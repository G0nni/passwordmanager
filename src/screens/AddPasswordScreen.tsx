import React, {useState, useEffect} from 'react';
import {auth} from '../auth/firebase';
import Snackbar from 'react-native-snackbar';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import Account from '../interfaces/account';
import Loading from '../components/Loading';
import * as Keychain from 'react-native-keychain';
import {MMKV} from 'react-native-mmkv';
import Aes from 'react-native-aes-crypto';
import {addDoc} from 'firebase/firestore';
import {accountsRef} from '../auth/firebase';
import NetInfo from '@react-native-community/netinfo';

type Props = {
  navigation: NavigationProp<any>;
};

const AddPasswordScreen: React.FC<Props> = ({navigation}) => {
  const [currentUserUID, setCurrentUID] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const storage = new MMKV();

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUID(auth.currentUser.uid);
      createAccount(auth.currentUser.uid);
    }
  }, []);

  const createAccount = (uid: string) => {
    setAccount({
      id: '',
      website: '',
      email: '',
      password: '',
      userID: uid,
    });
  };

  const handleInputChange = (field: keyof Account, value: string) => {
    setAccount(prevAccount => {
      if (prevAccount) {
        return {...prevAccount, [field]: value};
      } else {
        return {
          id: '', // Change this to a string
          website: field === 'website' ? value : '',
          email: field === 'email' ? value : '',
          password: field === 'password' ? value : '',
          userID: '',
        };
      }
    });
  };

  const encryptAccountPassword = async (
    password: string,
    secretKey: string,
  ) => {
    const {cipher, iv} = await Aes.randomKey(16).then(iv => {
      return Aes.encrypt(password, secretKey, iv, 'aes-256-cbc').then(
        cipher => ({
          cipher,
          iv,
        }),
      );
    });

    return iv + ':' + cipher;
  };

  const handleAddAccount = async () => {
    if (account?.email && account.password && account.website) {
      const credentials = await Keychain.getGenericPassword({
        service: currentUserUID,
      });
      const secretKey = credentials ? credentials.password : '';

      try {
        const combined = await encryptAccountPassword(
          account.password,
          secretKey,
        );

        let website = account.website;
        let email = account.email;
        let userID = account.userID;

        let docRef;

        setLoading(true);
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          docRef = await addDoc(accountsRef, {
            website,
            email,
            password: combined,
            userID,
          });
        }

        if (docRef && docRef.id) {
          const localData = storage.getString('accounts');
          const accounts = localData ? JSON.parse(localData) : [];
          accounts.push({
            docID: docRef.id, // Store the document ID
            account: {
              // Store the account data
              website,
              email,
              password: combined,
              userID,
            },
          });
          storage.set('accounts', JSON.stringify(accounts));

          setLoading(false);
          navigation.goBack();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      Snackbar.show({
        text: 'Veuillez rentrer toutes les informations !',
        backgroundColor: 'red',
      });
    }
  };

  return (
    <View>
      <Text>voici le user connecté : {currentUserUID}</Text>
      {account && (
        <>
          <TextInput
            placeholder="Website"
            onChangeText={value => handleInputChange('website', value)}
            value={account.website}
          />
          <TextInput
            placeholder="Email"
            onChangeText={value => handleInputChange('email', value)}
            value={account.email}
          />
          <TextInput
            placeholder="Password"
            onChangeText={value => handleInputChange('password', value)}
            value={account.password}
            secureTextEntry
          />
          {loading ? (
            <Loading />
          ) : (
            <Button title="Ajouter" onPress={handleAddAccount} />
          )}
        </>
      )}
    </View>
  );
};

export default AddPasswordScreen;

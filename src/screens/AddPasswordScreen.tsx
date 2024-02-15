import React, {useState, useEffect} from 'react';
import {auth} from '../auth/firebase';
import Snackbar from 'react-native-snackbar';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import Account from '../interfaces/account';
import Loading from '../components/Loading';
import * as Keychain from 'react-native-keychain';
import {NativeModules} from 'react-native';
import Aes from 'react-native-aes-crypto';

import {addDoc} from 'firebase/firestore';
import {accountsRef} from '../auth/firebase';

type Props = {
  navigation: NavigationProp<any>;
};

const AddPasswordScreen: React.FC<Props> = ({navigation}) => {
  const [currentUserUID, setCurrentUID] = useState('');
  const [account, setAccount] = React.useState<Account | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUID(auth.currentUser.uid);
      setAccount({
        id: 0,
        website: '',
        email: '',
        password: '',
        useruid: auth.currentUser.uid,
      });
    }
  }, []);

  const handleWebsiteChange = (website: string) => {
    setAccount(prevAccount =>
      prevAccount
        ? {...prevAccount, website}
        : {id: 0, website, email: '', password: '', useruid: ''},
    );
  };
  const handleEmailChange = (email: string) => {
    setAccount(prevAccount =>
      prevAccount
        ? {...prevAccount, email}
        : {id: 0, website: '', email, password: '', useruid: ''},
    );
  };
  const handlePasswordChange = (password: string) => {
    setAccount(prevAccount =>
      prevAccount
        ? {...prevAccount, password}
        : {id: 0, website: '', email: '', password, useruid: ''},
    );
  };
  const encryptData = (text: string, key: string) => {
    return Aes.randomKey(16).then(iv => {
      return Aes.encrypt(text, key, iv, 'aes-256-cbc').then(cipher => ({
        cipher,
        iv,
      }));
    });
  };

  const handleAddAccount = async () => {
    if (account?.email && account.password && account.website) {
      // Récupérer la clé de chiffrement du Keychain
      const credentials = await Keychain.getGenericPassword({
        service: account.email,
      });
      const secretKey = credentials ? credentials.password : '';

      try {
        // Chiffrer les données
        const {cipher, iv} = await encryptData(account.password, secretKey);

        // Combine the IV and cipher text
        const combined = iv + ':' + cipher;

        // good to go
        let website = account.website;
        let email = account.email;
        let userID = account.useruid;

        // navigation.navigate('Home');
        setLoading(true);
        let doc = await addDoc(accountsRef, {
          website,
          email,
          password: combined,
          userID,
        });
        setLoading(false);
        if (doc && doc.id) {
          navigation.goBack();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // show error
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
            onChangeText={handleWebsiteChange}
            value={account.website}
          />
          <TextInput
            placeholder="Email"
            onChangeText={handleEmailChange}
            value={account.email}
          />
          <TextInput
            placeholder="Password"
            onChangeText={handlePasswordChange}
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

import React, {useState, useEffect} from 'react';
import {auth} from '../auth/firebase';
import Snackbar from 'react-native-snackbar';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import Account from '../interfaces/account';
import Loading from '../components/Loading';

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
        website: '',
        email: '',
        password: '',
        useruid: auth.currentUser.uid,
      });
    }
  }, []);

  const handleWebsiteChange = (website: string) => {
    setAccount(prevAccount => ({...prevAccount, website}));
  };
  const handleEmailChange = (email: string) => {
    setAccount(prevAccount => ({...prevAccount, email}));
  };
  const handlePasswordChange = (password: string) => {
    setAccount(prevAccount => ({...prevAccount, password}));
  };

  const handleAddAccount = async () => {
    if (account) {
      // good to go
      let website = account.website;
      let email = account.email;
      let password = account.password;
      let userID = account.useruid;

      // navigation.navigate('Home');
      setLoading(true);
      let doc = await addDoc(accountsRef, {
        website,
        email,
        password,
        userID,
      });
      setLoading(false);
      if (doc && doc.id) {
        navigation.goBack();
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

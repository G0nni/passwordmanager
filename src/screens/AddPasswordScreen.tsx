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
  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUID(auth.currentUser.uid);
    }
  }, []);

  const [account, setAccount] = React.useState<Account>({
    website: '',
    email: '',
    password: '',
    useruid: currentUserUID,
  });
  const [loading, setLoading] = useState(false);

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

      // navigation.navigate('Home');
      setLoading(true);
      let doc = await addDoc(accountsRef, {
        account,
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
    </View>
  );
};

export default AddPasswordScreen;

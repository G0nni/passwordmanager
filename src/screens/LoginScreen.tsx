import React from 'react';
import {auth} from '../auth/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import {NativeModules} from 'react-native';
const Aes = NativeModules.Aes;
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

import User from '../interfaces/user';

type Props = {
  navigation: NavigationProp<any>;
};

// Connexion
const loginUser = async (user: User) => {
  console.log('User:', user.email);
  try {
    await signInWithEmailAndPassword(auth, user.email, user.password);
    const salt = uuidv4();
    const key = await Aes.pbkdf2(user.password, salt, 5000, 256, 'SHA1'); // génère la clé de chiffrement
    await Keychain.setGenericPassword(user.email, key, {service: user.email}); // Stocker le mot de passe chiffré
    const keyData = await Keychain.getGenericPassword({service: user.email});
    console.log(keyData);
    console.log('Utilisateur connecté');
  } catch (error) {
    console.error(error);
  }
};

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = React.useState<User>({email: '', password: ''});

  const handleEmailChange = (email: string) => {
    setUser(prevUser => ({...prevUser, email}));
  };

  const handlePasswordChange = (password: string) => {
    setUser(prevUser => ({...prevUser, password}));
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        onChangeText={handleEmailChange}
        value={user.email}
      />
      <TextInput
        placeholder="Password"
        onChangeText={handlePasswordChange}
        value={user.password}
        secureTextEntry
      />
      <Button title="Se connecter" onPress={() => loginUser(user)} />

      <Text>Vous n'avez pas de compte ?</Text>
      <Button
        title="S'inscrire"
        onPress={() => {
          navigation.navigate('SignUp');
        }}
      />
    </View>
  );
};

export default LoginScreen;

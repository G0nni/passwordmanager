import React from 'react';
import {auth} from '../auth/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

import User from '../interfaces/user';

type Props = {
  navigation: NavigationProp<any>;
};

// Connexion
const loginUser = async (User: User) => {
  try {
    await signInWithEmailAndPassword(auth, User.email, User.password);
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

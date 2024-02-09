import React from 'react';
import authent from '../auth/firebase';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

import User from '../interfaces/user';

type Props = {
  navigation: NavigationProp<any>;
};

// inscription
const registerUser = async (User: User) => {
  try {
    await createUserWithEmailAndPassword(authent, User.email, User.password);
    console.log('Utilisateur inscrit');
  } catch (error) {
    console.error(error);
  }
};

const SignUpScreen: React.FC<Props> = ({navigation}) => {
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
      <Button title="S'inscrire" onPress={() => registerUser(user)} />

      <Text>Vous avez déjà un compte ?</Text>
      <Button
        title="Se connecter"
        onPress={() => {
          navigation.navigate('Login');
        }}
      />
    </View>
  );
};

export default SignUpScreen;

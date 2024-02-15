import React, {useState} from 'react';
import {auth, saltRef} from '../auth/firebase';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {View, TextInput, Button, Text} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import {NativeModules} from 'react-native';
const Aes = NativeModules.Aes;
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import User from '../interfaces/user';
import {doc, setDoc} from 'firebase/firestore';

type Props = {
  navigation: NavigationProp<any>;
};

const createUser = async (user: User) => {
  return await createUserWithEmailAndPassword(auth, user.email, user.password);
};

const storeUserSalt = async (uid: string, salt: string) => {
  let userSaltRef = doc(saltRef, uid);
  await setDoc(userSaltRef, {salt});
};

const generateEncryptionKey = async (password: string, salt: string) => {
  return await Aes.pbkdf2(password, salt, 5000, 256, 'SHA1');
};

const storeEncryptedPassword = async (
  email: string,
  key: string,
  uid: string,
) => {
  await Keychain.setGenericPassword(email, key, {service: uid});
};

const registerUser = async (
  user: User,
  setErrorMessage: (message: string) => void,
) => {
  try {
    const userCredential = await createUser(user);
    const uid = userCredential.user.uid;
    const salt = uuidv4();
    await storeUserSalt(uid, salt);
    const key = await generateEncryptionKey(user.password, salt);
    await storeEncryptedPassword(user.email, key, uid);
    console.log('Utilisateur inscrit');
  } catch (error) {
    console.error("Erreur d'authentification : ", error);
    if (error instanceof Error) {
      setErrorMessage('Veuillez rentrer une adresse email valide');
    } else {
      setErrorMessage('An unknown error occurred');
    }
  }
};

const SignUpScreen: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<User>({email: '', password: ''});
  const [errorMessage, setErrorMessage] = useState<string>('');

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
      <Button
        title="S'inscrire"
        onPress={() => registerUser(user, setErrorMessage)}
      />
      {errorMessage && <Text>{errorMessage}</Text>}
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

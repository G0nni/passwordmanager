import React, {useState} from 'react';
import {auth, saltRef} from '../auth/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import {NativeModules} from 'react-native';
const Aes = NativeModules.Aes;
import 'react-native-get-random-values';
import {doc, getDoc} from 'firebase/firestore';

import User from '../interfaces/user';

type Props = {
  navigation: NavigationProp<any>; // Replace 'any' with the specific type
};

const loginUser = async (
  user: User,
  setErrorMessage: (message: string) => void,
) => {
  try {
    const userCredential = await authenticateUser(user);
    const salt = await fetchUserSalt(userCredential.user.uid);
    const key = await generateEncryptionKey(user.password, salt);
    await storeEncryptedPassword(user.email, key, userCredential.user.uid);
    console.log('Utilisateur connecté');
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      setErrorMessage("L'authentification a échoué, vérifiez vos identifiants");
    } else {
      setErrorMessage('An unknown error occurred');
    }
  }
};

const authenticateUser = (user: User) => {
  return signInWithEmailAndPassword(auth, user.email, user.password);
};

const fetchUserSalt = async (uid: string) => {
  let userSaltRef = doc(saltRef, uid);
  const saltDoc = await getDoc(userSaltRef);
  const saltData = saltDoc.data();
  const salt = saltData?.salt;
  if (!salt) {
    throw new Error('Salt data is undefined');
  }
  return salt;
};

const generateEncryptionKey = (password: string, salt: string) => {
  return Aes.pbkdf2(password, salt, 5000, 256, 'SHA1');
};

const storeEncryptedPassword = (email: string, key: string, uid: string) => {
  return Keychain.setGenericPassword(email, key, {service: uid});
};

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [user, setUser] = useState<User>({email: '', password: ''});
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleEmailChange = (email: string) => {
    setUser(prevUser => ({...prevUser, email}));
  };

  const handlePasswordChange = (password: string) => {
    setUser(prevUser => ({...prevUser, password}));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={handleEmailChange}
        value={user.email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={handlePasswordChange}
        value={user.password}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => loginUser(user, setErrorMessage)}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <Text style={styles.signup} onPress={() => navigation.navigate('SignUp')}>
        Vous n'avez pas de compte ?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 8,
  },
  button: {
    backgroundColor: '#5067FF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  signup: {
    marginTop: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import Aes from 'react-native-aes-crypto';
import {doc, deleteDoc, setDoc} from 'firebase/firestore';
import {auth, accountsRef} from '../auth/firebase';
import Account from '../interfaces/account';
import {MMKV} from 'react-native-mmkv';

type AccountCardProps = {
  account: Account;
};

const encryptAccountPassword = async (password: string, secretKey: string) => {
  const {cipher, iv} = await Aes.randomKey(16).then(iv => {
    return Aes.encrypt(password, secretKey, iv, 'aes-256-cbc').then(cipher => ({
      cipher,
      iv,
    }));
  });

  return iv + ':' + cipher;
};

const decryptData = (
  encryptedData: {cipher: string; iv: string},
  key: string,
) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

const AccountCard: React.FC<AccountCardProps> = ({account}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableAccount, setEditableAccount] = useState({...account});
  const storage = new MMKV();

  const toggleModal = () => setModalVisible(prev => !prev);

  const deleteAccount = async () => {
    // Delete from Firebase
    const accountRef = doc(accountsRef, account.id.toString());
    await deleteDoc(accountRef);

    // Delete from local storage
    const jsonData = storage.getString('accounts');
    console.log('jsonData', jsonData);
    if (jsonData) {
      const localData = JSON.parse(jsonData) as Account[];
      const updatedData = localData.filter(acc => acc.id !== account.id);
      storage.set('accounts', JSON.stringify(updatedData));
      console.log('Account deleted from local storage', updatedData);
    }

    // Close the modal
    toggleModal();
  };

  const saveChanges = async () => {
    // Check if there is a current user
    if (!auth.currentUser) {
      console.log('Aucun utilisateur connecté.');
      return;
    }

    // Get the current user's uid
    const uid = auth.currentUser.uid;

    // Encrypt the new password
    const key = await Keychain.getGenericPassword({
      service: auth.currentUser?.uid,
    });

    if (key && key.password) {
      const combined = await encryptAccountPassword(
        decryptedPassword,
        key.password,
      );
      editableAccount.password = combined;
    } else {
      console.error('Failed to retrieve key from keychain');
      return;
    }

    // Save changes to Firebase
    const accountRef = doc(accountsRef, account.id.toString());
    await setDoc(accountRef, {...editableAccount, userID: uid});

    // Save changes to local storage
    const jsonData = storage.getString('accounts');
    if (jsonData) {
      const localData = JSON.parse(jsonData) as Account[];
      const updatedData = localData.map(acc =>
        acc.id === account.id ? {...editableAccount, userID: uid} : acc,
      );
      storage.set('accounts', JSON.stringify(updatedData));
    }

    // Exit editing mode
    setIsEditing(false);
  };

  const decryptPassword = async () => {
    const key = await Keychain.getGenericPassword({
      service: auth.currentUser?.uid,
    });

    if (key && key.password) {
      const [originalIv, cipherText] = account.password.split(':');

      try {
        const decrypted = await decryptData(
          {cipher: cipherText, iv: originalIv},
          key.password,
        );
        setDecryptedPassword(decrypted);
      } catch (error) {
        console.error('Failed to decrypt:', error);
      }
    } else {
      console.error('Failed to retrieve key from keychain');
    }
  };

  useEffect(() => {
    decryptPassword();
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleModal}>
        <Text style={styles.cardText}>{account.website}</Text>
        <Text style={styles.cardText}>********</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {isEditing ? (
              <>
                <TextInput
                  value={editableAccount.email}
                  onChangeText={text =>
                    setEditableAccount({...editableAccount, email: text})
                  }
                />
                <TextInput
                  value={editableAccount.website}
                  onChangeText={text =>
                    setEditableAccount({...editableAccount, website: text})
                  }
                />
                <TextInput
                  value={decryptedPassword}
                  onChangeText={text => setDecryptedPassword(text)}
                />
                <TouchableOpacity
                  style={{...styles.openButton, backgroundColor: '#2196F3'}}
                  onPress={saveChanges}>
                  <Text style={styles.textStyle}>Save Changes</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalText}>Email: {account.email}</Text>
                <Text style={styles.modalText}>
                  Password: {decryptedPassword}
                </Text>

                <TouchableOpacity
                  style={{...styles.openButton, backgroundColor: '#2196F3'}}
                  onPress={toggleModal}>
                  <Text style={styles.textStyle}>Hide Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{...styles.openButton, backgroundColor: '#F194FF'}}
                  onPress={() => setIsEditing(true)}>
                  <Text style={styles.textStyle}>Edit Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{...styles.openButton, backgroundColor: '#F194FF'}}
                  onPress={deleteAccount}>
                  <Text style={styles.textStyle}>Delete Account</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 3, // for Android
    shadowOffset: {width: 1, height: 1}, // for iOS
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardText: {
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AccountCard;

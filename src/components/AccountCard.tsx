import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import * as Keychain from 'react-native-keychain';
import Aes from 'react-native-aes-crypto';

import {auth} from '../auth/firebase';
import Account from '../interfaces/account';

type AccountCardProps = {
  account: Account;
};

const decryptData = (
  encryptedData: {cipher: string; iv: string},
  key: string,
) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

const AccountCard: React.FC<AccountCardProps> = ({account}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');

  const toggleModal = () => setModalVisible(prev => !prev);

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
            <Text style={styles.modalText}>Email: {account.email}</Text>
            <Text style={styles.modalText}>Password: {decryptedPassword}</Text>

            <TouchableOpacity
              style={{...styles.openButton, backgroundColor: '#2196F3'}}
              onPress={toggleModal}>
              <Text style={styles.textStyle}>Hide Password</Text>
            </TouchableOpacity>
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

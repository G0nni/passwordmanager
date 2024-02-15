import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import * as Keychain from 'react-native-keychain';

import Account from '../interfaces/account';
import React, {useEffect} from 'react';
import {decrypt} from 'react-native-aes-crypto';
import {NativeModules} from 'react-native';
import Aes from 'react-native-aes-crypto';

type AccountCardProps = {
  account: Account;
};
const decryptData = (
  encryptedData: {cipher: string; iv: string},
  key: string,
) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

const AccountCard: React.FC<AccountCardProps> = ({account}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [decryptedPassword, setDecryptedPassword] = React.useState('');

  const decryptPassword = async () => {
    // Retrieve the decryption key from the keychain
    const key = await Keychain.getGenericPassword({service: account.email});
    if (key) {
      // Extract the IV and cipher text from the combined data
      const combined = account.password;
      const [originalIv, cipherText] = combined.split(':');

      try {
        const decrypted = await decryptData(
          {cipher: cipherText, iv: originalIv},
          key.password,
        );
        console.log('Password decrypted');
        setDecryptedPassword(decrypted);
      } catch (error) {
        console.error('Failed to decrypt:', error);
      }
    }
  };

  useEffect(() => {
    decryptPassword();
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.cardText}>{account.website}</Text>
        <Text style={styles.cardText}>********</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Password: {decryptedPassword}</Text>

            <TouchableOpacity
              style={{...styles.openButton, backgroundColor: '#2196F3'}}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
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

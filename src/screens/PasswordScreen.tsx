import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {useIsFocused, NavigationProp} from '@react-navigation/native';
import {addDoc, getDocs, query, where} from 'firebase/firestore';
import {auth, accountsRef} from '../auth/firebase';
import AccountCard from '../components/AccountCard';
import Account from '../interfaces/account';
import {MMKV} from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import {showMessage} from 'react-native-flash-message';

type Props = {
  navigation: NavigationProp<any>;
};

// Helper function to convert doc.data() to Account
const toAccount = (docData: any, id: string): Account => {
  return {
    website: docData.website || '',
    email: docData.email || '',
    password: docData.password || '',
    userID: docData.useruid || '',
    id: id, // Convert the id to a string
  };
};

// Fetch accounts from Firestore or local storage
const fetchAccounts = async (
  setAccounts: (accounts: Account[]) => void,
  storage: MMKV,
) => {
  const netInfoState = await NetInfo.fetch();
  const isConnected = netInfoState.isConnected;
  if (isConnected) {
    const q = query(accountsRef, where('userID', '==', auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    let data: Account[] = [];
    querySnapshot.forEach(doc => {
      data.push(toAccount(doc.data(), doc.id));
    });
    storage.set('accounts', JSON.stringify(data));
    setAccounts(data);
  } else {
    const jsonData = storage.getString('accounts');
    if (jsonData) {
      setAccounts(JSON.parse(jsonData));
    }
  }
};

// Sync local data with Firestore
const syncData = async (storage: MMKV) => {
  const jsonData = storage.getString('accounts');
  if (jsonData) {
    const localData = JSON.parse(jsonData) as Account[];
    const q = query(accountsRef, where('userID', '==', auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    let dbData: Account[] = [];
    querySnapshot.forEach(doc => {
      dbData.push(toAccount(doc.data(), doc.id));
    });
    const newItems = localData.filter(
      localItem => !dbData.some(dbItem => dbItem.id === localItem.id),
    );
    for (const item of newItems) {
      try {
        await addDoc(accountsRef, item);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }
  }
};

const PasswordScreen: React.FC<Props> = ({navigation}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const isFocused = useIsFocused();
  const storage = new MMKV();

  useEffect(() => {
    if (!auth.currentUser) {
      console.log('Aucun utilisateur connecté.');
      return;
    }
  }, []);

  const fetchAccountsCallback = useCallback(
    () => fetchAccounts(setAccounts, storage),
    [],
  );
  useEffect(() => {
    if (isFocused) fetchAccountsCallback();
  }, [isFocused, fetchAccountsCallback]);

  const syncDataCallback = useCallback(() => syncData(storage), []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncDataCallback();
        showMessage({
          message: 'Vous êtes connecté à internet. Vos données sont à jour.',
          type: 'success',
        });
      } else {
        showMessage({
          message:
            'Vous êtes hors ligne. Vos données sont enregistrées localement.',
          type: 'danger',
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [syncDataCallback]);

  return (
    <View style={styles.container}>
      <View style={{height: 430}}>
        <FlatList
          data={accounts}
          numColumns={2}
          keyExtractor={item => item.id.toString()} // Convert the id to a string
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          renderItem={({item}) => (
            <AccountCard
              account={item}
              refreshAccounts={fetchAccountsCallback}
            />
          )}
        />
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate('AddPasswordScreen');
        }}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    backgroundColor: '#5067FF',
    borderColor: 'white',
    borderWidth: 1,
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 50,
    marginTop: -5,
    textAlign: 'center',
  },
});
export default PasswordScreen;

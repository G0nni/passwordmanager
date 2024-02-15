import React, {useState, useEffect, useCallback} from 'react';
import {View, Button, FlatList} from 'react-native';
import {useIsFocused, NavigationProp} from '@react-navigation/native';
import {addDoc, getDocs, query, where} from 'firebase/firestore';
import {auth, accountsRef} from '../auth/firebase';
import AccountCard from '../components/AccountCard';
import Account from '../interfaces/account';
import {MMKV} from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';

type Props = {
  navigation: NavigationProp<any>;
};

// Helper function to convert doc.data() to Account
const toAccount = (docData: any, id: string): Account => {
  return {
    website: docData.website || '',
    email: docData.email || '',
    password: docData.password || '',
    useruid: docData.useruid || '',
    id: Number(id),
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
      }
    });
    return () => {
      unsubscribe();
    };
  }, [syncDataCallback]);

  return (
    <View>
      <Button
        title="+"
        onPress={() => {
          navigation.navigate('AddPasswordScreen');
        }}
      />
      <View style={{height: 430}}>
        <FlatList
          data={accounts}
          numColumns={2}
          keyExtractor={item => item.id.toString()} // Convert the id to a string
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          renderItem={({item}) => <AccountCard account={item} />}
        />
      </View>
    </View>
  );
};

export default PasswordScreen;

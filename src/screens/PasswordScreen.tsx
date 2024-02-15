import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useIsFocused, NavigationProp} from '@react-navigation/native';

import {getDoc, getDocs, query, where} from 'firebase/firestore';

import {auth, accountsRef} from '../auth/firebase';

import AccountCard from '../components/AccountCard';
import Account from '../interfaces/account';

type Props = {
  navigation: NavigationProp<any>;
};

const PasswordScreen: React.FC<Props> = ({navigation}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!auth.currentUser) {
      console.log('Aucun utilisateur connecté.');
      return;
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchAccounts();
  }, [isFocused]);

  const fetchAccounts = async () => {
    console.log('UID:', auth.currentUser?.uid); // Log the UID
    const q = query(accountsRef, where('userID', '==', auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    console.log('Query Snapshot:', querySnapshot); // Log the query snapshot
    let data: any = [];
    querySnapshot.forEach(doc => {
      data.push({...doc.data(), id: doc.id});
    });
    console.log('Data:', data); // Log the data
    setAccounts(data);
  };

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

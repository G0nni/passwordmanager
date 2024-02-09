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
type Props = {
  navigation: NavigationProp<any>;
};

const PasswordScreen: React.FC<Props> = ({navigation}) => {
  const [accounts, setAccounts] = useState([]);
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
    const q = query(accountsRef, where('userId', '==', auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    let data: any = [];
    querySnapshot.forEach(doc => {
      data.push({...doc.data(), id: doc.id});
    });
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
          data={accounts as any[]} // Provide the correct type for the accounts state variable
          numColumns={2}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          renderItem={({item}) => {
            return <Text>{item.website}</Text>; // Affichez les données que vous voulez ici
          }}
        />
      </View>
    </View>
  );
};

export default PasswordScreen;

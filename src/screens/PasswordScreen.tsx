import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Button} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

import {auth} from '../auth/firebase';
type Props = {
  navigation: NavigationProp<any>;
};

const PasswordScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    if (!auth.currentUser) {
      console.log('Aucun utilisateur connecté.');
      return;
    }
  }, []);

  return (
    <View>
      <Button
        title="+"
        onPress={() => {
          navigation.navigate('AddPasswordScreen');
        }}
      />
    </View>
  );
};

export default PasswordScreen;

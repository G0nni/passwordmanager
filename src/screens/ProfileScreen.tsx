import React, {useEffect, useState} from 'react';
import authent from '../auth/firebase';

import {View, Text, Button} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

type Props = {
  navigation: NavigationProp<any>;
};

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View>
      <Text>Profile</Text>
      <Button
        title="Se déconnecter"
        onPress={() => {
          authent.signOut();
        }}
      />
    </View>
  );
};

export default ProfileScreen;

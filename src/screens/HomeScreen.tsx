import React from 'react';

import {View, Text, Button} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

type Props = {
  navigation: NavigationProp<any>;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View>
      <Text>Vous êtes sur la page d'accueil.</Text>
      <Button
        title="Se connecter"
        onPress={() => {
          navigation.navigate('Login');
        }}
      />
    </View>
  );
};

export default HomeScreen;

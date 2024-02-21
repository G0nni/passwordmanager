import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {auth} from '../auth/firebase';

import PasswordScreen from '../screens/PasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AddPasswordScreen from '../screens/AddPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const PasswordStack = createStackNavigator();

export default function AppNavigation() {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsConnected(true);
        console.log('Utilisateur connecté');
      } else {
        setIsConnected(false);
        console.log('Aucun utilisateur connecté');
      }
    });

    // Nettoyer l'inscription à onAuthStateChanged lors du démontage du composant
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        {isConnected ? (
          <>
            <Tab.Screen name="PasswordStack" component={PasswordStackScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <Tab.Screen name="Home" component={HomeStack} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function PasswordStackScreen() {
  return (
    <PasswordStack.Navigator screenOptions={{headerShown: false}}>
      <PasswordStack.Screen name="Password" component={PasswordScreen} />

      <PasswordStack.Screen
        name="AddPasswordScreen"
        component={AddPasswordScreen}
      />
    </PasswordStack.Navigator>
  );
}

const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen
      options={{presentation: 'modal'}}
      name="Homes"
      component={HomeScreen}
    />
    <Stack.Screen
      options={{presentation: 'modal'}}
      name="Login"
      component={LoginScreen}
    />
    <Stack.Screen
      options={{presentation: 'modal'}}
      name="SignUp"
      component={SignUpScreen}
    />
  </Stack.Navigator>
);

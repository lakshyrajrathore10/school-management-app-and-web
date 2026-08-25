import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation.types';
import SplashScreen from '../screens/auth/Splash/SplashScreen';
import LoginScreen from '../screens/auth/Login/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Stack — shown when user is NOT logged in.
 * Screens: Splash → Login
 */
export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

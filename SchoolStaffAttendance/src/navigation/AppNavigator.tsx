import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { RootStackParamList } from '../types/navigation.types';
import { navigationRef } from './NavigationService';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import NoInternetScreen from '../components/common/NoInternetScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator — Root navigation container.
 * Also monitors global network connectivity via NetInfo.
 */
export default function AppNavigator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Only set offline if state explicitly reports disconnected/unreachable
      if (state.isConnected === false || state.isInternetReachable === false) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRetryConnectivity = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected !== false && state.isInternetReachable !== false) {
      setIsOffline(false);
    }
  };

  if (isOffline) {
    return <NoInternetScreen onRetry={handleRetryConnectivity} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Main" component={MainStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

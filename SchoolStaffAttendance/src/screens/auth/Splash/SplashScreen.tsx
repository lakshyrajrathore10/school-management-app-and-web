import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { School } from 'lucide-react-native';
import { useAppDispatch } from '../../../redux/store';
import { restoreSession } from '../../../redux/slice/authSlice';
import { storageService } from '../../../services/storageService';
import { resetToMain } from '../../../navigation/NavigationService';
import { Colors } from '../../../theme';
import { typography } from '../../../theme/tokens/typography';
import { AuthStackScreenProps } from '../../../types/navigation.types';

type Props = AuthStackScreenProps<'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));

      if (storageService.hasValidSession()) {
        dispatch(restoreSession());
        resetToMain();
      } else {
        navigation.replace('Login');
      }
    };

    checkSession();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <School size={48} color={Colors.white} />
        </View>
        <Text style={styles.appName}>Staff Attendance</Text>
        <Text style={styles.tagline}>School Management System</Text>
      </View>

      <ActivityIndicator size="large" color={Colors.white} style={styles.loader} />

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.whiteOpacity15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 26,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    color: Colors.whiteOpacity80,
    letterSpacing: 0.3,
  },
  loader: {
    marginTop: 12,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.whiteOpacity80,
  },
});

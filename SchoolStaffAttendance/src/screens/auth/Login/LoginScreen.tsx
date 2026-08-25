import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { School, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { Colors } from '../../../theme';
import { typography } from '../../../theme/tokens/typography';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearAuthError,
} from '../../../redux/slice/authSlice';
import { authService } from '../../../services/authService';
import { resetToMain } from '../../../navigation/NavigationService';
import { AuthStackScreenProps } from '../../../types/navigation.types';
import { showToast } from '../../../utils/toast';

type Props = AuthStackScreenProps<'Login'>;

export default function LoginScreen({ navigation: _navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(s => s.auth);

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleLogin = async () => {
    setLocalError(null);
    dispatch(clearAuthError());

    const trimmedId = employeeId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId || !trimmedPassword) {
      const msg = 'Please enter both Employee ID and Password.';
      setLocalError(msg);
      showToast.warning('Missing Fields', msg);
      return;
    }

    try {
      dispatch(loginStart());
      const response = await authService.login({
        employeeId: trimmedId,
        password: trimmedPassword,
      });

      dispatch(loginSuccess(response));
      showToast.success('Welcome Back!', `Signed in as ${response.user.name}`);
      resetToMain();
    } catch (err: any) {
      const errMsg = err?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errMsg));
      showToast.error('Login Failed', errMsg);
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.schoolLogoPlaceholder}>
              <School size={40} color={Colors.primary} />
            </View>
            <Text style={styles.schoolName}>School Name</Text>
            <Text style={styles.welcomeText}>Staff Attendance Portal</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Use credentials provided by your school admin
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee ID</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Employee ID"
                  placeholderTextColor={Colors.textDisabled}
                  value={employeeId}
                  onChangeText={text => {
                    setEmployeeId(text);
                    if (displayError) {
                      setLocalError(null);
                      dispatch(clearAuthError());
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter Password"
                  placeholderTextColor={Colors.textDisabled}
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (displayError) {
                      setLocalError(null);
                      dispatch(clearAuthError());
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {displayError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <View style={styles.buttonContent}>
                  <LogIn size={18} color={Colors.white} style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Login</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              Forgot password? Contact your school administrator.
            </Text>
          </View>

          <Text style={styles.version}>Staff Attendance v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  schoolLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    color: Colors.textPrimary,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 6,
  },
  errorContainer: {
    backgroundColor: Colors.errorSurface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.error,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  note: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});

import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../theme';

interface ScreenWrapperProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  statusBarColor?: string;
  barStyle?: 'dark-content' | 'light-content';
  translucent?: boolean;
  useScrollView?: boolean;
  keyboardAvoiding?: boolean;
  keyboardAvoidingBehavior?: 'padding' | 'height' | 'position';
  bounces?: boolean;
  safeArea?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  statusBarColor = Colors.white,
  barStyle = 'dark-content',
  translucent = false,
  useScrollView = false,
  keyboardAvoiding = false,
  keyboardAvoidingBehavior = Platform.OS === 'ios' ? 'padding' : undefined,
  bounces = false,
  safeArea = true,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const Container = safeArea ? SafeAreaView : View;

  const renderContent = () => {
    if (useScrollView) {
      return (
        <ScrollView
          style={[styles.scrollView, style]}
          contentContainerStyle={contentContainerStyle}
          bounces={bounces}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return <View style={[styles.inner, style]}>{children}</View>;
  };

  return (
    <Container style={styles.container}>
      <StatusBar
        backgroundColor={translucent ? Colors.transparent : statusBarColor}
        barStyle={barStyle}
        translucent={translucent}
      />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={keyboardAvoidingBehavior}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default ScreenWrapper;

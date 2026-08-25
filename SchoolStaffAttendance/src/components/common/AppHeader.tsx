import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { Colors, typography } from '../../theme';

export interface AppHeaderProps {
  /** Title text displayed in standard header */
  title?: string;
  /** Subtitle text displayed under title */
  subtitle?: string;
  /** Show back button. Defaults to true for standard screens if not specified */
  showBack?: boolean;
  showBackButton?: boolean;
  /** Back button press handler */
  onBackPress?: () => void;
  onBack?: () => void;
  /** Component rendered on the right side */
  rightElement?: React.ReactNode;
  rightComponent?: React.ReactNode;

  /** Dashboard / Profile Mode Props */
  isDashboard?: boolean;
  userName?: string;
  schoolName?: string;
  onNotificationPress?: () => void;
  hasUnreadNotifications?: boolean;

  /** Custom Styling Props */
  gradientColors?: (string | number)[];
  borderBottomRadius?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: TextStyle;
  barStyle?: 'light-content' | 'dark-content';
  showStatusBar?: boolean;
  bottomComponent?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack,
  showBackButton,
  onBackPress,
  onBack,
  rightElement,
  rightComponent,
  isDashboard = false,
  userName = 'Staff Member',
  schoolName = 'Whiteleaf International School',
  onNotificationPress,
  hasUnreadNotifications = true,
  gradientColors = ['#0D47A1', '#1565C0', '#1976D2'],
  borderBottomRadius = 0,
  style,
  containerStyle,
  contentStyle,
  titleStyle,
  barStyle = 'light-content',
  showStatusBar = true,
  bottomComponent,
  children,
}) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    const fn = onBackPress || onBack;
    if (fn) {
      fn();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const shouldShowBack = showBack !== undefined ? showBack : (showBackButton !== undefined ? showBackButton : !isDashboard);
  const rightSideElement = rightElement || rightComponent;
  const bottomContent = bottomComponent || children;

  const topInsetPadding = insets.top + (Platform.OS === 'ios' ? 8 : 12);

  return (
    <View style={[styles.wrapper, style, containerStyle]}>
      {showStatusBar && (
        <StatusBar
          barStyle={barStyle}
          backgroundColor="transparent"
          translucent={true}
        />
      )}

      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingTop: topInsetPadding,
            borderBottomLeftRadius: borderBottomRadius,
            borderBottomRightRadius: borderBottomRadius,
          },
        ]}
      >
        {isDashboard ? (
          /* Dashboard Profile Header Layout */
          <View style={[styles.headerRow, contentStyle]}>
            <View style={styles.userInfoContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.userTextCol}>
                <Text style={styles.greetingText}>
                  {getGreeting()}, <Text style={styles.userNameText}>{userName.split(' ')[0]}</Text>
                </Text>
                <Text style={styles.schoolNameText} numberOfLines={1}>
                  {schoolName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={onNotificationPress || (() => navigation.navigate('NotificationsTab'))}
              activeOpacity={0.8}
            >
              <Bell size={20} color={Colors.white} />
              {hasUnreadNotifications && <View style={styles.unreadBadgeDot} />}
            </TouchableOpacity>
          </View>
        ) : (
          /* Standard Page Header Layout */
          <View style={[styles.headerRow, contentStyle]}>
            <View style={styles.leftSection}>
              {shouldShowBack && (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={handleBack}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={20} color={Colors.white} />
                </TouchableOpacity>
              )}
              <View style={styles.titleWrapper}>
                {title && (
                  <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>

            {rightSideElement && <View style={styles.rightSection}>{rightSideElement}</View>}
          </View>
        )}

        {bottomContent}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  rightSection: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Dashboard Header Styles */
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  userTextCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontFamily: typography.fonts.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userNameText: {
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  schoolNameText: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 10,
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#1565C0',
  },
});

export default AppHeader;

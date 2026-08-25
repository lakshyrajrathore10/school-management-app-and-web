import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WifiOff,
  MapPinOff,
  ShieldOff,
  CameraOff,
  LocateOff,
  AlertOctagon,
  MapPin,
  CheckCheck,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { openAppSettings, openDeviceLocationSettings } from '../../../services/locationService';

// ── Error Types ───────────────────────────────────────────────
export type AttendanceErrorCode =
  | 'OUTSIDE_GEOFENCE'
  | 'MOCK_GPS_DETECTED'
  | 'NO_INTERNET'
  | 'GPS_DISABLED'
  | 'LOW_ACCURACY'
  | 'CAMERA_DENIED'
  | 'LOCATION_DENIED'
  | 'ALREADY_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT'
  | 'SERVER_ERROR';

// ── Error Config Map ──────────────────────────────────────────
interface ErrorConfig {
  Icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  description: (distanceMeters?: number) => string;
  primaryActionLabel: string;
  primaryAction: 'retry' | 'settings' | 'gps_settings' | 'dashboard' | 'none';
  showContactAdmin: boolean;
}

const ERROR_CONFIG: Record<AttendanceErrorCode, ErrorConfig> = {
  OUTSIDE_GEOFENCE: {
    Icon: MapPinOff,
    iconColor: Colors.warning,
    title: 'Outside School Campus',
    description: (d) =>
      d !== undefined
        ? `You are ${d} meters away from the school campus.\nYou must be within 150 meters to mark attendance.`
        : 'You are not inside the school geofence.\nPlease move closer to the campus and try again.',
    primaryActionLabel: 'Try Again',
    primaryAction: 'retry',
    showContactAdmin: false,
  },
  MOCK_GPS_DETECTED: {
    Icon: ShieldOff,
    iconColor: Colors.error,
    title: 'Fake GPS Detected',
    description: () =>
      'A mock or fake GPS application has been detected on your device.\n\nAttendance cannot be marked with spoofed location. Please disable any GPS spoofer apps and try again.',
    primaryActionLabel: 'Open Settings',
    primaryAction: 'settings',
    showContactAdmin: true,
  },
  NO_INTERNET: {
    Icon: WifiOff,
    iconColor: Colors.error,
    title: 'No Internet Connection',
    description: () =>
      'An active internet connection is required to mark attendance.\n\nPlease connect to Wi-Fi or mobile data and try again.',
    primaryActionLabel: 'Try Again',
    primaryAction: 'retry',
    showContactAdmin: false,
  },
  GPS_DISABLED: {
    Icon: LocateOff,
    iconColor: Colors.warning,
    title: 'GPS is Disabled',
    description: () =>
      'Your device location (GPS) is turned off.\n\nPlease enable Location Services in your device settings and try again.',
    primaryActionLabel: 'Enable GPS',
    primaryAction: 'gps_settings',
    showContactAdmin: false,
  },
  LOW_ACCURACY: {
    Icon: AlertOctagon,
    iconColor: Colors.warning,
    title: 'GPS Accuracy Too Low',
    description: () =>
      'Your current GPS signal accuracy is too low (> 50 meters).\n\nPlease move to an open area away from buildings and try again.',
    primaryActionLabel: 'Try Again',
    primaryAction: 'retry',
    showContactAdmin: false,
  },
  CAMERA_DENIED: {
    Icon: CameraOff,
    iconColor: Colors.error,
    title: 'Camera Access Denied',
    description: () =>
      'Camera permission is required to capture your live selfie for attendance verification.\n\nPlease grant Camera access in App Settings.',
    primaryActionLabel: 'Open App Settings',
    primaryAction: 'settings',
    showContactAdmin: false,
  },
  LOCATION_DENIED: {
    Icon: MapPin,
    iconColor: Colors.error,
    title: 'Location Access Denied',
    description: () =>
      'Location permission is required to verify you are inside the school campus.\n\nPlease grant Location access in App Settings.',
    primaryActionLabel: 'Open App Settings',
    primaryAction: 'settings',
    showContactAdmin: false,
  },
  ALREADY_CHECKED_IN: {
    Icon: CheckCheck,
    iconColor: Colors.primary,
    title: 'Already Checked In',
    description: () =>
      'You have already marked your Check In for today.\n\nYou can mark Check Out when you are leaving the campus.',
    primaryActionLabel: 'Go to Dashboard',
    primaryAction: 'dashboard',
    showContactAdmin: false,
  },
  ALREADY_CHECKED_OUT: {
    Icon: CheckCheck,
    iconColor: Colors.success,
    title: 'Attendance Completed',
    description: () =>
      'You have already completed your attendance for today (Check In + Check Out).\n\nSee you tomorrow!',
    primaryActionLabel: 'Go to Dashboard',
    primaryAction: 'dashboard',
    showContactAdmin: false,
  },
  SERVER_ERROR: {
    Icon: AlertOctagon,
    iconColor: Colors.error,
    title: 'Server Error',
    description: () =>
      'Could not connect to the attendance server. This may be a temporary issue.\n\nPlease try again in a moment.',
    primaryActionLabel: 'Try Again',
    primaryAction: 'retry',
    showContactAdmin: true,
  },
};

// ── Screen ────────────────────────────────────────────────────
export default function AttendanceFailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const errorCode: AttendanceErrorCode = route.params?.errorCode ?? 'SERVER_ERROR';
  const distanceMeters: number | undefined = route.params?.distanceMeters;

  const config = ERROR_CONFIG[errorCode] ?? ERROR_CONFIG.SERVER_ERROR;
  const { Icon, iconColor, title, description, primaryActionLabel, primaryAction, showContactAdmin } = config;

  const handlePrimaryAction = () => {
    switch (primaryAction) {
      case 'retry':
        navigation.navigate('Attendance');
        break;
      case 'settings':
        openAppSettings();
        break;
      case 'gps_settings':
        openDeviceLocationSettings();
        break;
      case 'dashboard':
        navigation.navigate('MainTabs', { screen: 'HomeTab' });
        break;
      default:
        navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color={Colors.textSecondary} />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* ── Error Icon ──────────────────────────────────── */}
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}18` }]}>
          <Icon size={52} color={iconColor} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description(distanceMeters)}</Text>

        {/* ── Error Code Badge ───────────────────────────── */}
        <View style={styles.errorCodeBadge}>
          <Text style={styles.errorCodeText}>Code: {errorCode}</Text>
        </View>

        {/* ── Primary Action ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: primaryAction === 'none' ? Colors.textSecondary : Colors.primary }]}
          onPress={handlePrimaryAction}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
        </TouchableOpacity>

        {/* ── Secondary: Back ───────────────────────────── */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* ── Contact Admin ─────────────────────────────── */}
        {showContactAdmin && (
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ProfileTab' })}
            activeOpacity={0.7}
          >
            <HelpCircle size={15} color={Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.helpBtnText}>Contact School Admin</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  // ── Icon ───────────────────────────────────────────────────
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Text ───────────────────────────────────────────────────
  title: {
    fontSize: 22,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Error Code Badge ───────────────────────────────────────
  errorCodeBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 32,
  },
  errorCodeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  // ── Buttons ────────────────────────────────────────────────
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  secondaryBtn: {
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  helpBtnText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
});

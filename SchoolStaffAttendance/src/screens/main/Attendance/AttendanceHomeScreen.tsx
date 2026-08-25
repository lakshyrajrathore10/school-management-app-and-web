import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  LocateFixed,
} from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setGeofenceStatus } from '../../../redux/slice/attendanceSlice';
import { showToast } from '../../../utils/toast';
import {
  runPreFlightChecks,
  getCurrentLocation,
  checkGeofence,
  isMockLocationSuspected,
  requestLocationPermission,
  requestCameraPermission,
  openAppSettings,
  openDeviceLocationSettings,
  getActiveSchoolConfig,
  PermissionStatus,
  PreFlightResult,
} from '../../../services/locationService';
import { schoolService } from '../../../services/schoolService';

// ── Types ─────────────────────────────────────────────────────
type CheckState = 'checking' | 'passed' | 'failed' | 'requesting';

interface PermissionCheckState {
  internet: CheckState;
  gps: CheckState;
  location: CheckState;
  camera: CheckState;
}

// ── Pre-flight Check Card ─────────────────────────────────────
interface CheckCardProps {
  label: string;
  state: CheckState;
  detail?: string;
  icon: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

function CheckCard({ label, state, detail, icon, onAction, actionLabel }: CheckCardProps) {
  const getStatusIcon = () => {
    if (state === 'checking' || state === 'requesting') {
      return <ActivityIndicator size={18} color={Colors.primary} />;
    }
    if (state === 'passed') {
      return <CheckCircle2 size={18} color={Colors.success} />;
    }
    return <XCircle size={18} color={Colors.error} />;
  };

  const getRowStyle = () => {
    if (state === 'passed') {return styles.checkItemPassed;}
    if (state === 'failed') {return styles.checkItemFailed;}
    return styles.checkItemChecking;
  };

  return (
    <View style={[styles.checkItem, getRowStyle()]}>
      <View style={styles.checkIcon}>{icon}</View>
      <View style={styles.checkTextContainer}>
        <Text style={styles.checkLabel}>{label}</Text>
        {detail ? <Text style={styles.checkDetail}>{detail}</Text> : null}
      </View>
      <View style={styles.checkStatus}>
        {state === 'failed' && onAction ? (
          <TouchableOpacity style={styles.fixBtn} onPress={onAction}>
            <Text style={styles.fixBtnText}>{actionLabel ?? 'Fix'}</Text>
          </TouchableOpacity>
        ) : (
          getStatusIcon()
        )}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function AttendanceHomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const attendance = useAppSelector(s => s.attendance);
  const initialType = route.params?.type ?? 'check_in';
  const [attendanceType, setAttendanceType] = useState<'check_in' | 'check_out'>(initialType);

  // ── Pre-flight states ─────────────────────────────────────
  const [checks, setChecks] = useState<PermissionCheckState>({
    internet: 'checking',
    gps: 'checking',
    location: 'checking',
    camera: 'checking',
  });
  const [allChecksPassed, setAllChecksPassed] = useState(false);

  // ── Geofence states ───────────────────────────────────────
  const [locationLoading, setLocationLoading] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [mockDetected, setMockDetected] = useState(false);

  // ── Refresh interval ──────────────────────────────────────
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Run pre-flight checks ─────────────────────────────────
  const runChecks = useCallback(async () => {
    // Reset to checking
    setChecks({ internet: 'checking', gps: 'checking', location: 'checking', camera: 'checking' });
    setAllChecksPassed(false);

    const result: PreFlightResult = await runPreFlightChecks();

    const locationCheck: CheckState = result.locationPermission === 'granted' ? 'passed' : 'failed';
    const cameraCheck: CheckState = result.cameraPermission === 'granted' ? 'passed' : 'failed';

    setChecks({
      internet: result.internet ? 'passed' : 'failed',
      gps: result.gpsEnabled ? 'passed' : 'failed',
      location: locationCheck,
      camera: cameraCheck,
    });

    const passed = result.internet && result.gpsEnabled && locationCheck === 'passed' && cameraCheck === 'passed';
    setAllChecksPassed(passed);

    return passed;
  }, []);

  // ── Fetch GPS & geofence ──────────────────────────────────
  const fetchLocation = useCallback(async () => {
    if (locationLoading) {return;}
    setLocationLoading(true);
    try {
      const position = await getCurrentLocation();
      const mock = isMockLocationSuspected(position);
      setMockDetected(mock);

      if (!mock) {
        const geofence = checkGeofence(position.latitude, position.longitude);
        setDistanceMeters(geofence.distanceMeters);
        setIsInsideGeofence(geofence.isInside);

        // Update Redux so dashboard & preview can use it
        dispatch(setGeofenceStatus({
          isInside: geofence.isInside,
          distanceMeters: geofence.distanceMeters,
        }));
      }
    } catch {
      setDistanceMeters(null);
      setIsInsideGeofence(false);
    } finally {
      setLocationLoading(false);
    }
  }, [dispatch, locationLoading]);

  // ── Run on screen focus ───────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      // Fetch latest dynamic school config from backend API
      schoolService.fetchSchoolConfig().finally(() => {
        runChecks().then(passed => {
          if (passed) {
            fetchLocation();
          }
        });
      });

      // Refresh location every 15 seconds
      locationInterval.current = setInterval(() => {
        fetchLocation();
      }, 15000);

      return () => {
        if (locationInterval.current) {
          clearInterval(locationInterval.current);
        }
      };
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Request permission actions ────────────────────────────
  const handleFixLocation = async () => {
    const perm: PermissionStatus = await requestLocationPermission();
    if (perm === 'granted') {
      await runChecks();
      fetchLocation();
    } else if (perm === 'never_ask_again') {
      openAppSettings();
    } else {
      showToast.warning(
        'Location Required',
        'Location permission is required to verify you are inside school campus.'
      );
    }
  };

  const handleFixCamera = async () => {
    const perm: PermissionStatus = await requestCameraPermission();
    if (perm === 'granted') {
      await runChecks();
    } else if (perm === 'never_ask_again') {
      openAppSettings();
    }
  };

  const handleFixGPS = () => {
    openDeviceLocationSettings();
  };

  // ── Proceed to camera ─────────────────────────────────────
  const handleProceed = () => {
    if (mockDetected) {
      navigation.navigate('AttendanceFailed', { errorCode: 'MOCK_GPS_DETECTED' });
      return;
    }
    if (!isInsideGeofence) {
      navigation.navigate('AttendanceFailed', {
        errorCode: 'OUTSIDE_GEOFENCE',
        distanceMeters,
      });
      return;
    }
    navigation.navigate('AttendanceCamera', { attendanceType });
  };

  // ── Derived UI helpers ─────────────────────────────────────
  const isCheckedIn = attendance.todayStatus === 'CHECKED_IN';
  const isCheckedOut = attendance.todayStatus === 'CHECKED_OUT';

  const canProceed =
    allChecksPassed &&
    isInsideGeofence &&
    !mockDetected &&
    !isCheckedOut &&
    (attendanceType === 'check_in' ? !isCheckedIn : isCheckedIn);

  const geofenceColor = isInsideGeofence ? Colors.success : Colors.error;
  const geofenceLabel = isInsideGeofence ? 'Inside Geofence ✓' : 'Outside Geofence';

  // ── Render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <AppHeader
        title="Mark Attendance"
        subtitle="GPS & Live Selfie Verification"
      />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Attendance Completed Today banner ─────────── */}
          {isCheckedOut && (
            <View style={styles.completedBanner}>
              <CheckCircle2 size={20} color={Colors.success} style={{ marginRight: 10 }} />
              <Text style={styles.completedBannerText}>Attendance Completed Today</Text>
            </View>
          )}

          {/* ── Type Selector ─────────────────────────────── */}
          {!isCheckedOut && (
            <View style={styles.typeSelectorCard}>
              <TouchableOpacity
                style={[styles.typeBtn, attendanceType === 'check_in' && styles.typeBtnActive]}
                onPress={() => setAttendanceType('check_in')}
                disabled={isCheckedIn}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, attendanceType === 'check_in' && styles.typeBtnTextActive]}>
                  Check In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, attendanceType === 'check_out' && styles.typeBtnActive]}
                onPress={() => setAttendanceType('check_out')}
                disabled={!isCheckedIn}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, attendanceType === 'check_out' && styles.typeBtnTextActive]}>
                  Check Out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Geofence Status Card ──────────────────────── */}
          <View style={[styles.geofenceCard, isInsideGeofence ? styles.geofenceCardSuccess : styles.geofenceCardError]}>
            <View style={styles.geofenceHeader}>
              <View style={[styles.geofenceIconBox, { backgroundColor: isInsideGeofence ? Colors.successSurface : Colors.errorSurface }]}>
                <LocateFixed size={22} color={geofenceColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.geofenceTitle, { color: geofenceColor }]}>
                  {geofenceLabel}
                </Text>
                <Text style={styles.geofenceSubtitle}>{getActiveSchoolConfig().name}</Text>
              </View>

              {/* Live pulse dot */}
              <View style={styles.liveIndicator}>
                <View style={[styles.pulseDot, { backgroundColor: geofenceColor }]} />
                <Text style={[styles.liveText, { color: geofenceColor }]}>Live</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.geofenceDetailsRow}>
              {locationLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.detailText}>
                    Distance:{' '}
                    <Text style={[styles.boldText, { color: geofenceColor }]}>
                      {distanceMeters !== null ? `${distanceMeters}m` : '--'}
                    </Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Allowed Radius:{' '}
                    <Text style={styles.boldText}>{getActiveSchoolConfig().radiusMeters}m</Text>
                  </Text>
                  <TouchableOpacity onPress={fetchLocation} style={styles.refreshGpsBtn}>
                    <RefreshCw size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Mock GPS Warning */}
            {mockDetected && (
              <View style={styles.mockWarning}>
                <ShieldCheck size={14} color={Colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.mockWarningText}>Fake GPS Detected — Attendance Blocked</Text>
              </View>
            )}
          </View>

          {/* ── Pre-Flight Checks ─────────────────────────── */}
          <Text style={styles.sectionTitle}>Verification Status</Text>

          <View style={styles.checkCard}>
            <CheckCard
              label="Internet Connection"
              state={checks.internet}
              detail={checks.internet === 'passed' ? 'Connected' : 'No connection'}
              icon={checks.internet === 'passed'
                ? <Wifi size={17} color={Colors.primary} />
                : <WifiOff size={17} color={Colors.error} />}
            />
            <View style={styles.divider} />
            <CheckCard
              label="GPS Service"
              state={checks.gps}
              detail={checks.gps === 'passed' ? 'Active' : 'GPS disabled'}
              icon={<MapPin size={17} color={checks.gps === 'passed' ? Colors.primary : Colors.error} />}
              onAction={handleFixGPS}
              actionLabel="Enable"
            />
            <View style={styles.divider} />
            <CheckCard
              label="Location Permission"
              state={checks.location}
              detail={checks.location === 'passed' ? 'Granted' : 'Permission required'}
              icon={<LocateFixed size={17} color={checks.location === 'passed' ? Colors.primary : Colors.error} />}
              onAction={handleFixLocation}
              actionLabel="Grant"
            />
            <View style={styles.divider} />
            <CheckCard
              label="Camera Permission"
              state={checks.camera}
              detail={checks.camera === 'passed' ? 'Granted' : 'Permission required'}
              icon={<Camera size={17} color={checks.camera === 'passed' ? Colors.primary : Colors.error} />}
              onAction={handleFixCamera}
              actionLabel="Grant"
            />
            <View style={styles.divider} />
            <CheckCard
              label="Mock Location Check"
              state={mockDetected ? 'failed' : 'passed'}
              detail={mockDetected ? 'Fake GPS detected' : 'Real GPS verified'}
              icon={<ShieldCheck size={17} color={mockDetected ? Colors.error : Colors.primary} />}
            />
          </View>

          {/* ── Action Button ─────────────────────────────── */}
          {!isCheckedOut && (
            <TouchableOpacity
              style={[styles.proceedBtn, !canProceed && styles.proceedBtnDisabled]}
              onPress={handleProceed}
              activeOpacity={canProceed ? 0.85 : 1}
              disabled={!canProceed}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={Colors.white} style={{ marginRight: 8 }} />
              ) : (
                <Camera size={18} color={Colors.white} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.proceedBtnText}>
                {locationLoading
                  ? 'Fetching Location...'
                  : `Capture Live Selfie (${attendanceType === 'check_in' ? 'Check In' : 'Check Out'})`}
              </Text>
              {!locationLoading && canProceed && (
                <ArrowRight size={18} color={Colors.white} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          )}

          {/* ── Retry all checks ─────────────────────────── */}
          <TouchableOpacity style={styles.retryBtn} onPress={runChecks} activeOpacity={0.7}>
            <RefreshCw size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.retryBtnText}>Re-run Checks</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── Completed Banner ───────────────────────────────────────
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successSurface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.successLight,
  },
  completedBannerText: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.successDark,
  },

  // ── Type Selector ──────────────────────────────────────────
  typeSelectorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
  },
  typeBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.white,
  },

  // ── Geofence Card ──────────────────────────────────────────
  geofenceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  geofenceCardSuccess: {
    backgroundColor: Colors.successSurface,
    borderColor: Colors.successLight,
  },
  geofenceCardError: {
    backgroundColor: Colors.errorSurface,
    borderColor: '#FECDD3',
  },
  geofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geofenceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  geofenceTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
  },
  geofenceSubtitle: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  liveText: {
    fontSize: 11,
    fontFamily: typography.fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  geofenceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  boldText: {
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  refreshGpsBtn: {
    padding: 4,
  },
  mockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.errorSurface,
    padding: 10,
    borderRadius: 10,
  },
  mockWarningText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.error,
  },

  // ── Pre-flight Checks ──────────────────────────────────────
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkItemChecking: {},
  checkItemPassed: {},
  checkItemFailed: {},
  checkIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  checkTextContainer: {
    flex: 1,
  },
  checkLabel: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
  },
  checkDetail: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  checkStatus: {
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  fixBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fixBtnText: {
    fontSize: 11,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },

  // ── Proceed Button ─────────────────────────────────────────
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  proceedBtnDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },

  // ── Retry Button ───────────────────────────────────────────
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  retryBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
});

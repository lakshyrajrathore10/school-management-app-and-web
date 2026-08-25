import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, ShieldCheck, RefreshCw, Send, AlertCircle } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { markCheckIn, markCheckOut } from '../../../redux/slice/attendanceSlice';
import { calculateWorkingHours, isLateCheckIn, SCHOOL_CONFIG } from '../../../services/locationService';
import { attendanceService } from '../../../services/attendanceService';
import { showToast } from '../../../utils/toast';
import { convertFileToBase64 } from '../../../utils/fileUtils';

export default function AttendancePreviewScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const route = useRoute<any>();
  const attendance = useAppSelector(s => s.attendance);
  const user = useAppSelector(s => s.auth.user);

  const {
    attendanceType = 'check_in',
    selfieUri,
    selfieBase64: paramSelfieBase64,
    latitude = SCHOOL_CONFIG.anchorLat,
    longitude = SCHOOL_CONFIG.anchorLon,
    accuracy = 10,
  } = route.params ?? {};

  const formattedAccuracy = typeof accuracy === 'number' ? accuracy.toFixed(1) : Number(accuracy || 0).toFixed(1);

  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Current timestamp
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateString = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const dayString = now.toLocaleDateString('en-IN', { weekday: 'long' });

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Resolve base64 image payload from URI if base64 string not directly supplied
      let finalBase64 = paramSelfieBase64 || '';
      if (!finalBase64 && selfieUri) {
        finalBase64 = await convertFileToBase64(selfieUri);
      }

      if (attendanceType === 'check_in') {
        const result = await attendanceService.checkIn({
          employeeId: user?.employeeId,
          type: 'check_in',
          latitude,
          longitude,
          timestamp: now.toISOString(),
          selfieBase64: finalBase64,
          deviceInfo: {
            appVersion: '1.0.0',
            isMockLocation: false,
          },
        });

        const isLate = result.isLate || false;
        dispatch(
          markCheckIn({
            timeString: result.checkInTime || currentTime,
            dateString,
            dayString,
            latitude,
            longitude,
            accuracy,
            isLate,
          })
        );

        navigation.navigate('AttendanceSuccess', {
          attendanceType,
          timestamp: `${dateString}, ${result.checkInTime || currentTime}`,
          isLate,
        });
      } else {
        const result = await attendanceService.checkOut({
          employeeId: user?.employeeId,
          type: 'check_out',
          latitude,
          longitude,
          timestamp: now.toISOString(),
          selfieBase64: finalBase64,
          deviceInfo: {
            appVersion: '1.0.0',
            isMockLocation: false,
          },
        });

        const workingHoursStr =
          result.workingHours ||
          (attendance.checkInTimestamp ? calculateWorkingHours(attendance.checkInTimestamp) : '0h 0m');

        dispatch(
          markCheckOut({
            timeString: result.checkOutTime || currentTime,
            dateString,
            workingHoursString: workingHoursStr,
            latitude,
            longitude,
            accuracy,
          })
        );

        navigation.navigate('AttendanceSuccess', {
          attendanceType,
          timestamp: `${dateString}, ${result.checkOutTime || currentTime}`,
          workingHours: workingHoursStr,
          checkInTime: attendance.checkInTime,
          isLate: false,
        });
      }
    } catch (error: any) {
      showToast.error('Submission Failed', error.message || 'Unable to mark attendance via server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={attendanceType === 'check_in' ? 'Confirm Check-In' : 'Confirm Check-Out'}
        subtitle="Review attendance snapshot"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Selfie Photo Preview with Watermark */}
        <View style={styles.imageCard}>
          {selfieUri && !imageError ? (
            <Image
              source={{ uri: selfieUri }}
              style={styles.selfieImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <AlertCircle size={48} color={Colors.primary} />
              <Text style={styles.placeholderText}>Live Selfie Captured</Text>
            </View>
          )}

          {/* Watermark Overlay */}
          <View style={styles.watermarkOverlay}>
            <View style={styles.watermarkBadge}>
              <ShieldCheck size={12} color={Colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.watermarkBadgeText}>VERIFIED GEO-TAG</Text>
            </View>

            <Text style={styles.watermarkTitle}>{user?.schoolName || 'Whiteleaf International School'}</Text>

            <View style={styles.watermarkRow}>
              <Clock size={12} color={Colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.watermarkText}>
                {dateString} • {currentTime}
              </Text>
            </View>

            <View style={styles.watermarkRow}>
              <MapPin size={12} color={Colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.watermarkText}>
                Lat: {typeof latitude === 'number' ? latitude.toFixed(6) : latitude}, Lon: {typeof longitude === 'number' ? longitude.toFixed(6) : longitude} (~{formattedAccuracy}m)
              </Text>
            </View>

            <Text style={styles.watermarkStaff}>
              {user?.name ?? ''} {user?.employeeId ? `(ID: ${user.employeeId})` : ''}
            </Text>
          </View>
        </View>

        {/* Attendance Summary Metadata Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Attendance Summary</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Attendance Action</Text>
            <View
              style={[
                styles.typeBadge,
                attendanceType === 'check_in' ? styles.typeCheckIn : styles.typeCheckOut,
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  attendanceType === 'check_in' ? styles.typeCheckInText : styles.typeCheckOutText,
                ]}
              >
                {attendanceType === 'check_in' ? 'Check In' : 'Check Out'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time Snapshot</Text>
            <Text style={styles.infoValue}>
              {dateString}, {currentTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {user?.name} ({user?.employeeId})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Campus Geofence</Text>
            <Text style={[styles.infoValue, { color: Colors.success }]} numberOfLines={1} ellipsizeMode="tail">
              Inside Campus (~{formattedAccuracy}m accuracy)
            </Text>
          </View>
        </View>

        {/* Buttons Action Container */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <RefreshCw size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Send size={18} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>
                  {attendanceType === 'check_in' ? 'Confirm Check-In' : 'Confirm Check-Out'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  imageCard: {
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: 16,
    elevation: 4,
  },
  selfieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
  },
  placeholderText: {
    ...typography.subtitle2,
    color: Colors.primary,
    marginTop: 12,
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  watermarkBadgeText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  watermarkTitle: {
    ...typography.subtitle1,
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  watermarkText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  watermarkStaff: {
    ...typography.caption,
    color: Colors.white,
    marginTop: 4,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeaderTitle: {
    ...typography.subtitle1,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  infoLabel: {
    ...typography.body2,
    color: Colors.textSecondary,
    flexShrink: 0,
    marginRight: 8,
  },
  infoValue: {
    ...typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeCheckIn: {
    backgroundColor: Colors.primarySurface,
  },
  typeCheckOut: {
    backgroundColor: Colors.purple_50,
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  typeCheckInText: {
    color: Colors.primary,
  },
  typeCheckOutText: {
    color: Colors.purple_600,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  retakeBtnText: {
    ...typography.button,
    color: Colors.primary,
  },
  submitBtn: {
    flex: 1.4,
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    ...typography.button,
    color: Colors.white,
  },
});

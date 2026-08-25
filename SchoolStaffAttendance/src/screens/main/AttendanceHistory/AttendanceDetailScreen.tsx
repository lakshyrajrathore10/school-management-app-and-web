import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MapPin, CheckCircle2, ShieldCheck, FileText, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/store';
import { SCHOOL_CONFIG } from '../../../services/locationService';

export default function AttendanceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const recordId = route.params?.recordId;

  const history = useAppSelector(s => s.attendance.history);
  const record = history.find(h => h.id === recordId || h.date === route.params?.date);

  if (!record) {
    return (
      <View style={styles.container}>
        <AppHeader title="Attendance Record" subtitle="Record Details" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <AlertCircle size={48} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Record Not Found</Text>
          <Text style={styles.errorSub}>
            The requested attendance log could not be located in your history.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back to History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return { bg: Colors.successSurface, text: Colors.successDark };
      case 'Late':
        return { bg: Colors.warningSurface, text: Colors.warningDark };
      case 'Half Day':
        return { bg: Colors.purple_50, text: Colors.purple_600 };
      case 'Absent':
        return { bg: Colors.errorSurface, text: Colors.errorDark };
      default:
        return { bg: Colors.successSurface, text: Colors.successDark };
    }
  };

  const statusStyle = getStatusBadgeStyle(record.status);

  return (
    <View style={styles.container}>
      <AppHeader title="Attendance Record" subtitle={`${record.date} • ${record.day}`} />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Overview Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <CheckCircle2 size={14} color={statusStyle.text} style={styles.statusIcon} />
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {record.status} {record.isLate ? '(Late Arrival)' : ''}
                </Text>
              </View>
              <Text style={styles.hoursText}>Working Hours: {record.workingHours}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.timesRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Check In</Text>
                <Text style={styles.timeValue}>{record.checkIn}</Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Check Out</Text>
                <Text style={styles.timeValue}>{record.checkOut}</Text>
              </View>
            </View>
          </View>

          {/* Captured Selfie Verification Image */}
          <Text style={styles.sectionTitle}>Verification Selfie</Text>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500' }}
              style={styles.selfieImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <ShieldCheck size={14} color={Colors.white} style={styles.overlayIcon} />
              <Text style={styles.imageOverlayText}>Verified Live Selfie</Text>
            </View>
          </View>

          {/* Location Verification Details */}
          <Text style={styles.sectionTitle}>GPS Verification</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={18} color={Colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Geofence Location</Text>
                <Text style={styles.infoValue}>{SCHOOL_CONFIG.name}</Text>
                <Text style={styles.subText}>
                  {SCHOOL_CONFIG.anchorLat}° N, {SCHOOL_CONFIG.anchorLon}° E (Geofence verified)
                </Text>
              </View>
            </View>
          </View>

          {/* Admin Remarks */}
          <Text style={styles.sectionTitle}>Notes & Remarks</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <FileText size={18} color={Colors.primary} style={styles.infoIcon} />
              <Text style={styles.remarkText}>
                {record.isLate
                  ? 'Check-in recorded after grace period. Marked as Late Arrival.'
                  : 'No issues reported. Attendance automatically verified by GPS geofence.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -12,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  errorSub: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.white,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
  },
  hoursText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  timeValue: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  imageCard: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: Colors.black,
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overlayIcon: {
    marginRight: 4,
  },
  imageOverlayText: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  subText: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  remarkText: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});

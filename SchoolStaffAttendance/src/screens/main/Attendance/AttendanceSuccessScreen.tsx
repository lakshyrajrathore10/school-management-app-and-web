import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Calendar, Clock, MapPin, Timer, ArrowRight, AlertTriangle } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SCHOOL_CONFIG } from '../../../services/locationService';

export default function AttendanceSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    attendanceType = 'check_in',
    timestamp,
    workingHours,
    checkInTime,
    isLate = false,
  } = route.params ?? {};

  const isCheckIn = attendanceType === 'check_in';

  // ── Scale in animation for checkmark ─────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoDashboard = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleGoHistory = () => {
    navigation.navigate('MainTabs', { screen: 'HistoryTab' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* ── Success Icon (animated) ──────────────────── */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <CheckCircle2 size={64} color={Colors.success} />
        </Animated.View>

        {/* ── Title ─────────────────────────────────────── */}
        <Text style={styles.title}>
          {isCheckIn ? 'Checked In Successfully!' : 'Checked Out Successfully!'}
        </Text>

        <Text style={styles.subtitle}>
          Your live selfie and GPS location have been verified and recorded.
        </Text>

        {/* ── Late check-in warning ─────────────────────── */}
        {isLate && isCheckIn && (
          <View style={styles.lateBadge}>
            <AlertTriangle size={15} color={Colors.warning} style={{ marginRight: 6 }} />
            <Text style={styles.lateText}>Late Arrival — marked after grace period</Text>
          </View>
        )}

        {/* ── Details Card ──────────────────────────────── */}
        <View style={styles.detailsCard}>
          {/* Timestamp */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Clock size={15} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>
              {isCheckIn ? 'Check-In Time' : 'Check-Out Time'}
            </Text>
            <Text style={styles.detailValue}>{timestamp}</Text>
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <MapPin size={15} color={Colors.primary} />
            </View>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{SCHOOL_CONFIG.name}</Text>
          </View>

          <View style={styles.divider} />

          {/* Status or Working Hours */}
          {isCheckIn ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Calendar size={15} color={Colors.primary} />
              </View>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.statusBadge, isLate ? styles.statusBadgeLate : styles.statusBadgeOnTime]}>
                <Text style={[styles.statusBadgeText, isLate ? styles.statusBadgeTextLate : styles.statusBadgeTextOnTime]}>
                  {isLate ? 'Late Arrival' : 'On Time'}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Check-in time (for checkout screen) */}
              {checkInTime && (
                <>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                      <Clock size={15} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.detailLabel}>Check-In Was</Text>
                    <Text style={styles.detailValue}>{checkInTime}</Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}
              {/* Working Hours */}
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Timer size={15} color={Colors.primary} />
                </View>
                <Text style={styles.detailLabel}>Working Hours</Text>
                <Text style={[styles.detailValue, styles.workingHoursValue]}>
                  {workingHours ?? '--'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── Action Buttons ────────────────────────────── */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleGoDashboard} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          <ArrowRight size={18} color={Colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHistory} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>View Attendance History</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // ── Icon ───────────────────────────────────────────────────
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.successSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  // ── Text ───────────────────────────────────────────────────
  title: {
    fontSize: 22,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  // ── Late Badge ─────────────────────────────────────────────
  lateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 20,
  },
  lateText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.warning,
  },

  // ── Details Card ───────────────────────────────────────────
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  workingHoursValue: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: typography.fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },

  // ── Status Badges ──────────────────────────────────────────
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeOnTime: {
    backgroundColor: Colors.successSurface,
  },
  statusBadgeLate: {
    backgroundColor: '#FFF7ED',
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
  },
  statusBadgeTextOnTime: {
    color: Colors.successDark,
  },
  statusBadgeTextLate: {
    color: Colors.warning,
  },

  // ── Buttons ────────────────────────────────────────────────
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
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
});

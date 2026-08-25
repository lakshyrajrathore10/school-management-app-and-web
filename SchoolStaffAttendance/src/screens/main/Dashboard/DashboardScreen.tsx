import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  Banknote,
} from 'lucide-react-native';
import { Colors } from '../../../theme';
import { typography } from '../../../theme/tokens/typography';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import AppHeader from '../../../components/common/AppHeader';
import { dashboardService, DashboardDataResponse } from '../../../services/dashboardService';
import { syncTodayStatus } from '../../../redux/slice/attendanceSlice';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const user = useAppSelector(s => s.auth.user);
  const attendance = useAppSelector(s => s.attendance);

  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [workingTimeFormatted, setWorkingTimeFormatted] = useState('0h 0m');

  const loadDashboard = useCallback(async () => {
    try {
      const data = await dashboardService.fetchDashboardData();
      setDashboardData(data);
      if (data?.today) {
        dispatch(syncTodayStatus(data.today));
      }
    } catch (err) {
      // Fallback gracefully if backend offline
    }
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) {
      loadDashboard();
    }
  }, [isFocused, loadDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const todayApi = dashboardData?.today;

  useEffect(() => {
    if (!attendance.checkInTimestamp) {
      if (todayApi?.workingHours) {
        setWorkingTimeFormatted(todayApi.workingHours);
      } else {
        setWorkingTimeFormatted('0h 0m');
      }
      return;
    }

    const updateTimer = () => {
      const endTime = attendance.checkOutTimestamp ? attendance.checkOutTimestamp : Date.now();
      const diffMs = Math.max(0, endTime - (attendance.checkInTimestamp ?? Date.now()));
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      setWorkingTimeFormatted(`${hours}h ${mins}m ${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attendance.checkInTimestamp, attendance.checkOutTimestamp, todayApi?.workingHours]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatTime = (ts: number | null | undefined) => {
    if (!ts) return '--:--';
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isCheckedIn =
    attendance.todayStatus === 'CHECKED_IN' ||
    todayApi?.todayStatus === 'CHECKED_IN' ||
    attendance.status === 'Present' ||
    attendance.status === 'Late' ||
    todayApi?.status === 'Present' ||
    todayApi?.status === 'Late' ||
    !!todayApi?.checkInTime;

  const isCheckedOut =
    attendance.todayStatus === 'CHECKED_OUT' ||
    todayApi?.todayStatus === 'CHECKED_OUT' ||
    attendance.status === 'Checked Out' ||
    todayApi?.status === 'Checked Out' ||
    !!todayApi?.checkOutTime;

  const displayCheckInTime =
    attendance.checkInTime ||
    todayApi?.checkInTime ||
    formatTime(attendance.checkInTimestamp);

  const displayCheckOutTime =
    attendance.checkOutTime ||
    todayApi?.checkOutTime ||
    formatTime(attendance.checkOutTimestamp);

  const getStatusBadgeConfig = () => {
    const currentStatus = todayApi?.status || attendance.status;
    switch (currentStatus) {
      case 'Present':
        return { bg: styles.bgSuccess, text: styles.textSuccess, dot: styles.dotSuccess, label: 'Present' };
      case 'Checked Out':
        return { bg: styles.bgPrimary, text: styles.textPrimaryStatus, dot: styles.dotPrimary, label: 'Checked Out' };
      case 'Late':
        return { bg: styles.bgWarning, text: styles.textWarning, dot: styles.dotWarning, label: 'Late Arrival' };
      case 'Half Day':
        return { bg: styles.bgPurple, text: styles.textPurple, dot: styles.dotPurple, label: 'Half Day' };
      default:
        return { bg: styles.bgWarning, text: styles.textWarning, dot: styles.dotWarning, label: 'Not Marked' };
    }
  };

  const badgeConfig = getStatusBadgeConfig();

  const quickLinks = [
    {
      icon: FileText,
      label: 'Apply Leave',
      subtitle: 'Request time off',
      color: '#7C3AED',
      bgColor: '#EDE9FE',
      action: () => navigation.navigate('ApplyLeave'),
    },
    {
      icon: Banknote,
      label: 'Salary Slips',
      subtitle: 'View pay slips',
      color: '#10B981',
      bgColor: '#ECFDF5',
      action: () => navigation.navigate('SalarySlip'),
    },
    {
      icon: Sparkles,
      label: 'Holidays',
      subtitle: 'School breaks',
      color: '#D97706',
      bgColor: '#FEF3C7',
      action: () => navigation.navigate('HolidayList'),
    },
  ];

  const monthlySummary = dashboardData?.monthlySummary || {
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    leavesTaken: 0,
  };

  const monthStats = [
    { label: 'Present Days', value: String(monthlySummary.presentDays), subtext: 'This Month', icon: CheckCircle2, color: Colors.success },
    { label: 'Late Arrivals', value: String(monthlySummary.lateDays), subtext: 'Flagged', icon: TrendingUp, color: Colors.warningDark },
    { label: 'Leaves Taken', value: String(monthlySummary.leavesTaken), subtext: 'Approved', icon: FileText, color: Colors.purple_600 },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        isDashboard
        showBack={false}
        userName={user?.name ?? 'Whiteleaf Staff'}
        schoolName="Whiteleaf International School"
        onNotificationPress={() => navigation.navigate('NotificationsTab')}
        hasUnreadNotifications
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Today's Status Box */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Today's Status</Text>

            <View style={[styles.statusBadge, badgeConfig.bg]}>
              <View style={[styles.statusDot, badgeConfig.dot]} />
              <Text style={[styles.statusBadgeText, badgeConfig.text]}>{badgeConfig.label}</Text>
            </View>
          </View>

          {/* 3-Column Info Strip for Check In, Working Hours, Check Out */}
          <View style={styles.statusInfoStrip}>
            {/* Check In */}
            <View style={styles.statusInfoItem}>
              <View style={styles.infoIconWrapper}>
                <Clock size={16} color={Colors.textSecondary} />
              </View>
              <Text style={styles.statusInfoLabel}>Check In</Text>
              <Text style={styles.statusInfoValue}>{displayCheckInTime}</Text>
            </View>

            <View style={styles.statusInfoDivider} />

            {/* Working Hours */}
            <View style={styles.statusInfoItem}>
              <View style={styles.infoIconWrapper}>
                <TrendingUp size={16} color={Colors.textSecondary} />
              </View>
              <Text style={styles.statusInfoLabel}>Working Hours</Text>
              <Text style={[styles.statusInfoValue, isCheckedIn && !isCheckedOut && styles.statusInfoValueLive]}>
                {isCheckedOut
                  ? (attendance.workingHoursString || todayApi?.workingHours || '--')
                  : isCheckedIn
                  ? workingTimeFormatted
                  : '--:--'}
              </Text>
            </View>

            <View style={styles.statusInfoDivider} />

            {/* Check Out */}
            <View style={styles.statusInfoItem}>
              <View style={styles.infoIconWrapper}>
                <Clock size={16} color={Colors.textSecondary} />
              </View>
              <Text style={styles.statusInfoLabel}>Check Out</Text>
              <Text style={styles.statusInfoValue}>{displayCheckOutTime}</Text>
            </View>
          </View>

          {/* Check In & Check Out Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                !isCheckedIn ? styles.primaryActionBtn : styles.secondaryActionBtn,
              ]}
              onPress={() => navigation.navigate('Attendance', { type: 'check_in' })}
              disabled={isCheckedIn}
              activeOpacity={0.8}
            >
              <CheckCircle2
                size={16}
                color={!isCheckedIn ? Colors.white : Colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  !isCheckedIn ? styles.primaryActionBtnText : styles.secondaryActionBtnText,
                ]}
              >
                Check In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                isCheckedIn && !isCheckedOut ? styles.primaryActionBtn : styles.secondaryActionBtn,
              ]}
              onPress={() => navigation.navigate('Attendance', { type: 'check_out' })}
              disabled={!isCheckedIn || isCheckedOut}
              activeOpacity={0.8}
            >
              <Clock
                size={16}
                color={isCheckedIn && !isCheckedOut ? Colors.white : Colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  isCheckedIn && !isCheckedOut ? styles.primaryActionBtnText : styles.secondaryActionBtnText,
                ]}
              >
                Check Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Attendance Summary Cards */}
        <Text style={styles.sectionHeader}>Monthly Summary</Text>
        <View style={styles.statsRow}>
          {monthStats.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View key={idx} style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <IconComp size={20} color={item.color} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statSubtext}>{item.subtext}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Actions Links */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickLinksRow}>
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.linkCard}
                onPress={link.action}
                activeOpacity={0.8}
              >
                <View style={[styles.linkIconWrapper, { backgroundColor: link.bgColor }]}>
                  <IconComponent size={24} color={link.color} />
                </View>
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  greetingText: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  userNameText: {
    ...typography.h3,
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTitle: {
    ...typography.subtitle1,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  bgSuccess: { backgroundColor: '#DCFCE7' },
  textSuccess: { color: '#166534' },
  dotSuccess: { backgroundColor: '#166534' },

  bgPrimary: { backgroundColor: Colors.primarySurface },
  textPrimaryStatus: { color: Colors.primary },
  dotPrimary: { backgroundColor: Colors.primary },

  bgWarning: { backgroundColor: '#FEF3C7' },
  textWarning: { color: '#92400E' },
  dotWarning: { backgroundColor: '#92400E' },

  bgPurple: { backgroundColor: '#EDE9FE' },
  textPurple: { color: '#6B21A8' },
  dotPurple: { backgroundColor: '#6B21A8' },

  completedBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  completedTitle: {
    ...typography.subtitle1,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 8,
  },
  completedSub: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timerBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timerLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 6,
  },
  checkOutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkOutButtonText: {
    ...typography.button,
    color: Colors.white,
  },
  notMarkedBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  notMarkedTitle: {
    ...typography.subtitle1,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginTop: 8,
  },
  notMarkedSub: {
    ...typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 6,
  },
  checkInButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkInButtonText: {
    ...typography.button,
    color: Colors.white,
  },
  sectionHeader: {
    ...typography.subtitle1,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    ...typography.h3,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  quickLinksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  linkCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  linkIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkLabel: {
    ...typography.subtitle2,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  linkSubtitle: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* Today's Status Info Strip — check-in / working hours / check-out */
  statusInfoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusInfoLabel: {
    fontSize: 10,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusInfoValue: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  statusInfoValueLive: {
    color: Colors.primary,
  },
  statusInfoDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },

  /* Action Buttons Row */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
  },
  secondaryActionBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
  },
  primaryActionBtnText: {
    color: Colors.white,
  },
  secondaryActionBtnText: {
    color: Colors.textSecondary,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FileText, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Colors, typography } from '../../../theme';

import AppHeader from '../../../components/common/AppHeader';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setLeaves } from '../../../redux/slice/leaveSlice';
import { leaveService } from '../../../services/leaveService';

interface LeaveApplication {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

export default function LeaveListScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const leaveList = useAppSelector(s => s.leave.leaveList);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      setError('');
      const data = await leaveService.fetchLeaves();
      const mapped = data.map(l => ({
        id: l.id,
        type: l.type as any,
        fromDate: l.fromDate,
        toDate: l.toDate,
        days: l.days,
        reason: l.reason,
        status: l.status as any,
        appliedOn: l.appliedOn,
        remarks: l.remarks,
      }));
      dispatch(setLeaves(mapped));
    } catch {
      setError('Could not load leave records. Pull down to retry.');
    }
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchLeaves().finally(() => setLoading(false));
    }
  }, [isFocused, fetchLeaves]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const getStatusConfig = (status: LeaveApplication['status']) => {
    switch (status) {
      case 'Approved':
        return { bg: Colors.successSurface, text: Colors.successDark, icon: CheckCircle2 };
      case 'Pending':
        return { bg: Colors.warningSurface, text: Colors.warningDark, icon: Clock };
      case 'Rejected':
        return { bg: Colors.errorSurface, text: Colors.errorDark, icon: XCircle };
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Leave Management"
        subtitle="Apply and view leave requests"
        showBack={false}
      />

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading leave records…</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeader}>Recent Requests</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
              }
            >
              {error ? (
                <View style={styles.centerBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : leaveList.length === 0 ? (
                <View style={styles.emptyBox}>
                  <FileText size={40} color={Colors.textDisabled} />
                  <Text style={styles.emptyTitle}>No Leave Applications</Text>
                  <Text style={styles.emptySubtitle}>You haven't applied for any leave yet.</Text>
                </View>
              ) : (
                leaveList.map(leave => {
                  const statusConfig = getStatusConfig(leave.status as any);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TouchableOpacity
                      key={leave.id}
                      style={styles.leaveCard}
                      onPress={() => navigation.navigate('LeaveDetail', { leaveId: leave.id })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.typeRow}>
                          <FileText size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                          <Text style={styles.leaveType}>{leave.type}</Text>
                          <Text style={styles.daysBadge}>({leave.days} {leave.days > 1 ? 'Days' : 'Day'})</Text>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                          <StatusIcon size={12} color={statusConfig.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {leave.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.datesRow}>
                        <Text style={styles.dateLabel}>Duration:</Text>
                        <Text style={styles.dateValue}>
                          {leave.fromDate} {leave.fromDate !== leave.toDate ? `to ${leave.toDate}` : ''}
                        </Text>
                      </View>

                      <Text style={styles.reasonText} numberOfLines={2}>
                        "{leave.reason}"
                      </Text>

                      <View style={styles.footerRow}>
                        <Text style={styles.appliedText}>Applied on: {leave.appliedOn}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Sticky Bottom Apply Leave Action Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.stickyApplyBtn}
          onPress={() => navigation.navigate('ApplyLeave')}
          activeOpacity={0.85}
        >
          <Plus size={18} color={Colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.stickyApplyBtnText}>Apply Leave</Text>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: typography.fonts.regular,
    color: Colors.error,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 150,
  },
  leaveCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveType: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  daysBadge: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  dateValue: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
  },
  reasonText: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  appliedText: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  stickyApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stickyApplyBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
});

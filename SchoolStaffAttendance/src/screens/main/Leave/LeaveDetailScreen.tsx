import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Clock, CheckCircle2, XCircle, Trash2, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/store';
import { showToast } from '../../../utils/toast';
import { leaveService } from '../../../services/leaveService';

export default function LeaveDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const leaveId = route.params?.leaveId;

  const leaveList = useAppSelector(s => s.leave.leaveList);
  const leave = leaveList.find(l => l.id === leaveId);

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (!leave) {
    return (
      <View style={styles.container}>
        <AppHeader title="Leave Application Details" subtitle="Application Status" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <AlertCircle size={48} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Application Not Found</Text>
          <Text style={styles.errorSub}>
            The requested leave application could not be found in your account records.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back to Leave List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCancelConfirm = async () => {
    setShowCancelDialog(false);
    try {
      await leaveService.cancelLeave(leave.id);
      showToast.info('Leave Application Withdrawn', 'Your leave request has been successfully cancelled.');
      navigation.goBack();
    } catch (err: any) {
      showToast.error('Cancellation Failed', err?.message || 'Unable to cancel leave application via server.');
    }
  };

  const getStatusBannerConfig = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          bg: Colors.successSurface,
          border: Colors.successDark,
          text: Colors.successDark,
          Icon: CheckCircle2,
          title: 'Approved',
          sub: 'Application has been approved by School Principal.',
        };
      case 'Rejected':
        return {
          bg: Colors.errorSurface,
          border: Colors.error,
          text: Colors.error,
          Icon: XCircle,
          title: 'Application Rejected',
          sub: leave.remarks ?? 'Leave request was not approved by administration.',
        };
      case 'Pending':
      default:
        return {
          bg: Colors.warningSurface,
          border: Colors.warningDark,
          text: Colors.warningDark,
          Icon: Clock,
          title: 'Pending Approval',
          sub: 'Application is currently under review by School Principal.',
        };
    }
  };

  const statusConfig = getStatusBannerConfig(leave.status);
  const StatusIcon = statusConfig.Icon;

  return (
    <View style={styles.container}>
      <AppHeader title="Leave Application Details" subtitle={`Ref: ${leave.id}`} />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Header Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg, borderLeftColor: statusConfig.border }]}>
            <StatusIcon size={20} color={statusConfig.text} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: statusConfig.text }]}>{statusConfig.title}</Text>
              <Text style={styles.statusSubtitle}>{statusConfig.sub}</Text>
            </View>
          </View>

          {/* Details Overview Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Application Summary</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Leave Type:</Text>
              <Text style={styles.value}>{leave.type}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>
                {leave.fromDate} {leave.fromDate !== leave.toDate ? `to ${leave.toDate}` : ''}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Total Days:</Text>
              <Text style={styles.value}>{leave.days} {leave.days > 1 ? 'Days' : 'Day'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Applied On:</Text>
              <Text style={styles.value}>{leave.appliedOn}</Text>
            </View>
          </View>

          {/* Reason Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Reason Provided</Text>
            <Text style={styles.reasonText}>"{leave.reason}"</Text>
          </View>

          {/* Approval Workflow Progress */}
          <Text style={styles.sectionTitle}>Approval Progress</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.dotDone]} />
              <View style={styles.timelineTextGroup}>
                <Text style={styles.timelineStep}>1. Request Submitted</Text>
                <Text style={styles.timelineTime}>{leave.appliedOn}</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  leave.status === 'Approved'
                    ? styles.dotDone
                    : leave.status === 'Rejected'
                    ? styles.dotRejected
                    : styles.dotActive,
                ]}
              />
              <View style={styles.timelineTextGroup}>
                <Text style={styles.timelineStep}>2. Principal Approval</Text>
                <Text style={styles.timelineTime}>
                  {leave.status === 'Approved'
                    ? 'Approved'
                    : leave.status === 'Rejected'
                    ? 'Rejected'
                    : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>

          {/* Cancel Action (Only available if Pending) */}
          {leave.status === 'Pending' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCancelDialog(true)}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color={Colors.error} style={{ marginRight: 6 }} />
              <Text style={styles.cancelBtnText}>Withdraw Leave Request</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <ConfirmationDialog
        visible={showCancelDialog}
        title="Withdraw Request?"
        message="Are you sure you want to cancel this leave application? This action cannot be undone."
        confirmText="Withdraw"
        type="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelDialog(false)}
      />
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
  },
  statusSubtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  reasonText: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  dotDone: {
    backgroundColor: Colors.success,
  },
  dotActive: {
    backgroundColor: Colors.warning,
  },
  dotRejected: {
    backgroundColor: Colors.error,
  },
  timelineTextGroup: {
    flex: 1,
  },
  timelineStep: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  timelineTime: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorSurface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.errorSurface,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.error,
  },
});

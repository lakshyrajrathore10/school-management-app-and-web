import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {
  Calendar,
  Send,
  FileText,
  Image as ImageIcon,
  Trash2,
  X,
  UploadCloud,
  Lock,
} from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { applyLeave, setLeaves, LeaveType } from '../../../redux/slice/leaveSlice';
import AttendanceCalendarModal from '../../../components/attendance/AttendanceCalendarModal';
import { showToast } from '../../../utils/toast';
import { leaveService } from '../../../services/leaveService';
import { schoolService } from '../../../services/schoolService';
import { getActiveSchoolConfig } from '../../../services/locationService';

export interface AttachedFile {
  name: string;
  size: string;
  type: 'pdf' | 'image';
  uri?: string;
}

export default function ApplyLeaveScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const leaveList = useAppSelector(s => s.leave.leaveList);

  const [monthlyQuota, setMonthlyQuota] = useState<number>(getActiveSchoolConfig().monthlyPaidLeaves ?? 2);

  useEffect(() => {
    schoolService.fetchSchoolConfig().then(config => {
      if (config?.monthlyPaidLeaves !== undefined) {
        setMonthlyQuota(config.monthlyPaidLeaves);
      }
    }).catch(() => {});

    leaveService.fetchLeaves().then(data => {
      if (data) {
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
      }
    }).catch(() => {});
  }, [dispatch]);

  // Total monthly quota allocated by admin
  const TOTAL_PAID_LEAVES_PER_MONTH = monthlyQuota;

  // Calculate used paid leaves from current month
  const usedPaidLeaves = useMemo(() => {
    return leaveList
      .filter(l => l.type === 'Paid Leave' && l.status !== 'Rejected')
      .reduce((sum, item) => sum + item.days, 0);
  }, [leaveList]);

  const remainingPaidLeaves = useMemo(() => {
    return Math.max(0, TOTAL_PAID_LEAVES_PER_MONTH - usedPaidLeaves);
  }, [TOTAL_PAID_LEAVES_PER_MONTH, usedPaidLeaves]);

  const isPaidExhausted = remainingPaidLeaves <= 0;

  // Selected leave type - defaulted to null (no initial selection)
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);

  // Automatically switch selectedType to 'Casual Leave' if Paid Leave is active and gets exhausted
  useEffect(() => {
    if (isPaidExhausted && selectedType === 'Paid Leave') {
      setSelectedType('Casual Leave');
    }
  }, [isPaidExhausted, selectedType]);

  // Dates state
  const todayObj = new Date();
  const MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthAbbr = MONTH_ABBRS[todayObj.getMonth()];
  const currentMonthPadded = String(todayObj.getMonth() + 1).padStart(2, '0');
  const initialDateStr = `${todayObj.getDate().toString().padStart(2, '0')} ${currentMonthAbbr} ${todayObj.getFullYear()}`;
  const initialKey = `${todayObj.getFullYear()}-${currentMonthPadded}-${todayObj.getDate().toString().padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(initialDateStr);
  const [startDateKey, setStartDateKey] = useState<string>(initialKey);

  const [endDate, setEndDate] = useState(initialDateStr);
  const [endDateKey, setEndDateKey] = useState<string>(initialKey);

  // Modals state
  const [isStartPickerVisible, setIsStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setIsEndPickerVisible] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);

  // Form details
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<AttachedFile | null>(null);

  // When Start Date is selected, End Date defaults to the SAME date automatically
  const handleSelectStartDate = (dateKey: string, displayDate: string) => {
    setStartDateKey(dateKey);
    setStartDate(displayDate);
    // Auto-default End Date to the exact same Start Date
    setEndDateKey(dateKey);
    setEndDate(displayDate);
    setIsStartPickerVisible(false);
  };

  const handleSelectEndDate = (dateKey: string, displayDate: string) => {
    setEndDateKey(dateKey);
    setEndDate(displayDate);
    setIsEndPickerVisible(false);
  };

  // Attachments handlers
  const handleAttachSamplePdf = () => {
    setAttachment({
      name: 'Medical_Certificate_Aug2026.pdf',
      size: '1.4 MB',
      type: 'pdf',
    });
    setIsAttachmentModalVisible(false);
  };

  const handleAttachSamplePhoto = () => {
    setAttachment({
      name: 'Doctor_Prescription_Photo.jpg',
      size: '2.8 MB',
      type: 'image',
      uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=400',
    });
    setIsAttachmentModalVisible(false);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      showToast.warning('Select Leave Type', 'Please select a leave type to proceed.');
      return;
    }

    if (!reason.trim()) {
      showToast.warning('Missing Reason', 'Please enter a valid reason for applying leave.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await leaveService.applyLeave({
        type: selectedType,
        startDate: startDateKey || startDate,
        endDate: endDateKey || endDate,
        reason: reason.trim(),
      });

      dispatch(
        applyLeave({
          id: result.id,
          type: selectedType,
          fromDate: result.fromDate || startDate,
          toDate: result.toDate || endDate,
          days: result.days || 1,
          reason: reason.trim(),
        }),
      );

      showToast.success(
        'Leave Application Submitted',
        `Your ${selectedType} application has been submitted to the School Administrator.`
      );
      navigation.goBack();
    } catch (err: any) {
      showToast.error('Leave Submission Failed', err?.message || 'Unable to submit leave request via server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Apply Leave" subtitle="Submit a new leave request" />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Leave Type Box Selector */}
          <Text style={styles.label}>Select Leave Type</Text>

          {/* Top Row: Paid Leave Box Card (Gray & Untouchable when Exhausted) */}
          <TouchableOpacity
            style={[
              styles.paidLeaveBox,
              isPaidExhausted && styles.paidLeaveBoxDisabled,
              selectedType === 'Paid Leave' && !isPaidExhausted && styles.leaveBoxActive,
            ]}
            onPress={() => {
              if (isPaidExhausted) {
                showToast.info(
                  'Paid Leave Quota Exhausted',
                  'Monthly quota of 2 paid leaves has been used. Additional paid leave unlocks next month.'
                );
              } else {
                setSelectedType('Paid Leave');
              }
            }}
            activeOpacity={isPaidExhausted ? 0.9 : 0.8}
          >
            <View style={styles.paidLeaveLeft}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.paidLeaveTitle,
                    isPaidExhausted && styles.paidLeaveTitleDisabled,
                    selectedType === 'Paid Leave' && !isPaidExhausted && styles.leaveTextActive,
                  ]}
                >
                  Paid Leave
                </Text>
                {isPaidExhausted && (
                  <View style={styles.lockBadge}>
                    <Lock size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.lockBadgeText}>Exhausted</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.paidLeaveSub,
                  isPaidExhausted && styles.paidLeaveSubDisabled,
                  selectedType === 'Paid Leave' && !isPaidExhausted && styles.leaveSubActive,
                ]}
              >
                {isPaidExhausted
                  ? `Monthly quota used (0/${TOTAL_PAID_LEAVES_PER_MONTH}). Unlocks next month.`
                  : 'Monthly allocated paid quota from school admin'}
              </Text>
            </View>

            <View
              style={[
                styles.paidQuotaPill,
                isPaidExhausted && styles.paidQuotaPillDisabled,
                selectedType === 'Paid Leave' && !isPaidExhausted && styles.paidQuotaPillActive,
              ]}
            >
              <Text
                style={[
                  styles.paidQuotaText,
                  isPaidExhausted && styles.paidQuotaTextDisabled,
                  selectedType === 'Paid Leave' && !isPaidExhausted && styles.paidQuotaTextActive,
                ]}
              >
                {remainingPaidLeaves}/{TOTAL_PAID_LEAVES_PER_MONTH} Left
              </Text>
            </View>
          </TouchableOpacity>

          {/* OR Divider Row */}
          <View style={styles.orDividerRow}>
            <View style={styles.orLine} />
            <View style={styles.orBadge}>
              <Text style={styles.orText}>OR</Text>
            </View>
            <View style={styles.orLine} />
          </View>

          {/* Bottom Row: 3 Other Leave Types in Rectangular Boxes */}
          <View style={styles.otherLeavesRow}>
            {(['Casual Leave', 'Sick Leave', 'Emergency Leave'] as const).map(type => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.otherLeaveBox,
                    isSelected && styles.leaveBoxActive,
                  ]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.otherLeaveText,
                      isSelected && styles.leaveTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section 2: Start Date & End Date with Calendar Pickers */}
          <View style={styles.datesRow}>
            {/* Start Date Box */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateInputBox}
                onPress={() => setIsStartPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{startDate}</Text>
              </TouchableOpacity>
            </View>

            {/* End Date Box */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.dateInputBox}
                onPress={() => setIsEndPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{endDate}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Auto-Sync Note */}
          <Text style={styles.dateNote}>
            * Selecting a Start Date automatically sets the End Date to the same day by default. You can pick a different End Date if required.
          </Text>

          {/* Section 3: Reason Input */}
          <View style={styles.reasonHeaderRow}>
            <Text style={styles.label}>Reason for Leave</Text>
            <Text style={styles.charCount}>{reason.length}/250</Text>
          </View>
          <TextInput
            style={styles.reasonInput}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            maxLength={250}
            placeholder="Explain the reason for taking leave..."
            placeholderTextColor={Colors.textDisabled}
            textAlignVertical="top"
          />

          {/* Section 4: Functional Working File Attachment */}
          <Text style={styles.label}>Attachment (Photo / PDF)</Text>

          {attachment ? (
            <View style={styles.attachedCard}>
              <View style={styles.attachedLeft}>
                {attachment.type === 'pdf' ? (
                  <View style={[styles.attachedIconBox, { backgroundColor: Colors.errorSurface }]}>
                    <FileText size={22} color={Colors.error} />
                  </View>
                ) : attachment.uri ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachedThumbnail} />
                ) : (
                  <View style={[styles.attachedIconBox, { backgroundColor: Colors.primarySurface }]}>
                    <ImageIcon size={22} color={Colors.primary} />
                  </View>
                )}

                <View style={styles.attachedInfo}>
                  <Text style={styles.attachedName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={styles.attachedMeta}>
                    {attachment.size} • Verified Attachment
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeAttachmentBtn}
                onPress={() => setAttachment(null)}
                hitSlop={8}
              >
                <Trash2 size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachmentBox}
              onPress={() => setIsAttachmentModalVisible(true)}
              activeOpacity={0.7}
            >
              <UploadCloud size={24} color={Colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentTitle}>
                  Attach Supporting Document (PDF / JPG)
                </Text>
                <Text style={styles.attachmentSubtitle}>
                  Tap to pick photo, prescription or PDF file
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Section 5: Submit Application */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Send size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Submit Application</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Start Date Calendar Modal */}
      <AttendanceCalendarModal
        visible={isStartPickerVisible}
        onClose={() => setIsStartPickerVisible(false)}
        selectedDateStr={startDateKey}
        onSelectDate={handleSelectStartDate}
        title="Select Leave Start Date"
      />

      {/* End Date Calendar Modal */}
      <AttendanceCalendarModal
        visible={isEndPickerVisible}
        onClose={() => setIsEndPickerVisible(false)}
        selectedDateStr={endDateKey}
        onSelectDate={handleSelectEndDate}
        title="Select Leave End Date"
      />

      {/* Attachment Upload Picker Modal */}
      <Modal
        visible={isAttachmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAttachmentModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsAttachmentModalVisible(false)}
        >
          <Pressable style={styles.uploadModalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Upload Supporting Document</Text>
              <TouchableOpacity onPress={() => setIsAttachmentModalVisible(false)} hitSlop={8}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.uploadModalSub}>
              Select document type to attach with your leave application:
            </Text>

            <TouchableOpacity
              style={styles.uploadOptionBtn}
              onPress={handleAttachSamplePhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.primarySurface }]}>
                <ImageIcon size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadOptionTitle}>Take Photo / Pick Image (JPG/PNG)</Text>
                <Text style={styles.uploadOptionSub}>Upload prescription or written slip photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadOptionBtn}
              onPress={handleAttachSamplePdf}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.errorSurface }]}>
                <FileText size={20} color={Colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadOptionTitle}>Select PDF Document</Text>
                <Text style={styles.uploadOptionSub}>Attach official medical report or document</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  label: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  paidLeaveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  paidLeaveBoxDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.85,
  },
  leaveBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paidLeaveLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidLeaveTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  paidLeaveTitleDisabled: {
    color: Colors.textSecondary,
  },
  paidLeaveSub: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paidLeaveSubDisabled: {
    color: Colors.textDisabled,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  lockBadgeText: {
    fontSize: 10,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
  },
  paidQuotaPill: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  paidQuotaPillDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  paidQuotaPillActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  paidQuotaText: {
    fontSize: 11,
    fontFamily: typography.fonts.bold,
    color: Colors.primary,
  },
  paidQuotaTextDisabled: {
    color: Colors.textSecondary,
  },
  paidQuotaTextActive: {
    color: Colors.primary,
  },
  leaveTextActive: {
    color: Colors.white,
  },
  leaveSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  orBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 10,
  },
  orText: {
    fontSize: 10,
    fontFamily: typography.fonts.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  otherLeavesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  otherLeaveBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherLeaveText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dateText: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  dateNote: {
    fontSize: 10,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 14,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
  },
  reasonInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textPrimary,
    minHeight: 110,
    marginBottom: 20,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  attachmentTitle: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
  },
  attachmentSubtitle: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
  },
  attachedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachedIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  attachedThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 10,
    marginRight: 10,
  },
  attachedInfo: {
    flex: 1,
  },
  attachedName: {
    fontSize: 13,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  attachedMeta: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: Colors.successDark,
    marginTop: 2,
  },
  removeAttachmentBtn: {
    padding: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  uploadModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  uploadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadModalTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  uploadModalSub: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  uploadOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadOptionTitle: {
    fontSize: 13,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  uploadOptionSub: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

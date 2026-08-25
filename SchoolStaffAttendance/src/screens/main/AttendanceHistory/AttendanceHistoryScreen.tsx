import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  SearchX,
  List,
  CalendarDays,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setHistory, AttendanceRecordItem } from '../../../redux/slice/attendanceSlice';
import { attendanceService } from '../../../services/attendanceService';
import { Colors, typography } from '../../../theme';

import AppHeader from '../../../components/common/AppHeader';
import InlineAttendanceCalendar, {
  normalizeDateToKey,
} from '../../../components/attendance/InlineAttendanceCalendar';

type ViewTab = 'calendar' | 'list';
type FilterType = 'today' | 'weekly' | 'monthly' | 'custom_date';

export default function AttendanceHistoryScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const history = useAppSelector(s => s.attendance.history);

  const today = new Date();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('calendar');
  const [activeFilter, setActiveFilter] = useState<FilterType>('monthly');

  // Calendar month state
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth());

  // Selected date state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordItem | undefined>(undefined);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await attendanceService.fetchHistory();
      if (response && Array.isArray(response.items)) {
        dispatch(setHistory(response.items));
      }
    } catch {
    }
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) {
      fetchHistory();
    }
  }, [isFocused, fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return { bg: Colors.successSurface, text: Colors.successDark, icon: CheckCircle2 };
      case 'Late':
        return { bg: Colors.warningSurface, text: Colors.warningDark, icon: AlertCircle };
      case 'Half Day':
        return { bg: Colors.purple_50, text: Colors.purple_600, icon: Clock };
      case 'Absent':
        return { bg: Colors.errorSurface, text: Colors.errorDark, icon: XCircle };
      default:
        return { bg: Colors.successSurface, text: Colors.successDark, icon: CheckCircle2 };
    }
  };

  // Compute live monthly stats based on active calendar year & month
  const monthlyStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;

    history.forEach(rec => {
      const key = normalizeDateToKey(rec.date);
      if (!key) return;
      const d = new Date(key);
      if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Late') late++;
        else if (rec.status === 'Half Day') halfDay++;
        else if (rec.status === 'Absent') absent++;
      }
    });

    return { present, late, halfDay, absent };
  }, [history, calendarYear, calendarMonth]);

  // List view filtered history
  const filteredHistory = useMemo(() => {
    const todayObj = new Date();
    const todayKey = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    if (activeFilter === 'today') {
      return history.filter(item => {
        const key = normalizeDateToKey(item.date);
        return key === todayKey;
      });
    }

    if (activeFilter === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(todayObj.getDate() - 7);
      return history.filter(item => {
        const key = normalizeDateToKey(item.date);
        if (!key) return false;
        const itemDate = new Date(key);
        return itemDate >= sevenDaysAgo && itemDate <= todayObj;
      });
    }

    if (activeFilter === 'custom_date' && selectedDateKey) {
      return history.filter(item => {
        const key = normalizeDateToKey(item.date);
        return key === selectedDateKey;
      });
    }

    // Default: 'monthly' (Selected calendar month or current month)
    return history.filter(item => {
      const key = normalizeDateToKey(item.date);
      if (!key) return true;
      const d = new Date(key);
      return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
    });
  }, [history, activeFilter, selectedDateKey, calendarYear, calendarMonth]);

  const handleSelectDateFromCalendar = (
    dateKey: string,
    displayDate: string,
    record?: AttendanceRecordItem
  ) => {
    setSelectedDateKey(dateKey);
    setSelectedDateLabel(displayDate);
    setSelectedRecord(record);
  };

  const handleResetDateSelection = () => {
    setSelectedDateKey(null);
    setSelectedDateLabel(null);
    setSelectedRecord(undefined);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Attendance History"
        subtitle="View calendar & track check-ins"
        showBack={false}
      />

      <View style={styles.content}>
        {/* View Switcher Tabs (Calendar View vs List View) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'calendar' && styles.tabBtnActive]}
            onPress={() => setActiveTab('calendar')}
            activeOpacity={0.8}
          >
            <CalendarDays
              size={16}
              color={activeTab === 'calendar' ? Colors.white : Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, activeTab === 'calendar' && styles.tabBtnTextActive]}>
              Calendar View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'list' && styles.tabBtnActive]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.8}
          >
            <List
              size={16}
              color={activeTab === 'list' ? Colors.white : Colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, activeTab === 'list' && styles.tabBtnTextActive]}>
              List View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary Card for Active Month */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{monthlyStats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{monthlyStats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.purple_500 }]}>{monthlyStats.halfDay}</Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.error }]}>{monthlyStats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >
          {activeTab === 'calendar' ? (
            /* ============================================================ */
            /* CALENDAR VIEW MODE                                           */
            /* ============================================================ */
            <View>
              {/* Inline Attendance Calendar Widget */}
              <InlineAttendanceCalendar
                historyRecords={history}
                selectedDateStr={selectedDateKey}
                onSelectDate={handleSelectDateFromCalendar}
                activeYear={calendarYear}
                activeMonth={calendarMonth}
                onMonthYearChange={(y, m) => {
                  setCalendarYear(y);
                  setCalendarMonth(m);
                  handleResetDateSelection();
                }}
              />

              {/* Selected Date Details Card */}
              {selectedDateKey ? (
                <View style={styles.selectedDateCard}>
                  <View style={styles.selectedDateCardHeader}>
                    <View style={styles.selectedDateTitleRow}>
                      <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.selectedDateTitle}>{selectedDateLabel}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.clearDateBtn}
                      onPress={handleResetDateSelection}
                      hitSlop={8}
                    >
                      <RotateCcw size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.clearDateText}>Clear</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.recordDivider} />

                  {selectedRecord ? (
                    <TouchableOpacity
                      style={styles.selectedRecordBox}
                      onPress={() =>
                        navigation.navigate('AttendanceDetail', {
                          recordId: selectedRecord.id,
                          date: selectedRecord.date,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordDay}>{selectedRecord.day}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBadgeStyle(selectedRecord.status).bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusBadgeStyle(selectedRecord.status).text },
                            ]}
                          >
                            {selectedRecord.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recordDetailsRow}>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Check In</Text>
                          <Text style={styles.detailValue}>{selectedRecord.checkIn}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Check Out</Text>
                          <Text style={styles.detailValue}>{selectedRecord.checkOut}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Working Hrs</Text>
                          <Text style={styles.detailValue}>{selectedRecord.workingHours}</Text>
                        </View>
                      </View>

                      <View style={styles.viewDetailRow}>
                        <Text style={styles.viewDetailText}>View Selfie & GPS Proof</Text>
                        <ChevronRight size={14} color={Colors.primary} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noRecordBox}>
                      <AlertCircle size={20} color={Colors.error} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.noRecordTitle}>No Check-In Record</Text>
                        <Text style={styles.noRecordSub}>
                          You were absent or did not log attendance on this day.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          ) : (
            /* ============================================================ */
            /* LIST VIEW MODE                                               */
            /* ============================================================ */
            <View>
              {/* Filter Chips */}
              <View style={styles.filterRowContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterRow}
                >
                  <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'monthly' && styles.filterChipActive]}
                    onPress={() => {
                      setActiveFilter('monthly');
                      setSelectedDateKey(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, activeFilter === 'monthly' && styles.filterChipTextActive]}>
                      This Month
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'today' && styles.filterChipActive]}
                    onPress={() => {
                      setActiveFilter('today');
                      setSelectedDateKey(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, activeFilter === 'today' && styles.filterChipTextActive]}>
                      Today
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, activeFilter === 'weekly' && styles.filterChipActive]}
                    onPress={() => {
                      setActiveFilter('weekly');
                      setSelectedDateKey(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, activeFilter === 'weekly' && styles.filterChipTextActive]}>
                      This Week
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Attendance Log Cards */}
              {filteredHistory.length > 0 ? (
                filteredHistory.map(record => {
                  const statusConfig = getStatusBadgeStyle(record.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TouchableOpacity
                      key={record.id}
                      style={styles.recordCard}
                      onPress={() =>
                        navigation.navigate('AttendanceDetail', {
                          recordId: record.id,
                          date: record.date,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.recordHeader}>
                        <View style={styles.dateContainer}>
                          <Calendar size={16} color={Colors.primary} style={styles.calendarIcon} />
                          <Text style={styles.recordDate}>{record.date}</Text>
                          <Text style={styles.recordDay}>• {record.day}</Text>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                          <StatusIcon size={12} color={statusConfig.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {record.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recordDivider} />

                      <View style={styles.recordDetailsRow}>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Check In</Text>
                          <Text style={styles.detailValue}>{record.checkIn}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Check Out</Text>
                          <Text style={styles.detailValue}>{record.checkOut}</Text>
                        </View>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailLabel}>Working Hrs</Text>
                          <Text style={styles.detailValue}>{record.workingHours}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <SearchX size={32} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.emptyTitle}>No Records Found</Text>
                  <Text style={styles.emptySubtitle}>
                    No attendance logs match the selected filter period.
                  </Text>
                </View>
              )}
            </View>
          )}
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
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.white,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContainer: {
    paddingBottom: 90,
  },
  selectedDateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateTitle: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  clearDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearDateText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
  },
  selectedRecordBox: {
    paddingTop: 4,
  },
  noRecordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorSurface,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  noRecordTitle: {
    fontSize: 13,
    fontFamily: typography.fonts.bold,
    color: Colors.errorDark,
  },
  noRecordSub: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.errorDark,
    marginTop: 2,
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetailText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
    marginRight: 4,
  },
  filterRowContainer: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 6,
  },
  recordDate: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  recordDay: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
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
  recordDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  recordDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
});

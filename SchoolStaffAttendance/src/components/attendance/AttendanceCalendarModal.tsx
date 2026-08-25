import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar as CalendarIcon,
  Filter,
  Check,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react-native';
import { Colors, typography } from '../../theme';
import { AttendanceRecordItem } from '../../redux/slice/attendanceSlice';

interface AttendanceCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDateStr: string | null; // e.g. "2026-08-09"
  onSelectDate: (dateStr: string, formattedDisplayDate: string) => void;
  onSelectMonthFilter?: (year: number, monthZeroBased: number, monthName: string) => void;
  historyRecords?: AttendanceRecordItem[];
  title?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to normalize any record date string to YYYY-MM-DD
export function normalizeDateToKey(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Try direct YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try "04 Aug 2026" or "04-Aug-2026"
  const cleaned = dateStr.replace(/-/g, ' ');
  const parsedDate = new Date(cleaned);
  if (!isNaN(parsedDate.getTime())) {
    const y = parsedDate.getFullYear();
    const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const d = String(parsedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

export default function AttendanceCalendarModal({
  visible,
  onClose,
  selectedDateStr,
  onSelectDate,
  onSelectMonthFilter,
  historyRecords = [],
  title = 'Select Date',
}: AttendanceCalendarModalProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0 - 11
  
  // View modes: 'calendar' (days grid) or 'picker' (month & year fast picker)
  const [viewMode, setViewMode] = useState<'calendar' | 'picker'>('calendar');
  const [pickerDecadeStart, setPickerDecadeStart] = useState<number>(
    Math.floor(today.getFullYear() / 12) * 12
  );

  // Sync state on modal open
  useEffect(() => {
    if (visible) {
      if (selectedDateStr) {
        const parts = selectedDateStr.split('-');
        if (parts.length === 3 && parts[0] && parts[1]) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            setCurrentYear(y);
            setCurrentMonth(m);
            setPickerDecadeStart(Math.floor(y / 12) * 12);
          }
        }
      }
      setViewMode('calendar');
    }
  }, [visible, selectedDateStr]);

  // Map history records by "YYYY-MM-DD"
  const recordsMap = useMemo(() => {
    const map: Record<string, AttendanceRecordItem> = {};
    historyRecords.forEach(rec => {
      const key = normalizeDateToKey(rec.date);
      if (key) {
        map[key] = rec;
      }
    });
    return map;
  }, [historyRecords]);

  // Infinite month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: null,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateKey,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remainingGrid = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingGrid; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: null,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handleDayPress = (dayItem: { isCurrentMonth: boolean; dateKey: string | null; dayNumber: number }) => {
    if (!dayItem.isCurrentMonth || !dayItem.dateKey) return;

    const dayStr = String(dayItem.dayNumber).padStart(2, '0');
    const monthShort = MONTH_SHORT[currentMonth] || '';
    const formattedDisplay = `${dayStr} ${monthShort} ${currentYear}`;

    onSelectDate(dayItem.dateKey, formattedDisplay);
    onClose();
  };

  const handleSelectEntireMonth = () => {
    if (onSelectMonthFilter) {
      const monthName = MONTH_NAMES[currentMonth] || '';
      onSelectMonthFilter(currentYear, currentMonth, `${monthName} ${currentYear}`);
    }
    onClose();
  };

  // Scalable 12-year grid for picker view mode
  const pickerYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(pickerDecadeStart + i);
    }
    return years;
  }, [pickerDecadeStart]);

  const getDayStatusConfig = (dateKey: string, record?: AttendanceRecordItem, dayOfWeek?: number) => {
    if (record) {
      switch (record.status) {
        case 'Present':
          return { bg: Colors.successSurface, border: Colors.success, text: Colors.successDark, label: 'P' };
        case 'Late':
          return { bg: Colors.warningSurface, border: Colors.warning, text: Colors.warningDark, label: 'L' };
        case 'Half Day':
          return { bg: Colors.purple_50, border: Colors.purple_500, text: Colors.purple_600, label: 'HD' };
        case 'Absent':
          return { bg: Colors.errorSurface, border: Colors.error, text: Colors.errorDark, label: 'A' };
      }
    }
    if (dayOfWeek === 0) {
      return { bg: Colors.slate_100, border: Colors.transparent, text: Colors.textSecondary, label: 'SUN' };
    }
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const cellDate = new Date(dateKey);
    if (cellDate < todayDate) {
      return { bg: Colors.errorSurface, border: Colors.error, text: Colors.errorDark, label: 'A' };
    }
    return { bg: Colors.surface, border: Colors.transparent, text: Colors.textPrimary, label: '' };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <CalendarIcon size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            {viewMode === 'calendar' ? (
              <>
                <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth} activeOpacity={0.7}>
                  <ChevronLeft size={20} color={Colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.monthYearHeaderBtn}
                  onPress={() => {
                    setPickerDecadeStart(Math.floor(currentYear / 12) * 12);
                    setViewMode('picker');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.monthYearText}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </Text>
                  <ChevronDown size={16} color={Colors.primary} style={{ marginLeft: 2 }} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth} activeOpacity={0.7}>
                  <ChevronRight size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </>
            ) : (
              /* Decade Year Pager in Picker View Mode */
              <View style={styles.pickerNavRow}>
                <TouchableOpacity
                  style={styles.arrowBtn}
                  onPress={() => setPickerDecadeStart(prev => prev - 12)}
                  activeOpacity={0.7}
                >
                  <ChevronsLeft size={20} color={Colors.primary} />
                </TouchableOpacity>

                <Text style={styles.pickerDecadeTitle}>
                  {pickerDecadeStart} – {pickerDecadeStart + 11}
                </Text>

                <TouchableOpacity
                  style={styles.arrowBtn}
                  onPress={() => setPickerDecadeStart(prev => prev + 12)}
                  activeOpacity={0.7}
                >
                  <ChevronsRight size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* View Content Switch */}
          {viewMode === 'picker' ? (
            /* Month & Scalable Year Picker Grid */
            <View style={styles.pickerContainer}>
              {/* Year Selection Section */}
              <Text style={styles.pickerSectionTitle}>Select Year</Text>
              <View style={styles.yearsGrid}>
                {pickerYears.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.pickerYearChip,
                      y === currentYear && styles.pickerYearChipActive,
                    ]}
                    onPress={() => setCurrentYear(y)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerYearText,
                        y === currentYear && styles.pickerYearTextActive,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Month Selection Section */}
              <Text style={styles.pickerSectionTitle}>Select Month</Text>
              <View style={styles.monthsGrid}>
                {MONTH_SHORT.map((mShort, idx) => (
                  <TouchableOpacity
                    key={mShort}
                    style={[
                      styles.pickerMonthChip,
                      idx === currentMonth && styles.pickerMonthChipActive,
                    ]}
                    onPress={() => setCurrentMonth(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerMonthText,
                        idx === currentMonth && styles.pickerMonthTextActive,
                      ]}
                    >
                      {mShort}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm / Back to Days Button */}
              <TouchableOpacity
                style={styles.donePickerBtn}
                onPress={() => setViewMode('calendar')}
                activeOpacity={0.8}
              >
                <Check size={16} color={Colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.donePickerBtnText}>
                  View {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Calendar Grid (Days View Mode) */
            <>
              {/* Weekday Headers */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((wd, index) => (
                  <Text
                    key={wd}
                    style={[
                      styles.weekdayText,
                      (index === 0 || index === 6) && styles.weekendText,
                    ]}
                  >
                    {wd}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, index) => {
                  if (!item.isCurrentMonth) {
                    return (
                      <View key={`pad-${index}`} style={styles.dayCell}>
                        <Text style={styles.dayTextDisabled}>{item.dayNumber}</Text>
                      </View>
                    );
                  }

                  const dateKey = item.dateKey!;
                  const record = recordsMap[dateKey];
                  const isSelected = selectedDateStr === dateKey;
                  const isToday =
                    today.getFullYear() === currentYear &&
                    today.getMonth() === currentMonth &&
                    today.getDate() === item.dayNumber;

                  const dayOfWeek = new Date(currentYear, currentMonth, item.dayNumber).getDay();
                  const statusConfig = getDayStatusConfig(dateKey, record, dayOfWeek);

                  return (
                    <TouchableOpacity
                      key={dateKey}
                      style={[
                        styles.dayCell,
                        { backgroundColor: statusConfig.bg, borderColor: statusConfig.border, borderWidth: 1 },
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => handleDayPress(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: isSelected ? Colors.white : statusConfig.text },
                          isSelected && styles.dayTextSelected,
                          isToday && !isSelected && styles.dayTextToday,
                        ]}
                      >
                        {item.dayNumber}
                      </Text>

                      {statusConfig.label ? (
                        <View style={{ position: 'absolute', bottom: 2 }}>
                          <Text style={{ fontSize: 7, fontFamily: typography.fonts.bold, color: isSelected ? Colors.white : statusConfig.text }}>
                            {statusConfig.label}
                          </Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.legendText}>Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.legendText}>Late</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.purple_500 }]} />
                  <Text style={styles.legendText}>Half Day</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                  <Text style={styles.legendText}>Absent</Text>
                </View>
              </View>

              {/* Action Footer */}
              <View style={styles.footerRow}>
                {onSelectMonthFilter && (
                  <TouchableOpacity
                    style={styles.monthFilterBtn}
                    onPress={handleSelectEntireMonth}
                    activeOpacity={0.8}
                  >
                    <Filter size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.monthFilterBtnText}>
                      Filter Entire {MONTH_NAMES[currentMonth] || ''}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.todayBtn}
                  onPress={() => {
                    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const dayStr = String(today.getDate()).padStart(2, '0');
                    const monthShort = MONTH_SHORT[today.getMonth()] || '';
                    const formattedDisplay = `${dayStr} ${monthShort} ${today.getFullYear()}`;
                    
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                    onSelectDate(todayKey, formattedDisplay);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.todayBtnText}>Today</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pickerNavRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pickerDecadeTitle: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.primary,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: 8,
  },
  monthYearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  monthYearText: {
    fontSize: 15,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginRight: 6,
  },
  tapYearHint: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: Colors.primary,
  },
  pickerContainer: {
    paddingVertical: 4,
  },
  pickerSectionTitle: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pickerYearChip: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerYearChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerYearText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
  },
  pickerYearTextActive: {
    color: Colors.white,
    fontFamily: typography.fonts.bold,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerMonthChip: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerMonthChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerMonthText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
  },
  pickerMonthTextActive: {
    color: Colors.white,
    fontFamily: typography.fonts.bold,
  },
  donePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  donePickerBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.white,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
  weekendText: {
    color: Colors.error,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayCell: {
    width: 36,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 10,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
  },
  dayTextDisabled: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
  },
  dayTextSelected: {
    color: Colors.white,
    fontFamily: typography.fonts.bold,
  },
  dayTextToday: {
    color: Colors.primary,
    fontFamily: typography.fonts.bold,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  monthFilterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySurface,
    paddingVertical: 10,
    borderRadius: 12,
  },
  monthFilterBtnText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
  },
  todayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  todayBtnText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.white,
  },
});

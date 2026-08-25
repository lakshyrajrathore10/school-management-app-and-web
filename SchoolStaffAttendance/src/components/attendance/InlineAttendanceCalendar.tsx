import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  ChevronsLeft,
  ChevronsRight,
  Check,
} from 'lucide-react-native';
import { Colors, typography } from '../../theme';
import { AttendanceRecordItem } from '../../redux/slice/attendanceSlice';

interface InlineAttendanceCalendarProps {
  historyRecords: AttendanceRecordItem[];
  selectedDateStr: string | null;
  onSelectDate: (dateKey: string, formattedDisplayDate: string, record?: AttendanceRecordItem) => void;
  onMonthYearChange?: (year: number, monthZeroBased: number) => void;
  activeYear?: number;
  activeMonth?: number;
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

export function normalizeDateToKey(dateStr: string): string | null {
  if (!dateStr) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

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

export default function InlineAttendanceCalendar({
  historyRecords = [],
  selectedDateStr,
  onSelectDate,
  onMonthYearChange,
  activeYear,
  activeMonth,
}: InlineAttendanceCalendarProps) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState<number>(activeYear ?? today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(activeMonth ?? today.getMonth());
  const [viewMode, setViewMode] = useState<'calendar' | 'picker'>('calendar');
  const [pickerDecadeStart, setPickerDecadeStart] = useState<number>(
    Math.floor((activeYear ?? today.getFullYear()) / 12) * 12
  );

  useEffect(() => {
    if (activeYear !== undefined && activeYear !== currentYear) {
      setCurrentYear(activeYear);
    }
    if (activeMonth !== undefined && activeMonth !== currentMonth) {
      setCurrentMonth(activeMonth);
    }
  }, [activeYear, activeMonth]);

  const handleYearMonthChange = (newYear: number, newMonth: number) => {
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    if (onMonthYearChange) {
      onMonthYearChange(newYear, newMonth);
    }
  };

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

  const handlePrevMonth = () => {
    let newM = currentMonth - 1;
    let newY = currentYear;
    if (newM < 0) {
      newM = 11;
      newY = currentYear - 1;
    }
    handleYearMonthChange(newY, newM);
  };

  const handleNextMonth = () => {
    let newM = currentMonth + 1;
    let newY = currentYear;
    if (newM > 11) {
      newM = 0;
      newY = currentYear + 1;
    }
    handleYearMonthChange(newY, newM);
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Padding previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: null,
        dayOfWeek: 0,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
      const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();

      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateKey,
        dayOfWeek,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remainingGrid = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingGrid; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: null,
        dayOfWeek: 0,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handleDayPress = (dayItem: { isCurrentMonth: boolean; dateKey: string | null; dayNumber: number }) => {
    if (!dayItem.isCurrentMonth || !dayItem.dateKey) return;

    const dayStr = String(dayItem.dayNumber).padStart(2, '0');
    const monthShort = MONTH_SHORT[currentMonth] || '';
    const formattedDisplay = `${dayStr} ${monthShort} ${currentYear}`;
    const record = recordsMap[dayItem.dateKey];

    onSelectDate(dayItem.dateKey, formattedDisplay, record);
  };

  const pickerYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(pickerDecadeStart + i);
    }
    return years;
  }, [pickerDecadeStart]);

  // Determine cell badge status
  const getDayStatusConfig = (dateKey: string, dayOfWeek: number) => {
    const record = recordsMap[dateKey];
    if (record) {
      switch (record.status) {
        case 'Present':
          return {
            status: 'Present',
            bg: Colors.successSurface,
            border: Colors.success,
            textColor: Colors.successDark,
            badgeLabel: 'P',
          };
        case 'Late':
          return {
            status: 'Late',
            bg: Colors.warningSurface,
            border: Colors.warning,
            textColor: Colors.warningDark,
            badgeLabel: 'L',
          };
        case 'Half Day':
          return {
            status: 'Half Day',
            bg: Colors.purple_50,
            border: Colors.purple_500,
            textColor: Colors.purple_600,
            badgeLabel: 'HD',
          };
        case 'Absent':
          return {
            status: 'Absent',
            bg: Colors.errorSurface,
            border: Colors.error,
            textColor: Colors.errorDark,
            badgeLabel: 'A',
          };
      }
    }

    // Is Sunday?
    if (dayOfWeek === 0) {
      return {
        status: 'Sunday',
        bg: Colors.slate_100,
        border: Colors.transparent,
        textColor: Colors.textSecondary,
        badgeLabel: 'SUN',
      };
    }

    // Is a past working day before today without a record? -> Treat as Absent
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const cellDate = new Date(dateKey);

    if (cellDate < todayDate) {
      return {
        status: 'Absent',
        bg: Colors.errorSurface,
        border: Colors.error,
        textColor: Colors.errorDark,
        badgeLabel: 'A',
      };
    }

    // Today or Future without record
    if (dateKey === todayKey) {
      return {
        status: 'Today',
        bg: Colors.primarySurface,
        border: Colors.primary,
        textColor: Colors.primary,
        badgeLabel: 'TODAY',
      };
    }

    return {
      status: 'Upcoming',
      bg: Colors.surface,
      border: Colors.transparent,
      textColor: Colors.textPrimary,
      badgeLabel: '',
    };
  };

  return (
    <View style={styles.cardContainer}>
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
              <CalendarIcon size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.monthYearText}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <ChevronDown size={14} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth} activeOpacity={0.7}>
              <ChevronRight size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </>
        ) : (
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

      {/* Mode View Content */}
      {viewMode === 'picker' ? (
        <View style={styles.pickerContainer}>
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

          <TouchableOpacity
            style={styles.donePickerBtn}
            onPress={() => {
              setViewMode('calendar');
              handleYearMonthChange(currentYear, currentMonth);
            }}
            activeOpacity={0.8}
          >
            <Check size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.donePickerBtnText}>
              Apply {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Weekdays Row Header */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd, index) => (
              <Text
                key={wd}
                style={[
                  styles.weekdayText,
                  index === 0 && styles.sundayHeader,
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
                  <View key={`pad-${index}`} style={styles.dayCellContainer}>
                    <View style={styles.dayCellDisabled}>
                      <Text style={styles.dayTextDisabled}>{item.dayNumber}</Text>
                    </View>
                  </View>
                );
              }

              const dateKey = item.dateKey!;
              const isSelected = selectedDateStr === dateKey;
              const isToday = dateKey === todayKey;
              const statusConfig = getDayStatusConfig(dateKey, item.dayOfWeek);

              return (
                <TouchableOpacity
                  key={dateKey}
                  style={styles.dayCellContainer}
                  onPress={() => handleDayPress(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCell,
                      { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                      isSelected && styles.dayCellSelected,
                      isToday && !isSelected && styles.dayCellTodayBorder,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: statusConfig.textColor },
                        isSelected && styles.dayTextSelected,
                        isToday && !isSelected && styles.dayTextToday,
                      ]}
                    >
                      {item.dayNumber}
                    </Text>

                    {/* Status Badge Label */}
                    {statusConfig.badgeLabel ? (
                      <View
                        style={[
                          styles.badgePill,
                          isSelected && styles.badgePillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgePillText,
                            { color: isSelected ? Colors.primary : statusConfig.textColor },
                          ]}
                        >
                          {statusConfig.badgeLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBadge, { backgroundColor: Colors.successSurface, borderColor: Colors.success }]}>
                <Text style={[styles.legendBadgeText, { color: Colors.successDark }]}>P</Text>
              </View>
              <Text style={styles.legendText}>Present</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBadge, { backgroundColor: Colors.errorSurface, borderColor: Colors.error }]}>
                <Text style={[styles.legendBadgeText, { color: Colors.errorDark }]}>A</Text>
              </View>
              <Text style={styles.legendText}>Absent</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBadge, { backgroundColor: Colors.warningSurface, borderColor: Colors.warning }]}>
                <Text style={[styles.legendBadgeText, { color: Colors.warningDark }]}>L</Text>
              </View>
              <Text style={styles.legendText}>Late</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendBadge, { backgroundColor: Colors.purple_50, borderColor: Colors.purple_500 }]}>
                <Text style={[styles.legendBadgeText, { color: Colors.purple_600 }]}>HD</Text>
              </View>
              <Text style={styles.legendText}>Half Day</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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
  arrowBtn: {
    padding: 6,
    borderRadius: 8,
  },
  monthYearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  monthYearText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginRight: 4,
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
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  weekdayText: {
    width: '13%',
    textAlign: 'center',
    fontSize: 11,
    fontFamily: typography.fonts.bold,
    color: Colors.textSecondary,
  },
  sundayHeader: {
    color: Colors.error,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayCellContainer: {
    width: '14.28%',
    alignItems: 'center',
    marginVertical: 3,
  },
  dayCell: {
    width: 38,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellDisabled: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayCellTodayBorder: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontFamily: typography.fonts.bold,
  },
  dayTextDisabled: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  dayTextToday: {
    fontFamily: typography.fonts.bold,
  },
  badgePill: {
    position: 'absolute',
    bottom: 2,
    paddingHorizontal: 3,
    borderRadius: 4,
  },
  badgePillSelected: {
    backgroundColor: Colors.white,
  },
  badgePillText: {
    fontSize: 8,
    fontFamily: typography.fonts.bold,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBadge: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  legendBadgeText: {
    fontSize: 9,
    fontFamily: typography.fonts.bold,
  },
  legendText: {
    fontSize: 11,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Calendar, ArrowLeft } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import { useNavigation } from '@react-navigation/native';
import { holidayService } from '../../../services/holidayService';

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Festival' | 'School' | 'Vacation';
  description?: string;
}

export const mockHolidays: HolidayItem[] = [];

export default function HolidayListScreen() {
  const navigation = useNavigation();

  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchHolidaysData = useCallback(async () => {
    try {
      const data = await holidayService.fetchHolidays();
      if (Array.isArray(data)) {
        const mapped: HolidayItem[] = data.map(h => ({
          id: h.id,
          name: h.name,
          date: h.date,
          day: h.day,
          type: (h.type as any) || 'School',
          description: h.description,
        }));
        setHolidays(mapped);
      }
    } catch {
      
      setHolidays([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHolidaysData().finally(() => setLoading(false));
  }, [fetchHolidaysData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHolidaysData();
    setRefreshing(false);
  };

  const getTypeBadge = (type: HolidayItem['type']) => {
    switch (type) {
      case 'National':
        return { bg: Colors.primarySurface, text: Colors.primary };
      case 'Festival':
        return { bg: Colors.warningSurface, text: Colors.warningDark };
      case 'Vacation':
        return { bg: Colors.purple_50, text: Colors.purple_600 };
      case 'School':
      default:
        return { bg: Colors.accentSurface, text: Colors.accentDark };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Holiday Calendar</Text>
          <Text style={styles.headerSubtitle}>Academic Year 2026-2027</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 12, color: Colors.textSecondary, fontFamily: typography.fonts.regular }}>
              Loading holiday calendar…
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
          >
            {holidays.length > 0 ? (
              holidays.map(holiday => {
                const badge = getTypeBadge(holiday.type);

                return (
                  <TouchableOpacity
                    key={holiday.id}
                    style={styles.holidayCard}
                    onPress={() => (navigation as any).navigate('HolidayDetail', { holidayId: holiday.id, holidayData: holiday })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.iconCircle}>
                        <Sparkles size={18} color={Colors.primary} />
                      </View>

                      <View style={styles.titleWrapper}>
                        <Text style={styles.holidayName}>{holiday.name}</Text>
                        <View style={styles.dateRow}>
                          <Calendar size={13} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.holidayDate}>{holiday.date}</Text>
                          <Text style={styles.holidayDay}>({holiday.day})</Text>
                        </View>
                      </View>

                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{holiday.type}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Sparkles size={40} color={Colors.textDisabled} />
                <Text style={{ fontSize: 16, fontFamily: typography.fonts.semiBold, color: Colors.textPrimary, marginTop: 12 }}>
                  No Holidays Scheduled
                </Text>
                <Text style={{ fontSize: 13, fontFamily: typography.fonts.regular, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                  There are currently no holidays declared in the calendar.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.whiteOpacity15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.whiteOpacity80,
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 40,
  },
  holidayCard: {
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  holidayName: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayDate: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.primary,
  },
  holidayDay: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
  },
});

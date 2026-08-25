import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Calendar, Bell, Info, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast } from '../../../utils/toast';
import { holidayService } from '../../../services/holidayService';

export default function HolidayDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { holidayId, holidayData } = route.params ?? {};

  const [holiday, setHoliday] = useState<any>(holidayData || null);
  const [loading, setLoading] = useState<boolean>(!holidayData && !!holidayId);

  useEffect(() => {
    if (!holidayData && holidayId) {
      setLoading(true);
      holidayService.fetchDetail(holidayId)
        .then(res => setHoliday(res))
        .catch(() => setHoliday(null))
        .finally(() => setLoading(false));
    }
  }, [holidayId, holidayData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Holiday Details" subtitle="Loading Information..." />
        <View style={styles.errorContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!holiday) {
    return (
      <View style={styles.container}>
        <AppHeader title="Holiday Details" subtitle="Calendar Information" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <AlertCircle size={48} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Holiday Not Found</Text>
          <Text style={styles.errorSub}>
            The requested holiday entry could not be located in the calendar schedule.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back to Holiday List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleAddReminder = () => {
    showToast.success('Reminder Added', `A calendar reminder notification for ${holiday.name} has been set.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Holiday Details" subtitle={`${holiday.date} • ${holiday.day}`} />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Card */}
          <View style={styles.bannerCard}>
            <View style={styles.iconCircle}>
              <Sparkles size={28} color={Colors.primary} />
            </View>
            <Text style={styles.holidayTitle}>{holiday.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{holiday.type} Holiday</Text>
            </View>
          </View>

          {/* Schedule Info */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Schedule Info</Text>

            <View style={styles.infoRow}>
              <Calendar size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Date & Day</Text>
                <Text style={styles.infoValue}>{holiday.date} ({holiday.day})</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Info size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>School Operation Status</Text>
                <Text style={styles.infoValue}>Closed for all Staff & Students</Text>
              </View>
            </View>
          </View>

          {/* Event Description */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>About Event</Text>
            <Text style={styles.descriptionText}>
              {holiday.name} is observed as a official school holiday ({holiday.type}). Regular teaching classes and staff duties will remain suspended. Staff members assigned to special campus events are requested to follow instructions issued by the administration.
            </Text>
          </View>

          {/* Action */}
          <TouchableOpacity style={styles.reminderBtn} onPress={handleAddReminder} activeOpacity={0.8}>
            <Bell size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.reminderBtnText}>Set Holiday Reminder</Text>
          </TouchableOpacity>
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
  bannerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  holidayTitle: {
    fontSize: 20,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: typography.fonts.semiBold,
    color: Colors.primary,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    color: Colors.white,
  },
});

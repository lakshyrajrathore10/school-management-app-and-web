import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Bell, Clock, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { markAsRead } from '../../../redux/slice/notificationSlice';

export default function NotificationDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const notificationId = route.params?.notificationId;

  const notifications = useAppSelector(s => s.notifications.notifications);
  const notification = notifications.find(n => n.id === notificationId);

  useEffect(() => {
    if (notification && !notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  }, [dispatch, notification]);

  if (!notification) {
    return (
      <View style={styles.container}>
        <AppHeader title="Announcement Detail" subtitle="Notification" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <AlertCircle size={48} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>Notice Not Found</Text>
          <Text style={styles.errorSub}>
            The requested announcement or notification could not be found.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back to Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Announcement Detail" subtitle="Official School Notice" />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Bell size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>{notification.title}</Text>
              <View style={styles.metaRow}>
                <Clock size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{notification.timestamp} • {notification.date}</Text>
              </View>
            </View>
          </View>

          {/* Sender Details */}
          <View style={styles.card}>
            <View style={styles.senderRow}>
              <UserCheck size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Issued By</Text>
                <Text style={styles.senderName}>School Administration Office</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{notification.type.replace('_', ' ')}</Text>
              </View>
            </View>
          </View>

          {/* Notice Body */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Announcement Content</Text>
            <Text style={styles.bodyText}>{notification.body}</Text>
          </View>
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  noticeTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
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
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
  },
  senderName: {
    fontSize: 13,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  typeBadge: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: typography.fonts.bold,
    color: Colors.primary,
  },
  bodyText: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

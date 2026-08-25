import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Calendar, Info, Clock, AlertTriangle, CheckCheck, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, typography } from '../../../theme';

import AppHeader from '../../../components/common/AppHeader';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setNotifications, markAsRead, markAllAsRead } from '../../../redux/slice/notificationSlice';
import { notificationService } from '../../../services/notificationService';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(s => s.notifications.notifications);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setError('');
      const data = await notificationService.fetchNotifications();
      // Map API shape to local shape
      const mapped = data.map(n => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        timestamp: n.timestamp,
        date: n.date,
      }));
      dispatch(setNotifications(mapped));
    } catch {
      setError('Could not load notifications. Pull down to retry.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ATTENDANCE_REMINDER':
        return { icon: Clock, color: Colors.warning, bg: Colors.warningSurface };
      case 'MEETING_NOTICE':
        return { icon: Info, color: Colors.primary, bg: Colors.primarySurface };
      case 'HOLIDAY_NOTICE':
        return { icon: Calendar, color: Colors.accentDark, bg: Colors.accentSurface };
      case 'LEAVE_APPROVAL':
      case 'GENERAL_CIRCULAR':
      default:
        return { icon: AlertTriangle, color: Colors.purple_600, bg: Colors.purple_50 };
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        subtitle="Announcements & Alerts"
        showBack={false}
        rightElement={
          <TouchableOpacity style={styles.markAllBtn} onPress={() => dispatch(markAllAsRead())}>
            <CheckCheck size={16} color={Colors.white} style={{ marginRight: 4 }} />
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        }
      />

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading notifications…</Text>
          </View>
        ) : (
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
            ) : notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bell size={40} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>You're all caught up! New updates will appear here.</Text>
              </View>
            ) : (
              notifications.map(item => {
                const iconConfig = getIconForType(item.type);
                const IconComponent = iconConfig.icon;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.notificationCard}
                    onPress={() => {
                      dispatch(markAsRead(item.id));
                      navigation.navigate('NotificationDetail', { notificationId: item.id });
                    }}
                    activeOpacity={0.7}
                  >
                    {!item.isRead && <View style={styles.unreadStrip} />}
                    <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                      <IconComponent size={20} color={iconConfig.color} />
                    </View>

                    <View style={styles.textWrapper}>
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.cardMessage}>{item.body}</Text>
                      <Text style={styles.cardTime}>{item.timestamp} · {item.date}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteOpacity15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.white,
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
    paddingBottom: 130,
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
    paddingHorizontal: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  unreadStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
  },
});

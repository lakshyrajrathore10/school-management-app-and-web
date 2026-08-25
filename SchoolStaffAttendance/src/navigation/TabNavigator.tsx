import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Calendar, FileText, Bell, User } from 'lucide-react-native';
import { MainTabParamList } from '../types/navigation.types';
import {
  DashboardScreen,
  AttendanceHistoryScreen,
  LeaveListScreen,
  NotificationsScreen,
  ProfileScreen,
} from '../screens/main';
import { Colors, typography } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBarButton = (props: BottomTabBarButtonProps) => {
  const { delayLongPress, ...rest } = props as any;
  return (
    <TouchableOpacity
      {...rest}
      delayLongPress={delayLongPress ?? undefined}
      activeOpacity={0.7}
    />
  );
};

function getTabBarIcon(routeName: string, focused: boolean, color: string) {
  const iconSize = 22;
  switch (routeName) {
    case 'HomeTab':
      return <LayoutDashboard size={iconSize} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
    case 'HistoryTab':
      return <Calendar size={iconSize} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
    case 'LeaveTab':
      return <FileText size={iconSize} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
    case 'NotificationsTab':
      return <Bell size={iconSize} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
    case 'ProfileTab':
      return <User size={iconSize} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
    default:
      return null;
  }
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'ios' ? 20 : 12);
  const tabHeight = 58 + bottomPadding;

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarButton: CustomTabBarButton,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          elevation: 12,
          shadowColor: Colors.black,
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.fonts.medium,
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color }) => getTabBarIcon(route.name, focused, color),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={AttendanceHistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="LeaveTab"
        component={LeaveListScreen}
        options={{ tabBarLabel: 'Leave' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

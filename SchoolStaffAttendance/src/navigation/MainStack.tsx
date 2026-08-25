import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation.types';
import { Colors } from '../theme';
import TabNavigator from './TabNavigator';
import {
  AttendanceHomeScreen,
  AttendanceCameraScreen,
  AttendancePreviewScreen,
  AttendanceSuccessScreen,
  AttendanceFailedScreen,
  AttendanceDetailScreen,
  ApplyLeaveScreen,
  LeaveDetailScreen,
  HolidayListScreen,
  HolidayDetailScreen,
  NotificationDetailScreen,
  AboutAppScreen,
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
  SalarySlipScreen,
} from '../screens/main';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Main Stack — shown when user IS logged in.
 * Hosts MainTabs (Bottom Navigation) as initial screen + detail stack screens.
 */
export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Attendance Workflow */}
      <Stack.Screen name="Attendance" component={AttendanceHomeScreen} />
      <Stack.Screen name="AttendanceCamera" component={AttendanceCameraScreen} />
      <Stack.Screen name="AttendancePreview" component={AttendancePreviewScreen} />
      <Stack.Screen name="AttendanceSuccess" component={AttendanceSuccessScreen} />
      <Stack.Screen name="AttendanceFailed" component={AttendanceFailedScreen} />
      <Stack.Screen name="AttendanceDetail" component={AttendanceDetailScreen} />

      {/* Leave */}
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
      <Stack.Screen name="LeaveDetail" component={LeaveDetailScreen} />

      {/* Salary */}
      <Stack.Screen name="SalarySlip" component={SalarySlipScreen} />

      {/* Holiday */}
      <Stack.Screen name="HolidayList" component={HolidayListScreen} />
      <Stack.Screen name="HolidayDetail" component={HolidayDetailScreen} />

      {/* Notifications */}
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />

      {/* Profile */}
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

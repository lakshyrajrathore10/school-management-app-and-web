import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { User, Building, Phone, LogOut, Shield, ChevronRight, Lock, Eye, EyeOff, X, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, typography } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { logout } from '../../../redux/slice/authSlice';
import { resetToAuth } from '../../../navigation/NavigationService';
import AppHeader from '../../../components/common/AppHeader';
import { showToast } from '../../../utils/toast';
import { profileService } from '../../../services/profileService';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  // Change Password Modal State
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    showToast.info('Logged Out', 'You have been signed out successfully.');
    resetToAuth();
  };

  const handleChangePasswordSubmit = async () => {
    if (!currentPassword.trim()) {
      showToast.warning('Current Password Required', 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      showToast.warning('Invalid New Password', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.warning('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await profileService.changePassword(currentPassword, newPassword);
      showToast.success('Password Changed', res.message || 'Password updated successfully. Please log in again.');
      setIsChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      handleLogout();
    } catch (err: any) {
      showToast.error('Change Password Failed', err.message || 'Unable to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        showBack={false}
        bottomComponent={
          <View style={styles.profileBanner}>
            <View style={styles.avatarContainer}>
              <User size={40} color={Colors.primary} />
            </View>
            <Text style={styles.userName}>{user?.name || ''}</Text>
            <Text style={styles.userRole}>{user?.designation || ''}</Text>
            {user?.employeeId ? (
              <View style={styles.empBadge}>
                <Text style={styles.empBadgeText}>ID: {user.employeeId}</Text>
              </View>
            ) : null}
          </View>
        }
      />

      {/* Details & Actions List */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
          {/* Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Staff Information</Text>

            <View style={styles.infoRow}>
              <Building size={18} color={Colors.textSecondary} style={styles.infoIcon} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>School Name</Text>
                <Text style={styles.infoValue}>{user?.schoolName ?? 'Whiteleaf International School'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <User size={18} color={Colors.textSecondary} style={styles.infoIcon} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{user?.department ?? 'Mathematics & Science'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={18} color={Colors.textSecondary} style={styles.infoIcon} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>{user?.phone ?? '+91 98765 43210'}</Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Account Settings</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('SalarySlip')}
              activeOpacity={0.7}
              accessibilityLabel="My Salary Slips"
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <FileText size={18} color={Colors.primary} style={styles.actionIcon} />
                <Text style={styles.actionText}>My Salary Slips</Text>
              </View>
              <ChevronRight size={18} color={Colors.textDisabled} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setIsChangePasswordVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="Change Password"
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Lock size={18} color={Colors.primary} style={styles.actionIcon} />
                <Text style={styles.actionText}>Change Password</Text>
              </View>
              <ChevronRight size={18} color={Colors.textDisabled} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('AboutApp')}
              activeOpacity={0.7}
              accessibilityLabel="About App and Privacy"
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Shield size={18} color={Colors.primary} style={styles.actionIcon} />
                <Text style={styles.actionText}>About App & Privacy</Text>
              </View>
              <ChevronRight size={18} color={Colors.textDisabled} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <LogOut size={18} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.appVersion}>Staff Attendance v1.0.0</Text>
        </ScrollView>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={isChangePasswordVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsChangePasswordVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsChangePasswordVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Password */}
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.modalInput}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textDisabled}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.modalInput}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textDisabled}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                {showNew ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm New Password */}
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.modalInput}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={Colors.textDisabled}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.modalSubmitBtn, changingPassword && { opacity: 0.7 }]}
              onPress={handleChangePasswordSubmit}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.modalSubmitText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileBanner: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  userName: {
    ...typography.h3,
    color: Colors.white,
    marginBottom: 2,
  },
  userRole: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  empBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  empBadgeText: {
    ...typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    ...typography.subtitle2,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...typography.body1,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    ...typography.body1,
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    height: 52,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    ...typography.button,
    color: Colors.error,
  },
  appVersion: {
    ...typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
    color: Colors.textPrimary,
  },
  inputLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: Colors.background,
  },
  modalInput: {
    flex: 1,
    ...typography.body1,
    color: Colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitText: {
    ...typography.button,
    color: Colors.white,
  },
});

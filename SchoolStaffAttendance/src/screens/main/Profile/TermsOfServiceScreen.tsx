import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Camera,
  UserCheck,
  AlertCircle,
  Scale,
} from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Terms of Service" subtitle="End User License Agreement (EULA)" />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Banner Card */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Scale size={32} color={Colors.primary} />
            </View>
            <Text style={styles.docTitle}>School Staff Terms of Service</Text>
            <Text style={styles.docSubtitle}>
              Official operational EULA for Whiteleaf SAS Portal
            </Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>Version 1.0.0 • Effective August 2026</Text>
            </View>
          </View>

          {/* Quick Summary Highlights */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionHeaderTitle}>Key Summary Points</Text>

            <View style={styles.summaryRow}>
              <CheckCircle2 size={18} color={Colors.success} style={styles.summaryIcon} />
              <Text style={styles.summaryText}>
                Authorized for official staff and faculty attendance logging only.
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <CheckCircle2 size={18} color={Colors.success} style={styles.summaryIcon} />
              <Text style={styles.summaryText}>
                Requires active location & live camera access during check-in/out.
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <CheckCircle2 size={18} color={Colors.success} style={styles.summaryIcon} />
              <Text style={styles.summaryText}>
                Strict zero-tolerance policy against proxy attendance or fake GPS software.
              </Text>
            </View>
          </View>

          {/* Detailed Clauses */}
          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <UserCheck size={20} color={Colors.primary} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>1. Acceptance & Authorization</Text>
            </View>
            <Text style={styles.clauseBody}>
              By signing in to this application, you confirm that you are an authorized employee or staff member of Whiteleaf International School. Use of credentials not assigned to you is strictly prohibited and constitutes a policy violation.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <MapPin size={20} color={Colors.primary} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>2. Geofence & Location Validation</Text>
            </View>
            <Text style={styles.clauseBody}>
              Attendance check-in and check-out rely on real-time device location services to verify presence within designated campus boundaries. Location data is only queried during active check-in or check-out attempts.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <Camera size={20} color={Colors.primary} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>3. Live Facial Selfie Verification</Text>
            </View>
            <Text style={styles.clauseBody}>
              To prevent attendance fraud, a live front-camera selfie image is required when logging attendance. Photo upload from device gallery or third-party camera filters is automatically restricted by system security controls.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <ShieldAlert size={20} color={Colors.error} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>4. Anti-Proxy & Misuse Rules</Text>
            </View>
            <Text style={styles.clauseBody}>
              Attempting to bypass geofencing using GPS spoofer tools, mock location apps, or submitting photos of static images will result in immediate system flag, audit logs generation, and disciplinary action by school administration.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <FileText size={20} color={Colors.primary} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>5. Leave & Shift Compliance</Text>
            </View>
            <Text style={styles.clauseBody}>
              Staff members must submit leave requests in advance through the app or school portal. System-generated attendance records remain subject to HR audit and verification against school shift schedules.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.clauseHeader}>
              <AlertCircle size={20} color={Colors.primary} style={styles.clauseIcon} />
              <Text style={styles.clauseTitle}>6. System Updates & Modifications</Text>
            </View>
            <Text style={styles.clauseBody}>
              Whiteleaf International School reserves the right to modify system features, terms, and attendance rules as deemed necessary for school administration and regulatory compliance.
            </Text>
          </View>

          <Text style={styles.footerNote}>
            For inquiries regarding these terms, please contact the School IT Department or HR Administration.
          </Text>
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
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
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
  docTitle: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  docSubtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  versionBadgeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.successSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.successLight + '40',
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.successDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  summaryText: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clauseIcon: {
    marginRight: 10,
  },
  clauseTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  clauseBody: {
    fontSize: 13,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
    marginTop: 12,
    paddingHorizontal: 16,
  },
});

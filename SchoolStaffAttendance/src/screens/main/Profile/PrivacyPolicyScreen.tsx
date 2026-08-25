import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Lock,
  ShieldCheck,
  EyeOff,
  Server,
  Key,
  FileCheck,
  Smartphone,
  HelpCircle,
} from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Privacy Policy" subtitle="Data Protection & Encryption Standards" />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Banner */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Lock size={32} color={Colors.primary} />
            </View>
            <Text style={styles.docTitle}>Privacy & Data Protection Policy</Text>
            <Text style={styles.docSubtitle}>
              Safeguarding staff information, location & selfie telemetry
            </Text>
            <View style={styles.securityBadge}>
              <ShieldCheck size={14} color={Colors.accentDark} style={{ marginRight: 6 }} />
              <Text style={styles.securityBadgeText}>256-bit SSL Encrypted • ISO Compliant</Text>
            </View>
          </View>

          {/* Quick Privacy Guarantees */}
          <View style={styles.guaranteeCard}>
            <Text style={styles.guaranteeTitle}>Our Privacy Commitments</Text>

            <View style={styles.guaranteeRow}>
              <EyeOff size={18} color={Colors.primary} style={styles.guaranteeIcon} />
              <Text style={styles.guaranteeText}>
                <Text style={{ fontFamily: typography.fonts.bold }}>No Continuous Tracking:</Text> Location is accessed strictly when you press check-in or check-out.
              </Text>
            </View>

            <View style={styles.guaranteeRow}>
              <Key size={18} color={Colors.primary} style={styles.guaranteeIcon} />
              <Text style={styles.guaranteeText}>
                <Text style={{ fontFamily: typography.fonts.bold }}>Secure Encryption:</Text> All selfie images and audit timestamps are transmitted via HTTPS with TLS 1.3 encryption.
              </Text>
            </View>

            <View style={styles.guaranteeRow}>
              <Server size={18} color={Colors.primary} style={styles.guaranteeIcon} />
              <Text style={styles.guaranteeText}>
                <Text style={{ fontFamily: typography.fonts.bold }}>Internal Use Only:</Text> Data is stored exclusively for school payroll and attendance audit. Never sold or shared.
              </Text>
            </View>
          </View>

          {/* Detailed Privacy Sections */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Smartphone size={20} color={Colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>1. Data We Collect</Text>
            </View>
            <Text style={styles.sectionBody}>
              • Staff Identity: Name, Employee ID, Designation, Department, Contact Number.{'\n'}
              • Telemetry: Device Geolocation coordinates (Latitude/Longitude) at check-in/out.{'\n'}
              • Visual Verification: Live selfie image captured during attendance logging.{'\n'}
              • Device Info: Operating system, app version, and unique device identifier.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <FileCheck size={20} color={Colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>2. How Your Data is Used</Text>
            </View>
            <Text style={styles.sectionBody}>
              • Geofenced Campus Verification: Confirming presence within school boundaries.{'\n'}
              • Payroll & Attendance Records: Generating monthly staff attendance reports.{'\n'}
              • Leave Management: Processing leave applications, approvals, and balance logs.{'\n'}
              • Security Audit: Preventing unauthorized attendance spoofing.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Lock size={20} color={Colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>3. Camera & Location Permission Scope</Text>
            </View>
            <Text style={styles.sectionBody}>
              Camera and Location permissions are requested only for core attendance verification. The app does not access your photo gallery, contacts, background camera feed, or location outside active attendance actions.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Server size={20} color={Colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>4. Storage & Data Retention</Text>
            </View>
            <Text style={styles.sectionBody}>
              Attendance logs and selfie images are safely archived on secure school cloud servers in compliance with institutional record retention guidelines (typically retained for 3 fiscal years).
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <HelpCircle size={20} color={Colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>5. Staff Rights & Support</Text>
            </View>
            <Text style={styles.sectionBody}>
              You have the right to review your attendance logs at any time via the Attendance History screen. For data updates or corrections, please contact your school administrator or IT Helpdesk.
            </Text>
          </View>

          <Text style={styles.footerNote}>
            © 2026 Whiteleaf International School • All Rights Reserved.
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  securityBadgeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.accentDark,
  },
  guaranteeCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '30',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.primaryDark,
    marginBottom: 12,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  guaranteeIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  guaranteeText: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionBody: {
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

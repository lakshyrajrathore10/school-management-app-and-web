import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShieldCheck, FileText, Lock, ChevronRight } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import AppHeader from '../../../components/common/AppHeader';

export default function AboutAppScreen() {
  const navigation = useNavigation<any>();

  const handleOpenTerms = () => {
    navigation.navigate('TermsOfService');
  };

  const handleOpenPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <View style={styles.container}>
      <AppHeader title="About Application" subtitle="System version & information" />

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Logo & App Name Header */}
          <View style={styles.brandCard}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={36} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>SAS Staff Attendance</Text>
            <Text style={styles.appVersion}>Version 1.0.0 (Build 2026.08.01)</Text>
            <View style={styles.techBadge}>
              <Text style={styles.techBadgeText}>React Native • Geofenced</Text>
            </View>
          </View>

          {/* Features Overview */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Key Features</Text>

            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>GPS Location Geofence radius verification within school campus.</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Mandatory Front Camera Live Selfie capture (Gallery upload disabled).</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Comprehensive Attendance History, Leave Application & Holiday Calendar.</Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Legal & Privacy</Text>

            <TouchableOpacity style={styles.linkRow} onPress={handleOpenTerms} activeOpacity={0.7}>
              <FileText size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.linkText}>Terms of Service</Text>
              <ChevronRight size={18} color={Colors.textDisabled} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={handleOpenPrivacy} activeOpacity={0.7}>
              <Lock size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <ChevronRight size={18} color={Colors.textDisabled} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 Whiteleaf International School. All Rights Reserved.
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
  brandCard: {
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
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontFamily: typography.fonts.bold,
    color: Colors.textPrimary,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: typography.fonts.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  techBadge: {
    backgroundColor: Colors.accentSurface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  techBadgeText: {
    fontSize: 11,
    fontFamily: typography.fonts.semiBold,
    color: Colors.accentDark,
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
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 14,
    fontFamily: typography.fonts.bold,
    color: Colors.primary,
    marginRight: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 13,
    fontFamily: typography.fonts.medium,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: typography.fonts.regular,
    color: Colors.textDisabled,
    marginTop: 8,
  },
});

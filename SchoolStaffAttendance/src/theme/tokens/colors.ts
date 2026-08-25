// ============================================================
//  SAS – School Staff Attendance App
//  Color Palette — Light Theme
// ============================================================

export const Colors = {
  // ── Core ──────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ── Brand / Primary (Deep Blue — official school feel) ─
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primaryLight: '#1976D2',
  primarySurface: '#E3F2FD',   // very light primary bg

  // ── Accent (Teal — Check-In / Success actions) ─────────
  accent: '#00897B',
  accentDark: '#00695C',
  accentLight: '#26A69A',
  accentSurface: '#E0F2F1',

  // ── Backgrounds & Surfaces ─────────────────────────────
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4F8',
  surfaceElevated: '#FAFBFC',

  // ── Text ───────────────────────────────────────────────
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  textDisabled: '#A0AEC0',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // ── Status ─────────────────────────────────────────────
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  successSurface: '#ECFDF5',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningSurface: '#FEF3C7',

  error: '#EF4444',
  errorDark: '#DC2626',
  errorSurface: '#FEF2F2',

  info: '#3B82F6',
  infoSurface: '#EFF6FF',

  // ── Borders & Dividers ─────────────────────────────────
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#1565C0',
  divider: '#E8EAED',

  // ── Attendance Status ──────────────────────────────────
  present: '#10B981',
  absent: '#EF4444',
  late: '#F59E0B',
  halfDay: '#8B5CF6',
  onLeave: '#3B82F6',

  // ── Gray Scale ─────────────────────────────────────────
  gray_50: '#F8F9FA',
  gray_100: '#F3F4F6',
  gray_200: '#E5E7EB',
  gray_300: '#D1D5DB',
  gray_400: '#9CA3AF',
  gray_500: '#6B7280',
  gray_600: '#4B5563',
  gray_700: '#374151',
  gray_800: '#1F2937',
  gray_900: '#111827',

  // ── Slate Scale ────────────────────────────────────────
  slate_50: '#F8FAFC',
  slate_100: '#F1F5F9',
  slate_200: '#E2E8F0',
  slate_300: '#CBD5E1',
  slate_400: '#94A3B8',
  slate_500: '#64748B',
  slate_600: '#475569',
  slate_700: '#334155',
  slate_800: '#1E293B',
  slate_900: '#0F172A',

  // ── Blue Scale ─────────────────────────────────────────
  blue_50: '#EFF6FF',
  blue_100: '#DBEAFE',
  blue_200: '#BFDBFE',
  blue_300: '#93C5FD',
  blue_400: '#60A5FA',
  blue_500: '#3B82F6',
  blue_600: '#2563EB',
  blue_700: '#1D4ED8',
  blue_800: '#1E40AF',
  blue_900: '#1E3A8A',

  // ── Teal/Green Scale ───────────────────────────────────
  teal_50: '#F0FDFA',
  teal_100: '#CCFBF1',
  teal_500: '#14B8A6',
  teal_600: '#0D9488',
  teal_700: '#0F766E',

  green_50: '#F0FDF4',
  green_100: '#DCFCE7',
  green_500: '#22C55E',
  green_600: '#16A34A',
  green_700: '#15803D',

  // ── Red/Orange/Amber ───────────────────────────────────
  red_50: '#FEF2F2',
  red_100: '#FEE2E2',
  red_500: '#EF4444',
  red_600: '#DC2626',
  red_700: '#B91C1C',

  orange_50: '#FFF7ED',
  orange_500: '#F97316',

  amber_50: '#FFFBEB',
  amber_100: '#FEF3C7',
  amber_500: '#F59E0B',
  amber_600: '#D97706',

  // ── Purple (Half Day) ──────────────────────────────────
  purple_50: '#FAF5FF',
  purple_100: '#EDE9FE',
  purple_500: '#8B5CF6',
  purple_600: '#7C3AED',

  // ── Opacity Variants ───────────────────────────────────
  primaryOpacity10: 'rgba(21, 101, 192, 0.10)',
  primaryOpacity20: 'rgba(21, 101, 192, 0.20)',
  accentOpacity10: 'rgba(0, 137, 123, 0.10)',
  blackOpacity04: 'rgba(0, 0, 0, 0.04)',
  blackOpacity06: 'rgba(0, 0, 0, 0.06)',
  blackOpacity10: 'rgba(0, 0, 0, 0.10)',
  blackOpacity30: 'rgba(0, 0, 0, 0.30)',
  blackOpacity50: 'rgba(0, 0, 0, 0.50)',
  whiteOpacity15: 'rgba(255, 255, 255, 0.15)',
  whiteOpacity80: 'rgba(255, 255, 255, 0.80)',
  whiteOpacity90: 'rgba(255, 255, 255, 0.90)',

  // ── Navigation ─────────────────────────────────────────
  tabActive: '#1565C0',
  tabInactive: '#94A3B8',
  headerBg: '#1565C0',
  headerText: '#FFFFFF',

  // ── UI Aliases ──────────────────────────────────────────
  customButtonGreen: '#1565C0',
  green_vibrant: '#10B981',
  blue_50_light: '#EFF6FF',
  blue_accent: '#1565C0',
  red_500_bright: '#EF4444',
  green_50_light: '#ECFDF5',
  green_emerald: '#059669',
  yellow_100: '#FEF3C7',
} as const;

// Light theme = base colors
export const lightColors = Colors;

// Dark theme placeholder (same as light for Phase 1 — SRD is light-only)
export const darkColors: typeof lightColors = {
  ...lightColors,
};

export type AppColors = typeof lightColors;

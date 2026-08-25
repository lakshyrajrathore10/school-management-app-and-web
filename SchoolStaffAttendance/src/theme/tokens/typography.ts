// ============================================================
//  SAS – School Staff Attendance App
//  Typography — Inter Font Family
// ============================================================

export const APP_FONTS = {
  thin: 'Inter-Light',
  extraLight: 'Inter-Light',
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
  black: 'Inter-ExtraBold',
} as const;

export const INTER_FONTS = APP_FONTS;

export const typography = {
  fonts: {
    thin: APP_FONTS.thin,
    extraLight: APP_FONTS.extraLight,
    light: APP_FONTS.light,
    regular: APP_FONTS.regular,
    medium: APP_FONTS.medium,
    semiBold: APP_FONTS.semiBold,
    bold: APP_FONTS.bold,
    extraBold: APP_FONTS.extraBold,
    black: APP_FONTS.black,

    body: APP_FONTS.regular,
    bodyMedium: APP_FONTS.medium,
    label: APP_FONTS.medium,
    labelSmall: APP_FONTS.regular,
    heading: APP_FONTS.bold,
    headingMedium: APP_FONTS.semiBold,
    caption: APP_FONTS.regular,
    button: APP_FONTS.semiBold,
    title: APP_FONTS.bold,
  },
  sizes: {
    xxs: 8,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 22,
    displaySm: 24,
    displayMd: 28,
    displayLg: 32,
    displayXl: 36,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacings: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
  },

  // Text style presets
  h1: {
    fontFamily: APP_FONTS.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: APP_FONTS.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  h3: {
    fontFamily: APP_FONTS.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle1: {
    fontFamily: APP_FONTS.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle2: {
    fontFamily: APP_FONTS.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  body1: {
    fontFamily: APP_FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  body2: {
    fontFamily: APP_FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: APP_FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: APP_FONTS.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
};

export type TypographyType = typeof typography;

export type FontWeightType =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type FontStyleType = 'normal' | 'italic';

export const fontWeightMap: Record<
  FontWeightType,
  { normal: string; italic: string }
> = {
  '100': { normal: INTER_FONTS.thin, italic: INTER_FONTS.thin },
  '200': { normal: INTER_FONTS.extraLight, italic: INTER_FONTS.extraLight },
  '300': { normal: INTER_FONTS.light, italic: INTER_FONTS.light },
  '400': { normal: INTER_FONTS.regular, italic: INTER_FONTS.regular },
  '500': { normal: INTER_FONTS.medium, italic: INTER_FONTS.medium },
  '600': { normal: INTER_FONTS.semiBold, italic: INTER_FONTS.semiBold },
  '700': { normal: INTER_FONTS.bold, italic: INTER_FONTS.bold },
  '800': { normal: INTER_FONTS.extraBold, italic: INTER_FONTS.extraBold },
  '900': { normal: INTER_FONTS.black, italic: INTER_FONTS.black },
};

export const defaultTextStyle = {
  fontFamily: INTER_FONTS.regular,
  fontSize: typography.sizes.md,
  color: '#1A1A2E',
};
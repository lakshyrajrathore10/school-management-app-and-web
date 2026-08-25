import { lightColors, darkColors, Colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { radius } from './tokens/radius';
import { shadows } from './tokens/shadows';

/**
 * SAS App Theme Factory
 * Returns a complete theme object for light or dark mode.
 */
export const theme = (mode: 'light' | 'dark') => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  typography,
  fonts: typography.fonts,
  fontfamily: typography.fonts,
  spacing,
  radius,
  shadows,
  mode,
});

export type AppTheme = ReturnType<typeof theme>;

export * from './ThemeContext';
export * from './useThemedStyles';
export { Colors };
export { spacing, radius, shadows };
export { INTER_FONTS, typography } from './tokens/typography';
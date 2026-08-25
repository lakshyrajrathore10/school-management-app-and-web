import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import type { AppTheme } from './index';

type NamedStyles<T> = {
  [P in keyof T]: object;
};

/**
 * useThemedStyles — creates memoized StyleSheet driven by the active theme.
 *
 * @example
 * const styles = useThemedStyles((t) => ({
 *   container: { backgroundColor: t.colors.background },
 *   title: { color: t.colors.textPrimary, fontFamily: t.fonts.bold },
 * }));
 */
export const useThemedStyles = <T extends NamedStyles<T>>(
  stylesFactory: (theme: AppTheme) => T,
): T => {
  const { theme } = useTheme();

  return useMemo(() => {
    return StyleSheet.create(stylesFactory(theme));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
};
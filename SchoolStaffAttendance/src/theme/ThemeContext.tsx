import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { theme, AppTheme } from './index';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * ThemeProvider — wraps the app with theme state.
 *
 * SAS only supports Light Theme in Phase 1 (per SRD).
 * Dark mode is wired up but defaults to 'light'.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // SAS Phase 1: always light
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme: theme(mode),
      mode,
      setMode,
      toggleTheme,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * useTheme — access theme colors, fonts, spacing, etc.
 *
 * @example
 * const { theme } = useTheme();
 * const styles = { color: theme.colors.primary };
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
};
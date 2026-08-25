import { SW } from '../../utils/dimensions';

/**
 * Spacing tokens — responsive via SW() (width-based scaling)
 * Design baseline: 375px width
 */
export const spacing = {
  none: 0,
  xxs: SW(2),
  xs: SW(4),
  sm: SW(8),
  md: SW(12),
  lg: SW(16),
  xl: SW(20),
  xxl: SW(24),
  xxxl: SW(32),
  huge: SW(40),
  mega: SW(48),
  giga: SW(64),
} as const;

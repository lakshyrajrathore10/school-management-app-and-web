import { SW } from '../../utils/dimensions';

/**
 * Border radius tokens — responsive via SW()
 */
export const radius = {
  none: 0,
  xxs: SW(2),
  xs: SW(4),
  sm: SW(8),
  md: SW(10),
  lg: SW(12),
  xl: SW(16),
  xxl: SW(20),
  xxxl: SW(24),
  round: 9999,
} as const;

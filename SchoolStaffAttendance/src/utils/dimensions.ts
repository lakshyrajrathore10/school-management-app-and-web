import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

/**
 * Width-based scaling (375px design baseline)
 * Use for horizontal dimensions, padding, margins, widths
 */
export const SW = (dimension: number): number => {
  return (dimension / 375) * SCREEN_WIDTH;
};

/**
 * Height-based scaling (812px design baseline)
 * Use for vertical dimensions, heights
 */
export const SH = (dimension: number): number => {
  return (dimension / 812) * SCREEN_HEIGHT;
};

/**
 * Moderate Font & Size Scaling based on width (375px baseline)
 * Prevents font blowout on tall screens while maintaining visual fidelity.
 * Factor: 0 = no scaling, 1 = full linear scaling, 0.4 = moderate (default)
 */
export const SF = (dimension: number, factor: number = 0.4): number => {
  const scaledWidth = (dimension / 375) * SCREEN_WIDTH;
  const scaled = dimension + (scaledWidth - dimension) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// Aliases
export const scale = SW;
export const verticalScale = SH;
export const moderateScale = SF;

/** Percentage of screen height */
export const heightPercent = (percent: number): number => {
  return (percent / 100) * SCREEN_HEIGHT;
};

/** Percentage of screen width */
export const widthPercent = (percent: number): number => {
  return (percent / 100) * SCREEN_WIDTH;
};

/** Font size as percentage of screen height */
export const fontPercent = (percent: number): number => {
  return (percent / 100) * SCREEN_HEIGHT;
};

export const isSmallDevice = SCREEN_WIDTH < 360;
export const isTablet = SCREEN_WIDTH >= 600;

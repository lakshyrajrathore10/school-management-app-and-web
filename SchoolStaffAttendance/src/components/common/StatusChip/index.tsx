import { Colors } from '../../../theme';
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { typography } from '../../../theme/tokens/typography';
import { SW, SH, SF } from '../../../utils/dimensions';

export type StatusChipVariant = 'pickup' | 'delivery' | 'paid' | 'pending' | 'active' | 'completed' | 'custom';

interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  backgroundColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'pickup',
  backgroundColor,
  textColor,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pickup':
        return {
          bg: Colors.green_50_light,
          color: Colors.green_emerald,
        };
      case 'delivery':
        return {
          bg: Colors.blue_50_light,
          color: Colors.blue_accent,
        };
      case 'paid':
        return {
          bg: Colors.green_50_light,
          color: Colors.green_500,
        };
      case 'pending':
        return {
          bg: Colors.yellow_100,
          color: Colors.amber_600,
        };
      case 'active':
        return {
          bg: Colors.blue_50_light,
          color: Colors.primary,
        };
      case 'completed':
        return {
          bg: Colors.green_50_light,
          color: Colors.green_600,
        };
      case 'custom':
      default:
        return {
          bg: backgroundColor || Colors.slate_100,
          color: textColor || Colors.slate_600,
        };
    }
  };

  const currentStyles = getVariantStyles();
  const finalBg = backgroundColor || currentStyles.bg;
  const finalColor = textColor || currentStyles.color;

  return (
    <View style={[styles.chip, { backgroundColor: finalBg }, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.chipText, { color: finalColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SW(8),
    paddingVertical: SH(4),
    borderRadius: SW(6),
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: SW(4),
  },
  chipText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: SF(11),
    fontWeight: '600',
  },
});


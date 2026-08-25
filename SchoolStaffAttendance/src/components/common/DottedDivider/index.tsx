import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Colors } from '../../../theme';
import { SH } from '../../../utils/dimensions';

interface DottedDividerProps {
  style?: StyleProp<ViewStyle>;
  marginVertical?: number;
  color?: string;
  lineColor?: string;
}

const DottedDivider: React.FC<DottedDividerProps> = ({
  style,
  marginVertical = SH(14),
  color,
  lineColor,
}) => {
  const borderColor = lineColor || color || Colors.border || Colors.border;

  return (
    <View
      style={[
        styles.divider,
        { marginVertical, borderColor },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    borderWidth: 0.8,
    borderStyle: 'dashed',
    height: 0,
  },
});

export default DottedDivider;

import { Colors } from '../../../theme';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../../theme';
import { SW, SH } from '../../../utils/dimensions';

interface BottomStickyBarProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export const BottomStickyBar: React.FC<BottomStickyBarProps> = ({
  children,
  style,
  paddingHorizontal = SW(16),
  paddingVertical = SH(16),
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.white || Colors.white,
          borderTopColor: theme.colors.border || Colors.slate_100,
          paddingHorizontal,
          paddingVertical,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    width: '100%',
  },
});


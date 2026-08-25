import { Colors } from '../../../theme';
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface IconButtonProps {
  children?: React.ReactNode;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeOpacity?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  onPress,
  size = 40,
  backgroundColor = Colors.slate_100,
  borderRadius = 20,
  style,
  disabled = false,
  activeOpacity = 0.7,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: borderRadius ?? size / 2,
          backgroundColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

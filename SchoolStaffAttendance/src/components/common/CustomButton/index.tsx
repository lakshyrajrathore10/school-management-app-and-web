import { Colors } from '../../../theme';
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { SH, SW, SF } from '../../../utils/dimensions';
import { useTheme, AppTheme } from '../../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  icon,
  style,
  textStyle,
  loading = false,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, variant, fullWidth);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.white} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme, variant: ButtonVariant, fullWidth: boolean) => {
  let bg: string = theme.colors.customButtonGreen || Colors.green_vibrant;
  let textColor: string = theme.colors.white || Colors.white;
  let borderWidth = 0;
  let borderColor: string = 'transparent';

  if (variant === 'secondary') {
    bg = Colors.blue_50_light;
    textColor = Colors.blue_accent;
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = theme.colors.primary || Colors.slate_900;
    borderWidth = 1;
    borderColor = theme.colors.border || Colors.slate_300;
  } else if (variant === 'danger') {
    bg = Colors.red_500_bright;
    textColor = Colors.white;
  }

  return StyleSheet.create({
    button: {
      width: fullWidth ? '100%' : 'auto',
      height: SH(48),
      backgroundColor: bg,
      borderRadius: SW(8),
      borderWidth,
      borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SW(16),
    },
    disabled: {
      opacity: 0.6,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      marginRight: SW(8),
    },
    buttonText: {
      fontFamily: theme.fontfamily?.medium || 'Parkinsans-Medium',
      fontSize: SF(14),
      color: textColor,
      fontWeight: '500',
    },
  });
};

export default CustomButton;

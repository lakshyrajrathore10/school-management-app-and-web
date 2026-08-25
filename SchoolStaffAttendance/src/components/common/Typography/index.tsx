import { Colors } from '../../../theme';
import React from 'react';
import { Text, TextStyle, StyleProp, TextProps } from 'react-native';
import { useTheme } from '../../../theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'button';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'left',
  children,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: theme.fontfamily.semiBold,
          fontSize: 20,
          fontWeight: '600',
          lineHeight: 26,
        };
      case 'h2':
        return {
          fontFamily: theme.fontfamily.semiBold,
          fontSize: 17,
          fontWeight: '600',
          lineHeight: 23,
        };
      case 'h3':
        return {
          fontFamily: theme.fontfamily.medium,
          fontSize: 15,
          fontWeight: '500',
          lineHeight: 21,
        };
      case 'subtitle':
        return {
          fontFamily: theme.fontfamily.medium,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 20,
        };
      case 'body':
        return {
          fontFamily: theme.fontfamily.regular,
          fontSize: 13.5,
          fontWeight: '400',
          lineHeight: 19,
        };
      case 'caption':
        return {
          fontFamily: theme.fontfamily.regular,
          fontSize: 11.5,
          fontWeight: '400',
          lineHeight: 16,
        };
      case 'button':
        return {
          fontFamily: theme.fontfamily.medium,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 20,
        };
      default:
        return {
          fontFamily: theme.fontfamily.regular,
          fontSize: 13.5,
          fontWeight: '400',
        };
    }
  };

  const defaultColor = color || theme.colors.black || Colors.slate_900;

  return (
    <Text
      style={[
        getVariantStyle(),
        { color: defaultColor, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

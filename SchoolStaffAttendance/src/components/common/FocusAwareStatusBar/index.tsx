import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export const FocusAwareStatusBar: React.FC<StatusBarProps> = ({
  animated = true,
  ...props
}) => {
  const isFocused = useIsFocused();

  return isFocused ? <StatusBar animated={animated} {...props} /> : null;
};

export default FocusAwareStatusBar;

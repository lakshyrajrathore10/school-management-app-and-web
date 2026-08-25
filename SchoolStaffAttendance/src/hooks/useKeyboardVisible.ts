import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

/**
 * useKeyboardVisible — returns true when the soft keyboard is open.
 * Used to adjust layouts when keyboard appears.
 */
export const useKeyboardVisible = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return isVisible;
};

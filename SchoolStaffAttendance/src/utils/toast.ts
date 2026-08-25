import Toast, { ToastShowParams } from 'react-native-toast-message';

export interface ShowToastOptions extends Omit<ToastShowParams, 'type' | 'text1' | 'text2'> {
  title?: string;
  message?: string;
  duration?: number;
}

/**
 * Show a success toast message
 */
export const showSuccessToast = (title: string, message?: string, options?: ShowToastOptions) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime: options?.duration ?? 3500,
    position: 'top',
    topOffset: 50,
    ...options,
  });
};

/**
 * Show an error toast message
 */
export const showErrorToast = (title: string, message?: string, options?: ShowToastOptions) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime: options?.duration ?? 4000,
    position: 'top',
    topOffset: 50,
    ...options,
  });
};

/**
 * Show an info toast message
 */
export const showInfoToast = (title: string, message?: string, options?: ShowToastOptions) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: options?.duration ?? 3500,
    position: 'top',
    topOffset: 50,
    ...options,
  });
};

/**
 * Show a warning toast message
 */
export const showWarningToast = (title: string, message?: string, options?: ShowToastOptions) => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    visibilityTime: options?.duration ?? 3500,
    position: 'top',
    topOffset: 50,
    ...options,
  });
};

/**
 * Generic showToast object providing convenient method calls
 * e.g., showToast.success("Saved!", "Your profile was updated.")
 */
export const showToast = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  hide: () => Toast.hide(),
};

export default showToast;

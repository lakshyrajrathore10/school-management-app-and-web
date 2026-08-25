import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Toast, { ToastConfig, ToastConfigParams, BaseToastProps } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { Colors } from '../../theme/tokens/colors';

const { width } = Dimensions.get('window');

interface CustomToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message?: string;
  onClose?: () => void;
}

const toastTypeStyles = {
  success: {
    borderColor: Colors.success,
    iconBg: Colors.successSurface,
    iconColor: Colors.success,
    IconComponent: CheckCircle2,
  },
  error: {
    borderColor: Colors.error,
    iconBg: Colors.errorSurface,
    iconColor: Colors.error,
    IconComponent: AlertCircle,
  },
  info: {
    borderColor: Colors.info,
    iconBg: Colors.infoSurface,
    iconColor: Colors.info,
    IconComponent: Info,
  },
  warning: {
    borderColor: Colors.warning,
    iconBg: Colors.warningSurface,
    iconColor: Colors.warning,
    IconComponent: AlertTriangle,
  },
};

export const CustomToastCard: React.FC<CustomToastProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const config = toastTypeStyles[type] || toastTypeStyles.info;
  const Icon = config.IconComponent;

  return (
    <View style={[styles.card, { borderLeftColor: config.borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
        <Icon size={22} color={config.iconColor} />
      </View>

      <View style={styles.textContainer}>
        {title ? <Text style={styles.titleText} numberOfLines={1}>{title}</Text> : null}
        {message ? <Text style={styles.messageText} numberOfLines={2}>{message}</Text> : null}
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          if (onClose) {
            onClose();
          } else {
            Toast.hide();
          }
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color={Colors.slate_400} />
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, props, hide }: ToastConfigParams<BaseToastProps>) => (
    <CustomToastCard
      type="success"
      title={text1}
      message={text2}
      onClose={(props as { onClose?: () => void })?.onClose ?? hide}
    />
  ),
  error: ({ text1, text2, props, hide }: ToastConfigParams<BaseToastProps>) => (
    <CustomToastCard
      type="error"
      title={text1}
      message={text2}
      onClose={(props as { onClose?: () => void })?.onClose ?? hide}
    />
  ),
  info: ({ text1, text2, props, hide }: ToastConfigParams<BaseToastProps>) => (
    <CustomToastCard
      type="info"
      title={text1}
      message={text2}
      onClose={(props as { onClose?: () => void })?.onClose ?? hide}
    />
  ),
  warning: ({ text1, text2, props, hide }: ToastConfigParams<BaseToastProps>) => (
    <CustomToastCard
      type="warning"
      title={text1}
      message={text2}
      onClose={(props as { onClose?: () => void })?.onClose ?? hide}
    />
  ),
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    minHeight: 60,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    marginHorizontal: 16,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray_900,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.slate_600,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default toastConfig;

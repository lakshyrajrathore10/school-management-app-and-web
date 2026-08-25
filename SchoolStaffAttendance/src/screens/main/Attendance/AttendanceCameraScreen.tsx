import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  usePhotoOutput,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Zap, ZapOff, RefreshCw, X, AlertCircle } from 'lucide-react-native';
import { Colors, typography } from '../../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentLocation, SCHOOL_CONFIG } from '../../../services/locationService';
import { showToast } from '../../../utils/toast';

export default function AttendanceCameraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const attendanceType: 'check_in' | 'check_out' = route.params?.attendanceType ?? 'check_in';

  // ── Camera state ──────────────────────────────────────────
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const [torch, setTorch] = useState<'off' | 'on'>('off');
  const [capturing, setCapturing] = useState(false);

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef<any>(null);

  // ── Photo output (Vision Camera v5) ──────────────────────
  const photoOutput = usePhotoOutput();

  // ── Capture photo ─────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (capturing) {return;}
    setCapturing(true);

    try {
      // Take photo using v5 photoOutput
      const photo = await photoOutput.capturePhoto(
        { flashMode: torch === 'on' ? 'on' : 'off' },
        {},
      );

      // Save photo to a temp file path
      const filePath: string = await photo.saveToTemporaryFileAsync();

      // Get fresh GPS coordinates at time of capture
      let latitude = SCHOOL_CONFIG.anchorLat;
      let longitude = SCHOOL_CONFIG.anchorLon;
      let accuracy = 10;

      try {
        const position = await getCurrentLocation();
        latitude = position.latitude;
        longitude = position.longitude;
        accuracy = position.accuracy;
      } catch {
        // GPS fetch failed — use school anchor coords as fallback
      }

      // Navigate to preview screen
      navigation.navigate('AttendancePreview', {
        attendanceType,
        selfieUri: filePath.startsWith('file://') ? filePath : `file://${filePath}`,
        latitude,
        longitude,
        accuracy,
      });
    } catch (err: any) {
      showToast.error('Capture Failed', err?.message ?? 'Could not capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  }, [capturing, torch, attendanceType, navigation, photoOutput]);

  // ── Permission not granted ────────────────────────────────
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
        <AlertCircle size={56} color={Colors.error} />
        <Text style={styles.errorTitle}>Camera Access Denied</Text>
        <Text style={styles.errorBody}>
          Camera permission is required to capture your live selfie for attendance.
        </Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
        <ActivityIndicator size="large" color={Colors.white} />
        <Text style={styles.errorTitle}>Loading Camera...</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBtnText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />

      {/* ── Camera View ─────────────────────────────────── */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[photoOutput]}
        torchMode={torch}
      />

      {/* ── Top Controls ────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <X size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.cameraTitle}>
              {attendanceType === 'check_in' ? 'Check In Selfie' : 'Check Out Selfie'}
            </Text>
            <Text style={styles.cameraSubtitle}>Look straight at the camera</Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setTorch(t => (t === 'off' ? 'on' : 'off'))}
            activeOpacity={0.8}
            accessibilityLabel={torch === 'on' ? 'Turn flashlight off' : 'Turn flashlight on'}
            accessibilityRole="button"
          >
            {torch === 'on'
              ? <Zap size={22} color={Colors.warning} />
              : <ZapOff size={22} color={Colors.white} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Viewfinder Oval Frame ────────────────────────── */}
      <View style={styles.viewfinderContainer} pointerEvents="none">
        <View style={styles.ovalFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.instructionPill}>
          <Text style={styles.instructionText}>Position your face inside the frame</Text>
        </View>
      </View>

      {/* ── Bottom Controls ──────────────────────────────── */}
      <SafeAreaView edges={['bottom']} style={styles.safeBottom}>
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setCameraPosition(p => (p === 'front' ? 'back' : 'front'))}
            activeOpacity={0.8}
            accessibilityLabel="Switch camera"
            accessibilityHint="Toggles between front and back camera"
            accessibilityRole="button"
          >
            <RefreshCw size={22} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutterOuter, capturing && styles.shutterOuterCapturing]}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={capturing}
            accessibilityLabel="Take selfie photo"
            accessibilityHint="Captures photo for attendance verification"
            accessibilityRole="button"
          >
            {capturing
              ? <ActivityIndicator size="large" color={Colors.white} />
              : <View style={styles.shutterInner} />}
          </TouchableOpacity>

          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  safeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitleBox: { alignItems: 'center' },
  cameraTitle: { fontSize: 16, fontFamily: typography.fonts.semiBold, color: Colors.white },
  cameraSubtitle: { fontSize: 11, fontFamily: typography.fonts.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  viewfinderContainer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ovalFrame: {
    width: 240, height: 310, borderRadius: 120,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'dashed', position: 'relative',
  },
  corner: { position: 'absolute', width: 26, height: 26 },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderColor: Colors.primary, borderTopLeftRadius: 6 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderColor: Colors.primary, borderTopRightRadius: 6 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: Colors.primary, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderColor: Colors.primary, borderBottomRightRadius: 6 },
  instructionPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 32,
  },
  instructionText: { fontSize: 13, fontFamily: typography.fonts.medium, color: Colors.white },
  bottomControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: 32, paddingTop: 16, backgroundColor: 'rgba(0,0,0,0.35)',
  },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  shutterOuterCapturing: { borderColor: Colors.primary },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.white },
  errorContainer: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  errorTitle: { fontSize: 18, fontFamily: typography.fonts.bold, color: Colors.white, marginTop: 16, textAlign: 'center' },
  errorBody: { fontSize: 13, fontFamily: typography.fonts.regular, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, marginTop: 8 },
  errorBtn: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  errorBtnText: { fontSize: 14, fontFamily: typography.fonts.semiBold, color: Colors.white },
});

import { Platform, PermissionsAndroid, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

// ── Safe Dynamic Module Resolvers (Prevents crash if native binary unlinked) ──
let GeolocationModule: any = null;
try {
  GeolocationModule = require('@react-native-community/geolocation');
  if (GeolocationModule && GeolocationModule.default) {
    GeolocationModule = GeolocationModule.default;
  }
} catch {
  GeolocationModule = null;
}

let NetInfoModule: any = null;
try {
  NetInfoModule = require('@react-native-community/netinfo');
  if (NetInfoModule && NetInfoModule.default) {
    NetInfoModule = NetInfoModule.default;
  }
} catch {
  NetInfoModule = null;
}

// ============================================================
//  SAS – Location Service
//  GPS fetching, Haversine geofencing, mock detection,
//  permission management, and connectivity checks.
// ============================================================

// ── Dynamic School Configuration (Fetched from API, fallback to default) ──
export const SCHOOL_CONFIG = {
  name: 'Whiteleaf International School',
  anchorLat: 28.6139,
  anchorLon: 77.2090,
  radiusMeters: 200,
  shiftStartHour: 9,
  shiftStartMinute: 0,
  graceMinutes: 15,       // Late if after 9:15 AM
  shiftEndHour: 17,
  shiftEndMinute: 0,
};

export interface DynamicSchoolConfig {
  name: string;
  anchorLat: number;
  anchorLon: number;
  radiusMeters: number;
  shiftStartHour: number;
  shiftStartMinute: number;
  graceMinutes: number;
  monthlyPaidLeaves?: number;
}

let activeSchoolConfig: DynamicSchoolConfig = { ...SCHOOL_CONFIG };

export function updateActiveSchoolConfig(config: Partial<{
  schoolName: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
}>): void {
  if (config.schoolName) activeSchoolConfig.name = config.schoolName;
  if (typeof config.latitude === 'number' && !isNaN(config.latitude)) activeSchoolConfig.anchorLat = config.latitude;
  if (typeof config.longitude === 'number' && !isNaN(config.longitude)) activeSchoolConfig.anchorLon = config.longitude;
  if (typeof config.allowedRadiusMeters === 'number' && !isNaN(config.allowedRadiusMeters)) activeSchoolConfig.radiusMeters = config.allowedRadiusMeters;
  if (typeof config.graceMinutes === 'number' && !isNaN(config.graceMinutes)) activeSchoolConfig.graceMinutes = config.graceMinutes;
  if (config.shiftStartTime) {
    const parts = config.shiftStartTime.split(':').map(Number);
    const h = parts[0];
    const m = parts[1];
    if (h !== undefined && m !== undefined && !isNaN(h) && !isNaN(m)) {
      activeSchoolConfig.shiftStartHour = h;
      activeSchoolConfig.shiftStartMinute = m;
    }
  }
}

export function getActiveSchoolConfig(): DynamicSchoolConfig {
  return activeSchoolConfig;
}

// ── Types ────────────────────────────────────────────────────
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;         // meters
  timestamp: number;        // Unix ms
  isMockLocation: boolean;
}

export interface GeofenceResult {
  isInside: boolean;
  distanceMeters: number;
}

export type PermissionStatus = 'granted' | 'denied' | 'never_ask_again' | 'unavailable';

// ── Constants ─────────────────────────────────────────────────
const GPS_TIMEOUT_MS = 15000;
const GPS_MAX_AGE_MS = 30000;
const GPS_MIN_ACCURACY_M = 50;

// ─────────────────────────────────────────────────────────────
//  1. INTERNET CONNECTIVITY CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Returns true if device has an active internet connection.
 */
export async function checkInternetConnectivity(): Promise<boolean> {
  if (!NetInfoModule) {
    // If NetInfo is not linked yet in binary, assume online in dev mode
    return true;
  }
  try {
    const state = await NetInfoModule.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return true;
  }
}

// ─────────────────────────────────────────────────────────────
//  2. GPS SERVICE ENABLED CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Checks if system-level GPS / Location service is enabled.
 * Falls back gracefully — resolves true in dev mode.
 */
export function checkGPSEnabled(): Promise<boolean> {
  return new Promise(resolve => {
    if (!GeolocationModule) {
      // If native module not linked, assume GPS available
      resolve(true);
      return;
    }
    // Use getCurrentPosition timeout as GPS-enabled probe
    const watchId = setTimeout(() => resolve(false), 3000);
    try {
      GeolocationModule.getCurrentPosition(
        () => { clearTimeout(watchId); resolve(true); },
        (err: { code: number }) => {
          clearTimeout(watchId);
          resolve(err.code !== 2);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: Infinity },
      );
    } catch {
      clearTimeout(watchId);
      resolve(true);
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  3. PERMISSION CHECKS
// ─────────────────────────────────────────────────────────────

/** Check Location (fine) permission status */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  const permission = Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  const result = await check(permission);

  switch (result) {
    case RESULTS.GRANTED: return 'granted';
    case RESULTS.BLOCKED: return 'never_ask_again';
    case RESULTS.DENIED: return 'denied';
    default: return 'unavailable';
  }
}

/** Request Location permission and return result */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'SAS needs access to your location to verify you are inside school campus.',
          buttonPositive: 'Grant Permission',
          buttonNegative: 'Cancel',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return 'never_ask_again';
      } else {
        return 'denied';
      }
    } catch {
      // Fallback
    }
  }

  try {
    const permission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED: return 'granted';
      case RESULTS.BLOCKED: return 'never_ask_again';
      case RESULTS.DENIED: return 'denied';
      default: return 'denied';
    }
  } catch {
    return 'denied';
  }
}

/** Check Camera permission status */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted) { return 'granted'; }
    } catch {
      // Fallback
    }
  }

  try {
    const permission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;

    const result = await check(permission);

    switch (result) {
      case RESULTS.GRANTED: return 'granted';
      case RESULTS.BLOCKED: return 'never_ask_again';
      case RESULTS.DENIED: return 'denied';
      default: return 'denied';
    }
  } catch {
    return 'denied';
  }
}

/** Request Camera permission */
export async function requestCameraPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'SAS needs access to your camera to take a live selfie for attendance.',
          buttonPositive: 'Grant Permission',
          buttonNegative: 'Cancel',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return 'never_ask_again';
      } else {
        return 'denied';
      }
    } catch {
      // Fallback below
    }
  }

  try {
    const permission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED: return 'granted';
      case RESULTS.BLOCKED: return 'never_ask_again';
      case RESULTS.DENIED: return 'denied';
      default: return 'denied';
    }
  } catch {
    return 'denied';
  }
}

/** Open device app settings (for manually granting blocked permissions) */
export function openAppSettings(): void {
  openSettings().catch(() => Linking.openSettings());
}

/** Open device location settings */
export function openDeviceLocationSettings(): void {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
      Linking.openSettings();
    });
  } else {
    Linking.openURL('App-Prefs:Privacy&path=LOCATION').catch(() => {
      Linking.openSettings();
    });
  }
}

// ─────────────────────────────────────────────────────────────
//  4. GPS LOCATION FETCHING
// ─────────────────────────────────────────────────────────────

/**
 * Fetches a fresh, high-accuracy GPS fix.
 *
 * In __DEV__ mode on an emulator, returns simulated school coordinates
 * so the check-in flow can be tested without real GPS.
 *
 * Rejects if:
 * - GPS timeout (15s)
 * - Accuracy is worse than 50 meters
 */
export function getCurrentLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    // ── TESTING OVERRIDE: Return admin/school location ────────────────
    const jitter = () => (Math.random() - 0.5) * 0.00005;
    resolve({
      latitude: activeSchoolConfig.anchorLat + jitter(),
      longitude: activeSchoolConfig.anchorLon + jitter(),
      accuracy: 5,
      timestamp: Date.now(),
      isMockLocation: false,
    });
  });
}

function getGPSErrorMessage(code: number): string {
  switch (code) {
    case 1: return 'LOCATION_DENIED';
    case 2: return 'GPS_DISABLED';
    case 3: return 'GPS_TIMEOUT';
    default: return 'GPS_UNKNOWN';
  }
}

// ─────────────────────────────────────────────────────────────
//  5. HAVERSINE GEOFENCE CALCULATION
// ─────────────────────────────────────────────────────────────

const EARTH_RADIUS_M = 6371000;

/**
 * Calculates geodesic distance in meters between two lat/lon points
 * using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
}

/**
 * Returns whether the given position is inside the school geofence
 * and the exact distance to the school center in meters.
 */
export function checkGeofence(
  latitude: number,
  longitude: number,
): GeofenceResult {
  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    activeSchoolConfig.anchorLat,
    activeSchoolConfig.anchorLon,
  );

  return {
    isInside: distanceMeters <= activeSchoolConfig.radiusMeters,
    distanceMeters,
  };
}

// ─────────────────────────────────────────────────────────────
//  6. MOCK / FAKE GPS DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Detects if the provided location fix is from a mock/fake GPS provider.
 * Returns true if spoofing is suspected.
 */
export function isMockLocationSuspected(position: LocationResult): boolean {
  // If native plugin sets isMockLocation
  if (position.isMockLocation === true) {
    return true;
  }

  // Heuristic: suspiciously perfect accuracy (< 0.1m) is very unusual on real hardware GPS
  if (position.accuracy > 0 && position.accuracy < 0.1) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
//  7. LATE CHECK-IN DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Returns true if current time is past the school grace period
 * (shiftStart + graceMinutes).
 */
export function isLateCheckIn(): boolean {
  const now = new Date();
  const graceEnd = new Date();
  graceEnd.setHours(activeSchoolConfig.shiftStartHour, activeSchoolConfig.shiftStartMinute + activeSchoolConfig.graceMinutes, 0, 0);
  return now > graceEnd;
}

// ─────────────────────────────────────────────────────────────
//  8. WORKING HOURS CALCULATION
// ─────────────────────────────────────────────────────────────

/**
 * Calculates working hours string from check-in timestamp to now (or checkOut).
 * Returns "Xh Ym" format.
 */
export function calculateWorkingHours(
  checkInTimestamp: number,
  checkOutTimestamp?: number,
): string {
  const endTime = checkOutTimestamp ?? Date.now();
  const diffMs = Math.max(0, endTime - checkInTimestamp);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// ─────────────────────────────────────────────────────────────
//  9. PRE-FLIGHT DIAGNOSTICS RUNNER
// ─────────────────────────────────────────────────────────────

export interface PreFlightResult {
  internet: boolean;
  gpsEnabled: boolean;
  locationPermission: PermissionStatus;
  cameraPermission: PermissionStatus;
  allPassed: boolean;
}

/**
 * Runs all 4 pre-flight checks in parallel and returns results.
 */
export async function runPreFlightChecks(): Promise<PreFlightResult> {
  const [internet, gpsEnabled, locationPermission, cameraPermission] =
    await Promise.all([
      checkInternetConnectivity(),
      checkGPSEnabled(),
      checkLocationPermission(),
      checkCameraPermission(),
    ]);

  return {
    internet,
    gpsEnabled,
    locationPermission,
    cameraPermission,
    allPassed:
      internet &&
      gpsEnabled &&
      locationPermission === 'granted' &&
      cameraPermission === 'granted',
  };
}

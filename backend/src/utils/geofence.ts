/**
 * Geofencing & GPS Security Utility
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string | number;
  isMockLocation?: boolean;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  distanceMeters: number;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Calculates the geodesic distance between two points on Earth using the Haversine formula.
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000; // 6,371 km in meters

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c * 10) / 10; // Rounded to 1 decimal place
}

/**
 * Validates GPS fix sanity, accuracy, mock status, and server geofence boundary.
 */
export function validateGeofenceAndGps(
  userLocation: LocationCoordinates,
  schoolLocation: { latitude: number; longitude: number; allowedRadiusMeters: number }
): GeofenceValidationResult {
  const { latitude, longitude, accuracy, isMockLocation, timestamp } = userLocation;

  // 1. Sanity check coordinates
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) {
    return {
      isValid: false,
      distanceMeters: Infinity,
      errorCode: 'INVALID_COORDINATES',
      errorMessage: 'Invalid GPS coordinates provided.',
    };
  }

  // 2. Anti-spoofing check
  if (isMockLocation) {
    return {
      isValid: false,
      distanceMeters: Infinity,
      errorCode: 'MOCK_GPS_DETECTED',
      errorMessage: 'Fake GPS detected. Attendance cannot be marked.',
    };
  }

  // 3. Accuracy threshold check (<= 50 meters)
  if (accuracy !== undefined && accuracy > 50) {
    return {
      isValid: false,
      distanceMeters: Infinity,
      errorCode: 'LOW_ACCURACY',
      errorMessage: `GPS accuracy is too low (${accuracy}m). Please move to an open area and retry.`,
    };
  }

  // 4. Client timestamp age check (reject >30s in past or >10s in future)
  if (timestamp) {
    const clientTime = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
    const now = Date.now();
    const diffMs = Math.abs(now - clientTime);

    if (diffMs > 30000) {
      return {
        isValid: false,
        distanceMeters: Infinity,
        errorCode: 'STALE_TIMESTAMP',
        errorMessage: 'GPS timestamp is outdated. Please refresh location and retry.',
      };
    }
  }

  // 5. Haversine geofence calculation
  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    schoolLocation.latitude,
    schoolLocation.longitude
  );

  if (distanceMeters > schoolLocation.allowedRadiusMeters) {
    return {
      isValid: false,
      distanceMeters,
      errorCode: 'OUTSIDE_GEOFENCE',
      errorMessage: `You are ${distanceMeters} meters away from school. Please be within ${schoolLocation.allowedRadiusMeters} meters.`,
    };
  }

  return {
    isValid: true,
    distanceMeters,
  };
}

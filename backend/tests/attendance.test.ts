import { calculateHaversineDistance, validateGeofenceAndGps } from '../src/utils/geofence';

describe('Attendance & Geofencing Security Unit Tests', () => {
  const school = {
    latitude: 22.719568,
    longitude: 75.857727,
    allowedRadiusMeters: 200,
  };

  it('should correctly calculate distance inside geofence', () => {
    // 50 meters away
    const userLat = 22.719900;
    const userLon = 75.857727;

    const distance = calculateHaversineDistance(userLat, userLon, school.latitude, school.longitude);
    expect(distance).toBeLessThan(200);
  });

  it('should accept valid location within allowed radius', () => {
    const result = validateGeofenceAndGps(
      {
        latitude: 22.719600,
        longitude: 75.857727,
        accuracy: 10,
        isMockLocation: false,
      },
      school
    );

    expect(result.isValid).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(200);
  });

  it('should reject location outside geofence radius', () => {
    // ~5km away
    const result = validateGeofenceAndGps(
      {
        latitude: 22.750000,
        longitude: 75.890000,
        accuracy: 15,
        isMockLocation: false,
      },
      school
    );

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('OUTSIDE_GEOFENCE');
  });

  it('should hard block mock / fake GPS location', () => {
    const result = validateGeofenceAndGps(
      {
        latitude: 22.719568,
        longitude: 75.857727,
        accuracy: 5,
        isMockLocation: true,
      },
      school
    );

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('MOCK_GPS_DETECTED');
  });

  it('should reject GPS fix with low accuracy (>50m)', () => {
    const result = validateGeofenceAndGps(
      {
        latitude: 22.719568,
        longitude: 75.857727,
        accuracy: 85, // 85m accuracy
        isMockLocation: false,
      },
      school
    );

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('LOW_ACCURACY');
  });
});

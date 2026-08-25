# School Staff Attendance — API Contract & Integration Specification

**Base URL**: `http://localhost:5000/api/v1`  
**OpenAPI / Swagger Specs**: `http://localhost:5000/api-docs`  
**Authentication Header**: `Authorization: Bearer <access_token>`

---

## 1. Response Standard

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Paginated Success Response Format
```json
{
  "success": true,
  "message": "Records retrieved.",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "OUTSIDE_GEOFENCE",
    "message": "You are 350 meters away from school. Please be within 200 meters.",
    "details": {}
  }
}
```

---

## 2. Frontend Screen → API Endpoint Mapping Table

| Frontend Screen | Method | Endpoint | Description & Redux Slice Sync |
|---|---|---|---|
| `LoginScreen.tsx` | `POST` | `/auth/login` | Authenticates staff with `employeeId` + `password`. Returns JWT token, refresh token & `user` object (`authSlice.ts`). |
| `Splash / AppInit` | `POST` | `/auth/refresh` | Refreshes expired access token using stored refresh token. |
| `ProfileScreen.tsx` | `POST` | `/auth/logout` | Revokes session and invalidates refresh token. |
| `DashboardScreen.tsx` | `GET` | `/dashboard` | Returns combined metrics: staff info, today state, monthly attendance counts, unread notifications count. |
| `ProfileScreen.tsx` | `GET` | `/staff/profile` | Fetches complete employee profile details. |
| `ProfileScreen.tsx` | `PATCH` | `/staff/profile` | Updates name, phone, department, designation, or avatar. |
| `ChangePasswordScreen.tsx` | `POST` | `/staff/change-password` | Verifies current password and updates to new password. |
| `AttendanceHomeScreen.tsx` | `GET` | `/schools/config` | Returns school anchor coordinates (`lat`, `lon`, `radiusMeters`) for geofencing calculation. |
| `AttendanceHomeScreen.tsx` | `GET` | `/attendance/today` | Fetches today's check-in/out status (`attendanceSlice.ts`). |
| `AttendancePreviewScreen.tsx` | `POST` | `/attendance/check-in` | Submits check-in with GPS coords & base64 selfie. Enforces server-side Haversine geofence. |
| `AttendancePreviewScreen.tsx` | `POST` | `/attendance/check-out` | Submits check-out with GPS coords & base64 selfie. Computes total working minutes. |
| `AttendanceHistoryScreen.tsx` | `GET` | `/attendance/history` | Returns paginated list of historical attendance records. |
| `AttendanceDetailScreen.tsx` | `GET` | `/attendance/:id` | Returns single attendance record details with location and selfie URL. |
| `LeaveListScreen.tsx` | `GET` | `/leaves` | Fetches user leave applications (`leaveSlice.ts`). |
| `ApplyLeaveScreen.tsx` | `POST` | `/leaves` | Submits new leave application with overlap validation & file attachment. |
| `LeaveDetailScreen.tsx` | `GET` | `/leaves/quotas` | Returns leave quota balances. |
| `LeaveDetailScreen.tsx` | `GET` | `/leaves/:id` | Returns single leave application detail. |
| `LeaveDetailScreen.tsx` | `PATCH` | `/leaves/:id/cancel` | Cancels pending leave. |
| `HolidayListScreen.tsx` | `GET` | `/holidays` | Fetches school holiday calendar (`HolidayItem[]`). |
| `HolidayDetailScreen.tsx` | `GET` | `/holidays/:id` | Returns single holiday details. |
| `NotificationsScreen.tsx` | `GET` | `/notifications` | Fetches notifications (`notificationSlice.ts`). |
| `NotificationsScreen.tsx` | `PATCH` | `/notifications/:id/read` | Marks notification as read. |
| `NotificationsScreen.tsx` | `PATCH` | `/notifications/read-all` | Marks all notifications as read. |
| `NotificationsScreen.tsx` | `DELETE` | `/notifications/:id` | Deletes notification. |
| `Upload` | `POST` | `/uploads` | Uploads image / document file (multipart/form-data). |

---

## 3. Detailed Endpoint Contracts

### 3.1 POST /api/v1/auth/login
**Request Payload**:
```json
{
  "employeeId": "EMP001",
  "password": "password123"
}
```
**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "u-101",
      "employeeId": "EMP001",
      "name": "Whiteleaf Staff",
      "email": "staff@whiteleaf.edu",
      "phone": "+91 98765 43210",
      "designation": "Senior Teacher",
      "department": "Academics",
      "schoolName": "Whiteleaf International School",
      "schoolId": "sch-01"
    },
    "expiresAt": "2026-08-09T14:30:00.000Z"
  }
}
```

### 3.2 POST /api/v1/attendance/check-in
**Request Payload**:
```json
{
  "latitude": 22.719568,
  "longitude": 75.857727,
  "accuracy": 12.5,
  "timestamp": "2026-08-09T09:10:00Z",
  "selfieBase64": "data:image/jpeg;base64,...",
  "deviceInfo": {
    "platform": "android",
    "appVersion": "1.0.0",
    "isMockLocation": false
  }
}
```
**Success Response (201)**:
```json
{
  "success": true,
  "message": "Check-in successful.",
  "data": {
    "id": "att-2001",
    "date": "2026-08-09",
    "checkInTime": "09:10 AM",
    "status": "Present",
    "isLate": false,
    "distanceMeters": 15.2
  }
}
```
**Error Response (400 - Outside Geofence)**:
```json
{
  "success": false,
  "error": {
    "code": "OUTSIDE_GEOFENCE",
    "message": "You are 350 meters away from school. Please be within 200 meters.",
    "details": {
      "distanceMeters": 350
    }
  }
}
```

### 3.3 POST /api/v1/attendance/check-out
**Request Payload**:
```json
{
  "latitude": 22.719568,
  "longitude": 75.857727,
  "accuracy": 10.0,
  "selfieBase64": "data:image/jpeg;base64,..."
}
```
**Success Response (200)**:
```json
{
  "success": true,
  "message": "Check-out successful.",
  "data": {
    "id": "att-2001",
    "date": "2026-08-09",
    "checkInTime": "09:10 AM",
    "checkOutTime": "05:00 PM",
    "workingHours": "7h 50m",
    "status": "Present"
  }
}
```

---

## 4. Error Codes Inventory

| Error Code | HTTP Status | Trigger Condition |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT access token |
| `INVALID_CREDENTIALS` | 401 | Incorrect employee ID or password |
| `INVALID_REFRESH_TOKEN` | 401 | Expired or malformed refresh token |
| `REVOKED_REFRESH_TOKEN` | 401 | Refresh token already logged out or revoked |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource missing in database |
| `OUTSIDE_GEOFENCE` | 400 | Calculated Haversine distance > school radius |
| `MOCK_GPS_DETECTED` | 400 | `isMockLocation: true` flag detected |
| `LOW_ACCURACY` | 400 | GPS accuracy > 50 meters |
| `STALE_TIMESTAMP` | 400 | Client timestamp differs by >30 seconds from server clock |
| `ALREADY_CHECKED_IN` | 409 | User has already checked in today |
| `NOT_CHECKED_IN` | 400 | Attempted check-out before checking in |
| `ALREADY_CHECKED_OUT` | 409 | User has already checked out today |
| `OVERLAPPING_LEAVE` | 409 | Leave dates conflict with existing pending/approved leave |
| `VALIDATION_ERROR` | 400 | Request DTO validation failed |
| `TOO_MANY_REQUESTS` | 429 | Rate limit threshold exceeded |

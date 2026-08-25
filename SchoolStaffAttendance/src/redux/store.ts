import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slice/authSlice';
import attendanceReducer from './slice/attendanceSlice';
import leaveReducer from './slice/leaveSlice';
import notificationReducer from './slice/notificationSlice';

// ============================================================
//  SAS – Redux Store
// ============================================================

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    notifications: notificationReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization warnings
        ignoredActions: ['auth/loginSuccess'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed dispatch hook — use instead of raw useDispatch
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(loginSuccess(data));
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook — use instead of raw useSelector
 * @example
 * const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

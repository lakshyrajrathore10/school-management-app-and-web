import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.types';

// ============================================================
//  SAS – Navigation Service
//  Allows navigation from outside React components (e.g. Axios interceptors)
// ============================================================

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to any screen in the root stack.
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    (
      navigationRef.navigate as (
        name: RouteName,
        params?: RootStackParamList[RouteName],
      ) => void
    )(name, params);
  }
}

/**
 * Go back in navigation stack.
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reset navigation to Auth stack (used on logout).
 */
export function resetToAuth() {
  if (!navigationRef.isReady()) {return;}

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    }),
  );
}

/**
 * Reset navigation to Main stack (used after successful login).
 */
export function resetToMain() {
  if (!navigationRef.isReady()) {return;}

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    }),
  );
}

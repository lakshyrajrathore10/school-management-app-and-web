import { schoolApi } from '../api/services/school.api';
import { updateActiveSchoolConfig } from './locationService';
export * from '../api/types/school.api.types';

export const schoolService = {
  fetchSchoolConfig: async () => {
    try {
      const config = await schoolApi.getConfig();
      if (config) {
        updateActiveSchoolConfig(config);
      }
      return config;
    } catch (error) {
      // Fallback silently to initial active school config if offline
      return null;
    }
  },
};

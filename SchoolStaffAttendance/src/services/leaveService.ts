import { leaveApi } from '../api/services/leave.api';
export * from '../api/types/leave.api.types';

export const leaveService = {
  fetchLeaves: leaveApi.getLeaves,
  applyLeave: leaveApi.applyLeave,
  fetchQuotas: leaveApi.getQuotas,
  fetchDetail: leaveApi.getDetail,
  cancelLeave: leaveApi.cancelLeave,
};

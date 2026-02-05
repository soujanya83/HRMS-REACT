import axiosClient from '../axiosClient';

// Roster Period APIs
export const rosterPeriodService = {
  // Get all roster periods
  getRosterPeriods: (params = {}) => {
    return axiosClient.get('/periods', { params });
  },

  // Create new roster period
  createRosterPeriod: (data) => {
    return axiosClient.post('/periods', data);
  },

  // Publish roster period
  publishRosterPeriod: (periodId) => {
    return axiosClient.post(`/periods/${periodId}/publish`);
  },

  // Lock roster period
  lockRosterPeriod: (periodId) => {
    return axiosClient.post(`/periods/${periodId}/lock`);
  },

  // Get roster period by ID
  getRosterPeriodById: (periodId) => {
    return axiosClient.get(`/periods/${periodId}`);
  },

  // Delete roster period
  deleteRosterPeriod: (periodId) => {
    return axiosClient.delete(`/periods/${periodId}`);
  },

  // Get roster period statistics
  getPeriodStats: (periodId) => {
    return axiosClient.get(`/periods/${periodId}/stats`);
  },

  // Bulk assign roster to employees
  bulkAssignRoster: (data) => {
    return axiosClient.post('/rosters/bulk-assign', data);
  },

  // Get rosters by period ID
  getRostersByPeriod: (periodId) => {
    return axiosClient.get(`/rosters/period/${periodId}`);
  }
};
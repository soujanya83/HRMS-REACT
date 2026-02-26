// services/rosterService.js
import axiosClient from '../axiosClient';

export const rosterService = {
  // Get all rosters with optional filters
  getRosters: (params = {}) => {
    return axiosClient.get('/rosters', { params });
  },

  // Get single roster by ID
  getRosterById: (rosterId) => {
    return axiosClient.get(`/rosters/${rosterId}`);
  },

  // Create new roster
  createRoster: (data) => {
    return axiosClient.post('/rosters', data);
  },

  // Update roster
  updateRoster: (rosterId, data) => {
    return axiosClient.put(`/rosters/${rosterId}`, data);
  },

  // Delete roster
  deleteRoster: (rosterId) => {
    return axiosClient.delete(`/rosters/${rosterId}`);
  },

  // Bulk assign rosters
  bulkAssignRoster: (data) => {
    return axiosClient.post('/rosters/bulk-assign', data);
  },

  // Get rosters by period ID
  getRostersByPeriod: (periodId) => {
    return axiosClient.get(`/rosters/period/${periodId}`);
  },

  // Get employees
  getEmployees: (params = {}) => {
    return axiosClient.get('/employees', { params });
  },

  // Get shifts
  getShifts: (params = {}) => {
    return axiosClient.get('/shifts', { params });
  },

  // Get departments
  getDepartments: (organizationId) => {
    if (organizationId) {
      return axiosClient.get(`/organizations/${organizationId}/departments`);
    }
    return axiosClient.get('/departments');
  },

  // Get organization departments (alternative)
  getOrganizationDepartments: (organizationId) => {
    return axiosClient.get(`/organizations/${organizationId}/departments`);
  },

  // Get all departments (without organization filter)
  getAllDepartments: () => {
    return axiosClient.get('/departments');
  },

  // Get rooms - ADDED THIS MISSING METHOD
  getRooms: (organizationId) => {
    if (organizationId) {
      return axiosClient.get(`/organizations/${organizationId}/rooms`);
    }
    return axiosClient.get('/rooms');
  },

  // Get roster statistics
  getRosterStats: (params = {}) => {
    return axiosClient.get('/rosters/stats', { params });
  }
};

export default rosterService;
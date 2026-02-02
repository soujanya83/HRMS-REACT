// src/services/attendanceService.js
import axiosClient from '../axiosClient';

// Attendance APIs
export const attendanceService = {
  // Get attendance records with filters
  getAttendance: (params = {}) => {
    return axiosClient.get('/attendance', { params });
  }
};

// Organization attendance rules
export const attendanceRuleService = {
  // Get attendance rules by organization ID
  getRulesByOrganization: (organizationId) => {
    return axiosClient.get(`/getbyorganization/${organizationId}`);
  },

  // Create new attendance rule
  createRule: (data) => {
    return axiosClient.post('/organization-attendance-rule', data);
  },

  // Update existing attendance rule - USE PUT instead of POST
  updateRule: (id, data) => {
    return axiosClient.put(`/organization-attendance-rule/${id}`, data);
  },

  // Delete attendance rule
  deleteRule: (id) => {
    return axiosClient.delete(`/organization-attendance-rule/${id}`);
  }
};
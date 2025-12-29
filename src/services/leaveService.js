// src/services/leaveService.js
import axiosClient from '../../src/axiosClient';

export const leaveService = {
  // Get all leave requests
  getLeaves: (params = {}) => {
    return axiosClient.get('/leave', { params });
  },

  // Create leave request
  createLeave: (employeeId, data) => {
    return axiosClient.post(`/leave/store/${employeeId}`, data);
  },

  // Approve/reject leave request
  approveLeave: (leaveId, data) => {
    return axiosClient.put(`/leave/approve-leave/${leaveId}`, data);
  },

  // Get single leave request
  getLeave: (leaveId) => {
    return axiosClient.get(`/leave/show/${leaveId}`);
  },

  // Delete leave request
  deleteLeave: (leaveId) => {
    return axiosClient.delete(`/leave/destroy/${leaveId}`);
  },

  // Get leave balance
  getLeaveBalance: (organizationId) => {
    return axiosClient.get(`/leave/leaveBalance?organization_id=${organizationId}`);
  },

  // Get leave summary
  getLeavesSummary: () => {
    return axiosClient.get('/leave/leaves-summary');
  },

  // Get organization leave types
  getLeaveTypes: () => {
    return axiosClient.get('/organization-leaves');
  },

  // Create organization leave type
  createLeaveType: (data) => {
    return axiosClient.post('/organization-leaves', data);
  },

  // Update organization leave type
  updateLeaveType: (id, data) => {
    return axiosClient.post(`/organization-leaves/${id}`, data);
  },

  // Delete organization leave type
  deleteLeaveType: (id) => {
    return axiosClient.delete(`/organization-leaves/${id}`);
  }
};
// src/services/attendanceService.js
import axiosClient from '../axiosClient';

// Attendance APIs
export const attendanceService = {
  // Get attendance records with filters
  getAttendance: (params = {}) => {
    return axiosClient.get('/attendance', { params });
  },

  // Clock in
  clockIn: (data) => {
    return axiosClient.post('/attendance/clock-in', data);
  },

  // Clock out
  clockOut: (data) => {
    return axiosClient.post('/attendance/clock-out', data);
  },

  // Create attendance record
  createAttendance: (data) => {
    return axiosClient.post('/attendance/store', data);
  },

  // Update attendance record
  updateAttendance: (data) => {
    return axiosClient.post('/attendance/update', data);
  },

  // Delete attendance record
  deleteAttendance: (id) => {
    return axiosClient.delete(`/attendance/destroy/${id}`);
  },

  // Work on holiday request
  workOnHoliday: (data) => {
    return axiosClient.post('/attendance/work-on-holiday', data);
  },

  // Approve work on holiday
  approveWorkOnHoliday: (data) => {
    return axiosClient.post('/attendance/approve-work-on-holiday', data);
  },

  // Get work on holiday requests
  getWorkOnHoliday: () => {
    return axiosClient.get('/attendance/work-on-holiday');
  }
};

// Organization attendance rules
export const attendanceRuleService = {
  getRules: () => {
    return axiosClient.get('/organization-attendance-rule');
  },

  createRule: (data) => {
    return axiosClient.post('/organization-attendance-rule', data);
  },

  getRule: (id) => {
    return axiosClient.get(`/organization-attendance-rule/${id}`);
  },

  updateRule: (id, data) => {
    return axiosClient.post(`/organization-attendance-rule/${id}`, data);
  },

  deleteRule: (id) => {
    return axiosClient.delete(`/organization-attendance-rule/${id}`);
  }
};

// Organization holidays
export const holidayService = {
  getHolidays: () => {
    return axiosClient.get('/organization-holiday');
  },

  createHoliday: (data) => {
    return axiosClient.post('/organization-holiday', data);
  },

  getHoliday: (id) => {
    return axiosClient.get(`/organization-holiday/${id}`);
  },

  updateHoliday: (id, data) => {
    return axiosClient.post(`/organization-holiday/${id}`, data);
  },

  partialUpdateHoliday: (id, data) => {
    return axiosClient.post(`/organization-holiday/${id}/partial`, data);
  },

  deleteHoliday: (id) => {
    return axiosClient.delete(`/organization-holiday/${id}`);
  }
};

// Employee leaves
export const leaveService = {
  getLeaves: (params = {}) => {
    return axiosClient.get('/leave', { params });
  },

  createLeave: (employeeId, data) => {
    return axiosClient.post(`/leave/store/${employeeId}`, data);
  },

  approveLeave: (leaveId, data) => {
    return axiosClient.put(`/leave/approve-leave/${leaveId}`, data);
  },

  getLeave: (leaveId) => {
    return axiosClient.get(`/leave/show/${leaveId}`);
  },

  deleteLeave: (leaveId) => {
    return axiosClient.delete(`/leave/destroy/${leaveId}`);
  },

  getLeaveBalance: () => {
    return axiosClient.get('/leave/leaveBalance');
  }
};
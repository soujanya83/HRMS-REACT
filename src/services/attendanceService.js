// src/services/attendanceService.js
import axiosClient from '../axiosClient';

// Attendance APIs
export const attendanceService = {
  // Get attendance records with filters
  getAttendance: (params = {}) => {
    return axiosClient.get('/attendance', { params });
  },
    getDepartmentsByOrgId: (orgId) => {
    return axiosClient.get(`/organizations/${orgId}/departments`);
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

  // Update attendance record (for manual adjustments)
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
  },

  // ===== NEW ENDPOINTS =====
  
  // Get attendance of employee for specific date to modify
  getAttendanceForModification: (employeeId, date) => {
    return axiosClient.get(`/attendance/get-attendance/${employeeId}/${date}`);
  },

  // Approve or reject manual correction in attendance
  approveRejectAttendanceChange: (adjustmentId, data) => {
    return axiosClient.post(`/attendance/approve-or-reject-employee-attendance-change/${adjustmentId}`, data);
  },

  // Get all manual adjustment requests (if separate endpoint exists)
  getManualAdjustments: (params = {}) => {
    return axiosClient.get('/attendance', { params }); // Fallback to regular attendance
  },

  // Get employees (you might need to check your employee service endpoint)
  getEmployees: (params = {}) => {
    // Common employee endpoints - adjust based on your API
    return axiosClient.get('/employees', { params });
  },

  // Get departments
  getDepartments: () => {
    return axiosClient.get('/departments');
  }
};

// Organization attendance rules
export const attendanceRuleService = {
  // Get all rules
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
    // Check if your Laravel uses PUT or POST for update
    // Based on your earlier code, it uses PUT
    return axiosClient.put(`/organization-attendance-rule/${id}`, data);
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

// Employee service (if you need a separate employee service)
export const employeeService = {
  getAllEmployees: (params = {}) => {
    return axiosClient.get('/employees', { params });
  },

  getEmployee: (id) => {
    return axiosClient.get(`/employees/${id}`);
  },

  createEmployee: (data) => {
    return axiosClient.post('/employees', data);
  },

  updateEmployee: (id, data) => {
    return axiosClient.put(`/employees/${id}`, data);
  },

  deleteEmployee: (id) => {
    return axiosClient.delete(`/employees/${id}`);
  },

  getEmployeeAttendance: (employeeId, params = {}) => {
    return axiosClient.get(`/employees/${employeeId}/attendance`, { params });
  }
};

// Department service
export const departmentService = {
  getAllDepartments: () => {
    return axiosClient.get('/departments');
  },

  getDepartment: (id) => {
    return axiosClient.get(`/departments/${id}`);
  },

  createDepartment: (data) => {
    return axiosClient.post('/departments', data);
  },

  updateDepartment: (id, data) => {
    return axiosClient.put(`/departments/${id}`, data);
  },

  deleteDepartment: (id) => {
    return axiosClient.delete(`/departments/${id}`);
  }
};

export const getDepartmentsByOrgId = (orgId) => {
  return axiosClient.get(`/organizations/${orgId}/departments`);
};


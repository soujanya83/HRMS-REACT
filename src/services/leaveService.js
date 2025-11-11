import axiosClient from "../axiosClient";

// --- Leave Requests CRUD Operations ---

// Get all leave requests
export const getLeaveRequests = (params = {}) => {
  return axiosClient.get("/leave-requests", { params });
};

// Get a single leave request by ID
export const getLeaveRequestById = (id) => {
  return axiosClient.get(`/leave-requests/${id}`);
};

// Create a new leave request
export const createLeaveRequest = (leaveData) => {
  return axiosClient.post("/leave-requests", leaveData);
};

// Update an existing leave request
export const updateLeaveRequest = (id, leaveData) => {
  return axiosClient.put(`/leave-requests/${id}`, leaveData);
};

// Delete a leave request
export const deleteLeaveRequest = (id) => {
  return axiosClient.delete(`/leave-requests/${id}`);
};

// Get leave requests by employee ID
export const getLeaveRequestsByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/leave-requests/by-employee/${employeeId}`, { params });
};

// Approve leave request
export const approveLeaveRequest = (id) => {
  return axiosClient.patch(`/leave-requests/${id}/approve`);
};

// Reject leave request
export const rejectLeaveRequest = (id) => {
  return axiosClient.patch(`/leave-requests/${id}/reject`);
};
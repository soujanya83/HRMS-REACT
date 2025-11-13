import axiosClient from "../axiosClient";

// --- Leave Balance CRUD Operations ---

// Get all leave balances
export const getLeaveBalances = (params = {}) => {
  return axiosClient.get("/leave-balances", { params });
};

// Get a single leave balance by ID
export const getLeaveBalanceById = (id) => {
  return axiosClient.get(`/leave-balances/${id}`);
};

// Create a new leave balance record
export const createLeaveBalance = (balanceData) => {
  return axiosClient.post("/leave-balances", balanceData);
};

// Update an existing leave balance record
export const updateLeaveBalance = (id, balanceData) => {
  return axiosClient.put(`/leave-balances/${id}`, balanceData);
};

// Delete a leave balance record
export const deleteLeaveBalance = (id) => {
  return axiosClient.delete(`/leave-balances/${id}`);
};

// Get leave balance by employee ID
export const getLeaveBalanceByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/leave-balances/by-employee/${employeeId}`, {
    params,
  });
};

// Reset leave balances for new year
export const resetLeaveBalances = (year) => {
  return axiosClient.post("/leave-balances/reset", { year });
};

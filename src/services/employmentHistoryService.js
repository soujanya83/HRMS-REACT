import axiosClient from "../axiosClient";

// --- Employment History CRUD Operations ---

// Get all employment history records
export const getEmploymentHistory = (params = {}) => {
  return axiosClient.get("/employment-history", { params });
};

// Get a single employment history record by ID
export const getEmploymentHistoryById = (id) => {
  return axiosClient.get(`/employment-history/${id}`);
};

// Create a new employment history record
export const createEmploymentHistory = (historyData) => {
  return axiosClient.post("/employment-history", historyData);
};

// Update an existing employment history record
export const updateEmploymentHistory = (id, historyData) => {
  return axiosClient.put(`/employment-history/${id}`, historyData);
};

// Delete an employment history record
export const deleteEmploymentHistory = (id) => {
  return axiosClient.delete(`/employment-history/${id}`);
};

// Get employment history by employee ID
export const getEmploymentHistoryByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/employment-history/by-employee/${employeeId}`, { params });
};
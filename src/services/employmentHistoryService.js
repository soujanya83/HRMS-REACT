import axiosClient from "../axiosClient";

export const getEmploymentHistory = (params = {}) => {
  return axiosClient.get("/employment-history", { params });
};

export const getEmploymentHistoryById = (id) => {
  return axiosClient.get(`/employment-history/${id}`);
};

export const createEmploymentHistory = (historyData) => {
  return axiosClient.post("/employment-history", historyData);
};

export const updateEmploymentHistory = (id, historyData) => {
  return axiosClient.put(`/employment-history/${id}`, historyData);
};

export const deleteEmploymentHistory = (id) => {
  return axiosClient.delete(`/employment-history/${id}`);
};

export const getEmploymentHistoryByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/employment-history/by-employee/${employeeId}`, { params });
};

// REMOVED: getDepartments and getDesignations since endpoints don't exist

export const getEmployeesList = () => {
  return axiosClient.get("/employees", { params: { limit: 100 } });
};  
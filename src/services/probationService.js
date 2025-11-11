import axiosClient from "../axiosClient";

// --- Probation Period CRUD Operations ---

// Get all probation periods
export const getProbationPeriods = (params = {}) => {
  return axiosClient.get("/probation-periods", { params });
};

// Get a single probation period by ID
export const getProbationPeriodById = (id) => {
  return axiosClient.get(`/probation-periods/${id}`);
};

// Create a new probation period
export const createProbationPeriod = (probationData) => {
  return axiosClient.post("/probation-periods", probationData);
};

// Update an existing probation period
export const updateProbationPeriod = (id, probationData) => {
  return axiosClient.put(`/probation-periods/${id}`, probationData);
};

// Delete a probation period
export const deleteProbationPeriod = (id) => {
  return axiosClient.delete(`/probation-periods/${id}`);
};

// Get probation periods by employee ID
export const getProbationPeriodsByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/probation-periods/by-employee/${employeeId}`, { params });
};
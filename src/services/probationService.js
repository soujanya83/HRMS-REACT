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
  // Map frontend fields to backend API expected fields
  const apiData = {
    employee_id: probationData.employee_id,
    start_date: probationData.start_date,
    end_date: probationData.end_date,
    status: probationData.status, // Make sure this matches backend values: "Extended", "Active", "Completed"
    feedback: probationData.notes || "", // Map 'notes' to 'feedback'
    confirmation_date: probationData.confirmation_date || null
  };
  return axiosClient.post("/probation-periods", apiData);
};  

// Update an existing probation period
export const updateProbationPeriod = (id, probationData) => {
  // IMPORTANT: Backend expects employee_id even for updates
  const apiData = {
    employee_id: probationData.employee_id, // Must include this!
    start_date: probationData.start_date,
    end_date: probationData.end_date,
    status: probationData.status,
    feedback: probationData.notes || "", // Map 'notes' to 'feedback'
    confirmation_date: probationData.confirmation_date || null
  };
  return axiosClient.put(`/probation-periods/${id}`, apiData);
};

// Delete a probation period
export const deleteProbationPeriod = (id) => {
  return axiosClient.delete(`/probation-periods/${id}`);
};

// Get probation periods by employee ID
export const getProbationPeriodsByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/probation-periods/by-employee/${employeeId}`, { params });
};
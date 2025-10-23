import axiosClient from "../axiosClient";

// --- Core CRUD Operations ---

// Get a list of employees with optional filtering/searching
export const getEmployees = (params) => {
  // Example params: { search: 'John', status: 'Active', page: 1 }
  return axiosClient.get("/employees", { params });
};

// Get a single employee by their ID
export const getEmployee = (id) => {
  return axiosClient.get(`/employees/${id}`);
};

// Create a new employee
export const createEmployee = (employeeData) => {
  // employeeData should be a FormData object
  return axiosClient.post("/employees", employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Important for potential file uploads
    },
  });
};

// Update an existing employee
export const updateEmployee = (id, employeeData) => {
  // Laravel needs help with PUT requests when using FormData
  employeeData.append('_method', 'PUT');
  return axiosClient.post(`/employees/${id}`, employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Soft delete an employee (moves them to trash)
export const deleteEmployee = (id) => {
  return axiosClient.delete(`/employees/${id}`);
};


// --- Soft Deletes & Trashed Data ---

// Get a list of soft-deleted employees
export const getTrashedEmployees = (params) => {
  return axiosClient.get('/employees/trashed', { params });
};

// Restore a soft-deleted employee
export const restoreEmployee = (id) => {
  return axiosClient.patch(`/employees/${id}/restore`);
};

// Permanently delete an employee from the database
export const forceDeleteEmployee = (id) => {
  return axiosClient.delete(`/employees/${id}/force`);
};


// --- Additional Specific Operations ---

// Update just the status of an employee
export const updateEmployeeStatus = (id, status) => {
    return axiosClient.patch(`/employees/${id}/status`, { status });
};

// Update just the manager of an employee
export const updateEmployeeManager = (id, managerId) => {
    return axiosClient.patch(`/employees/${id}/manager`, { reporting_manager_id: managerId });
};

// Get an employee's detailed profile data
export const getEmployeeProfile = (id) => {
  return axiosClient.get(`/employees/${id}/profile`);
};

// Get an employee's documents
export const getEmployeeDocuments = (id) => {
  return axiosClient.get(`/employees/${id}/documents`);
};

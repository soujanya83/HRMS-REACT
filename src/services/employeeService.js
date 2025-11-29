import axiosClient from '../axiosClient';


export const getEmployees = (params = {}) => {
  return axiosClient.get("/employees", { params });
};

export const getEmployee = (id) => {
  const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
  console.log('EmployeeService - Fetching employee with cleaned ID:', cleanId);
  return axiosClient.get(`/employees/${cleanId}`);
};

// Create a new employee
export const createEmployee = (employeeData) => {
  return axiosClient.post("/employees", employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update an existing employee
export const updateEmployee = (id, employeeData) => {
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
export const getTrashedEmployees = (params = {}) => {
  return axiosClient.get('/employees/trashed', { params });
};

// Restore a soft-deleted employee
export const restoreEmployee = (id) => {
  return axiosClient.patch(`/employees/${id}/restore`);
};

// Permanently delete an employee from the database
export const forceDeleteEmployee = (id) => {
  return axiosClient.delete(`/employees/${id}/force-delete`);
};

// --- Filtering & Searching ---

// List employees by department
export const getEmployeesByDepartment = (departmentId, params = {}) => {
  return axiosClient.get(`/employees/department/${departmentId}`, { params });
};

// List employees by designation
export const getEmployeesByDesignation = (designationId, params = {}) => {
  return axiosClient.get(`/employees/designation/${designationId}`, { params });
};

// List employees by reporting manager
export const getEmployeesByManager = (managerId, params = {}) => {
  return axiosClient.get(`/employees/manager/${managerId}`, { params });
};

// Employees by organization
export const getEmployeesByOrganization = (organizationId, params = {}) => {
  return axiosClient.get(`/employees/organization/${organizationId}`, { params });
};

// Search/filter employees by name
export const searchEmployees = (searchParams = {}) => {
  return axiosClient.get('/employees/search', { params: searchParams });
};

// --- Employee Status & Management ---

// Change employee status
export const updateEmployeeStatus = (id, status) => {
  return axiosClient.post(`/employees/${id}/status`, { status });
};

// Update employee manager
export const updateEmployeeManager = (id, managerId) => {
  return axiosClient.patch(`/employees/${id}/manager`, { reporting_manager_id: managerId });
};

// Get an employee's detailed profile data
export const getEmployeeProfile = (id) => {
  const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
  return axiosClient.get(`/employees/${cleanId}/profile`);
};

// Get an employee's documents
export const getEmployeeDocuments = (employeeId) => {
  return axiosClient.get(`/employees/${employeeId}/documents`);
};

// Upload new employee document
export const uploadEmployeeDocument = (employeeId, documentData) => {
  return axiosClient.post(`/employees/${employeeId}/documents`, documentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Departments ---
// Get departments for a specific organization
export const getDepartmentsByOrganization = (orgId) => {
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

// Get all departments (if available) - but this endpoint doesn't exist
// export const getDepartments = () => {
//   return axiosClient.get('/departments');
// };

// Export as employeeService object for components that need it
export const employeeService = {
  getEmployees,
  getEmployee,
  getDepartmentsByOrganization, // Use this instead of getDepartments
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getTrashedEmployees,
  restoreEmployee
};
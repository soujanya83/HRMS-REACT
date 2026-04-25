// services/employeeService.js
import axiosClient from '../axiosClient';

// Your existing export functions remain unchanged
export const getEmployees = (params = {}) => {
  return axiosClient.get("/employees", { params });
};

export const getEmployee = (id) => {
  const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
  //console.log('EmployeeService - Fetching employee with cleaned ID:', cleanId);
  return axiosClient.get(`/employees/${cleanId}`);
};

// Create a new employee - FIXED: Use /employees/basic/store-update
export const createEmployeeBasic = (employeeData) => {
  return axiosClient.post("/employees/basic/store-update", employeeData, {
    headers: {
      'Content-Type': 'application/json',
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

// ============= DOCUMENT RELATED FUNCTIONS =============

// Get employee documents - FIXED: Use /employee-documents endpoint
export const getEmployeeDocuments = (employeeId) => {
  return axiosClient.get(`/employee-documents?employee_id=${employeeId}`);
};

// Upload new employee document - FIXED: Use /employee-documents endpoint with correct fields
export const uploadEmployeeDocument = (documentData) => {
  //console.log('DEBUG - uploadEmployeeDocument called with data:');

  // Log FormData contents for debugging
  // if (documentData instanceof FormData) {
  //   for (let pair of documentData.entries()) {
  //     //console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]);
  //   }
  // }

  // The API expects: document_type, file_name, file, issue_date, expiry_date
  // This matches the database schema
  return axiosClient.post('/employee-documents', documentData, {
    headers: {
      // Let browser set Content-Type with boundary
      'Accept': 'application/json',
    },
  });
};

// Delete employee document - Add this function
export const deleteEmployeeDocument = (documentId) => {
  return axiosClient.delete(`/employee-documents/${documentId}`);
};

// Update employee document - Add this function
export const updateEmployeeDocument = (documentId, documentData) => {
  documentData.append('_method', 'PUT');
  return axiosClient.post(`/employee-documents/${documentId}`, documentData, {
    headers: {
      'Accept': 'application/json',
    },
  });
};

// --- Departments ---
// Get departments for a specific organization
export const getDepartmentsByOrganization = (orgId) => {
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

// ============= FUNCTIONS FOR PERFORMANCE REVIEWS =============

// Get all employees with async/await (for performance reviews)
export const getAllEmployees = async (params = {}) => {
  try {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Get employee by ID with async/await (for performance reviews)
export const getEmployeeById = async (id) => {
  try {
    const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
    const response = await axiosClient.get(`/employees/${cleanId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

// Get managers (employees who can be reviewers) with async/await
export const getManagers = async (params = {}) => {
  try {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
};

// Export as employeeService object for components that need it
export const employeeService = {
  getEmployees,
  getEmployee,
  getDepartmentsByOrganization,
  createEmployeeBasic,
  updateEmployee,
  deleteEmployee,
  getTrashedEmployees,
  restoreEmployee,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  updateEmployeeDocument,
  getAllEmployees,
  getEmployeeById,
  getManagers,
};

// Default export for convenience
export default employeeService;
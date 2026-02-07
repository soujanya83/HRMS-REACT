// services/employeeService.js
import axiosClient from '../axiosClient';

// Your existing export functions remain unchanged
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
// FIXED VERSION in employeeService.js
export const uploadEmployeeDocument = (employeeId, documentData) => {
  // Ensure employeeId is a string/number, not FormData
  const id = typeof employeeId === 'object' ? 
    (employeeId.get ? employeeId.get('employee_id') : null) : 
    employeeId;
  
  return axiosClient.post(`/employees/${id}/documents`, documentData, {
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

// ============= ADDING NEW FUNCTIONS FOR PERFORMANCE REVIEWS =============

// Get all employees with async/await (for performance reviews)
export const getAllEmployees = async () => {
  try {
    const response = await axiosClient.get('/employees');
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
export const getManagers = async () => {
  try {
    const response = await axiosClient.get('/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
};

// Get managers with filters (designation-based if needed)
export const getManagersWithFilters = async (filters = {}) => {
  try {
    const response = await axiosClient.get('/employees', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered managers:', error);
    throw error;
  }
};

// Get employees by status
export const getEmployeesByStatus = async (status) => {
  try {
    const response = await axiosClient.get(`/employees/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employees by status ${status}:`, error);
    throw error;
  }
};

// Export as employeeService object for components that need it (with new functions)
export const employeeService = {
  // Original functions
  getEmployees,
  getEmployee,
  getDepartmentsByOrganization,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getTrashedEmployees,
  restoreEmployee,
  
  // New async functions for performance reviews
  getAllEmployees: async (params = {}) => {
    try {
      const response = await axiosClient.get('/employees', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  getEmployeeById: async (id) => {
    try {
      const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
      const response = await axiosClient.get(`/employees/${cleanId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },
  
  getManagers: async (params = {}) => {
    try {
      const response = await axiosClient.get('/employees', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },
  
  // All other functions remain available as separate exports
};

// Default export for convenience
export default employeeService;
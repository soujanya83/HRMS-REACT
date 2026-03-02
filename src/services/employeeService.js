// services/employeeService.js
import axiosClient from '../axiosClient'; // This should be at the very top

// ============================================
// BASIC EMPLOYEE OPERATIONS
// ============================================

// Get all employees with optional filters
export const getEmployees = (params = {}) => {
  return axiosClient.get("/employees", { params });
};

// Get single employee by ID
export const getEmployee = (id) => {
  const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
  console.log('EmployeeService - Fetching employee with cleaned ID:', cleanId);
  return axiosClient.get(`/employees/${cleanId}`);
};

// Create a new employee (basic info only) - MATCHES YOUR API
export const createEmployeeBasic = (employeeData) => {
  console.log('Creating employee with data:', employeeData);
  return axiosClient.post("/employees/basic/store-update", employeeData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });   
};

// Update basic employee info
export const updateEmployeeBasic = (id, employeeData) => {
  return axiosClient.put(`/employees/basic/${id}`, employeeData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Create a new employee with full details (including file uploads)
export const createEmployee = (employeeData) => {
  return axiosClient.post("/employees", employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update an existing employee with full details
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

// ============================================
// SOFT DELETES & TRASHED DATA
// ============================================

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

// ============================================
// XERO INTEGRATION - CORRECT IMPLEMENTATION
// ============================================

/**
 * Sync a single employee to Xero
 * @param {number|string} organizationId - The organization ID
 * @param {number|string} employeeId - The employee ID to sync (REQUIRED)
 * @returns {Promise} - API response with xero_employee_id
 * 
 * API Response (success): 
 * {
 *   "status": true,
 *   "message": "Employee already linked with Xero.",
 *   "xero_employee_id": "c18f519b-c615-4b72-a9fd-9aeb54844f13"
 * }
 * 
 * API Response (error - missing employee):
 * {
 *   "status": false,
 *   "message": "Sync error",
 *   "error": "No query results for model [App\\Models\\Employee\\Employee]."
 * }
 */
export const syncEmployeeToXero = (organizationId, employeeId) => {
  // Validate that employeeId is provided
  if (!employeeId) {
    return Promise.reject(new Error("Employee ID is required for sync"));
  }
  
  console.log(`Syncing employee ${employeeId} to Xero...`);
  return axiosClient.post('/xero/sync-employee', {
    organization_id: organizationId.toString(),
    employee_id: employeeId.toString()  // This is REQUIRED
  });
};

// ============================================
// FILTERING & SEARCHING
// ============================================

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

// ============================================
// EMPLOYEE STATUS & MANAGEMENT
// ============================================

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

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

// Get employee documents
export const getEmployeeDocuments = (employeeId) => {
  console.log(`Fetching documents for employee ID: ${employeeId}`);
  return axiosClient.get(`/employee-documents`, { 
    params: { employee_id: employeeId } 
  });
};

// Upload new employee document
export const uploadEmployeeDocument = (documentData) => {
  console.log('DEBUG - uploadEmployeeDocument called with data:');
  
  // Log FormData contents for debugging
  if (documentData instanceof FormData) {
    for (let pair of documentData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]);
    }
  }
  
  return axiosClient.post('/employee-documents', documentData, {
    headers: {
      'Accept': 'application/json',
    },
  });
};

// Delete employee document
export const deleteEmployeeDocument = (documentId) => {
  console.log(`Deleting document ID: ${documentId}`);
  return axiosClient.delete(`/employee-documents/${documentId}`);
};

// Update employee document
export const updateEmployeeDocument = (documentId, documentData) => {
  console.log(`Updating document ID: ${documentId}`);
  documentData.append('_method', 'PUT');
  return axiosClient.post(`/employee-documents/${documentId}`, documentData, {
    headers: {
      'Accept': 'application/json',
    },
  });
};



// Get designations by department ID
// In employeeService.js - update this function (around line 237)
// employeeService.js
// ============================================
// DEPARTMENTS & ORGANIZATIONS
// ============================================

// Get departments for a specific organization
export const getDepartmentsByOrganization = (orgId) => {
  console.log(`Fetching departments for organization ID: ${orgId}`);
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

// Get designations by department ID
// FIXED: Now accepts organizationId as a parameter
export const getDesignationsByDeptId = async (organizationId) => {
  if (!organizationId) {
    console.error('Organization ID is required to fetch designations');
    return { data: [] };
  }
  
  console.log(`Fetching designations for organization: ${organizationId}`);
  try {
    // Use the organization-level endpoint to get all designations
    const response = await axiosClient.get(`/organizations/${organizationId}/designations`);
    return response;
  } catch (error) {
    console.error('Error fetching designations:', error);
    throw error;
  }
};
// ============================================
// SUPER FUND SEARCH - NEW API ENDPOINT
// ============================================

/**
 * Search for superannuation funds by query
 * @param {string} query - Search query (minimum 1 character)
 * @returns {Promise<Array<string>>} - Array of fund names
 * 
 * API Response: Returns array of strings directly
 * Example: ["A G Williams Private Superannuation Fund", "A R Willis Private Superannuation Fund"]
 */
export const searchSuperFunds = async (query) => {
  if (!query || query.trim().length < 1) {
    return [];
  }
  
  try {
    console.log(`Searching super funds with query: "${query}"`);
    const response = await axiosClient.get('/fund-suggestions', {
      params: { q: query.trim() }
    });
    
    // API returns array of strings directly
    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} super funds`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching super funds:', error);
    return [];
  }
};

// ============================================
// PERFORMANCE REVIEWS & ADDITIONAL FUNCTIONS
// ============================================

// Get all employees with async/await
export const getAllEmployees = async (params = {}) => {
  try {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Get employee by ID with async/await
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

// Get managers (employees who can be reviewers)
export const getManagers = async (params = {}) => {
  try {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
};

// Get managers with filters
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

// ============================================
// EXPORT AS OBJECT FOR CONVENIENCE
// ============================================

export const employeeService = {
  // Basic Operations
  getEmployees,
  getEmployee,
  createEmployeeBasic,
  updateEmployeeBasic,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  
  // Soft Deletes
  getTrashedEmployees,
  restoreEmployee,
  forceDeleteEmployee,
  
  // Xero Integration
  syncEmployeeToXero,
  
  // Filtering
  getEmployeesByDepartment,
  getEmployeesByDesignation,
  getEmployeesByManager,
  getEmployeesByOrganization,
  searchEmployees,
  
  // Status Management
  updateEmployeeStatus,
  updateEmployeeManager,
  getEmployeeProfile,
  
  // Document Management
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  updateEmployeeDocument,
  
  // Departments
  getDepartmentsByOrganization,
  getDesignationsByDeptId,
  
  // Super Fund Search - NEW
  searchSuperFunds,
  
  // Performance Reviews
  getAllEmployees,
  getEmployeeById,
  getManagers,
  getManagersWithFilters,
  getEmployeesByStatus,
};

// Default export for convenience
export default employeeService;
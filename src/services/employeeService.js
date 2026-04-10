// services/employeeService.js
import axiosClient from '../axiosClient';

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
 */
export const syncEmployeeToXero = (organizationId, employeeId) => {
  if (!employeeId) {
    return Promise.reject(new Error("Employee ID is required for sync"));
  }
  
  console.log(`Syncing employee ${employeeId} to Xero...`);
  return axiosClient.post('/xero/sync-employee', {
    organization_id: organizationId.toString(),
    employee_id: employeeId.toString()
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
// DOCUMENT MANAGEMENT - CORRECT API ENDPOINTS
// ============================================

/**
 * Upload a document using the store-flexible endpoint
 * @param {FormData} documentData - FormData containing employee_id, document_type, and file
 * @returns {Promise} - API response with document details
 */
export const uploadEmployeeDocument = (documentData) => {
  console.log('Uploading document to /employee/document/store-flexible');
  
  if (documentData instanceof FormData) {
    for (let pair of documentData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }
  }
  
  return axiosClient.post('/employee/document/store-flexible', documentData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get all documents for an employee
 * @param {number|string} employeeId - The employee ID
 * @returns {Promise} - API response with array of documents
 */
export const getEmployeeDocuments = (employeeId) => {
  console.log(`Fetching documents for employee ID: ${employeeId}`);
  return axiosClient.get(`/employee/${employeeId}/documents`);
};

/**
 * Get single document details
 * @param {number|string} documentId - The document ID
 * @returns {Promise} - API response with document details
 */
export const getDocumentDetails = (documentId) => {
  console.log(`Fetching document details for ID: ${documentId}`);
  return axiosClient.get(`/employee/document/${documentId}`);
};

/**
 * Update document dates (issue_date and expiry_date)
 * @param {number|string} documentId - The document ID
 * @param {Object} datesData - Object containing issue_date and/or expiry_date
 * @returns {Promise} - API response
 */
export const updateDocumentDates = (documentId, datesData) => {
  console.log(`Updating document ${documentId} dates:`, datesData);
  return axiosClient.post('/employee/document/update-dates', {
    document_id: documentId,
    issue_date: datesData.issue_date || '',
    expiry_date: datesData.expiry_date || ''
  });
};

/**
 * Delete an employee document
 * @param {number|string} documentId - The document ID
 * @returns {Promise} - API response
 */
export const deleteEmployeeDocument = (documentId) => {
  console.log(`Deleting document ID: ${documentId}`);
  return axiosClient.delete(`/employee/document/${documentId}`);
};

// ============================================
// DEPARTMENTS & ORGANIZATIONS
// ============================================

// Get departments for a specific organization
export const getDepartmentsByOrganization = (orgId) => {
  console.log(`Fetching departments for organization ID: ${orgId}`);
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

// Get designations by organization ID
export const getDesignationsByDeptId = async (organizationId) => {
  if (!organizationId) {
    console.error('Organization ID is required to fetch designations');
    return { data: [] };
  }
  
  console.log(`Fetching designations for organization: ${organizationId}`);
  try {
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


// Add this to employeeService.js
export const updateEmployeeDocument = async (documentId, documentData) => {
  console.log(`Updating document ID: ${documentId}`);
  
  // If it's a FormData with dates
  if (documentData instanceof FormData) {
    return axiosClient.post(`/employee-documents/${documentId}`, documentData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  // For date updates, use the update-dates endpoint
  return axiosClient.post('/employee/document/update-dates', {
    document_id: documentId,
    issue_date: documentData.issue_date || '',
    expiry_date: documentData.expiry_date || ''
  });
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
  
  // Document Management - UPDATED
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  getDocumentDetails,
  updateDocumentDates,
  
  // Departments
  getDepartmentsByOrganization,
  getDesignationsByDeptId,
  
  // Super Fund Search
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
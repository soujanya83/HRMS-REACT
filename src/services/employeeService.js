import axiosClient from '../axiosClient';

// --- Core CRUD Operations ---

// Get a list of employees with optional filtering/searching
export const getEmployees = (params = {}) => {
  return axiosClient.get("/employees", { params });
};

// Get a single employee by their ID
export const getEmployee = (id) => {
  // Clean the ID parameter to remove any prefixes
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


const mockEmployees = [
  { id: 1, employee_id: 'EMP001', name: 'John Smith', department: 'Engineering' },
  { id: 2, employee_id: 'EMP002', name: 'Sarah Johnson', department: 'Marketing' },
  { id: 3, employee_id: 'EMP003', name: 'Mike Chen', department: 'Sales' },
  { id: 4, employee_id: 'EMP004', name: 'Emily Davis', department: 'HR' },
  { id: 5, employee_id: 'EMP005', name: 'Robert Wilson', department: 'Engineering' }
];

const mockDepartments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Finance'];

// Helper function for API calls with fallback
const apiCallWithFallback = async (apiCall, fallbackData, operation = 'fetch') => {
  try {
    const response = await apiCall();
    
    // Check if we got a 401 error (handled by axiosClient interceptor)
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    // If it's a 401, let the axiosClient interceptor handle it
    if (error.response?.status === 401 || error.message === 'Unauthorized') {
      throw error;
    }
    
    console.warn(`Employee API ${operation} failed, using mock data:`, error.message);
    return {
      data: {
        data: fallbackData,
        message: `Using demo data (API ${operation} failed)`
      },
      status: 200
    };
  }
};

export const employeeService = {
  getEmployees: (params = {}) => {
    return apiCallWithFallback(
      () => axiosClient.get('/employees', { params }),
      mockEmployees,
      'fetch employees'
    );
  },

  getEmployee: (id) => {
    const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
    return apiCallWithFallback(
      () => axiosClient.get(`/employees/${cleanId}`),
      mockEmployees.find(emp => emp.id === parseInt(cleanId)) || mockEmployees[0],
      'fetch employee'
    );
  },

  getDepartments: () => {
    return apiCallWithFallback(
      () => axiosClient.get('/departments'),
      mockDepartments,
      'fetch departments'
    );
  },

  // Additional methods from your existing service
  createEmployee: (employeeData) => {
    return apiCallWithFallback(
      () => axiosClient.post("/employees", employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      { success: true, message: 'Employee created successfully (demo)' },
      'create employee'
    );
  },

  updateEmployee: (id, employeeData) => {
    employeeData.append('_method', 'PUT');
    return apiCallWithFallback(
      () => axiosClient.post(`/employees/${id}`, employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      { success: true, message: 'Employee updated successfully (demo)' },
      'update employee'
    );
  },

  deleteEmployee: (id) => {
    return apiCallWithFallback(
      () => axiosClient.delete(`/employees/${id}`),
      { success: true, message: 'Employee deleted successfully (demo)' },
      'delete employee'
    );
  },

  getTrashedEmployees: (params = {}) => {
    return apiCallWithFallback(
      () => axiosClient.get('/employees/trashed', { params }),
      [],
      'fetch trashed employees'
    );
  },

  restoreEmployee: (id) => {
    return apiCallWithFallback(
      () => axiosClient.patch(`/employees/${id}/restore`),
      { success: true, message: 'Employee restored successfully (demo)' },
      'restore employee'
    );
  }
};  
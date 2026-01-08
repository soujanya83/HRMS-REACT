// services/xeroService.js
import axiosClient from '../../src/axiosClient'; // Import your existing axiosClient

export const syncEmployeeToXero = async (employeeId) => {
  try {
    const response = await axiosClient.post('/xero/sync-employee', {
      employee_id: employeeId,
    });
    
    console.log('✅ Xero Sync API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Xero Sync API Error:', error);
    
    // Provide user-friendly error messages
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      throw {
        message: errorData?.message || 'Failed to sync with Xero',
        status: error.response.status,
        data: errorData,
        details: errorData?.details || errorData,
      };
    } else if (error.request) {
      // No response received
      throw {
        message: 'No response received from server. Please check your network connection.',
        status: 0,
        details: 'Network error or server unreachable',
      };
    } else {
      // Request setup error
      throw {
        message: error.message || 'Failed to sync with Xero',
        status: -1,
        details: 'Request configuration error',
      };
    }
  }
};

// Optional: Check if Xero is connected
export const getXeroConnectionStatus = async () => {
  try {
    const response = await axiosClient.get('/xero/connection-status');
    return response.data;
  } catch (error) {
    console.error('Error checking Xero connection status:', error);
    // If endpoint doesn't exist, return default status
    if (error.response?.status === 404) {
      return {
        status: false,
        message: 'Xero connection status endpoint not available',
        connected: false,
      };
    }
    throw error;
  }
};

// Optional: Sync multiple employees at once (if your API supports it)
export const syncMultipleEmployeesToXero = async (employeeIds) => {
  try {
    const response = await axiosClient.post('/xero/sync-employees', {
      employee_ids: employeeIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing multiple employees to Xero:', error);
    throw error;
  }
};

// Optional: Get Xero employee details
export const getXeroEmployeeDetails = async (employeeId) => {
  try {
    const response = await axiosClient.get(`/xero/employee/${employeeId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error getting Xero employee details:', error);
    // If endpoint doesn't exist, return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Optional: Disconnect Xero integration for an employee
export const disconnectXeroEmployee = async (employeeId) => {
  try {
    const response = await axiosClient.delete(`/xero/employee/${employeeId}/disconnect`);
    return response.data;
  } catch (error) {
    console.error('Error disconnecting Xero employee:', error);
    throw error;
  }
};
import axiosClient from '../axiosClient';

const shiftSwapService = {
  // List all swap requests (filterable)
  getSwapRequests: async (params = {}) => {
    try {
      console.log('Fetching swap requests with params:', params);
      const response = await axiosClient.get('/shift-swap-requests', { params });
      console.log('Swap requests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching swap requests:', error);
      throw error;
    }
  },

  // Create swap request
  createSwapRequest: async (data) => {
    try {
      console.log('Creating swap request with data:', data);
      const response = await axiosClient.post('/shift-swap-requests', data);
      console.log('Create swap request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating swap request:', error);
      throw error;
    }
  },

  // View swap request detail
  getSwapRequest: async (id) => {
    try {
      console.log('Fetching swap request detail for ID:', id);
      const response = await axiosClient.get(`/shift-swap-requests/${id}`);
      console.log('Swap request detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching swap request detail:', error);
      throw error;
    }
  },

  // Update request (manager action)
  updateSwapRequest: async (id, data) => {
    try {
      console.log('Updating swap request ID:', id, 'with data:', data);
      const response = await axiosClient.put(`/shift-swap-requests/${id}`, data);
      console.log('Update swap request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating swap request:', error);
      throw error;
    }
  },

  // Approve swap request
  approveSwapRequest: async (id) => {
    try {
      console.log('Approving swap request ID:', id);
      const response = await axiosClient.patch(`/shift-swap-requests/${id}/approve`);
      console.log('Approve swap request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error approving swap request:', error);
      throw error;
    }
  },

  // Reject swap request
  rejectSwapRequest: async (id, rejectionReason = '') => {
    try {
      console.log('Rejecting swap request ID:', id, 'with reason:', rejectionReason);
      const data = rejectionReason ? { rejection_reason: rejectionReason } : {};
      const response = await axiosClient.patch(`/shift-swap-requests/${id}/reject`, data);
      console.log('Reject swap request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting swap request:', error);
      throw error;
    }
  },

  // Delete swap request
  deleteSwapRequest: async (id) => {
    try {
      console.log('Deleting swap request ID:', id);
      const response = await axiosClient.delete(`/shift-swap-requests/${id}`);
      console.log('Delete swap request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting swap request:', error);
      throw error;
    }
  },

  // Get swap requests for employee
  getEmployeeSwapRequests: async (employeeId, params = {}) => {
    try {
      console.log('Fetching swap requests for employee ID:', employeeId, 'with params:', params);
      const response = await axiosClient.get(`/shift-swap-requests/employee/${employeeId}`, { params });
      console.log('Employee swap requests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee swap requests:', error);
      throw error;
    }
  },

  // Get employees
  getEmployees: async (params = {}) => {
    try {
      console.log('Fetching employees with params:', params);
      const response = await axiosClient.get('/employees', { params });
      console.log('Employees response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get roster data
  getRosters: async (params = {}) => {
    try {
      console.log('Fetching rosters with params:', params);
      const response = await axiosClient.get('/rosters', { params });
      console.log('Rosters response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching rosters:', error);
      throw error;
    }
  },

  // Get shifts
  getShifts: async (params = {}) => {
    try {
      console.log('Fetching shifts with params:', params);
      const response = await axiosClient.get('/shifts', { params });
      console.log('Shifts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },

  // Get departments for organization
  getDepartments: async (organizationId) => {
    try {
      console.log('Fetching departments for organization ID:', organizationId);
      const response = await axiosClient.get(`/organizations/${organizationId}/departments`);
      console.log('Departments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }
};

export default shiftSwapService;
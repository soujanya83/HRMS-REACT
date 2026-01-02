// src/services/shiftSwapService.js
import axiosClient from '../axiosClient';

export const shiftSwapService = {
  // Get all shift swap requests
  getSwapRequests: async (params = {}) => {
    try {
      const response = await axiosClient.get('/shift-swap-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching swap requests:', error);
      throw error;
    }
  },

  // Get single swap request
  getSwapRequest: async (id) => {
    try {
      const response = await axiosClient.get(`/shift-swap-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching swap request:', error);
      throw error;
    }
  },

  // Create new swap request
  createSwapRequest: async (data) => {
    try {
      const response = await axiosClient.post('/shift-swap-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error creating swap request:', error);
      throw error;
    }
  },

  // Update swap request
  updateSwapRequest: async (id, data) => {
    try {
      const response = await axiosClient.put(`/shift-swap-requests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating swap request:', error);
      throw error;
    }
  },

  // Approve swap request
  approveSwapRequest: async (id) => {
    try {
      const response = await axiosClient.patch(`/shift-swap-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving swap request:', error);
      throw error;
    }
  },

  // Reject swap request
  rejectSwapRequest: async (id, data = {}) => {
    try {
      const response = await axiosClient.patch(`/shift-swap-requests/${id}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting swap request:', error);
      throw error;
    }
  },

  // Delete swap request
  deleteSwapRequest: async (id) => {
    try {
      const response = await axiosClient.delete(`/shift-swap-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting swap request:', error);
      throw error;
    }
  },

  // Get employees (assuming you have an employee endpoint)
  getEmployees: async (params = {}) => {
    try {
      const response = await axiosClient.get('/employees', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get roster data (assuming you have a roster endpoint)
  getRosters: async (params = {}) => {
    try {
      const response = await axiosClient.get('/rosters', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching rosters:', error);
      throw error;
    }
  },

  // Get shifts (assuming you have a shifts endpoint)
  getShifts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/shifts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },

  // Get departments (assuming you have a departments endpoint)
  getDepartments: async (params = {}) => {
    try {
      const response = await axiosClient.get('/departments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }
};

export default shiftSwapService;
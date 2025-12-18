import axiosClient from '../../src/axiosClient';

const shiftSchedulingService = {
  // List all shifts for organization
  getShifts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/shifts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },

  // Get single shift details
  getShift: async (id) => {
    try {
      const response = await axiosClient.get(`/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift:', error);
      throw error;
    }
  },

  // Create new shift
  createShift: async (shiftData) => {
    try {
      const response = await axiosClient.post('/shifts', shiftData);
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  },

  // Update shift
  updateShift: async (id, shiftData) => {
    try {
      const response = await axiosClient.put(`/shifts/${id}`, shiftData);
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  },

  // Delete shift
  deleteShift: async (id) => {
    try {
      const response = await axiosClient.delete(`/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  },

  // Get deleted shifts
  getDeletedShifts: async () => {
    try {
      const response = await axiosClient.get('/shifts/trashed');
      return response.data;
    } catch (error) {
      console.error('Error fetching deleted shifts:', error);
      throw error;
    }
  },

  // Restore shift
  restoreShift: async (id) => {
    try {
      const response = await axiosClient.patch(`/shifts/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring shift:', error);
      throw error;
    }
  },

  // Get calendar view
  getCalendarShifts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/shifts/calendar', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar shifts:', error);
      throw error;
    }
  }
};

export default shiftSchedulingService;
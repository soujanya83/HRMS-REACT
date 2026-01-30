import axiosClient from '../axiosClient';

const shiftSchedulingService = {
  // Get all shifts (with optional organization filter)
  getShifts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/shifts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },

  // Get single shift detail
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
  createShift: async (data) => {
    try {
      const response = await axiosClient.post('/shifts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  },

  // Update existing shift
  updateShift: async (id, data) => {
    try {
      const response = await axiosClient.put(`/shifts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  },

  // Delete (soft delete) shift
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
      // Note: This endpoint might need to be different. 
      // If your API doesn't have a specific endpoint for deleted shifts,
      // you might need to filter in the frontend or request a different endpoint
      const response = await axiosClient.get('/shifts', { 
        params: { deleted: true } // Adjust based on your API
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deleted shifts:', error);
      throw error;
    }
  },

  // Restore deleted shift
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
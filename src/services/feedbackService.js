// services/feedbackService.js
import axiosClient from '../axiosClient';

export const feedbackService = {
  // Get all feedback entries
  getAllFeedback: async (params = {}) => {
    try {
      const response = await axiosClient.get('/performance-feedback', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Get feedback for specific receiver
  getFeedbackByReceiver: async (employeeId) => {
    try {
      const response = await axiosClient.get(`/performance-feedback/receiver/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching receiver feedback:', error);
      throw error;
    }
  },

  // Get specific feedback by ID
  getFeedbackById: async (id) => {
    try {
      const response = await axiosClient.get(`/performance-feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback ${id}:`, error);
      throw error;
    }
  },

  // Create new feedback
  createFeedback: async (feedbackData) => {
    try {
      console.log('Creating feedback with data:', feedbackData);
      const response = await axiosClient.post('/performance-feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error.response?.data || error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackData) => {
    try {
      const response = await axiosClient.put(`/performance-feedback/${id}`, feedbackData);
      return response.data;
    } catch (error) {
      console.error(`Error updating feedback ${id}:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const response = await axiosClient.delete(`/performance-feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting feedback ${id}:`, error);
      throw error;
    }
  },

  // Mark feedback as read
  markAsRead: async (id) => {
    try {
      const response = await axiosClient.patch(`/performance-feedback/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking feedback ${id} as read:`, error);
      throw error;
    }
  },

  // Get employees for dropdown (assuming you have an employee service)
  getEmployees: async () => {
    try {
      // You might need to adjust this endpoint based on your actual employee API
      const response = await axiosClient.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }
};
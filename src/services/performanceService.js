// services/performanceService.js
import axiosClient from '../axiosClient';

const performanceService = {
  // Performance Review Cycles
  
  // Get all performance review cycles
  getReviewCycles: async () => {
    try {
      const response = await axiosClient.get('/performance-review-cycles');
      return response.data;
    } catch (error) {
      console.error('Error fetching review cycles:', error);
      throw error;
    }
  },

  // Get specific review cycle
  getReviewCycleById: async (id) => {
    try {
      const response = await axiosClient.get(`/performance-review-cycles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review cycle ${id}:`, error);
      throw error;
    }
  },

  // Create new review cycle
  createReviewCycle: async (cycleData) => {
    try {
      const response = await axiosClient.post('/performance-review-cycles', cycleData);
      return response.data;
    } catch (error) {
      console.error('Error creating review cycle:', error);
      throw error;
    }
  },

  // Update review cycle
  updateReviewCycle: async (id, cycleData) => {
    try {
      const response = await axiosClient.put(`/performance-review-cycles/${id}`, cycleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating review cycle ${id}:`, error);
      throw error;
    }
  },

  // Delete review cycle
  deleteReviewCycle: async (id) => {
    try {
      const response = await axiosClient.delete(`/performance-review-cycles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting review cycle ${id}:`, error);
      throw error;
    }
  },

  // Get review cycles by status
  getReviewCyclesByStatus: async (status) => {
    try {
      const response = await axiosClient.get(`/performance-review-cycles/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review cycles by status ${status}:`, error);
      throw error;
    }
  },

  // Performance Reviews
  
  // Get all performance reviews
  getPerformanceReviews: async () => {
    try {
      const response = await axiosClient.get('/performance-reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      throw error;
    }
  },

  // Get specific performance review
  getPerformanceReviewById: async (id) => {
    try {
      const response = await axiosClient.get(`/performance-reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching performance review ${id}:`, error);
      throw error;
    }
  },

  // Create new performance review
  createPerformanceReview: async (reviewData) => {
    try {
      const response = await axiosClient.post('/performance-reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw error;
    }
  },

  // Update performance review
  updatePerformanceReview: async (id, reviewData) => {
    try {
      const response = await axiosClient.put(`/performance-reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error updating performance review ${id}:`, error);
      throw error;
    }
  },

  // Delete performance review
  deletePerformanceReview: async (id) => {
    try {
      const response = await axiosClient.delete(`/performance-reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting performance review ${id}:`, error);
      throw error;
    }
  },

  // Acknowledge performance review
  acknowledgePerformanceReview: async (id) => {
    try {
      const response = await axiosClient.patch(`/performance-reviews/${id}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error(`Error acknowledging performance review ${id}:`, error);
      throw error;
    }
  },

  // Get reviews for specific employee
  getReviewsByEmployee: async (employeeId) => {
    try {
      const response = await axiosClient.get(`/performance-reviews/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Get reviews by review cycle
  getReviewsByCycle: async (cycleId) => {
    try {
      const response = await axiosClient.get(`/performance-reviews/cycle/${cycleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for cycle ${cycleId}:`, error);
      throw error;
    }
  },

  // Additional helper methods
  
  // Get employees (you might have this in another service)
  getEmployees: async () => {
    try {
      const response = await axiosClient.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get departments
  getDepartments: async () => {
    try {
      const response = await axiosClient.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get performance goals (if available)
  getPerformanceGoals: async () => {
    try {
      const response = await axiosClient.get('/performance-goals');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance goals:', error);
      throw error;
    }
  },

  // Get organization info
 // services/performanceService.js - Update getOrganization method
getOrganization: async () => {
  try {
    // Remove the API call to non-existent endpoint
    // Get from localStorage or use default
    const orgId = localStorage.getItem('current_organization_id') || 
                  localStorage.getItem('organization_id') || 
                  15;
    
    return { id: parseInt(orgId), name: `Organization ${orgId}` };
    
  } catch (error) {
    console.error('Error getting organization:', error);
    return { id: 15, name: 'Organization 15' };
  }
},
};

export default performanceService;
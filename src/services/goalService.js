// services/goalService.js
import axiosClient from '../axiosClient';
// import { extractOrganizationId } from '../utils/organizationUtils';

const goalService = {
  // Performance Goals
  
  // Get all performance goals
  getPerformanceGoals: async (params = {}) => {
    try {
      const response = await axiosClient.get('/performance-goals', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance goals:', error);
      throw error;
    }
  },

  // Get specific performance goal
  getPerformanceGoalById: async (id) => {
    try {
      const response = await axiosClient.get(`/performance-goals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching performance goal ${id}:`, error);
      throw error;
    }
  },

  // Create new performance goal
  createPerformanceGoal: async (goalData) => {
    try {
      // Validate required fields
      const requiredFields = ['title', 'employee_id', 'review_cycle_id'];
      const missingFields = requiredFields.filter(field => !goalData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      console.log('Creating goal with data:', goalData);
      const response = await axiosClient.post('/performance-goals', goalData);
      return response.data;
    } catch (error) {
      console.error('Error creating performance goal:', error);
      throw error;
    }
  },

  // Update performance goal
  updatePerformanceGoal: async (id, goalData) => {
    try {
      const response = await axiosClient.put(`/performance-goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      console.error(`Error updating performance goal ${id}:`, error);
      throw error;
    }
  },

  // Delete performance goal
  deletePerformanceGoal: async (id) => {
    try {
      const response = await axiosClient.delete(`/performance-goals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting performance goal ${id}:`, error);
      throw error;
    }
  },

  // Get goals by employee
  getGoalsByEmployee: async (employeeId, params = {}) => {
    try {
      const response = await axiosClient.get(`/performance-goals/employee/${employeeId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching goals for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Get goals by review cycle
  getGoalsByReviewCycle: async (cycleId, params = {}) => {
    try {
      const response = await axiosClient.get(`/performance-goals/cycle/${cycleId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching goals for review cycle ${cycleId}:`, error);
      throw error;
    }
  },

  // Get goals by status
  getGoalsByStatus: async (status, params = {}) => {
    try {
      const response = await axiosClient.get(`/performance-goals/status/${status}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching goals by status ${status}:`, error);
      throw error;
    }
  },

  // Key Results
  
  // Get all key results
  getKeyResults: async (params = {}) => {
    try {
      const response = await axiosClient.get('/goal-key-results', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching key results:', error);
      throw error;
    }
  },

  // Get specific key result
  getKeyResultById: async (id) => {
    try {
      const response = await axiosClient.get(`/goal-key-results/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching key result ${id}:`, error);
      throw error;
    }
  },

  // Create new key result
  createKeyResult: async (keyResultData) => {
    try {
      const response = await axiosClient.post('/goal-key-results', keyResultData);
      return response.data;
    } catch (error) {
      console.error('Error creating key result:', error);
      throw error;
    }
  },

  // Update key result
  updateKeyResult: async (id, keyResultData) => {
    try {
      const response = await axiosClient.put(`/goal-key-results/${id}`, keyResultData);
      return response.data;
    } catch (error) {
      console.error(`Error updating key result ${id}:`, error);
      throw error;
    }
  },

  // Delete key result
  deleteKeyResult: async (id) => {
    try {
      const response = await axiosClient.delete(`/goal-key-results/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting key result ${id}:`, error);
      throw error;
    }
  },

  // Bulk update key results
  bulkUpdateKeyResults: async (keyResultsData) => {
    try {
      const response = await axiosClient.patch('/goal-key-results/bulk', keyResultsData);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating key results:', error);
      throw error;
    }
  },

  // Get key results by performance goal
  getKeyResultsByGoal: async (goalId, params = {}) => {
    try {
      const response = await axiosClient.get(`/goal-key-results/goal/${goalId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching key results for goal ${goalId}:`, error);
      throw error;
    }
  },

  // Helper to extract organization ID from data
  extractOrganizationId: (data) => {
    return extractOrganizationId(data);
  },

  // Helper functions
  
  // Calculate progress percentage
  calculateProgress: (startValue, targetValue, currentValue) => {
    if (startValue === null || targetValue === null || currentValue === null) return 0;
    if (targetValue === startValue) return currentValue >= targetValue ? 100 : 0;
    
    const start = parseFloat(startValue);
    const target = parseFloat(targetValue);
    const current = parseFloat(currentValue);
    
    if (isNaN(start) || isNaN(target) || isNaN(current)) return 0;
    
    const progress = ((current - start) / (target - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  },

  // Format value based on type
  formatValue: (value, type = 'Quantitative') => {
    if (value === null || value === undefined) return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Invalid';
    
    if (type === 'Percentage') {
      return `${numValue.toFixed(1)}%`;
    }
    
    if (type === 'Currency') {
      return `₹${numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return numValue.toLocaleString('en-IN');
  },

  // Validate goal data before submission
  validateGoalData: (goalData) => {
    const errors = [];
    
    if (!goalData.title?.trim()) {
      errors.push('Title is required');
    }
    
    if (!goalData.employee_id) {
      errors.push('Employee is required');
    }
    
    if (!goalData.review_cycle_id) {
      errors.push('Review cycle is required');
    }
    
    if (!goalData.start_date) {
      errors.push('Start date is required');
    }
    
    if (!goalData.due_date) {
      errors.push('Due date is required');
    }
    
    if (goalData.start_date && goalData.due_date) {
      const startDate = new Date(goalData.start_date);
      const dueDate = new Date(goalData.due_date);
      
      if (dueDate < startDate) {
        errors.push('Due date must be after start date');
      }
    }
    
    return errors;
  }
};

export default goalService;
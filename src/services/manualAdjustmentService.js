// services/manualAdjustmentService.js
import axiosClient from '../axiosClient';

// Create service object
const manualAdjustmentService = {
  // Get attendance by employee and date - FIXED ENDPOINT
  getAttendanceByEmployeeDate: async (employeeId, date) => {
    try {
      const response = await axiosClient.get('/attendance/attendance/by-employee-date', {
        params: {
          employee_id: employeeId,
          date: date
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching attendance by employee and date:', error);
      throw error;
    }
  },

  // Create manual adjustment request
  createAdjustment: async (adjustmentData) => {
    try {
      const response = await axiosClient.post('/manual-attendance/store', adjustmentData);
      return response;
    } catch (error) {
      console.error('Error creating manual adjustment:', error);
      throw error;
    }
  },

  // Get list of adjustments for an organization
  getAdjustmentsList: async (organizationId, params = {}) => {
    try {
      const response = await axiosClient.get(`/manual-attendance/list/${organizationId}`, {
        params: params
      });
      return response;
    } catch (error) {
      console.error('Error fetching adjustments list:', error);
      throw error;
    }
  },

  // Get specific adjustment by ID
  getAdjustmentById: async (adjustmentId) => {
    try {
      const response = await axiosClient.get(`/manual-attendance/view/${adjustmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching adjustment by ID:', error);
      throw error;
    }
  },

  // Update adjustment
  updateAdjustment: async (adjustmentId, updateData) => {
    try {
      const response = await axiosClient.post(`/manual-attendance/update/${adjustmentId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating adjustment:', error);
      throw error;
    }
  },

  // Approve adjustment
  approveAdjustment: async (adjustmentId, approvedBy) => {
    try {
      const response = await axiosClient.post(`/manual-attendance/approve/${adjustmentId}`, {
        approved_by: approvedBy
      });
      return response;
    } catch (error) {
      console.error('Error approving adjustment:', error);
      throw error;
    }
  },

  // Reject adjustment
  rejectAdjustment: async (adjustmentId, rejectedBy) => {
    try {
      const response = await axiosClient.post(`/manual-attendance/reject/${adjustmentId}`, {
        rejected_by: rejectedBy
      });
      return response;
    } catch (error) {
      console.error('Error rejecting adjustment:', error);
      throw error;
    }
  },

  // Delete adjustment
  deleteAdjustment: async (adjustmentId) => {
    try {
      const response = await axiosClient.delete(`/manual-attendance/delete/${adjustmentId}`);
      return response;
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      throw error;
    }
  }
};

// Export as default
export default manualAdjustmentService;
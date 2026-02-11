// services/timesheetService.js
import axiosClient from '../axiosClient';

export const timesheetService = {
  // ✅ Available: Get pay periods for organization
  getPayPeriods: async (organizationId) => {
    try {
      const response = await axiosClient.get('/pay-periods', {
        params: { organization_id: organizationId }
      });
      console.log('📅 Pay periods API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pay periods:', error);
      throw error;
    }
  },

  // ✅ Available: Generate timesheets for date range
  generateTimesheets: async (fromDate, toDate) => {
    try {
      const response = await axiosClient.post('/timesheets/generate', {
        from: fromDate,
        to: toDate
      });
      console.log('🔄 Generate timesheets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generating timesheets:', error);
      throw error;
    }
  },

  // ✅ Available: Get all timesheets for organization
  getTimesheets: async (organizationId) => {
    try {
      const response = await axiosClient.get(`/timesheets/${organizationId}`);
      console.log('📋 Timesheets API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching timesheets:', error);
      throw error;
    }
  },

  // ✅ Available: Submit timesheets for approval
  submitTimesheets: async (timesheetIds) => {
    try {
      const response = await axiosClient.post('/timesheets/submit', {
        timesheet_ids: timesheetIds
      });
      console.log('✅ Submit timesheets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting timesheets:', error);
      throw error;
    }
  },

  // ✅ Available: Push timesheets to Xero (bulk - old endpoint)
  pushToXero: async (organizationId) => {
    try {
      const formData = new FormData();
      formData.append('organization_id', organizationId);
      
      const response = await axiosClient.post('/xero/timesheets/push', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('📤 Push to Xero (bulk) response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error pushing to Xero (bulk):', error);
      throw error;
    }
  },

  // ✅ NEW: Push single employee to Xero
  pushEmployeeToXero: async (organizationId, employeeId) => {
    try {
      console.log('📤 Pushing employee to Xero:', { organizationId, employeeId });
      
      const response = await axiosClient.post('/xero/timesheet/push-employee', {
        organization_id: organizationId,
        employee_id: employeeId
      });
      
      console.log('✅ Push single employee to Xero response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error pushing employee to Xero:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        organizationId,
        employeeId
      });
      
      // Check if it's a 500 error and provide more specific message
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error ||
                            'Server error while pushing to Xero';
        throw new Error(`Xero Push Failed: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  // ✅ NEW: Push multiple employees to Xero
  pushEmployeesToXero: async (organizationId, employeeIds) => {
    try {
      console.log('📤 Pushing multiple employees to Xero:', {
        organizationId,
        employeeCount: employeeIds.length,
        employeeIds
      });
      
      const responses = [];
      for (const employeeId of employeeIds) {
        try {
          const response = await axiosClient.post('/xero/timesheet/push-employee', {
            organization_id: organizationId,
            employee_id: employeeId
          });
          responses.push({
            employeeId,
            success: true,
            data: response.data
          });
          console.log(`✅ Successfully pushed employee ${employeeId} to Xero`);
        } catch (error) {
          responses.push({
            employeeId,
            success: false,
            error: error.response?.data || error.message
          });
          console.error(`❌ Failed to push employee ${employeeId} to Xero:`, error);
        }
      }
      console.log('📤 Push multiple employees to Xero responses:', responses);
      return responses;
    } catch (error) {
      console.error('❌ Error pushing employees to Xero:', error);
      throw error;
    }
  },

  // ✅ NEW: Approve timesheet
  approveTimesheet: async (timesheetId) => {
    try {
      const response = await axiosClient.post(`/timesheets/${timesheetId}/approve`);
      console.log('✅ Approve timesheet response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving timesheet:', error);
      throw error;
    }
  },

  // ✅ NEW: Reject timesheet
  rejectTimesheet: async (timesheetId, reason) => {
    try {
      const response = await axiosClient.post(`/timesheets/${timesheetId}/reject`, {
        reason: reason
      });
      console.log('✅ Reject timesheet response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting timesheet:', error);
      throw error;
    }
  }
};

export default timesheetService;
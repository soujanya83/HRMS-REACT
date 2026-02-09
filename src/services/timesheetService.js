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

  // ✅ Available: Push timesheets to Xero
  pushToXero: async (organizationId) => {
    try {
      const formData = new FormData();
      formData.append('organization_id', organizationId);
      
      const response = await axiosClient.post('/xero/timesheets/push', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('📤 Push to Xero response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error pushing to Xero:', error);
      throw error;
    }
  }
};
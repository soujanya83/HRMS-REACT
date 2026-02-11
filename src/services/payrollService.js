// services/payrollService.js - FINAL VERSION
import axiosClient from '../axiosClient';

const API_BASE = '/xero';

export const payrollService = {
  // Fetch Pay Periods
  fetchPayPeriods: (organizationId) => {
    return axiosClient.get('/pay-periods', {
      params: { organization_id: organizationId }
    });
  },

  // Create Pay Run - WITH COMPLETE ERROR HANDLING
  createPayRun: async (organizationId, fromDate, toDate) => {
    try {
      console.log('🎯 Creating pay run:', {
        organization_id: organizationId,
        from_date: fromDate,
        to_date: toDate
      });

      const response = await axiosClient.post(`${API_BASE}/payruns/create`, {
        organization_id: organizationId.toString(),
        from_date: fromDate,
        to_date: toDate
      });
      
      console.log('✅ Pay run created successfully');
      return response;
    } catch (error) {
      console.error('❌ CREATE PAY RUN ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        details: error.response?.data?.details
      });
      
      // Extract error message
      let errorMessage = 'Failed to create pay run';
      let errorType = 'GENERAL';
      
      if (error.response?.data?.details?.Message) {
        const xeroMessage = error.response.data.details.Message;
        errorMessage = `Xero Error: ${xeroMessage}`;
        
        if (xeroMessage.includes('one draft pay run per pay frequency')) {
          errorMessage = 'Cannot create pay run: There is already a draft pay run for this period. Please approve or void the existing draft pay run first.';
          errorType = 'DRAFT_EXISTS';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const customError = new Error(errorMessage);
      customError.type = errorType;
      customError.response = error.response;
      customError.details = error.response?.data?.details;
      throw customError;
    }
  },

  // Review Pay Run
  reviewPayRun: (organizationId, fromDate, toDate) => {
    const params = { organization_id: organizationId };
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    
    return axiosClient.get(`${API_BASE}/payruns`, { params });
  },

  // Approve Pay Run
  approvePayRun: (payRunId, organizationId) => {
    return axiosClient.post(`${API_BASE}/payruns/${payRunId}/approve`, {
      organization_id: organizationId.toString()
    });
  },

  // Sync Payslips
  syncPayslips: (organizationId, xeroPayRunId) => {
    return axiosClient.post(`${API_BASE}/payslips/sync`, {
      organization_id: organizationId.toString(),
      xero_pay_run_id: xeroPayRunId
    });
  },

  // Get Payslips by Pay Run
  getPayslipsByPayRun: (xeroPayRunId) => {
    return axiosClient.get(`${API_BASE}/payslips`, {
      params: { xero_pay_run_id: xeroPayRunId }
    });
  },

  // Get Employee Payslip History
  getEmployeePayslipHistory: (employeeId) => {
    return axiosClient.get(`${API_BASE}/payslips`, {
      params: { employee_id: employeeId }
    });
  },

  // Get Pay Run Details
  getPayRunDetails: (payRunId) => {
    return axiosClient.get(`${API_BASE}/payruns/${payRunId}`);
  }
};
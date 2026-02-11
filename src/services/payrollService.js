// services/payrollService.js - FINAL VERSION WITH ALL PAYSLIPS API
import axiosClient from '../axiosClient';

const API_BASE = '/xero';

export const payrollService = {
  // ============ PAY PERIODS ============
  fetchPayPeriods: (organizationId) => {
    return axiosClient.get('/pay-periods', {
      params: { organization_id: organizationId }
    });
  },

  // ============ PAY RUNS ============
  // Create Pay Run
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

  // Get All Pay Runs by Organization (POST)
  getAllPayRunsByOrganization: (organizationId) => {
    console.log('📡 Fetching ALL pay runs for organization:', organizationId);
    return axiosClient.post(`${API_BASE}-payruns/by-organization`, {
      organization_id: parseInt(organizationId, 10)
    });
  },

  // Review Pay Run by Date Range (GET)
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

  // Get Pay Run Details
  getPayRunDetails: (payRunId) => {
    return axiosClient.get(`${API_BASE}/payruns/${payRunId}`);
  },

  // ============ PAYSLIPS ============
  // NEW: Get All Payslips by Organization (POST)
  getAllPayslipsByOrganization: (organizationId) => {
    console.log('📡 Fetching ALL payslips for organization:', organizationId);
    return axiosClient.post(`${API_BASE}-payslips/by-organization`, {
      organization_id: parseInt(organizationId, 10)
    });
  },

  // Sync Payslips from Xero
  syncPayslips: (organizationId, xeroPayRunId) => {
    return axiosClient.post(`${API_BASE}/payslips/sync`, {
      organization_id: organizationId.toString(),
      xero_pay_run_id: xeroPayRunId
    });
  },

  // Get Payslips by Pay Run (Database ID)
  getPayslipsByPayRun: (payRunDbId) => {
    return axiosClient.get(`${API_BASE}/payslips`, {
      params: { xero_pay_run_id: payRunDbId }
    });
  },

  // Get Employee Payslip History
  getEmployeePayslipHistory: (employeeId) => {
    return axiosClient.get(`${API_BASE}/payslips`, {
      params: { employee_id: employeeId }
    });
  }
};
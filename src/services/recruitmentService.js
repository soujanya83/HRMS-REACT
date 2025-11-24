import axiosClient from "../axiosClient";

// Applicants endpoints
export const getApplicants = (params) => {
  return axiosClient.get('/recruitment/applicants', { params });
};

export const createApplicant = (formData) => {
  return axiosClient.post('/recruitment/applicants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getApplicantById = (id) => {
  return axiosClient.get(`/recruitment/applicants/${id}`);
};

// FIXED: Use POST for update with _method parameter
export const updateApplicant = (id, formData) => {
  // Since your API uses POST for updates, we need to handle this differently
  const data = new FormData();
  
  // Copy all form data
  for (let [key, value] of formData.entries()) {
    data.append(key, value);
  }
  
  // Add the method override
  data.append('_method', 'PUT');
  
  return axiosClient.post(`/recruitment/applicants/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteApplicant = (id) => {
  return axiosClient.delete(`/recruitment/applicants/${id}`);
};

// FIXED: Status update endpoint
export const updateApplicantStatus = (id, status) => {
  return axiosClient.post(`/recruitment/applicants/${id}/status`, { status });
};

export const downloadApplicantResume = (id) => {
  return axiosClient.get(`/recruitment/applicants/${id}/resume/download`, {
    responseType: 'blob',
  });
};

export const getApplicantsByJobOpening = (jobId) => {
  return axiosClient.get(`/recruitment/applicants/job-opening/${jobId}`);
};

export const getApplicantsByStatus = (status, orgId) => {
  return axiosClient.get(`/recruitment/applicants/status/${status}`, {
    params: { organization_id: orgId }
  });
};

// Job openings endpoints
export const getJobOpenings = (orgId) => {
  return axiosClient.get('/recruitment/job-openings', {
    params: { organization_id: orgId }
  });
};

export const getJobOpeningById = (id) => {
  return axiosClient.get(`/recruitment/job-openings/${id}`);
};

export const createJobOpening = (data) => {
  return axiosClient.post('/recruitment/job-openings', data);
};

export const updateJobOpening = (id, data) => {
  return axiosClient.put(`/recruitment/job-openings/${id}`, data);
};

export const deleteJobOpening = (id) => {
  return axiosClient.delete(`/recruitment/job-openings/${id}`);
};

// Departments and designations
export const getDepartmentsByOrgId = (orgId) => {
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

export const getDesignationsByDeptId = (deptId) => {
  return axiosClient.get(`/departments/${deptId}/designations`);
};


// Interview endpoints
export const getInterviews = (params) => {
  return axiosClient.get('/recruitment/interviews', { params });
};

export const getInterviewById = (id) => {
  return axiosClient.get(`/recruitment/interviews/${id}`);
};

export const createInterview = (data) => {
  return axiosClient.post('/recruitment/interviews', data);
};

export const updateInterview = (id, data) => {
  return axiosClient.put(`/recruitment/interviews/${id}`, data);
};

export const deleteInterview = (id) => {
  return axiosClient.delete(`/recruitment/interviews/${id}`);
};

export const getInterviewsByApplicant = (applicantId) => {
  return axiosClient.get(`/recruitment/interviews/applicant/${applicantId}`);
};

export const getInterviewsByStatus = (status) => {
  return axiosClient.get(`/recruitment/interviews/status/${status}`);
};

export const getInterviewsByInterviewer = (interviewerId) => {
  return axiosClient.get(`/recruitment/interviews/interviewer/${interviewerId}`);
};

export const getUpcomingInterviews = () => {
  return axiosClient.get('/recruitment/interviews/upcoming/list');
};

export const updateInterviewStatus = (id, status) => {
  return axiosClient.post(`/recruitment/interviews/${id}/status`, { status });
};

export const updateInterviewFeedback = (id, feedback) => {
  return axiosClient.post(`/recruitment/interviews/${id}/feedback`, { feedback });
};

// Get applicants for dropdown
export const getApplicantsForInterviews = (orgId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { organization_id: orgId }
  });
};

// Get employees who can be interviewers - Fallback to mock data if endpoint doesn't exist
export const getInterviewers = async (orgId) => {
  try {
    // Try to get from organizations endpoint first
    const response = await axiosClient.get(`/organizations/${orgId}/employees`);
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('Interviewers endpoint not found, using fallback data');
      // Return mock interviewers as fallback
      return {
        data: {
          data: [
            { id: 1, first_name: 'Aftab', last_name: 'Khan', email: 'aftab@example.com' },
            { id: 2, first_name: 'Rizwan', last_name: 'Dizel', email: 'rizwan@example.com' },
            { id: 3, first_name: 'Raju', last_name: 'Dizel', email: 'raju@example.com' },
            { id: 4, first_name: 'Deepak', last_name: 'Kumar', email: 'deepak@example.com' },
            { id: 5, first_name: 'Tabrej', last_name: 'Khan', email: 'tabrej@example.com' },
            { id: 6, first_name: 'Farhan', last_name: 'Ansari', email: 'farhan@example.com' }
          ]
        }
      };
    }
    throw error;
  }
};

// Alternative: Get interviewers from users endpoint if available
export const getUsersAsInterviewers = async () => {
  try {
    const response = await axiosClient.get('/users');
    return response;
  } catch (error) {
    console.log('Users endpoint not available for interviewers',error);
    return { data: { data: [] } };
  }
};
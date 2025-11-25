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

export const getApplicantById = (applicantId) => {
  return axiosClient.get(`/recruitment/applicants/${applicantId}`);
};

export const updateApplicant = (id, formData) => {
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
// Add this function to your recruitmentService.js
export const updateApplicantStatus = (applicantId, status) => {
  return axiosClient.put(`/recruitment/applicants/${applicantId}/status`, { status });
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

export const getApplicantsForInterviews = (orgId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { organization_id: orgId }
  });
};

// Get employees who can be interviewers - API only
export const getInterviewers = (orgId) => {
  return axiosClient.get(`/organizations/${orgId}/employees`);
};

// Alternative: Get interviewers from users endpoint if available
export const getUsersAsInterviewers = () => {
  return axiosClient.get('/users');
};

// Get interviewers from existing interviews data
export const getInterviewersFromInterviews = async (orgId) => {
  try {
    const response = await getInterviews({ organization_id: orgId });
    const interviews = response.data?.data || [];
    
    // Extract unique interviewers from existing interviews
    const interviewersMap = new Map();
    
    interviews.forEach(interview => {
      if (interview.interviewers && Array.isArray(interview.interviewers)) {
        interview.interviewers.forEach(interviewer => {
          if (interviewer.id && !interviewersMap.has(interviewer.id)) {
            interviewersMap.set(interviewer.id, {
              id: interviewer.id,
              name: interviewer.name || `${interviewer.first_name || ''} ${interviewer.last_name || ''}`.trim(),
              email: interviewer.email || ''
            });
          }
        });
      }
    });


    
    
    return { data: { data: Array.from(interviewersMap.values()) } };
  } catch (error) {
    console.error('Error extracting interviewers from interviews:', error);
    return { data: { data: [] } };
  }
};



// Add this to your recruitmentService.js file - Job Offer endpoints
export const getJobOffers = (params = {}) => {
  return axiosClient.get('/recruitment/job-offers', { params });
};

export const createJobOffer = (data) => {
  return axiosClient.post('/recruitment/job-offers', data);
};

export const getJobOfferById = (id) => {
  return axiosClient.get(`/recruitment/job-offers/${id}`);
};

export const updateJobOffer = (id, data) => {
  return axiosClient.patch(`/recruitment/job-offers/${id}`, data);
};

export const deleteJobOffer = (id) => {
  return axiosClient.delete(`/recruitment/job-offers/${id}`);
};

export const getJobOffersByJobOpening = (jobOpeningId) => {
  return axiosClient.get(`/recruitment/job-offers/job-opening/${jobOpeningId}`);
};

export const updateJobOfferStatus = (id, status) => {
  return axiosClient.post(`/recruitment/job-offers/${id}/status`, { status });
};

export const downloadOfferLetter = (id) => {
  return axiosClient.get(`/recruitment/job-offers/${id}/offer-letter/download`, {
    responseType: 'blob'
  });
};

export const getFinalCandidates = (jobOpeningId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      status: 'final_round_completed'
    }
  });
};

export const getApplicantsForJob = (jobOpeningId, params = {}) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      ...params
    }
  });
};

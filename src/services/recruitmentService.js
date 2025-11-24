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
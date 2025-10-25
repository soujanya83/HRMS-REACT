import axiosClient from "../axiosClient";

 export const getJobOpenings = (orgId) => {
    return axiosClient.get(`/recruitment/job-openings`, {
        params: { organization_id: orgId }
    });
};
export const getJobOpeningById = (id) => axiosClient.get(`/recruitment/job-openings/${id}`);
export const createJobOpening = (data) => axiosClient.post('/recruitment/job-openings', data);
export const updateJobOpening = (id, data) => axiosClient.put(`/recruitment/job-openings/${id}`, data);
export const deleteJobOpening = (id) => axiosClient.delete(`/recruitment/job-openings/${id}`);


 export const getApplicants = (params) => axiosClient.get('/recruitment/applicants', { params });

 export const createApplicant = (formData) => {
    return axiosClient.post('/recruitment/applicants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

 export const updateApplicant = (id, formData) => {
    formData.append('_method', 'PUT');
    return axiosClient.post(`/recruitment/applicants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const deleteApplicant = (id) => axiosClient.delete(`/recruitment/applicants/${id}`);
export const updateApplicantStatus = (id, status) => axiosClient.patch(`/recruitment/applicants/${id}/status`, { status });
export const downloadApplicantResume = (id) => {
    return axiosClient.get(`/recruitment/applicants/${id}/resume/download`, {
        responseType: 'blob', 
    });
};
export const getApplicantsByJobOpening = (jobId) => axiosClient.get(`/recruitment/applicants/job-opening/${jobId}`);
export const getApplicantsByStatus = (status, orgId) => {
    return axiosClient.get(`/recruitment/applicants/status/${status}`, { 
        params: { organization_id: orgId } 
    });
};


 export const getDepartmentsByOrgId = (orgId) => {
    return axiosClient.get(`/organizations/${orgId}/departments`);
};
export const getDesignationsByDeptId = (deptId) => {
    return axiosClient.get(`/departments/${deptId}/designations`);
};


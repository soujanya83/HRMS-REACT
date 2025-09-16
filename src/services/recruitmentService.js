import axiosClient from "../axiosClient";

 
export const getJobOpenings = (orgId) => {
    return axiosClient.get(`/recruitment/job-openings`, {
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

 
export const getApplicants = (params) => { 
    return axiosClient.get(`/recruitment/applicants`, { params });
};
 
export const getApplicantById = (id) => {
    return axiosClient.get(`/recruitment/applicants/${id}`);
};

 export const createApplicant = (data) => {
    return axiosClient.post('/recruitment/applicants', data);
};

 export const updateApplicant = (id, data) => {
    return axiosClient.put(`/recruitment/applicants/${id}`, data);
};

 export const deleteApplicant = (id) => {
    return axiosClient.delete(`/recruitment/applicants/${id}`);
};

export const getApplicantsByJobOpening = (jobOpeningId) => {
    return axiosClient.get(`/recruitment/applicants/job-opening/${jobOpeningId}`);
};

export const getApplicantsByStatus = (status, orgId) => {
    return axiosClient.get(`/recruitment/applicants/status/${status}`, { 
        params: { organization_id: orgId } 
    });
};

export const updateApplicantStatus = (id, status) => {
    return axiosClient.patch(`/recruitment/applicants/${id}/status`, { status });
};


export const downloadApplicantResume = (id) => {
    return axiosClient.get(`/recruitment/applicants/${id}/resume/download`, {
        responseType: 'blob',
    });
};

export const getDepartmentsByOrgId = (orgId) => {
    return axiosClient.get(`/organizations/${orgId}/departments`);
};

export const getDesignationsByDeptId = (deptId) => {
    return axiosClient.get(`/departments/${deptId}/designations`);
};

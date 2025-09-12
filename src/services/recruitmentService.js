import axiosClient from "../axiosClient";


export const getJobOpenings = (orgId, status) => {
    let url = `/recruitment/job-openings`;
    const params = { organization_id: orgId };

    if (status && status.toLowerCase() === 'active') {
        url = `/recruitment/job-openings/active/list`;
    } else if (status && status.toLowerCase() !== 'all') {
        url = `/recruitment/job-openings/status/${status.toLowerCase()}`;
    }
    return axiosClient.get(url, { params });
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



export const getDepartmentsByOrgId = (orgId) => {
    return axiosClient.get(`/organizations/${orgId}/departments`);
};

export const getDesignationsByDeptId = (deptId) => {
    return axiosClient.get(`/departments/${deptId}/designations`);
};
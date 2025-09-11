import axiosClient from "../axiosClient";

// --- Job Opening APIs ---

// GET all job openings for a specific organization, with optional filtering
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

// GET a single job opening by its ID
export const getJobOpeningById = (id) => {
    return axiosClient.get(`/recruitment/job-openings/${id}`);
};

// POST (create) a new job opening
export const createJobOpening = (data) => {
    return axiosClient.post('/recruitment/job-openings', data);
};

// PUT (update) an existing job opening
export const updateJobOpening = (id, data) => {
    return axiosClient.put(`/recruitment/job-openings/${id}`, data);
};

// DELETE a job opening
export const deleteJobOpening = (id) => {
    return axiosClient.delete(`/recruitment/job-openings/${id}`);
};


// --- Helper APIs for Form Dropdowns ---

// GET all departments for a specific organization
export const getDepartmentsByOrgId = (orgId) => {
    return axiosClient.get(`/organizations/${orgId}/departments`);
};

// GET all designations for a specific department
export const getDesignationsByDeptId = (deptId) => {
    return axiosClient.get(`/departments/${deptId}/designations`);
};
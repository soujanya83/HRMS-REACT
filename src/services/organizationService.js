import axiosClient from "../axiosClient"; 


export const getOrganizations = () => axiosClient.get("/organizations");
export const getOrganizationById = (id) => axiosClient.get(`/organizations/${id}`);
export const createOrganization = (data) => axiosClient.post("/organizations", data);
export const updateOrganization = (id, data) => axiosClient.put(`/organizations/${id}`, data);
export const deleteOrganization = (id) => axiosClient.delete(`/organizations/${id}`);


export const getDepartmentsByOrgId = (orgId) => axiosClient.get(`/organizations/${orgId}/departments`);
export const createDepartment = (orgId, data) => axiosClient.post(`/organizations/${orgId}/departments`, data);
export const updateDepartment = (deptId, data) => axiosClient.put(`/departments/${deptId}`, data);
export const deleteDepartment = (deptId) => axiosClient.delete(`/departments/${deptId}`);


export const getDesignationsByDeptId = (deptId) => axiosClient.get(`/departments/${deptId}/designations`);
export const createDesignation = (deptId, data) => axiosClient.post(`/departments/${deptId}/designations`, data);
export const updateDesignation = (desigId, data) => axiosClient.put(`/designations/${desigId}`, data);
export const deleteDesignation = (desigId) => axiosClient.delete(`/designations/${desigId}`);
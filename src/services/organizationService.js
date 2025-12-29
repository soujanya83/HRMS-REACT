// src/services/organizationService.js
import axiosClient from "../axiosClient";

// Helper function to extract data from your API's nested structure
const extractData = (response) => {
  console.log('Service Response:', {
    url: response.config.url,
    status: response.status,
    fullData: response.data
  });

  // Handle your API's structure: {success: true, data: {data: [...], pagination...}}
  if (response.data && response.data.success === true) {
    return response.data; // Return {success, data, message}
  }
  
  // Fallback for error cases or different structure
  return response.data || {};
};

// In organizationService.js - Updated getOrganizations function
export const getOrganizations = () => {
  return axiosClient.get("/organizations")
    .then(response => {
      console.log('✅ GET organizations response:', response.data);
      // Return the full successful response, just like POST
      return response.data; // This should be {success: true, data: {...}, message: '...'}
    })
    .catch(error => {
      console.error('❌ GET organizations error:', error);
      throw error;
    });
};

export const getOrganizationById = (id) => 
  axiosClient.get(`/organizations/${id}`)
    .then(extractData);

export const createOrganization = (data) => 
  axiosClient.post("/organizations", data)
    .then(extractData);

export const updateOrganization = (id, data) => 
  axiosClient.put(`/organizations/${id}`, data)
    .then(extractData);

export const deleteOrganization = (id) => 
  axiosClient.delete(`/organizations/${id}`)
    .then(extractData);

// Departments
export const getDepartmentsByOrgId = (orgId) => 
  axiosClient.get(`/organizations/${orgId}/departments`)
    .then(extractData);

export const createDepartment = (orgId, data) => 
  axiosClient.post(`/organizations/${orgId}/departments`, data)
    .then(extractData);

export const updateDepartment = (deptId, data) => 
  axiosClient.put(`/departments/${deptId}`, data)
    .then(extractData);

export const deleteDepartment = (deptId) => 
  axiosClient.delete(`/departments/${deptId}`)
    .then(extractData);

// Designations
export const getDesignationsByDeptId = (deptId) => 
  axiosClient.get(`/departments/${deptId}/designations`)
    .then(extractData);

export const createDesignation = (deptId, data) => 
  axiosClient.post(`/departments/${deptId}/designations`, data)
    .then(extractData);

export const updateDesignation = (desigId, data) => 
  axiosClient.put(`/designations/${desigId}`, data)
    .then(extractData);

export const deleteDesignation = (desigId) => 
  axiosClient.delete(`/designations/${desigId}`)
    .then(extractData);
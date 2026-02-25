// src/services/organizationService.js
import axiosClient from "../axiosClient";

// Helper function to extract data from your API's nested structure
const extractData = (response) => {
  console.log('Service Response:', {
    url: response.config.url,
    status: response.status,
    fullData: response.data
  });

  if (response.data && response.data.success === true) {
    return response.data;
  }
  
  return response.data || {};
};

// ============ Organization APIs ============

export const getOrganizations = () => {
  return axiosClient.get("/organizations")
    .then(response => {
      console.log('✅ GET organizations response:', response.data);
      return response.data;
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

// ============ Department/Room APIs ============

export const getDepartmentsByOrgId = (orgId) => 
  axiosClient.get(`/organizations/${orgId}/departments`)
    .then(extractData);

export const getDepartment = (id) => 
  axiosClient.get(`/departments/${id}`)
    .then(extractData);

export const createDepartment = (orgId, data) => {
  // Map our data to match API expectations
  const apiData = {
    name: data.name,
    description: data.description || '',
  };
  return axiosClient.post(`/organizations/${orgId}/departments`, apiData)
    .then(extractData);
};

export const updateDepartment = (deptId, data) => {
  // Map our data to match API expectations
  const apiData = {
    name: data.name,
    description: data.description || '',
  };
  return axiosClient.put(`/departments/${deptId}`, apiData)
    .then(extractData);
};

export const deleteDepartment = (deptId) => 
  axiosClient.delete(`/departments/${deptId}`)
    .then(extractData);

// ============ Designation APIs ============

// Get all designations for an organization
export const getDesignationsByOrgId = (orgId) => 
  axiosClient.get(`/organizations/${orgId}/designations`)
    .then(extractData);

// Create a new designation for an organization
export const createDesignation = (orgId, data) => 
  axiosClient.post(`/organizations/${orgId}/designations`, data)
    .then(extractData);

// Update a designation
export const updateDesignation = (desigId, data) => 
  axiosClient.put(`/designations/${desigId}`, data)
    .then(extractData);

// Delete a designation
export const deleteDesignation = (desigId) => 
  axiosClient.delete(`/designations/${desigId}`)
    .then(extractData);

// ============ ADD THIS: Get designations by department ID (for backward compatibility) ============
// This function will first get the organization ID from the department, then fetch designations
export const getDesignationsByDeptId = async (deptId) => {
  console.log(`🔍 Fetching designations for department ${deptId}...`);
  
  try {
    // First, get the department details to find its organization_id
    const deptResponse = await getDepartment(deptId);
    
    if (deptResponse && deptResponse.success === true && deptResponse.data) {
      const orgId = deptResponse.data.organization_id;
      
      // Then get all designations for that organization
      const desigResponse = await getDesignationsByOrgId(orgId);
      
      console.log(`✅ Found designations for department ${deptId} via organization ${orgId}:`, desigResponse);
      return desigResponse;
    } else {
      console.warn(`⚠️ Could not find organization for department ${deptId}`);
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error(`❌ Error fetching designations for department ${deptId}:`, error);
    // Return empty array on error to prevent breaking the UI
    return { success: true, data: [] };
  }
};
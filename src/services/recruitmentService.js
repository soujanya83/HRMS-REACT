// services/recruitmentService.js
import axiosClient from "../axiosClient";

/**
 * Fetch job openings for a specific organization.
 * @param {number|string} orgId - Organization ID
 * @param {string} [status] - Optional status filter (e.g., 'active', 'open', 'closed', 'all')
 */
export const getJobOpenings = (orgId, status = "all") => {
  if (!orgId) throw new Error("Organization ID is required");

  let url = `/recruitment/job-openings`;
  const params = { organization_id: orgId };

  if (status && status.toLowerCase() === "active") {
    url = `/recruitment/job-openings/active/list`;
  } else if (status && status.toLowerCase() !== "all") {
    url = `/recruitment/job-openings/status/${status.toLowerCase()}`;
  }

  return axiosClient.get(url, { params });
};

/**
 * Fetch a single job opening by ID
 * @param {number|string} id - Job opening ID
 */
export const getJobOpeningById = (id) => {
  if (!id) throw new Error("Job opening ID is required");
  return axiosClient.get(`/recruitment/job-openings/${id}`);
};

/**
 * Create a new job opening
 * @param {Object} data - Job opening payload
 */
export const createJobOpening = (data) => {
  if (!data || !data.organization_id) {
    throw new Error("Job opening data with organization_id is required");
  }
  return axiosClient.post("/recruitment/job-openings", data);
};

/**
 * Update an existing job opening
 * @param {number|string} id - Job opening ID
 * @param {Object} data - Updated job data
 */
export const updateJobOpening = (id, data) => {
  if (!id) throw new Error("Job opening ID is required");
  return axiosClient.put(`/recruitment/job-openings/${id}`, data);
};

/**
 * Delete a job opening by ID
 * @param {number|string} id - Job opening ID
 */
export const deleteJobOpening = (id) => {
  if (!id) throw new Error("Job opening ID is required");
  return axiosClient.delete(`/recruitment/job-openings/${id}`);
};

/**
 * Fetch departments for a given organization
 * @param {number|string} orgId - Organization ID
 */
export const getDepartmentsByOrgId = (orgId) => {
  if (!orgId) throw new Error("Organization ID is required");
  return axiosClient.get(`/organizations/${orgId}/departments`);
};

/**
 * Fetch designations for a given department
 * @param {number|string} deptId - Department ID
 */
export const getDesignationsByDeptId = (deptId) => {
  if (!deptId) throw new Error("Department ID is required");
  return axiosClient.get(`/departments/${deptId}/designations`);
};

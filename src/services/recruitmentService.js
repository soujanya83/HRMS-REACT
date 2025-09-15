import axiosClient from "../axiosClient";

// THE FIX: This function now simply gets all jobs. We will filter them on the front-end.
export const getJobOpenings = () => {
  return axiosClient.get("/recruitment/job-openings");
};

// --- Other functions for CRUD operations ---
export const getJobOpeningById = (id) =>
  axiosClient.get(`/recruitment/job-openings/${id}`);
export const createJobOpening = (data) =>
  axiosClient.post("/recruitment/job-openings", data);
export const updateJobOpening = (id, data) =>
  axiosClient.put(`/recruitment/job-openings/${id}`, data);
export const deleteJobOpening = (id) =>
  axiosClient.delete(`/recruitment/job-openings/${id}`);

// Helper functions for form dropdowns
export const getDepartmentsByOrgId = (orgId) =>
  axiosClient.get(`/organizations/${orgId}/departments`);
export const getDesignationsByDeptId = (deptId) =>
  axiosClient.get(`/departments/${deptId}/designations`);

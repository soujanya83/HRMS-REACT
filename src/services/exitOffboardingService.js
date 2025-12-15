// src/services/exitOffboardingService.js
import axiosClient from "../axiosClient";

// --- Employee Exits API ---
export const getEmployeeExits = (params = {}) => {
  return axiosClient.get("/employee-exits", { params });
};

export const getEmployeeExitById = (id) => {
  return axiosClient.get(`/employee-exits/${id}`);
};

export const createEmployeeExit = (exitData) => {
  return axiosClient.post("/employee-exits", exitData);
};

export const updateEmployeeExit = (id, exitData) => {
  return axiosClient.put(`/employee-exits/${id}`, exitData);
};

export const deleteEmployeeExit = (id) => {
  return axiosClient.delete(`/employee-exits/${id}`);
};

export const getEmployeeExitsByEmployee = (employeeId) => {
  return axiosClient.get(`/employee-exits/by-employee/${employeeId}`);
};

// --- Offboarding Tasks API ---
export const getOffboardingTasks = (params = {}) => {
  return axiosClient.get("/offboarding-tasks", { params });
};

export const getOffboardingTaskById = (id) => {
  return axiosClient.get(`/offboarding-tasks/${id}`);
};

export const createOffboardingTask = (taskData) => {
  return axiosClient.post("/offboarding-tasks", taskData);
};

export const updateOffboardingTask = (id, taskData) => {
  return axiosClient.put(`/offboarding-tasks/${id}`, taskData);
};

export const deleteOffboardingTask = (id) => {
  return axiosClient.delete(`/offboarding-tasks/${id}`);
};

export const completeOffboardingTask = (id) => {
  return axiosClient.patch(`/offboarding-tasks/${id}/complete`);
};

export const getOverdueTasks = () => {
  return axiosClient.get("/offboarding-tasks/overdue/list");
};

// --- Offboarding Templates API ---
export const getOffboardingTemplates = (params = {}) => {
  return axiosClient.get("/offboarding-templates", { params });
};

export const getOffboardingTemplateById = (id) => {
  return axiosClient.get(`/offboarding-templates/${id}`);
};

export const createOffboardingTemplate = (templateData) => {
  return axiosClient.post("/offboarding-templates", templateData);
};

export const updateOffboardingTemplate = (id, templateData) => {
  return axiosClient.put(`/offboarding-templates/${id}`, templateData);
};

export const deleteOffboardingTemplate = (id) => {
  return axiosClient.delete(`/offboarding-templates/${id}`);
};

export const cloneOffboardingTemplate = (id) => {
  return axiosClient.post(`/offboarding-templates/${id}/clone`);
};

// --- Offboarding Template Tasks API ---
export const getOffboardingTemplateTasks = (params = {}) => {
  return axiosClient.get("/offboarding-template-tasks", { params });
};

export const getOffboardingTemplateTaskById = (id) => {
  return axiosClient.get(`/offboarding-template-tasks/${id}`);
};

export const createOffboardingTemplateTask = (taskData) => {
  return axiosClient.post("/offboarding-template-tasks", taskData);
};

export const updateOffboardingTemplateTask = (id, taskData) => {
  return axiosClient.put(`/offboarding-template-tasks/${id}`, taskData);
};

export const deleteOffboardingTemplateTask = (id) => {
  return axiosClient.delete(`/offboarding-template-tasks/${id}`);
};

export const getTemplateTasksByTemplate = (templateId) => {
  return axiosClient.get(`/offboarding-template-tasks/template/${templateId}`);
};
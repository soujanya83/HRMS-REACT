import axiosClient from '../axiosClient';


export const getOnboardingTasks = (params = {}) => {
  return axiosClient.get('/recruitment/onboarding-tasks', { params });
};

export const createOnboardingTask = (data) => {
  return axiosClient.post('/recruitment/onboarding-tasks', data);
};

export const getOnboardingTaskById = (id) => {
  return axiosClient.get(`/recruitment/onboarding-tasks/${id}`);
};

export const updateOnboardingTask = (id, data) => {
  return axiosClient.put(`/recruitment/onboarding-tasks/${id}`, data);
};

export const deleteOnboardingTask = (id) => {
  return axiosClient.delete(`/recruitment/onboarding-tasks/${id}`);
};

export const getOnboardingTasksByApplicant = (applicantId) => {
  return axiosClient.get(`/recruitment/onboarding-tasks/applicant/${applicantId}`);
};

export const getOnboardingTasksByStatus = (status) => {
  return axiosClient.get(`/recruitment/onboarding-tasks/status/${status}`);
};

export const completeOnboardingTask = (id) => {
  return axiosClient.patch(`/recruitment/onboarding-tasks/${id}/complete`);
};

export const getOverdueOnboardingTasks = () => {
  return axiosClient.get('/recruitment/onboarding-tasks/overdue/list');
};

export const getUpcomingOnboardingTasks = () => {
  return axiosClient.get('/recruitment/onboarding-tasks/upcoming/list');
};

export const getOnboardingTemplates = (params = {}) => {
  return axiosClient.get('/recruitment/onboarding-templates', { params });
};

export const createOnboardingTemplate = (data) => {
  return axiosClient.post('/recruitment/onboarding-templates', data);
};

export const getOnboardingTemplateById = (id) => {
  return axiosClient.get(`/recruitment/onboarding-templates/${id}`);
};

export const updateOnboardingTemplate = (id, data) => {
  return axiosClient.put(`/recruitment/onboarding-templates/${id}`, data);
};

export const deleteOnboardingTemplate = (id) => {
  return axiosClient.delete(`/recruitment/onboarding-templates/${id}`);
};

export const getOnboardingTemplatesByOrganization = (organizationId) => {
  return axiosClient.get(`/recruitment/onboarding-templates/organization/${organizationId}`);
};

export const cloneOnboardingTemplate = (id) => {
  return axiosClient.post(`/recruitment/onboarding-templates/${id}/clone`);
};

// Onboarding Template Tasks API
export const getOnboardingTemplateTasks = (params = {}) => {
  return axiosClient.get('/recruitment/onboarding-template-tasks', { params });
};

export const createOnboardingTemplateTask = (data) => {
  return axiosClient.post('/recruitment/onboarding-template-tasks', data);
};

export const getOnboardingTemplateTaskById = (id) => {
  return axiosClient.get(`/recruitment/onboarding-template-tasks/${id}`);
};

export const updateOnboardingTemplateTask = (id, data) => {
  return axiosClient.patch(`/recruitment/onboarding-template-tasks/${id}`, data);
};

export const deleteOnboardingTemplateTask = (id) => {
  return axiosClient.delete(`/recruitment/onboarding-template-tasks/${id}`);
};

export const getOnboardingTemplateTasksByTemplate = (templateId) => {
  return axiosClient.get(`/recruitment/onboarding-template-tasks/template/${templateId}`);
};

export const getOnboardingTemplateTasksByRole = (role) => {
  return axiosClient.get(`/recruitment/onboarding-template-tasks/role/${role}`);
};

export const bulkCreateOnboardingTemplateTasks = (data) => {
  return axiosClient.post('/recruitment/onboarding-template-tasks/bulk-create', data);
};

// Onboarding Automation API
export const generateOnboardingTasks = (data) => {
  return axiosClient.post('/recruitment/onboarding-automation/generate-tasks', data);
};

export const autoGenerateNewHires = (data) => {
  return axiosClient.post('/recruitment/onboarding-automation/auto-generate-new-hires', data);
};

export const getOnboardingDashboard = () => {
  return axiosClient.get('/recruitment/onboarding-automation/dashboard');
};

// Utility functions
export const getHiredApplicants = (organizationId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: {
      organization_id: organizationId,
      status: 'Hired'
    }
  });
};

// Generate tasks from template for a specific applicant
export const generateTasksFromTemplate = (applicantId, templateId) => {
  return axiosClient.post('/recruitment/onboarding-automation/generate-tasks', {
    applicant_id: applicantId,
    template_id: templateId
  });
};
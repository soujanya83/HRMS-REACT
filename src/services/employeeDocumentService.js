import axiosClient from "../axiosClient";

// --- Employee Documents CRUD Operations ---

// Get all employee documents
export const getEmployeeDocuments = (params = {}) => {
  return axiosClient.get("/employee-documents", { params });
};

// Get specific employee document
export const getEmployeeDocument = (documentId) => {
  return axiosClient.get(`/employee-documents/${documentId}`);
};

// Create new employee document - RENAMED to avoid conflict
export const createEmployeeDocument = (formData) => {
  // FormData should already contain employee_id
  return axiosClient.post("/employee-documents", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update employee document
export const updateEmployeeDocument = (documentId, documentData) => {
  documentData.append('_method', 'PUT');
  return axiosClient.post(`/employee-documents/${documentId}`, documentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete employee document
export const deleteEmployeeDocument = (documentId) => {
  return axiosClient.delete(`/employee-documents/${documentId}`);
};

// Get documents by employee ID
export const getDocumentsByEmployee = (employeeId, params = {}) => {
  return axiosClient.get(`/employee-documents/by-employee/${employeeId}`, { params });
};
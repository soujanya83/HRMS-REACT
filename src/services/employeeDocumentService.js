// employeeDocumentService.js
import axiosClient from "../axiosClient";

// Get all employee documents
export const getEmployeeDocuments = (params = {}) => {
  return axiosClient.get("/employee-documents", { params });
};

// Get specific employee document
export const getEmployeeDocument = (documentId) => {
  return axiosClient.get(`/employee-documents/${documentId}`);
};

// Create new employee document
export const createEmployeeDocument = (employeeId, formData) => {
  return axiosClient.post(`/employees/${employeeId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update employee document
export const updateEmployeeDocument = (documentId, formData) => {
  return axiosClient.post(`/employee-documents/${documentId}`, formData, {
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
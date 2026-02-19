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
  console.log('🔵 createEmployeeDocument - URL:', `/employees/${employeeId}/documents`);
  
  // Double-check FormData before sending
  console.log('🔵 FormData before send:');
  for (let pair of formData.entries()) {
    console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `FILE: ${pair[1].name}` : `"${pair[1]}"`);
  }
  
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
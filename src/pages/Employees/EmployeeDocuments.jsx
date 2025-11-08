import React, { useState, useEffect } from 'react';
import { getDocumentsByEmployee, createEmployeeDocument, deleteEmployeeDocument } from '../../services/employeeDocumentService'; // CHANGED: uploadEmployeeDocument → createEmployeeDocument
import { FaUpload, FaFile, FaTrash, FaDownload, FaPlus } from 'react-icons/fa';

const EmployeeDocuments = ({ employeeId, employeeName }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await getDocumentsByEmployee(employeeId);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('employee_id', employeeId);
    formData.append('document_name', file.name);
    formData.append('document_type', file.type);
    
    setUploading(true);
    try {
      await createEmployeeDocument(formData); // CHANGED: uploadEmployeeDocument → createEmployeeDocument
      await fetchDocuments(); // Refresh the list
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteEmployeeDocument(documentId);
      await fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Employee Documents
          {employeeName && (
            <span className="text-sm text-gray-600 ml-2">- {employeeName}</span>
          )}
        </h3>
        
        <div className="relative">
          <input
            type="file"
            id="document-upload"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="document-upload"
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="text-sm" />
                Upload Document
              </>
            )}
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaFile className="text-4xl mx-auto mb-4 text-gray-300" />
          <p>No documents found for this employee.</p>
          <p className="text-sm">Upload a document to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FaFile className="text-blue-500 text-xl" />
                <div>
                  <h4 className="font-medium text-gray-800">{document.document_name}</h4>
                  <p className="text-sm text-gray-500">
                    {document.document_type} • 
                    {document.file_size && ` ${document.file_size} •`}
                    {document.created_at && ` Uploaded on ${new Date(document.created_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {document.file_url && (
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                    title="Download"
                  >
                    <FaDownload />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
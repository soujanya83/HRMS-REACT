import React, { useState, useEffect } from 'react';
import { 
  getDocumentsByEmployee, 
  createEmployeeDocument, 
  updateEmployeeDocument,
  deleteEmployeeDocument 
} from '../../services/employeeDocumentService';
import { 
  FaUpload, FaFile, FaTrash, FaDownload, FaPlus, FaEdit, 
  FaTimes, FaCheck, FaSpinner, FaInfoCircle, FaExclamationTriangle,
  FaCalendar, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord
} from 'react-icons/fa';

// Document Type Options
const DOCUMENT_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Visa',
  'Work Permit',
  'Employment Contract',
  'Offer Letter',
  'Experience Letter',
  'Salary Slip',
  'Bank Statement',
  'Tax Document',
  'Education Certificate',
  'Professional Certificate',
  'Other'
];

// File Type Icon Component
const FileIcon = ({ fileName }) => {
  if (!fileName) return <FaFile className="text-blue-500 text-2xl" />;
  
  const ext = fileName.split('.').pop().toLowerCase();
  const className = "text-2xl";
  
  if (['pdf'].includes(ext)) return <FaFilePdf className={`${className} text-red-500`} />;
  if (['doc', 'docx'].includes(ext)) return <FaFileWord className={`${className} text-blue-500`} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className={`${className} text-green-500`} />;
  return <FaFileAlt className={`${className} text-gray-500`} />;
};

// Document Upload Modal
const DocumentUploadModal = ({ isOpen, onClose, onSubmit, isEdit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    document_type: initialData.document_type || '',
    issue_date: initialData.issue_date || '',
    expiry_date: initialData.expiry_date || '',
    file: null,
    file_name: initialData.file_name || '',
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: initialData.document_type || '',
        issue_date: initialData.issue_date || '',
        expiry_date: initialData.expiry_date || '',
        file: null,
        file_name: initialData.file_name || '',
      });
      setErrors({});
      setDebugInfo(null);
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        file_name: file.name, // Set file_name from file name
        // Auto-suggest document type from filename
        document_type: prev.document_type || 
          file.name
            .split('.')[0]
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrors({});
    setDebugInfo(null);

    // Validate expiry date
    if (formData.issue_date && formData.expiry_date) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(formData.expiry_date);
      if (expiryDate < issueDate) {
        setErrors({
          expiry_date: ['Expiry date must be after or equal to issue date']
        });
        setUploading(false);
        return;
      }
    }

    try {
      const data = new FormData();
      
      // Required fields
      data.append('document_type', formData.document_type);
      
      // File fields (required for new uploads)
      if (!isEdit) {
        if (!formData.file) {
          throw new Error('Please select a file to upload');
        }
        data.append('file', formData.file); // File upload field
        data.append('file_name', formData.file_name || formData.file.name); // Separate file name field
      } else {
        // For edits, only append file if changed
        if (formData.file) {
          data.append('file', formData.file);
          data.append('file_name', formData.file_name || formData.file.name);
        }
      }
      
      // Optional date fields
      if (formData.issue_date) {
        data.append('issue_date', formData.issue_date);
      }
      
      if (formData.expiry_date) {
        data.append('expiry_date', formData.expiry_date);
      }

      // Log FormData for debugging
      console.log('FormData contents before upload:');
      for (let pair of data.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      await onSubmit(data, isEdit);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
        setDebugInfo({
          status: error.response.status,
          errors: validationErrors,
          data: error.response.data,
          formData: Object.fromEntries(data ? data.entries() : [])
        });
      } else {
        alert(error.response?.data?.message || error.message || 'Failed to upload document');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? 'Edit Document' : 'Upload New Document'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? 'Update document details' : 'Add a new document for this employee'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={uploading}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.document_type ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="">Select Document Type</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.document_type && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <FaExclamationTriangle /> {errors.document_type[0]}
                  </p>
                </div>
              )}
            </div>

            {/* File Name (if editing) */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="file_name"
                  value={formData.file_name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.file_name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter file name"
                />
                {errors.file_name && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <FaExclamationTriangle /> {errors.file_name[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.expiry_date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                </div>
                {errors.expiry_date && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <FaExclamationTriangle /> {errors.expiry_date[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload - For new uploads */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File <span className="text-red-500">*</span>
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                  errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="space-y-3 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 items-center justify-center gap-1">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span className="px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          Choose a file
                        </span>
                        <input
                          id="file-upload"
                          name="file"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          required={!isEdit}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-gray-500">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supports: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </p>
                    {formData.file && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-700 flex items-center justify-center gap-2">
                          <FaCheck /> Selected file: {formData.file.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Size: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.file && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <FaExclamationTriangle /> {errors.file[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Debug Info - Show only in development */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <FaInfoCircle /> Debug Information
                </h4>
                <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || (!isEdit && !formData.file)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {isEdit ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                <>
                  {isEdit ? <FaEdit /> : <FaUpload />}
                  {isEdit ? 'Update Document' : 'Upload Document'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const EmployeeDocuments = ({ employeeId, employeeName }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const fetchDocuments = async () => {
    if (!employeeId) {
      setLoading(false);
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching documents for employee ID: ${employeeId}`);
      const response = await getDocumentsByEmployee(employeeId);
      console.log('API Response:', response);
      
      // Handle both response formats
      const documentsData = response.data?.data || response.data || [];
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
      setUploadError(null);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setUploadError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (formData, isEdit = false) => {
    try {
      console.log('Submitting document with FormData:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      // Always append employee_id
      formData.append('employee_id', employeeId);

      if (isEdit && editingDocument) {
        await updateEmployeeDocument(editingDocument.id, formData);
      } else {
        await createEmployeeDocument(formData);
      }
      
      // Refresh documents
      setRefreshTrigger(prev => prev + 1);
      setShowUploadModal(false);
      setEditingDocument(null);
      setUploadError(null);
      
    } catch (error) {
      console.error('Error in document operation:', error);
      setUploadError(error.response?.data?.message || error.message || 'Upload failed');
      // Re-throw to be handled by modal
      throw error;
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setShowUploadModal(true);
  };

  const handleDelete = (documentId) => {
    setDocumentToDelete(documentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployeeDocument(documentToDelete);
      // Refresh documents
      setRefreshTrigger(prev => prev + 1);
      setUploadError(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setUploadError('Failed to delete document');
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getDocumentStatus = (issueDate, expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const issue = issueDate ? new Date(issueDate) : null;
    
    // Check if expiry is before issue date
    if (issue && expiry < issue) {
      return { text: 'Invalid Dates', color: 'bg-red-100 text-red-800', icon: '⚠️' };
    }
    
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800', icon: '❌' };
    } else if (daysRemaining <= 30) {
      return { text: `Expires in ${daysRemaining} days`, color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else {
      return { text: 'Valid', color: 'bg-green-100 text-green-800', icon: '✅' };
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId, refreshTrigger]);

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
          <p className="text-sm text-gray-500 mt-1">Employee ID: {employeeId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Error Message */}
      {uploadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{uploadError}</p>
              <button
                onClick={fetchDocuments}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try reloading documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingDocument(null);
          setUploadError(null);
        }}
        onSubmit={handleUploadSubmit}
        isEdit={!!editingDocument}
        initialData={editingDocument || {}}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800">Employee Documents</h3>
            {documents.length > 0 && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </span>
            )}
          </div>
          {employeeName && (
            <p className="text-gray-600 flex items-center gap-2">
              <FaInfoCircle className="text-gray-400" />
              For: <span className="font-medium">{employeeName}</span>
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <FaUpload className="text-sm" />
          Upload Document
        </button>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
            <FaFile className="text-4xl text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-700 mb-3">No documents found</h4>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            This employee doesn't have any documents yet. Upload important documents like IDs, contracts, certificates, etc.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaUpload /> Upload First Document
            </button>
            <button
              onClick={fetchDocuments}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaSpinner className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {documents.map((document) => {
              const status = getDocumentStatus(document.issue_date, document.expiry_date);
              
              return (
                <div
                  key={document.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <FileIcon fileName={document.file_name} />
                    </div>
                    
                    {/* Document Details */}
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg mb-1">
                            {document.document_type}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <FaFileAlt className="text-xs" />
                            {document.file_name}
                          </p>
                        </div>
                        {status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} whitespace-nowrap`}>
                            {status.icon} {status.text}
                          </span>
                        )}
                      </div>
                      
                      {/* Dates Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {document.issue_date && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(document.issue_date)}
                            </p>
                          </div>
                        )}
                        {document.expiry_date && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(document.expiry_date)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Info */}
                      <div className="text-xs text-gray-400 mb-1">
                        Uploaded on {formatDate(document.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                    {document.file_url && (
                      <a
                        href={`https://api.chrispp.com${document.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <FaDownload />
                        <span className="text-sm">Download</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(document)}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Documents</div>
                <div className="text-2xl font-bold text-blue-700">{documents.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Recent Upload</div>
                <div className="text-lg font-semibold text-green-700">
                  {documents.length > 0 ? formatDate(documents[0].created_at) : 'None'}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Document Types</div>
                <div className="text-lg font-semibold text-purple-700">
                  {[...new Set(documents.map(d => d.document_type))].length} types
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 font-medium">
              Debug Info (Employee ID: {employeeId})
            </summary>
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify({
                employeeId,
                documentsCount: documents.length,
                documents: documents.map(d => ({
                  id: d.id,
                  type: d.document_type,
                  fileName: d.file_name,
                  url: d.file_url,
                  issue_date: d.issue_date,
                  expiry_date: d.expiry_date
                }))
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
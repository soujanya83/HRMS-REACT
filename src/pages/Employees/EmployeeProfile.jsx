/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaBriefcase, FaBuilding, FaPhone, FaEnvelope,
  FaBirthdayCake, FaMapMarkerAlt, FaFileContract, FaUniversity,
  FaExclamationTriangle, FaArrowLeft, FaDollarSign, FaShieldAlt,
  FaPassport, FaCalendarAlt, FaEdit, FaFileAlt, FaHistory,
  FaPrint, FaShare, FaQrcode, FaIdCard, FaTasks, FaChartLine,
  FaDownload, FaCopy, FaExternalLinkAlt, FaEllipsisH,
  FaPlus, FaTrash, FaEye, FaFilePdf, FaFileWord, FaFileImage,
  FaTimes, FaCheck, FaSpinner, FaUpload  // <-- Add FaUpload here
} from 'react-icons/fa';
import { HiOutlineDocumentReport, HiOutlineUserGroup } from 'react-icons/hi';
import { getEmployee, getEmployeeDocuments, uploadEmployeeDocument } from '../../services/employeeService';

// Detail Field Component
const DetailField = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start py-3 ${className}`}>
    <div className="text-gray-500 mr-4 mt-1 flex-shrink-0">{icon}</div>
    <div className="flex-grow">
      <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-md text-gray-900 break-words">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-lg font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon, label, onClick, color = 'bg-blue-600 hover:bg-blue-700' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${color}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Document Card Component
const DocumentCard = ({ document, onView, onDelete }) => {
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-green-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="text-xl mt-1">
            {getFileIcon(document.file_name)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{document.document_type || 'Document'}</h4>
            <p className="text-sm text-gray-600">{document.file_name}</p>
            <div className="flex items-center gap-3 mt-1">
              {document.issue_date && (
                <span className="text-xs text-gray-500">
                  Issued: {formatDate(document.issue_date)}
                </span>
              )}
              {document.expiry_date && (
                <span className="text-xs text-gray-500">
                  Expires: {formatDate(document.expiry_date)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {document.file_url && (
            <button
              onClick={() => onView(document)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="View Document"
            >
              <FaEye />
            </button>
          )}
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete Document"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Uploaded: {formatDate(document.created_at)}
        </span>
        {document.file_url && (
          <a
            href={`https://api.chrispp.com${document.file_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaDownload size={12} /> Download
          </a>
        )}
      </div>
    </div>
  );
};

// Document Upload Modal
const DocumentUploadModal = ({ isOpen, onClose, employeeId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
 // In DocumentUploadModal component - Update initial state
const [formData, setFormData] = useState({
  document_type: '',
  issue_date: '',
  expiry_date: '',
  file: null,
  file_name: '', // Add this
});

  // In EmployeeProfile.jsx - Update handleFileChange
const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    // Get filename without extension
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    
    setFormData({ 
      ...formData, 
      file: file,
      // Auto-populate file_name with a cleaned version of the filename
      file_name: formData.file_name || fileNameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      // Auto-suggest document type from filename if not set
      document_type: formData.document_type || 
        fileNameWithoutExt
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
    });
  }
};

  // In EmployeeProfile.jsx - FIXED handleSubmit function in DocumentUploadModal
// In EmployeeProfile.jsx - Update the handleSubmit function in DocumentUploadModal
// In EmployeeProfile.jsx - CORRECTED handleSubmit function
// In EmployeeProfile.jsx - UPDATED handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('DEBUG - handleSubmit triggered in EmployeeProfile');
  console.log('Employee ID:', employeeId);
  console.log('Form data:', formData);
  
  if (!formData.file) {
    setError('Please select a file to upload');
    return;
  }

  setUploading(true);
  setError('');

  try {
    const actualFormData = new FormData();
    
    // CORRECT FIELD NAMES BASED ON PREVIOUS VALIDATION ERRORS:
    // 1. Add employee_id (required)
    actualFormData.append('employee_id', employeeId);
    
    // 2. API expects 'document_type' - NOT document_name!
    actualFormData.append('document_type', formData.document_type);
    
    // 3. API expects 'file' field for file upload - NOT document!
    actualFormData.append('file', formData.file);
    
    // 4. API expects 'file_name' field (required)
    actualFormData.append('file_name', formData.file_name || formData.file.name || 'document');
    
    // 5. Optional fields
    if (formData.issue_date) {
      actualFormData.append('issue_date', formData.issue_date);
    }
    if (formData.expiry_date) {
      actualFormData.append('expiry_date', formData.expiry_date);
    }

    // Debug: Show FormData contents
    console.log('DEBUG - CORRECTED EmployeeProfile FormData being sent:');
    const formDataObj = {};
    for (let pair of actualFormData.entries()) {
      const value = pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1];
      console.log(`${pair[0]}: ${value}`);
      formDataObj[pair[0]] = value;
    }
    console.log('CORRECTED FormData summary:', formDataObj);

    // Call the API
    await uploadEmployeeDocument(actualFormData);
    
    console.log('DEBUG - Document upload successful');
    onUploadSuccess();
    onClose();
  } catch (err) {
    console.error('Upload error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url,
      config: err.config
    });
    
    if (err.response?.status === 422) {
      const errors = err.response.data?.errors || {};
      const errorMessages = Object.values(errors).flat();
      setError(errorMessages.join(', ') || 'Validation failed. Please check all fields.');
      
      // Show specific field errors if available
      console.error('Validation errors:', errors);
    } else {
      setError(err.response?.data?.message || 'Failed to upload document. Please try again.');
    }
  } finally {
    setUploading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Upload Document</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
      Document Type *
    </label>
    <select
      value={formData.document_type}
      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required
    >
      <option value="">Select Type</option>
      <option value="Aadhaar Card">Aadhaar Card</option>
      <option value="PAN Card">PAN Card</option>
      <option value="Passport">Passport</option>
      <option value="Driving License">Driving License</option>
      <option value="Visa">Visa</option>
      <option value="Work Permit">Work Permit</option>
      <option value="Employment Contract">Employment Contract</option>
      <option value="Offer Letter">Offer Letter</option>
      <option value="Experience Letter">Experience Letter</option>
      <option value="Salary Slip">Salary Slip</option>
      <option value="Bank Statement">Bank Statement</option>
      <option value="Tax Document">Tax Document</option>
      <option value="Education Certificate">Education Certificate</option>
      <option value="Professional Certificate">Professional Certificate</option>
      <option value="Other">Other</option>
    </select>
  </div>

  {/* File Name - ADD THIS */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      File Name *
    </label>
    <input
      type="text"
      value={formData.file_name || ''}
      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
      placeholder="Enter a descriptive file name (e.g., 'John_Aadhaar_Card')"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required
    />
    <p className="text-xs text-gray-500 mt-1">
      This will be the name shown in the documents list
    </p>
  </div>

  {/* Dates Row */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Issue Date
      </label>
      <input
        type="date"
        value={formData.issue_date}
        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Expiry Date
      </label>
      <input
        type="date"
        value={formData.expiry_date}
        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>

  {/* File Upload */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Document File *
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        required
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {formData.file ? (
          <div className="text-green-600">
            <FaCheck className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">{formData.file.name}</p>
            <p className="text-sm text-gray-500">
              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-gray-500">
            <FaFileAlt className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Click to select file</p>
            <p className="text-sm">PDF, DOC, JPG, PNG up to 10MB</p>
          </div>
        )}
      </label>
    </div>
  </div>
</div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading && <FaSpinner className="animate-spin" />}
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getEmployee(id);
        if (response.data?.data) {
          setEmployee(response.data.data);
        } else {
          throw new Error('Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError(err.response?.data?.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id]);

  // Fetch documents
  useEffect(() => {
    if (employee) {
      fetchDocuments();
    }
  }, [employee]);

  const fetchDocuments = async () => {
    if (!employee?.id) return;
    
    setLoadingDocuments(true);
    try {
      const response = await getEmployeeDocuments(employee.id);
      const documentsData = response.data?.data || response.data || [];
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate tenure
  const calculateTenure = (joiningDate) => {
    if (!joiningDate) return null;
    const join = new Date(joiningDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const months = now.getMonth() - join.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths >= 12) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
    }
  };

  // Handle document upload success
  const handleUploadSuccess = () => {
    fetchDocuments(); // Refresh documents list
  };

  // Handle view document
  const handleViewDocument = (document) => {
    if (document.file_url) {
      window.open(`https://api.chrispp.com${document.file_url}`, '_blank');
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // You'll need to add a delete document API call here
        // await deleteEmployeeDocument(documentId);
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
  };

  // Generate employee stats
  const employeeStats = employee ? [
    { icon: <FaCalendarAlt className="h-5 w-5" />, label: 'Tenure', value: calculateTenure(employee.joining_date) || 'N/A', color: 'blue' },
    { icon: <FaBriefcase className="h-5 w-5" />, label: 'Employment Type', value: employee.employment_type || 'N/A', color: 'green' },
    { icon: <HiOutlineUserGroup className="h-5 w-5" />, label: 'Department', value: employee.department?.name || 'N/A', color: 'purple' },
    { icon: <FaUser className="h-5 w-5" />, label: 'Reports To', value: employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'N/A', color: 'orange' }
  ] : [];

  // Quick actions
  const quickActions = [
    { label: 'Edit Profile', icon: <FaEdit className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/edit/${id}`), color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'View Documents', icon: <FaFileAlt className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/documents`), color: 'bg-green-600 hover:bg-green-700' },
    { label: 'History', icon: <FaHistory className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/history`), color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Performance', icon: <FaChartLine className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/performance`), color: 'bg-orange-600 hover:bg-orange-700' }
  ];

  // Secondary actions
  const secondaryActions = [
    { label: 'Print', icon: <FaPrint className="h-4 w-4" />, action: () => window.print(), color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Export', icon: <FaDownload className="h-4 w-4" />, action: () => exportProfile(), color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Share', icon: <FaShare className="h-4 w-4" />, action: () => shareProfile(), color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  const exportProfile = () => {
    alert('Export feature coming soon!');
  };

  const shareProfile = () => {
    alert('Share feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested employee could not be found.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard/employees')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Employee List
              </button>
              <button
                onClick={() => navigate('/dashboard/employees/new')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Add New Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        employeeId={employee.id}
        onUploadSuccess={handleUploadSuccess}
      />

      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/dashboard/employees')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaArrowLeft /> Back to Employees
              </button>
              
              <div className="flex items-center gap-2">
                {secondaryActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-2.5 ${action.color} text-white rounded-lg transition-colors`}
                    title={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white border-opacity-30">
                  {employee.first_name?.[0]}{employee.last_name?.[0]}
                </div>
                <span className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold ${
                  employee.status === 'Active' 
                    ? 'bg-green-500 text-white' 
                    : employee.status === 'On Leave'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {employee.status}
                </span>
              </div>
              
              {/* Basic Info */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {employee.first_name} {employee.last_name}
                    </h1>
                    <p className="text-xl text-blue-100 opacity-90 mb-3">
                      {employee.designation?.title || 'No Designation'}
                      {employee.department?.name && ` • ${employee.department.name}`}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-200" />
                        <span>{employee.personal_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-blue-200" />
                        <span>{employee.phone_number || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-blue-200" />
                        <span>{employee.employee_code}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <ActionButton
                          key={index}
                          icon={action.icon}
                          label={action.label}
                          onClick={action.action}
                          color={action.color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {employeeStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {['overview', 'employment', 'financial', 'documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaUser className="h-5 w-5 text-blue-600" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField
                        icon={<FaEnvelope className="h-4 w-4" />}
                        label="Email Address"
                        value={employee.personal_email}
                      />
                      <DetailField
                        icon={<FaPhone className="h-4 w-4" />}
                        label="Phone Number"
                        value={employee.phone_number}
                      />
                      <DetailField
                        icon={<FaBirthdayCake className="h-4 w-4" />}
                        label="Date of Birth"
                        value={formatDate(employee.date_of_birth)}
                      />
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Gender"
                        value={employee.gender}
                      />
                      <DetailField
                        icon={<FaMapMarkerAlt className="h-4 w-4" />}
                        label="Address"
                        value={employee.address}
                        className="md:col-span-2"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Contact Name"
                        value={employee.emergency_contact_name}
                      />
                      <DetailField
                        icon={<FaPhone className="h-4 w-4" />}
                        label="Contact Phone"
                        value={employee.emergency_contact_phone}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === 'employment' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaBriefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      Employment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField
                        icon={<FaIdCard className="h-4 w-4" />}
                        label="Employee Code"
                        value={employee.employee_code}
                      />
                      <DetailField
                        icon={<FaCalendarAlt className="h-4 w-4" />}
                        label="Joining Date"
                        value={formatDate(employee.joining_date)}
                      />
                      <DetailField
                        icon={<FaBuilding className="h-4 w-4" />}
                        label="Department"
                        value={employee.department?.name}
                      />
                      <DetailField
                        icon={<FaBriefcase className="h-4 w-4" />}
                        label="Designation"
                        value={employee.designation?.title}
                      />
                      <DetailField
                        icon={<FaFileContract className="h-4 w-4" />}
                        label="Employment Type"
                        value={employee.employment_type}
                      />
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Reporting Manager"
                        value={employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'Not assigned'}
                      />
                    </div>
                  </div>

                  {/* Organizational Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaBuilding className="h-5 w-5 text-purple-600" />
                      </div>
                      Organizational Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Organization"
                        value={employee.organization?.name}
                      />
                      <DetailField
                        icon={<FaCalendarAlt className="h-4 w-4" />}
                        label="Date Added"
                        value={formatDate(employee.created_at)}
                      />
                      {employee.applicant && (
                        <DetailField
                          icon={<FaUser className="h-4 w-4" />}
                          label="Applicant Source"
                          value={employee.applicant.source || 'N/A'}
                          className="md:col-span-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 text-sm">
                        Financial information is securely stored and used only for payroll and compliance purposes.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaDollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      Financial Information (AU)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField
                        icon={<FaShieldAlt className="h-4 w-4" />}
                        label="Tax File Number (TFN)"
                        value={employee.tax_file_number ? '•••• •••• ' + employee.tax_file_number.slice(-3) : null}
                      />
                      <DetailField
                        icon={<FaUniversity className="h-4 w-4" />}
                        label="Superannuation Fund"
                        value={employee.superannuation_fund_name}
                      />
                      <DetailField
                        icon={<FaUniversity className="h-4 w-4" />}
                        label="Superannuation Member #"
                        value={employee.superannuation_member_number ? '•••• ' + employee.superannuation_member_number.slice(-4) : null}
                      />
                      <DetailField
                        icon={<FaDollarSign className="h-4 w-4" />}
                        label="Bank BSB"
                        value={employee.bank_bsb ? '•••-' + employee.bank_bsb.slice(-3) : null}
                      />
                      <DetailField
                        icon={<FaDollarSign className="h-4 w-4" />}
                        label="Bank Account #"
                        value={employee.bank_account_number ? '•••• ' + employee.bank_account_number.slice(-4) : null}
                      />
                      <DetailField
                        icon={<FaPassport className="h-4 w-4" />}
                        label="Visa Type"
                        value={employee.visa_type}
                      />
                      <DetailField
                        icon={<FaCalendarAlt className="h-4 w-4" />}
                        label="Visa Expiry Date"
                        value={formatDate(employee.visa_expiry_date)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Employee Documents</h3>
                      <p className="text-gray-600">
                        Manage documents for {employee.first_name} {employee.last_name}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaPlus /> Upload Document
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/employees/${id}/documents`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaFileAlt /> View All
                      </button>
                    </div>
                  </div>

                  {loadingDocuments ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading documents...</p>
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            document={doc}
                            onView={handleViewDocument}
                            onDelete={handleDeleteDocument}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                      <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">No Documents Found</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        This employee doesn't have any documents yet. Upload important documents like IDs, contracts, certificates, etc.
                      </p>
                      <button
                        onClick={() => setUploadModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FaUpload /> Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaQrcode className="h-5 w-5 text-blue-600" />
                Employee ID Card
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
                <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{employee.employee_code}</div>
                  <div className="text-lg font-semibold text-gray-700">{employee.first_name} {employee.last_name}</div>
                  <div className="text-sm text-gray-600 mt-2">{employee.designation?.title}</div>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <FaPrint className="inline mr-2" />
                  Print ID Card
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaShare className="h-5 w-5 text-green-600" />
                Share Profile
              </h3>
              <p className="text-gray-600 mb-4">Share this employee profile with team members.</p>
              <div className="space-y-3">
                <button className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                  Share via Email
                </button>
                <button className="w-full px-4 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors">
                  Generate Shareable Link
                </button>
                <button className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                  Export as PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiOutlineDocumentReport className="h-5 w-5 text-purple-600" />
                Quick Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                  <div className="font-medium">Employment Summary</div>
                  <div className="text-sm text-gray-500">View detailed employment history</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                  <div className="font-medium">Performance Review</div>
                  <div className="text-sm text-gray-500">View performance metrics</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                  <div className="font-medium">Document Checklist</div>
                  <div className="text-sm text-gray-500">Check required documents</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
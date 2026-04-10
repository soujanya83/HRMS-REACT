// src/pages/Public/PublicEmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaSave,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaUpload,
  FaFileAlt,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaShieldAlt,
  FaMedkit,
  FaGavel,
  FaClipboardList,
  FaIdCard,
  FaPassport,
  FaGraduationCap,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaHeart,
  FaFolder,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaSave as FaSaveIcon
} from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import {
  getDepartmentsByOrganization,
  getDesignationsByDeptId,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocuments,
  updateDocumentDates
} from '../../services/employeeService';

// ============================================
// MANDATORY CERTIFICATES CHECKLIST (8 items)
// ============================================
const MANDATORY_CERTIFICATES_LIST = [
  {
    id: "wwcc",
    name: "Working With Children Check",
    type: "Working With Children Check",
    required: true,
    hasExpiry: true,
    expiryYears: 5,
    description: "Employee type, linked to service",
    icon: "🆔"
  },
  {
    id: "first_aid",
    name: "First Aid Certification (HLTAID012)",
    type: "First Aid Certificate",
    required: true,
    hasExpiry: true,
    expiryYears: 3,
    description: "HLTAID012 including CPR, Asthma & Anaphylaxis management",
    icon: "🚑"
  },
  {
    id: "police_check",
    name: "National Police Check",
    type: "Police Check",
    required: true,
    hasExpiry: true,
    expiryYears: 3,
    description: "Current National Police Check",
    icon: "👮"
  },
  {
    id: "qualification",
    name: "Qualification Certificate",
    type: "Certificate III or Diploma",
    required: true,
    hasExpiry: false,
    description: "Certificate III or Diploma in Early Childhood Education",
    icon: "🎓"
  },
  {
    id: "immunisation",
    name: "Immunisation Record",
    type: "Immunisation Record",
    required: true,
    hasExpiry: false,
    description: "Flu and Pertussis recommended for childcare workers",
    icon: "💉"
  },
  {
    id: "code_of_conduct",
    name: "Signed Code of Conduct",
    type: "Code of Conduct",
    required: true,
    hasExpiry: false,
    description: "Signed Code of Conduct agreement",
    icon: "📄"
  },
  {
    id: "induction",
    name: "Completed Induction",
    type: "Induction",
    required: true,
    hasExpiry: false,
    description: "Emergency procedures, supervision, child protection",
    icon: "📋"
  },
  {
    id: "right_to_work",
    name: "Right to Work in Australia",
    type: "Right to Work",
    required: true,
    hasExpiry: false,
    description: "Proof of Australian citizenship or valid work visa",
    icon: "🇦🇺"
  }
];

// ============================================
// ENCRYPTED INPUT COMPONENT WITH EYE BUTTON
// ============================================
const EncryptedInput = ({ label, name, value, onChange, required, placeholder, error }) => {
  const [showValue, setShowValue] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showValue ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowValue(!showValue)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showValue ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ============================================
// DOCUMENT UPLOAD MODAL
// ============================================
const DocumentUploadModal = ({ isOpen, onClose, employeeId, onUploadSuccess, preselectedDocumentType = null }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showFileNameInput, setShowFileNameInput] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    file: null,
    file_name: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: preselectedDocumentType || '',
        file: null,
        file_name: '',
      });
      setError('');
      setShowFileNameInput(preselectedDocumentType === 'Other Document');
    }
  }, [isOpen, preselectedDocumentType]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      
      setFormData({ 
        ...formData, 
        file: file,
        file_name: fileNameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
    }
  };

  const handleDocumentTypeChange = (e) => {
    const value = e.target.value;
    setShowFileNameInput(value === 'Other Document');
    setFormData({ ...formData, document_type: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.document_type) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const actualFormData = new FormData();
      actualFormData.append('employee_id', employeeId);
      actualFormData.append('document_type', formData.document_type);
      actualFormData.append('file', formData.file);
      
      if (showFileNameInput && formData.file_name) {
        actualFormData.append('file_name', formData.file_name);
      }
      
      await uploadEmployeeDocument(actualFormData);
      toast.success('Document uploaded successfully!');
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(', ') || 'Validation failed');
      } else {
        setError(err.response?.data?.message || 'Failed to upload document');
      }
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
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
                onChange={handleDocumentTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Document Type</option>
                <option value="Working With Children Check">🆔 Working With Children Check</option>
                <option value="First Aid Certificate">🚑 First Aid Certificate</option>
                <option value="Police Check">👮 Police Check</option>
                <option value="Qualification Certificate">🎓 Qualification Certificate</option>
                <option value="Immunisation Record">💉 Immunisation Record</option>
                <option value="Code of Conduct">📄 Signed Code of Conduct</option>
                <option value="Induction">📋 Completed Induction</option>
                <option value="Right to Work">🇦🇺 Right to Work in Australia</option>
                <option value="Other Document">📁 Other Document</option>
              </select>
            </div>

            {showFileNameInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  placeholder="Enter document name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={showFileNameInput}
                />
              </div>
            )}

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
                      <FaUpload className="h-8 w-8 mx-auto mb-2" />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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

// ============================================
// DATE EDIT MODAL
// ============================================
const DateEditModal = ({ isOpen, onClose, document, onUpdate }) => {
  const [issueDate, setIssueDate] = useState(document?.issue_date || '');
  const [expiryDate, setExpiryDate] = useState(document?.expiry_date || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (document) {
      setIssueDate(document.issue_date || '');
      setExpiryDate(document.expiry_date || '');
    }
  }, [document]);

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      await updateDocumentDates(document.id, { issue_date: issueDate, expiry_date: expiryDate });
      toast.success('Dates updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update dates',error);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Document Dates</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {updating && <FaSpinner className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DOCUMENT CARD COMPONENT
// ============================================
const DocumentCard = ({ document, onDelete, onView, onEditDates }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-green-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= 30;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getFileIcon(document.file_name)}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{document.file_name || document.document_type}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="text-gray-500">
                <FaCalendarAlt className="inline mr-1 text-gray-400" size={10} />
                Issue: {formatDate(document.issue_date)}
              </span>
              <span className={`flex items-center gap-1 ${isExpired(document.expiry_date) ? 'text-red-600' : isExpiringSoon(document.expiry_date) ? 'text-orange-500' : 'text-gray-500'}`}>
                <FaClock className="inline" size={10} />
                Expiry: {formatDate(document.expiry_date)}
                {isExpiringSoon(document.expiry_date) && !isExpired(document.expiry_date) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Expiring soon</span>
                )}
                {isExpired(document.expiry_date) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">Expired</span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEditDates(document)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit Dates"
          >
            <FaEdit size={12} />
          </button>
          {document.file_url && (
            <button
              onClick={() => onView(document)}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
              title="View"
            >
              <FaEye size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(document.id)}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
            title="Delete"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MANDATORY CHECKLIST ITEM COMPONENT
// ============================================
const ChecklistItem = ({ item, isUploaded, documents, onUpload, onDelete, onView, onEditDates }) => {
  const [showDocuments, setShowDocuments] = useState(false);
  
  const itemDocuments = documents.filter(doc => 
    doc.document_type === item.type || 
    doc.document_type?.includes(item.type.split(' ')[0])
  );

  return (
    <div className={`border rounded-lg p-4 transition-all ${isUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {isUploaded ? (
              <FaCheckCircle className="text-green-500 text-xl" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{item.icon}</span>
              <h4 className="font-semibold text-gray-800">{item.name}</h4>
              {item.required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>}
              {item.hasExpiry && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Expires every {item.expiryYears} years</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            
            {/* Uploaded Documents List */}
            {itemDocuments.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showDocuments ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  {itemDocuments.length} document(s) uploaded
                </button>
                {showDocuments && (
                  <div className="mt-2 space-y-2">
                    {itemDocuments.map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={onDelete}
                        onView={onView}
                        onEditDates={onEditDates}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onUpload(item.type)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 whitespace-nowrap ml-3"
        >
          <FaUpload size={12} /> Upload
        </button>
      </div>
    </div>
  );
};

// ============================================
// OTHER DOCUMENTS SECTION
// ============================================
const OtherDocumentsSection = ({ documents, onUpload, onDelete, onView, onEditDates }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const otherDocs = documents.filter(doc => 
    !MANDATORY_CERTIFICATES_LIST.some(m => 
      doc.document_type === m.type || doc.document_type?.includes(m.type.split(' ')[0])
    )
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 bg-gray-100 flex items-center justify-between hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FaFolder className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Other Documents</h3>
          <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
            {otherDocs.length} document(s)
          </span>
        </div>
        {isExpanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </button>
      
      {isExpanded && (
        <div className="p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => onUpload('Other Document')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaPlus size={12} /> Add Other Document
            </button>
          </div>
          
          {otherDocs.length > 0 ? (
            <div className="space-y-3">
              {otherDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={onDelete}
                  onView={onView}
                  onEditDates={onEditDates}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FaFileAlt className="text-3xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No additional documents uploaded</p>
              <button
                onClick={() => onUpload('Other Document')}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700"
              >
                Click here to upload
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN PUBLIC EMPLOYEE FORM
// ============================================
const PublicEmployeeForm = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [dateEditModalOpen, setDateEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    tax_file_number: '',
    superannuation_fund_name: '',
    superannuation_member_number: '',
    bank_bsb: '',
    bank_account_number: '',
    citizenship_status: '',
    is_australian_citizen: false,
    is_pr: false,
    visa_type: '',
    // Employment fields removed
  });

  // Fetch employee data when organizationId is available
  useEffect(() => {
    if (organizationId) {
      fetchEmployeeData();
    } else {
      toast.error('Invalid application link');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [organizationId]);

  // Fetch documents when employee is created/loaded
  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/employeedata/${organizationId}`);
      
      if (response.data?.success && response.data?.data) {
        const employee = response.data.data;
        setEmployeeData(employee);
        setEmployeeId(employee.id);
        
        setFormData({
          employee_id: employee.id || '',
          first_name: employee.first_name || '',
          middle_name: employee.middle_name || '',
          last_name: employee.last_name || '',
          email: employee.personal_email || '',
          phone_number: employee.phone_number || '',
          date_of_birth: employee.date_of_birth || '',
          gender: employee.gender || '',
          address: employee.address || '',
          emergency_contact_name: employee.emergency_contact_name || '',
          emergency_contact_phone: employee.emergency_contact_phone || '',
          emergency_contact_relationship: employee.emergency_contact_relationship || '',
          tax_file_number: employee.tax_file_number || '',
          superannuation_fund_name: employee.superannuation_fund_name || '',
          superannuation_member_number: employee.superannuation_member_number || '',
          bank_bsb: employee.bank_bsb || '',
          bank_account_number: employee.bank_account_number || '',
          citizenship_status: employee.citizenship_status || '',
          is_australian_citizen: employee.is_australian_citizen === '1' || employee.is_australian_citizen === true,
          is_pr: employee.is_pr === '1' || employee.is_pr === true,
          visa_type: employee.visa_type || '',
          // Employment fields removed
        });
        
        if (employee.organization_id) {
          fetchDepartments(employee.organization_id);
          fetchDesignations(employee.organization_id);
        }
      } else {
        toast.error('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error(error.response?.data?.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (orgId) => {
    try {
      const res = await getDepartmentsByOrganization(orgId);
      let depts = [];
      if (res.data?.success && res.data.data) depts = res.data.data;
      else if (Array.isArray(res.data)) depts = res.data;
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDesignations = async (orgId) => {
    try {
      const res = await getDesignationsByDeptId(orgId);
      let desigs = [];
      if (res.data?.success && res.data.data) desigs = res.data.data;
      else if (Array.isArray(res.data)) desigs = res.data;
      setDesignations(desigs);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const fetchDocuments = async () => {
    if (!employeeId) return;
    try {
      const res = await getEmployeeDocuments(employeeId);
      let docs = [];
      if (res.data?.success && res.data.data) docs = res.data.data;
      else if (Array.isArray(res.data)) docs = res.data;
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleViewDocument = (document) => {
    if (document.file_url) {
      window.open(`https://api.chrispp.com${document.file_url}`, '_blank');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteEmployeeDocument(docId);
      toast.success('Document deleted successfully!');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document',error);
    }
  };

  const handleEditDates = (document) => {
    setSelectedDocument(document);
    setDateEditModalOpen(true);
  };

  const handleDatesUpdated = () => {
    fetchDocuments();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone_number?.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.emergency_contact_name?.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone?.trim()) newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    if (!formData.emergency_contact_relationship?.trim()) newErrors.emergency_contact_relationship = 'Emergency contact relationship is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const payload = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        tax_file_number: formData.tax_file_number,
        superannuation_fund_name: formData.superannuation_fund_name,
        superannuation_member_number: formData.superannuation_member_number,
        bank_bsb: formData.bank_bsb,
        bank_account_number: formData.bank_account_number,
        citizenship_status: formData.citizenship_status,
        is_australian_citizen: formData.is_australian_citizen,
        is_pr: formData.is_pr,
        visa_type: formData.visa_type,
        // Employment fields removed from payload
      };
      
      const response = await axiosClient.post('/employee/update-profile', payload);
      
      if (response.data?.status) {
        setSubmitted(true);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please correct the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const openUploadModal = (documentType) => {
    setSelectedDocumentType(documentType);
    setUploadModalOpen(true);
  };

  // Check if a certificate is uploaded
  const isCertificateUploaded = (certType) => {
    return documents.some(doc => 
      doc.document_type === certType || 
      doc.document_type?.includes(certType.split(' ')[0])
    );
  };

  // Get documents for a specific certificate
  const getDocumentsForCertificate = (certType) => {
    return documents.filter(doc => 
      doc.document_type === certType || 
      doc.document_type?.includes(certType.split(' ')[0])
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const uploadedCount = MANDATORY_CERTIFICATES_LIST.filter(cert => isCertificateUploaded(cert.type)).length;
  const completionPercentage = Math.round((uploadedCount / MANDATORY_CERTIFICATES_LIST.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedDocumentType(null);
        }}
        employeeId={employeeId}
        onUploadSuccess={handleUploadSuccess}
        preselectedDocumentType={selectedDocumentType}
      />

      <DateEditModal
        isOpen={dateEditModalOpen}
        onClose={() => {
          setDateEditModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onUpdate={handleDatesUpdated}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Please fill in your details to complete your employee profile</p>
          {employeeData?.organization && (
            <p className="text-sm text-blue-600 mt-1">
              Organization: {employeeData.organization.name}
            </p>
          )}
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-500 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Profile Updated Successfully!</p>
                <p className="text-sm text-green-700">
                  You can now upload your certificates and documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Personal Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaUser className="text-blue-600" /> Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+61 123 456 789"
                />
                {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full address"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaHeart className="text-red-500" /> Emergency Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  required
                  placeholder="Emergency Contact Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.emergency_contact_name && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  required
                  placeholder="Emergency Contact Phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.emergency_contact_phone && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  required
                  placeholder="Emergency Contact Relationship"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.emergency_contact_relationship && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_relationship}</p>}
              </div>
            </div>
          </div>

          {/* Tax & Financial Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaShieldAlt className="text-green-600" /> Tax & Financial Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EncryptedInput
                label="Tax File Number (TFN)"
                name="tax_file_number"
                value={formData.tax_file_number}
                onChange={handleChange}
                placeholder="Enter your TFN"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superannuation Fund Name
                </label>
                <input
                  type="text"
                  name="superannuation_fund_name"
                  value={formData.superannuation_fund_name}
                  onChange={handleChange}
                  placeholder="Superannuation Fund Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superannuation Member Number
                </label>
                <input
                  type="text"
                  name="superannuation_member_number"
                  value={formData.superannuation_member_number}
                  onChange={handleChange}
                  placeholder="Superannuation Member Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank BSB
                </label>
                <input
                  type="text"
                  name="bank_bsb"
                  value={formData.bank_bsb}
                  onChange={handleChange}
                  placeholder="Bank BSB (e.g., 123-456)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <EncryptedInput
                label="Bank Account Number"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={handleChange}
                placeholder="Enter your bank account number"
              />
            </div>
          </div>

          {/* Citizenship Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaIdCard className="text-blue-600" /> Citizenship Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citizenship Status
                </label>
                <select
                  name="citizenship_status"
                  value={formData.citizenship_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Citizenship Status</option>
                  <option value="Australian Citizen">Australian Citizen</option>
                  <option value="Australian Permanent Resident">Australian Permanent Resident</option>
                  <option value="Visa Holder">Visa Holder</option>
                </select>
              </div>
              
              {formData.citizenship_status === 'Visa Holder' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visa Type
                  </label>
                  <input
                    type="text"
                    name="visa_type"
                    value={formData.visa_type}
                    onChange={handleChange}
                    placeholder="Enter visa type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {!submitted && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {submitting ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          )}
        </form>

        {/* Documents Section - Show after submission */}
        {submitted && employeeId && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaUpload className="text-purple-600" /> Mandatory Documents Checklist
                </h2>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-600">{completionPercentage}%</span>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                {uploadedCount} of {MANDATORY_CERTIFICATES_LIST.length} mandatory documents uploaded
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {MANDATORY_CERTIFICATES_LIST.map((cert) => (
                <ChecklistItem
                  key={cert.id}
                  item={cert}
                  isUploaded={isCertificateUploaded(cert.type)}
                  documents={getDocumentsForCertificate(cert.type)}
                  onUpload={openUploadModal}
                  onDelete={handleDeleteDocument}
                  onView={handleViewDocument}
                  onEditDates={handleEditDates}
                />
              ))}
            </div>

            {/* Other Documents Section */}
            <OtherDocumentsSection
              documents={documents}
              onUpload={openUploadModal}
              onDelete={handleDeleteDocument}
              onView={handleViewDocument}
              onEditDates={handleEditDates}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your information is secure and will be used only for employment purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicEmployeeForm;
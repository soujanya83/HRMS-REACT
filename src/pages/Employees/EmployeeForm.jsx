import React, { useEffect, useState } from "react";
import {
  getEmployee,
  updateEmployee,
  getEmployees,
} from "../../services/employeeService.js";
import {
  getDepartmentsByOrgId,
  getDesignationsByDeptId,
} from "../../services/organizationService.js";
import { 
  getDocumentsByEmployee, 
  createEmployeeDocument, 
  deleteEmployeeDocument 
} from "../../services/employeeDocumentService.js";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaCertificate,
  FaDollarSign,
  FaCalendarAlt,
  FaIdCard,
  FaFileAlt,
  FaPassport,
  FaGraduationCap,
  FaSpinner,
  FaUpload,
  FaTrash,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaPlus,
} from "react-icons/fa";
import { useOrganizations } from "../../contexts/OrganizationContext";

// Reusable Input Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
  </div>
);

// Reusable Select Component
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "-- Select --",
  disabled = false,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
  </div>
);

// Reusable TextArea Component
const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  rows = 3,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
  </div>
);

// Tab Component
const TabButton = ({ active, onClick, icon, label, step, completed }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-3 px-6 py-4 w-full rounded-lg transition-all duration-300 ${
      active
        ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
    }`}
  >
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
      active ? "bg-blue-100 text-blue-600" : completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
    }`}>
      {completed && !active ? <FaCheck className="text-sm" /> : icon}
    </div>
    <div className="flex flex-col items-start">
      <span className={`text-sm font-medium ${active ? "text-blue-700" : completed ? "text-green-700" : "text-gray-600"}`}>
        {label}
      </span>
      <span className={`text-xs ${active ? "text-blue-500" : "text-gray-400"}`}>
        Step {step}
      </span>
    </div>
  </button>
);

// Section Header Component
const SectionHeader = ({ title, description }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    {description && <p className="text-gray-600">{description}</p>}
  </div>
);

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
  'Working with Children Check',
  'First Aid Certificate',
  'CPR Certificate',
  'Police Check',
  'Other'
];

// File Icon Component
const FileIcon = ({ fileName }) => {
  if (!fileName) return <FaFileAlt className="text-gray-400 text-2xl" />;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  const className = "text-2xl";
  
  if (ext === 'pdf') return <FaFilePdf className={`${className} text-red-500`} />;
  if (['doc', 'docx'].includes(ext)) return <FaFileWord className={`${className} text-blue-500`} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className={`${className} text-green-500`} />;
  return <FaFileAlt className={`${className} text-gray-500`} />;
};

// Document Upload Modal
const DocumentUploadModal = ({ isOpen, onClose, onSubmit, employeeId }) => {
  const [formData, setFormData] = useState({
    document_type: '',
    issue_date: '',
    expiry_date: '',
    file: null,
    file_name: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: '',
        issue_date: '',
        expiry_date: '',
        file: null,
        file_name: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      
      setFormData(prev => ({
        ...prev,
        file,
        file_name: prev.file_name || fileNameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        document_type: prev.document_type || 
          fileNameWithoutExt
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
      }));
    }
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
      const data = new FormData();
      data.append('employee_id', employeeId);
      data.append('document_type', formData.document_type);
      data.append('file', formData.file);
      data.append('file_name', formData.file_name || formData.file.name || 'document');
      
      if (formData.issue_date) {
        data.append('issue_date', formData.issue_date);
      }
      if (formData.expiry_date) {
        data.append('expiry_date', formData.expiry_date);
      }

      console.log('Uploading document with data:', {
        employeeId,
        document_type: formData.document_type,
        file_name: formData.file_name,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        file: formData.file?.name
      });

      await onSubmit(employeeId, data);
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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Upload New Document</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Document Type</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* File Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.file_name}
                onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                placeholder="Enter a descriptive file name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be the name shown in the documents list
              </p>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File <span className="text-red-500">*</span>
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

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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

// Document Card Component
const DocumentCard = ({ document, onDelete }) => {
  const today = new Date();
  const expiryDate = document.expiry_date ? new Date(document.expiry_date) : null;
  
  let daysRemaining = null;
  let statusColor = "bg-green-100 text-green-800 border-green-200";
  let statusText = "Valid";
  
  if (expiryDate) {
    daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      statusColor = "bg-red-100 text-red-800 border-red-200";
      statusText = "Expired";
    } else if (daysRemaining <= 30) {
      statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
      statusText = `Expires in ${daysRemaining} days`;
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const baseUrl = 'https://api.chrispp.com';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">
            {getFileIcon(document.file_name)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{document.document_type || 'Document'}</h4>
            <p className="text-sm text-gray-500">{document.file_name}</p>
          </div>
        </div>
        {expiryDate && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
            {statusText}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {document.issue_date && (
          <div>
            <p className="text-xs text-gray-500">Issue Date</p>
            <p className="text-sm font-medium">{formatDate(document.issue_date)}</p>
          </div>
        )}
        {document.expiry_date && (
          <div>
            <p className="text-xs text-gray-500">Expiry Date</p>
            <p className="text-sm font-medium">{formatDate(document.expiry_date)}</p>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
        {document.file_url && (
          <>
            <a
              href={`${baseUrl}${document.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <FaEye />
              View
            </a>
            <a
              href={`${baseUrl}${document.file_url}`}
              download
              className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors text-sm"
            >
              <FaDownload />
              Download
            </a>
          </>
        )}
        <button
          onClick={() => onDelete(document.id)}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          <FaTrash />
          Delete
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Uploaded: {formatDate(document.created_at)}
      </div>
    </div>
  );
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formErrors, setFormErrors] = useState({});
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateError, setCertificateError] = useState('');

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const [formData, setFormData] = useState({
    // Personal Info - Basic fields for the basic API
    first_name: "",
    last_name: "",
    personal_email: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    
    // Employment - These will be added in the edit mode
    employee_code: "",
    joining_date: "",
    room_id: "",
    designation_id: "",
    reporting_manager_id: "",
    employment_type: "",
    status: "On Probation",
    hourly_wage: "",
    
    // Payroll
    tax_file_number: "",
    superannuation_fund_name: "",
    superannuation_member_number: "",
    bank_bsb: "",
    bank_account_number: "",
    visa_type: "",
    visa_expiry_date: "",
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FaUser />, step: 1 },
    { id: "certificates", label: "Certificates", icon: <FaCertificate />, step: 2 },
    { id: "employment", label: "Employment", icon: <FaBriefcase />, step: 3 },
    { id: "payroll", label: "Payroll", icon: <FaDollarSign />, step: 4 },
  ];

  // Tab descriptions
  const tabDescriptions = {
    personal: "Personal details and emergency contact information",
    certificates: "Manage employee certificates and documents with expiry tracking",
    employment: "Employment details, room assignment, and wage information",
    payroll: "Payroll and financial information",
  };

  // Fetch employee data
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getEmployee(id)
        .then(({ data }) => {
          console.log('Employee data:', data);
          setFormData(data.data);
          setCompletedTabs(new Set(["personal", "certificates", "employment", "payroll"]));
        })
        .catch((err) => console.error("Failed to fetch employee", err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Fetch certificates/documents when in edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetchCertificates();
    }
  }, [id, isEdit]);

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    setCertificateError('');
    
    try {
      console.log(`Fetching documents for employee ID: ${id}`);
      const response = await getDocumentsByEmployee(id);
      console.log('API Response:', response);
      
      // Handle different response structures
      let documentsData = [];
      
      if (response.data) {
        if (response.data.success === true && response.data.data) {
          documentsData = response.data.data;
        } 
        else if (Array.isArray(response.data)) {
          documentsData = response.data;
        }
        else if (response.data.data && Array.isArray(response.data.data)) {
          documentsData = response.data.data;
        }
      } 
      else if (Array.isArray(response)) {
        documentsData = response;
      }
      
      console.log('Documents data extracted:', documentsData);
      
      setCertificates(Array.isArray(documentsData) ? documentsData : []);
      setCertificateError(null);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
      setCertificateError('Failed to load certificates. Please try again.');
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Fetch dynamic data (only in edit mode)
  useEffect(() => {
    if (isEdit && organizationId) {
      // Fetch departments (rooms)
      getDepartmentsByOrgId(organizationId)
        .then((res) => {
          if (res && res.success === true) {
            const roomsData = res.data || [];
            setDepartments(
              roomsData.map((r) => ({ 
                value: r.id, 
                label: r.name,
                age_group: r.age_group,
                color_code: r.color_code
              }))
            );
          } else {
            setDepartments([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching rooms:", err);
          setDepartments([]);
        });

      // Fetch managers (existing employees)
      getEmployees({ organization_id: organizationId })
        .then((response) => {
          if (response.data && response.data.success === true) {
            const employeesData = response.data.data || [];
            setManagers(
              employeesData.map((e) => ({
                value: e.id,
                label: `${e.first_name} ${e.last_name}`,
              }))
            );
          } else {
            setManagers([]);
          }
        })
        .catch((err) => console.error("Failed to fetch managers", err));
    }
  }, [isEdit, organizationId]);

  // Fetch designations when room changes (only in edit mode)
  useEffect(() => {
    if (isEdit && formData.room_id) {
      setFormData((prev) => ({ ...prev, designation_id: "" }));
      
      getDesignationsByDeptId(formData.room_id)
        .then((res) => {
          if (res && res.success === true) {
            const designationsData = res.data || [];
            setDesignations(
              designationsData.map((d) => ({ 
                value: d.id, 
                label: d.title 
              }))
            );
          } else {
            setDesignations([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching designations:", err);
          setDesignations([]);
        });
    } else {
      setDesignations([]);
    }
  }, [isEdit, formData.room_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleUploadDocument = async (employeeId, formData) => {
    try {
      console.log('Submitting document with FormData:');
      await createEmployeeDocument(employeeId, formData);
      await fetchCertificates();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error in document upload:', error);
      if (error.response?.data?.message) {
        setCertificateError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setCertificateError(errorMessages.join(', '));
      } else {
        setCertificateError(error.message || 'Upload failed');
      }
      throw error;
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteEmployeeDocument(documentToDelete);
      await fetchCertificates();
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      setCertificateError('Failed to delete document');
    }
  };

  // Validate current tab
  const validateCurrentTab = () => {
    const errors = {};

    if (activeTab === "personal") {
      if (!formData.first_name.trim())
        errors.first_name = ["First Name is required"];
      if (!formData.last_name.trim())
        errors.last_name = ["Last Name is required"];
      if (!formData.personal_email.trim())
        errors.personal_email = ["Personal Email is required"];
      else if (!/^\S+@\S+\.\S+$/.test(formData.personal_email))
        errors.personal_email = ["Please enter a valid email address"];
      if (!formData.phone_number.trim())
        errors.phone_number = ["Phone Number is required"];
      if (!formData.date_of_birth)
        errors.date_of_birth = ["Date of Birth is required"];
      if (!formData.gender)
        errors.gender = ["Gender is required"];
      if (!formData.address.trim())
        errors.address = ["Address is required"];
    } else if (activeTab === "employment" && isEdit) {
      if (!formData.employee_code.trim())
        errors.employee_code = ["Employee Code is required"];
      if (!formData.joining_date)
        errors.joining_date = ["Joining Date is required"];
      if (!formData.room_id)
        errors.room_id = ["Room is required"];
      if (!formData.designation_id)
        errors.designation_id = ["Designation is required"];
      if (!formData.employment_type)
        errors.employment_type = ["Employment Type is required"];
      if (!formData.status)
        errors.status = ["Status is required"];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }, 100);
      }
      return false;
    }
    return true;
  };

  const goToNextTab = () => {
    if (validateCurrentTab()) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEdit) {
      // For edit mode - use FormData for all fields
      let isValid = true;
      const allErrors = {};
      
      if (!formData.first_name.trim()) {
        allErrors.first_name = ["First Name is required"];
        isValid = false;
      }
      if (!formData.last_name.trim()) {
        allErrors.last_name = ["Last Name is required"];
        isValid = false;
      }
      if (!formData.personal_email.trim()) {
        allErrors.personal_email = ["Personal Email is required"];
        isValid = false;
      }
      if (!formData.employee_code.trim()) {
        allErrors.employee_code = ["Employee Code is required"];
        isValid = false;
      }
      if (!formData.room_id) {
        allErrors.room_id = ["Room is required"];
        isValid = false;
      }
      
      if (!isValid) {
        setFormErrors(allErrors);
        setActiveTab("personal");
        alert("Please fill in all required fields marked with *");
        return;
      }
      
      setIsSubmitting(true);
      setFormErrors({});

      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }
      if (organizationId) {
        data.append("organization_id", organizationId);
      }

      try {
        await updateEmployee(id, data);
        navigate("/dashboard/employees");
      } catch (error) {
        console.error("Failed to update employee", error);
        if (error.response && error.response.status === 422) {
          setFormErrors(error.response.data.errors);
          alert("Please correct the validation errors below.");
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For create mode - use basic employee API
      let isValid = true;
      const allErrors = {};
      
      if (!formData.first_name.trim()) {
        allErrors.first_name = ["First Name is required"];
        isValid = false;
      }
      if (!formData.last_name.trim()) {
        allErrors.last_name = ["Last Name is required"];
        isValid = false;
      }
      if (!formData.personal_email.trim()) {
        allErrors.personal_email = ["Personal Email is required"];
        isValid = false;
      }
      if (!formData.phone_number.trim()) {
        allErrors.phone_number = ["Phone Number is required"];
        isValid = false;
      }
      if (!formData.date_of_birth) {
        allErrors.date_of_birth = ["Date of Birth is required"];
        isValid = false;
      }
      if (!formData.gender) {
        allErrors.gender = ["Gender is required"];
        isValid = false;
      }
      if (!formData.address.trim()) {
        allErrors.address = ["Address is required"];
        isValid = false;
      }
      
      if (!isValid) {
        setFormErrors(allErrors);
        setActiveTab("personal");
        alert("Please fill in all required personal information fields marked with *");
        return;
      }
      
      setIsSubmitting(true);
      setFormErrors({});

      // Create payload for basic employee API
      const basicEmployeeData = {
        organization_id: organizationId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        personal_email: formData.personal_email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name || '',
        emergency_contact_phone: formData.emergency_contact_phone || '',
        emergency_contact_relationship: formData.emergency_contact_relationship || '',
      };

      try {
        console.log('Creating basic employee with data:', basicEmployeeData);
        
        // You need to import createEmployeeBasic at the top
        const { createEmployeeBasic } = await import("../../services/employeeService.js");
        const response = await createEmployeeBasic(basicEmployeeData);
        console.log('Create employee response:', response);
        
        const newEmployeeId = response.data?.data?.id || response.data?.id;
        
        if (newEmployeeId) {
          navigate(`/dashboard/employees/edit/${newEmployeeId}`);
        } else {
          navigate("/dashboard/employees");
        }
      } catch (error) {
        console.error("Failed to create employee", error);
        if (error.response && error.response.status === 422) {
          setFormErrors(error.response.data.errors);
          alert("Please correct the validation errors below.");
        } else {
          alert(error.response?.data?.message || "An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isLastTab = activeTab === tabs[tabs.length - 1].id;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Employees
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h1>
          <p className="text-gray-600">
            {isEdit 
              ? "Update employee information" 
              : "Fill in the basic details to add a new employee. You can add employment and payroll information after creation."}
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                  label={tab.label}
                  step={tab.step}
                  completed={completedTabs.has(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Tab Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                {tabDescriptions[activeTab]}
              </p>
            </div>

            {/* Personal Information Tab */}
            <div className={`space-y-8 ${activeTab === "personal" ? "block" : "hidden"} tab-personal`}>
              <SectionHeader 
                title="Personal Information" 
                description="Basic personal details about the employee"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={formErrors.first_name}
                  required
                  placeholder="Enter first name"
                />
                
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={formErrors.last_name}
                  required
                  placeholder="Enter last name"
                />
                
                <InputField
                  label="Email Address"
                  name="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  error={formErrors.personal_email}
                  required
                  placeholder="employee@company.com"
                />
                
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={formErrors.phone_number}
                  required
                  placeholder="+61 123 456 789"
                />
                
                <InputField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  error={formErrors.date_of_birth}
                  required
                />
                
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                    { value: "Prefer not to say", label: "Prefer not to say" },
                  ]}
                  error={formErrors.gender}
                  required
                  placeholder="-- Select --"
                />
                
                <div className="md:col-span-2">
                  <TextAreaField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={formErrors.address}
                    required
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>

              <SectionHeader 
                title="Emergency Contact" 
                description="Emergency contact details"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Emergency Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_name}
                  placeholder="Enter contact name"
                />
                
                <InputField
                  label="Emergency Contact Phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_phone}
                  placeholder="Enter contact phone"
                />
                
                <InputField
                  label="Emergency Contact Relationship"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_relationship}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>

            {/* Certificates Tab */}
            <div className={`space-y-8 ${activeTab === "certificates" ? "block" : "hidden"} tab-certificates`}>
              <div className="flex justify-between items-center mb-6">
                <SectionHeader 
                  title="Certificates & Documents" 
                  description="Manage employee certificates and track expiry dates"
                />
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus /> Upload Document
                  </button>
                )}
              </div>

              {certificateError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm">{certificateError}</p>
                      {isEdit && (
                        <button
                          onClick={fetchCertificates}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Try reloading documents
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isEdit ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <FaInfoCircle className="mx-auto text-gray-400 text-5xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Save Employee First</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Complete the basic employee information first, then you'll be able to upload and manage certificates.
                  </p>
                </div>
              ) : loadingCertificates ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading certificates...</span>
                </div>
              ) : certificates.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {certificates.length} {certificates.length === 1 ? 'document' : 'documents'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <DocumentCard
                        key={cert.id}
                        document={cert}
                        onDelete={(id) => {
                          setDocumentToDelete(id);
                          setIsDeleteModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
                    <FaFileAlt className="text-4xl text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-3">No documents found</h4>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    This employee doesn't have any documents yet. Upload important documents like IDs, contracts, certificates, etc.
                  </p>
                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <FaUpload /> Upload First Document
                  </button>
                </div>
              )}
            </div>

            {/* Employment Tab - Only show in edit mode */}
            {isEdit && (
              <div className={`space-y-8 ${activeTab === "employment" ? "block" : "hidden"} tab-employment`}>
                <SectionHeader 
                  title="Employment Details" 
                  description="Employment information, room assignment, and wage details"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Employee Code"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                    error={formErrors.employee_code}
                    required
                    placeholder="e.g., EMP-001"
                  />
                  
                  <InputField
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    error={formErrors.joining_date}
                    required
                  />
                  
                  <SelectField
                    label="Room"
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    options={departments}
                    error={formErrors.room_id}
                    required
                    placeholder="-- Select Room --"
                  />
                  
                  <SelectField
                    label="Designation"
                    name="designation_id"
                    value={formData.designation_id}
                    onChange={handleChange}
                    options={designations}
                    error={formErrors.designation_id}
                    required
                    placeholder={departments.length === 0 ? "-- Select Room First --" : "-- Select Designation --"}
                    disabled={!formData.room_id || designations.length === 0}
                  />
                  
                  <SelectField
                    label="Employment Type"
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    options={[
                      { value: "Full-time", label: "Full-time" },
                      { value: "Part-time", label: "Part-time" },
                      { value: "Contract", label: "Contract" },
                      { value: "Internship", label: "Internship" },
                      { value: "Casual", label: "Casual" },
                    ]}
                    error={formErrors.employment_type}
                    required
                    placeholder="-- Select Type --"
                  />
                  
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "On Probation", label: "On Probation" },
                      { value: "On Leave", label: "On Leave" },
                      { value: "Terminated", label: "Terminated" },
                      { value: "Inactive", label: "Inactive" },
                    ]}
                    error={formErrors.status}
                    required
                    placeholder="-- Select Status --"
                  />
                  
                  <InputField
                    label="Hourly Wage (AUD)"
                    name="hourly_wage"
                    type="number"
                    value={formData.hourly_wage}
                    onChange={handleChange}
                    error={formErrors.hourly_wage}
                    placeholder="e.g., 32.50"
                    step="0.01"
                    min="0"
                  />
                  
                  <div className="md:col-span-2">
                    <SelectField
                      label="Reporting Manager (Optional)"
                      name="reporting_manager_id"
                      value={formData.reporting_manager_id}
                      onChange={handleChange}
                      options={managers}
                      error={formErrors.reporting_manager_id}
                      placeholder="-- Select Reporting Manager --"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payroll Tab - Only show in edit mode */}
            {isEdit && (
              <div className={`space-y-8 ${activeTab === "payroll" ? "block" : "hidden"} tab-payroll`}>
                <SectionHeader 
                  title="Payroll Information" 
                  description="Payroll, tax, and superannuation details (AU specific)"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Tax File Number (TFN)"
                    name="tax_file_number"
                    value={formData.tax_file_number}
                    onChange={handleChange}
                    error={formErrors.tax_file_number}
                    placeholder="Enter TFN"
                  />
                  
                  <InputField
                    label="Superannuation Fund Name"
                    name="superannuation_fund_name"
                    value={formData.superannuation_fund_name}
                    onChange={handleChange}
                    error={formErrors.superannuation_fund_name}
                    placeholder="e.g., AustralianSuper"
                  />
                  
                  <InputField
                    label="Superannuation Member Number"
                    name="superannuation_member_number"
                    value={formData.superannuation_member_number}
                    onChange={handleChange}
                    error={formErrors.superannuation_member_number}
                    placeholder="Enter member number"
                  />
                  
                  <InputField
                    label="Bank BSB"
                    name="bank_bsb"
                    value={formData.bank_bsb}
                    onChange={handleChange}
                    error={formErrors.bank_bsb}
                    placeholder="000-000"
                  />
                  
                  <InputField
                    label="Bank Account Number"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    error={formErrors.bank_account_number}
                    placeholder="Enter account number"
                  />
                  
                  <InputField
                    label="Visa Type"
                    name="visa_type"
                    value={formData.visa_type}
                    onChange={handleChange}
                    error={formErrors.visa_type}
                    placeholder="e.g., Permanent Residency"
                  />
                  
                  <div className="md:col-span-2">
                    <InputField
                      label="Visa Expiry Date"
                      name="visa_expiry_date"
                      type="date"
                      value={formData.visa_expiry_date}
                      onChange={handleChange}
                      error={formErrors.visa_expiry_date}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/employees")}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              
              {activeTab !== "payroll" && isEdit ? (
                <button
                  type="button"
                  onClick={goToNextTab}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  Next
                  <FaArrowLeft className="text-sm rotate-180" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-sm" />
                      {isEdit ? "Update Employee" : "Create Employee"}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Required Fields Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Fields marked with <span className="text-red-500">*</span> are required.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {!isEdit ? "After creating the basic profile, you'll be redirected to add employment and payroll details." : "Update employee information as needed."}
            </p>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {isEdit && (
        <DocumentUploadModal
          isOpen={isCertificateModalOpen}
          onClose={() => {
            setIsCertificateModalOpen(false);
            setCertificateError(null);
          }}
          onSubmit={handleUploadDocument}
          employeeId={id}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}
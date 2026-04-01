// src/pages/Public/PublicEmployeeForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  FaArrowLeft,
  FaInfoCircle,
  FaShieldAlt,
  FaMedkit,
  FaGavel,
  FaUserShield,
  FaClipboardList,
  FaIdCard,
  FaPassport,
  FaGraduationCap,
  FaCertificate,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaTrash,
  FaEye,
  FaDownload,
  FaPlus,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  createEmployeeBasic,
  getDepartmentsByOrganization,
  getDesignationsByDeptId,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocuments
} from '../../services/employeeService';

// ============================================
// STATIC MANDATORY CERTIFICATES DATA
// ============================================
const MANDATORY_CERTIFICATES = {
  mandatory_checks: {
    title: "🛡️ Mandatory Certificates & Checks",
    icon: <FaShieldAlt />,
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800",
    badgeColor: "bg-purple-100 text-purple-800",
    items: [
      {
        id: "wwcc",
        name: "Working With Children Check",
        type: "Working With Children Check",
        required: true,
        hasExpiry: true,
        expiryYears: 5,
        description: "Employee type, linked to service",
        icon: "🆔",
      },
      {
        id: "first_aid",
        name: "First Aid Certification (HLTAID012)",
        type: "First Aid Certificate",
        required: true,
        hasExpiry: true,
        expiryYears: 3,
        description: "HLTAID012 including CPR, Asthma & Anaphylaxis management",
        icon: "🚑",
      },
      {
        id: "police_check",
        name: "National Police Check",
        type: "Police Check",
        required: true,
        hasExpiry: true,
        expiryYears: 3,
        description: "Current National Police Check",
        icon: "👮",
      },
      {
        id: "mandatory_reporting",
        name: "Mandatory Reporting Training",
        type: "Mandatory Reporting",
        required: true,
        hasExpiry: false,
        description: "Protecting Children – Victoria",
        icon: "📋",
      },
      {
        id: "child_safe",
        name: "Child Safe Standards Awareness",
        type: "Child Safe Standards",
        required: true,
        hasExpiry: false,
        description: "Child Safe Standards Awareness Training",
        icon: "🛡️",
      },
    ],
  },
  qualifications: {
    title: "🎓 Qualifications",
    icon: <FaGraduationCap />,
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    badgeColor: "bg-blue-100 text-blue-800",
    items: [
      {
        id: "cert_3",
        name: "Certificate III in Early Childhood Education & Care",
        type: "Certificate III",
        required: true,
        hasExpiry: false,
        description: "Minimum qualification for educators",
        icon: "🎓",
      },
      {
        id: "diploma",
        name: "Diploma in Early Childhood Education & Care",
        type: "Diploma",
        required: false,
        hasExpiry: false,
        description: "Advanced qualification for room leaders",
        icon: "📜",
      },
      {
        id: "enrollment_proof",
        name: "Currently Enrolled towards Certificate III",
        type: "Enrollment Proof",
        required: false,
        hasExpiry: true,
        expiryYears: 1,
        description: "Proof of current enrollment in qualification",
        icon: "📝",
      },
    ],
  },
  health_safety: {
    title: "🏥 Health & Safety Compliance",
    icon: <FaMedkit />,
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    badgeColor: "bg-green-100 text-green-800",
    items: [
      {
        id: "immunisation",
        name: "Immunisation Record",
        type: "Immunisation Record",
        required: true,
        hasExpiry: false,
        description: "Flu and Pertussis recommended for childcare workers",
        icon: "💉",
      },
      {
        id: "medical_fitness",
        name: "Medical Fitness Declaration",
        type: "Medical Fitness",
        required: true,
        hasExpiry: false,
        description: "Medical fitness to work with children",
        icon: "🩺",
      },
    ],
  },
  identity_legal: {
    title: "🪪 Identity & Legal",
    icon: <FaIdCard />,
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    badgeColor: "bg-orange-100 text-orange-800",
    items: [
      {
        id: "proof_of_identity",
        name: "Proof of Identity",
        type: "Proof of Identity",
        required: true,
        hasExpiry: false,
        description: "Passport or Driver's Licence",
        icon: "🛂",
      },
      {
        id: "right_to_work",
        name: "Right to Work in Australia",
        type: "Right to Work",
        required: true,
        hasExpiry: false,
        description: "Proof of Australian citizenship or valid work visa",
        icon: "🇦🇺",
      },
      {
        id: "visa",
        name: "Visa (if applicable)",
        type: "Visa",
        required: false,
        hasExpiry: true,
        description: "Current visa for non-citizens",
        icon: "🛂",
      },
    ],
  },
  professional: {
    title: "📋 Professional Compliance",
    icon: <FaGavel />,
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    badgeColor: "bg-red-100 text-red-800",
    items: [
      {
        id: "code_of_conduct",
        name: "Signed Code of Conduct",
        type: "Code of Conduct",
        required: true,
        hasExpiry: false,
        description: "Signed Code of Conduct agreement",
        icon: "📄",
      },
      {
        id: "confidentiality",
        name: "Signed Confidentiality Agreement",
        type: "Confidentiality Agreement",
        required: true,
        hasExpiry: false,
        description: "Signed Confidentiality Agreement",
        icon: "🔒",
      },
    ],
  },
  operational: {
    title: "⚙️ Operational Readiness",
    icon: <FaClipboardList />,
    color: "teal",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-800",
    badgeColor: "bg-teal-100 text-teal-800",
    items: [
      {
        id: "induction",
        name: "Completed Induction",
        type: "Induction",
        required: true,
        hasExpiry: false,
        description: "Emergency procedures, supervision, child protection",
        icon: "📋",
      },
      {
        id: "food_safety",
        name: "Food Safety Awareness",
        type: "Food Safety",
        required: false,
        hasExpiry: false,
        description: "If handling food",
        icon: "🍽️",
      },
      {
        id: "safe_sleep",
        name: "Safe Sleep & SIDS Training",
        type: "Safe Sleep Training",
        required: true,
        hasExpiry: false,
        description: "For educators working with children under 2 years",
        icon: "😴",
      },
    ],
  },
  annual_training: {
    title: "📅 Annual Training Requirements",
    icon: <FaCalendarAlt />,
    color: "pink",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-800",
    badgeColor: "bg-pink-100 text-pink-800",
    items: [
      {
        id: "sun_smart",
        name: "Sun Smart Training",
        type: "Sun Smart",
        required: true,
        hasExpiry: true,
        expiryYears: 1,
        description: "Annual sun safety awareness training",
        icon: "☀️",
      },
      {
        id: "allergies",
        name: "All About Allergies",
        type: "Allergies Training",
        required: true,
        hasExpiry: true,
        expiryYears: 1,
        description: "Annual allergy awareness and management training",
        icon: "⚠️",
      },
      {
        id: "food_safety_annual",
        name: "Do Food Safety",
        type: "Food Safety Annual",
        required: true,
        hasExpiry: true,
        expiryYears: 1,
        description: "Annual food safety certification",
        icon: "🍲",
      },
    ],
  },
};

const STAFF_FILE_REQUIREMENTS = [
  { id: "wwcc_copy", name: "WWCC Copy", required: true },
  { id: "qualification", name: "Qualification Certificate", required: true },
  { id: "first_aid_copy", name: "First Aid Certificate", required: true },
  { id: "police_check_copy", name: "Police Check", required: true },
  { id: "id_proof", name: "ID Proof", required: true },
  { id: "immunisation_record", name: "Immunisation Record", required: true },
  { id: "training_certs", name: "Training Certificates", required: true },
  { id: "signed_policies", name: "Signed Policies", required: true },
  { id: "induction_checklist", name: "Induction Checklist", required: true },
];

// ============================================
// DOCUMENT UPLOAD MODAL
// ============================================
const DocumentUploadModal = ({ isOpen, onClose, employeeId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    document_type: '',
    issue_date: '',
    expiry_date: '',
    file: null,
    file_name: '',
  });

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
      actualFormData.append('file_name', formData.file_name);
      
      if (formData.issue_date) {
        actualFormData.append('issue_date', formData.issue_date);
      }
      if (formData.expiry_date) {
        actualFormData.append('expiry_date', formData.expiry_date);
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

  const allDocumentTypes = Object.values(MANDATORY_CERTIFICATES).flatMap(
    category => category.items.map(item => ({
      value: item.type,
      label: `${item.icon} ${item.name} ${item.required ? '(Required)' : ''}`,
      category: category.title
    }))
  );

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
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Document Type</option>
                {allDocumentTypes.map((doc, idx) => (
                  <option key={idx} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name *
              </label>
              <input
                type="text"
                value={formData.file_name}
                onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                placeholder="Enter a descriptive file name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
// DOCUMENT CARD COMPONENT
// ============================================
const DocumentCard = ({ document, onDelete, onView }) => {
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
    if (!fileName) return <FaFileAlt className="text-gray-400 text-2xl" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return <FaFilePdf className="text-red-500 text-2xl" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500 text-2xl" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-green-500 text-2xl" />;
    return <FaFileAlt className="text-gray-500 text-2xl" />;
  };

  const baseUrl = 'https://api.chrispp.com';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getFileIcon(document.file_name)}
          <div>
            <h4 className="font-semibold text-gray-800">{document.document_type || 'Document'}</h4>
            <p className="text-sm text-gray-500">{document.file_name}</p>
            {document.expiry_date && (
              <span className="text-xs text-yellow-600 mt-1 inline-block">
                Expires: {formatDate(document.expiry_date)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {document.file_url && (
            <button
              onClick={() => onView(document)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="View"
            >
              <FaEye />
            </button>
          )}
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Uploaded: {formatDate(document.created_at)}
        </span>
        {document.file_url && (
          <a
            href={`${baseUrl}${document.file_url}`}
            download
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaDownload size={10} /> Download
          </a>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPLIANCE CHECKLIST COMPONENT
// ============================================
const ComplianceChecklist = ({ certificates = [] }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(MANDATORY_CERTIFICATES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    )
  );

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const isCertificateUploaded = (certType) => {
    return certificates.some(
      doc => doc.document_type === certType || 
             doc.document_type?.includes(certType) ||
             (certType === "Working With Children Check" && doc.document_type?.includes("WWCC")) ||
             (certType === "First Aid Certificate" && doc.document_type?.includes("First Aid"))
    );
  };

  const totalRequired = Object.values(MANDATORY_CERTIFICATES).flatMap(cat =>
    cat.items.filter(item => item.required)
  ).length;

  const uploadedRequired = Object.values(MANDATORY_CERTIFICATES)
    .flatMap(cat => cat.items.filter(item => item.required))
    .filter(item => isCertificateUploaded(item.type)).length;

  const compliancePercentage = Math.round((uploadedRequired / totalRequired) * 100) || 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Compliance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Summary</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Compliance</span>
              <span className={`text-sm font-bold ${getStatusColor(compliancePercentage)}`}>
                {compliancePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  compliancePercentage >= 80 ? "bg-green-500" :
                  compliancePercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${compliancePercentage}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              {uploadedRequired}/{totalRequired}
            </p>
            <p className="text-xs text-gray-500">Required Documents</p>
          </div>
        </div>
      </div>

      {/* Staff File Requirements */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800">Staff File Requirements</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STAFF_FILE_REQUIREMENTS.map(req => {
              const isUploaded = certificates.some(doc =>
                doc.document_type?.includes(req.name) ||
                (req.name === "WWCC Copy" && doc.document_type?.includes("WWCC")) ||
                (req.name === "First Aid Certificate" && doc.document_type?.includes("First Aid"))
              );
              return (
                <div key={req.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {isUploaded ? (
                    <FaCheck className="text-green-500 flex-shrink-0" />
                  ) : (
                    <FaTimes className="text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${isUploaded ? "text-gray-800" : "text-gray-500"}`}>
                    {req.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Categories */}
      {Object.entries(MANDATORY_CERTIFICATES).map(([key, category]) => {
        const uploadedInCategory = category.items.filter(item =>
          isCertificateUploaded(item.type)
        ).length;

        return (
          <div key={key} className={`rounded-lg border overflow-hidden ${category.borderColor || "border-gray-200"}`}>
            <button
              onClick={() => toggleCategory(key)}
              className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-colors ${category.bgColor || "bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-${category.color || "gray"}-600 text-xl`}>{category.icon}</span>
                <div className="text-left">
                  <h3 className={`text-md font-semibold ${category.textColor || "text-gray-800"}`}>
                    {category.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {uploadedInCategory}/{category.items.length} documents
                  </p>
                </div>
              </div>
              {expandedCategories[key] ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
            </button>

            {expandedCategories[key] && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 bg-white">
                <div className="space-y-3">
                  {category.items.map(item => {
                    const uploaded = isCertificateUploaded(item.type);
                    return (
                      <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg ${item.bgColor || "bg-gray-50"}`}>
                        <div className="mt-1">
                          {uploaded ? (
                            <FaCheck className="text-green-500" />
                          ) : item.required ? (
                            <FaExclamationTriangle className="text-red-500" />
                          ) : (
                            <FaInfoCircle className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <p className={`font-medium ${item.textColor || "text-gray-800"}`}>
                                {item.name}
                                {item.required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN PUBLIC EMPLOYEE FORM
// ============================================
const PublicEmployeeForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    personal_email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    employee_code: '',
    joining_date: new Date().toISOString().split('T')[0],
    department_id: '',
    designation_id: '',
    employment_type: 'Full-time',
    status: 'On Probation',
    hourly_wage: '',
  });

  // Get organization ID from URL or use default
  useEffect(() => {
    const orgId = searchParams.get('org_id') || localStorage.getItem('default_org_id') || '15';
    setOrganizationId(orgId);
    fetchDepartments(orgId);
    fetchDesignations(orgId);
    
    // Pre-fill from URL
    const firstName = searchParams.get('first_name');
    const lastName = searchParams.get('last_name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (firstName || lastName || email) {
      setFormData(prev => ({
        ...prev,
        first_name: firstName || prev.first_name,
        last_name: lastName || prev.last_name,
        personal_email: email || prev.personal_email,
        phone_number: phone || prev.phone_number,
      }));
    }
  }, [searchParams]);

  // Fetch documents when employee is created
  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      toast.error('Failed to delete document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (!formData.first_name || !formData.last_name || !formData.personal_email || !formData.phone_number) {
      toast.error('Please fill all required fields');
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await createEmployeeBasic({
        organization_id: organizationId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        personal_email: formData.personal_email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        employee_code: formData.employee_code,
        joining_date: formData.joining_date,
        department_id: formData.department_id,
        designation_id: formData.designation_id,
        employment_type: formData.employment_type,
        status: formData.status,
        hourly_wage: formData.hourly_wage,
      });
      
      const newId = response.data?.data?.employee?.id || response.data?.data?.id;
      
      if (newId) {
        setEmployeeId(newId);
        setSubmitted(true);
        toast.success('Employee created successfully! Now upload your documents.');
      } else {
        toast.success('Application submitted successfully!');
        setSubmitted(true);
      }
      
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        employeeId={employeeId}
        onUploadSuccess={handleUploadSuccess}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Employee Application Form</h1>
          <p className="text-gray-600 mt-2">Please fill in your details to apply</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-500 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Application Submitted!</p>
                <p className="text-sm text-green-700">
                  Your employee profile has been created. You can now upload your documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          {/* Personal Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" /> Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="personal_email"
                    value={formData.personal_email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="employee@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+61 123 456 789"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBriefcase className="text-green-600" /> Employment Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Code (Optional)
                </label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="EMP-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Start Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position/Designation
                </label>
                <select
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  {designations.map(desig => (
                    <option key={desig.id} value={desig.id}>{desig.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Hourly Rate (AUD)
                </label>
                <input
                  type="number"
                  name="hourly_wage"
                  value={formData.hourly_wage}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="32.50"
                />
              </div>
            </div>
          </div>

          {/* Submit Button - Only show if not submitted */}
          {!submitted && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Submit Application
              </button>
            </div>
          )}
        </form>

        {/* Documents Section - Show after submission */}
        {submitted && employeeId && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaUpload className="text-purple-600" /> Documents & Certificates
                </h2>
                <p className="text-gray-600 text-sm">Upload your certificates and documents</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode("checklist")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === "checklist"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Compliance Checklist
                  </button>
                </div>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FaPlus /> Upload Document
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onDelete={handleDeleteDocument}
                      onView={handleViewDocument}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Upload Document" to add your certificates</p>
                </div>
              )
            ) : (
              <ComplianceChecklist certificates={documents} />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your information will be kept confidential and used only for employment purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicEmployeeForm;
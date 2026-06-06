import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUpload,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaEye,
  FaTrash,
  FaEdit,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaInfoCircle,
} from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import {
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  updateDocumentDates,
  verifyEmployeeDocument,
} from '../../services/employeeService';

// MANDATORY CERTIFICATES CHECKLIST (8 items)
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
    type: "Qualification Certificate",
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
// DOCUMENT CARD COMPONENT
// ============================================
const DocumentCard = ({ document, onDelete, onView, onEdit }) => {
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

  const getStatusBadge = (verify) => {
    if (verify === 'approved') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
          <FaCheckCircle size={10} /> Approved
        </span>
      );
    }
    if (verify === 'rejected') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold">
          <FaTimes size={10} /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">
        <FaClock size={10} /> Pending
      </span>
    );
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className={`bg-white border ${document.verify === 'approved' ? 'border-green-200 shadow-sm' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow relative overflow-hidden`}>
      {document.verify === 'approved' && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-10">
          <FaCheckCircle size={60} className="text-green-500 -mr-4 -mt-4" />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {getFileIcon(document.file_name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800">{document.file_name || document.document_type}</p>
              {getStatusBadge(document.verify)}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="text-gray-500">
                <FaCalendarAlt className="inline mr-1 text-gray-400" size={10} />
                Issue: {formatDate(document.issue_date)}
              </span>
              <span className={isExpired(document.expiry_date) ? 'text-red-600' : 'text-gray-500'}>
                <FaClock className="inline mr-1" size={10} />
                Expiry: {formatDate(document.expiry_date)}
                {isExpired(document.expiry_date) && <span className="ml-1 text-red-600 font-semibold">(Expired)</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {document.verify !== 'approved' && (
            <button
              onClick={() => onEdit(document)}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
              title="Edit Dates"
            >
              <FaEdit size={12} />
            </button>
          )}
          {document.file_url && (
            <button
              onClick={() => onView(document)}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
              title="View Document"
            >
              <FaEye size={12} />
            </button>
          )}
          {document.verify !== 'approved' && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
              title="Delete"
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// DOCUMENT UPLOAD MODAL
// ============================================
const DocumentUploadModal = ({ isOpen, onClose, employeeId, onUploadSuccess, preselectedDocumentType = null }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showDocumentNameInput, setShowDocumentNameInput] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    custom_document_name: '',
    file: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: preselectedDocumentType || '',
        custom_document_name: '',
        file: null,
      });
      setShowDocumentNameInput(preselectedDocumentType === 'Other Document');
      setError('');
    }
  }, [isOpen, preselectedDocumentType]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, file: file });
    }
  };

  const handleDocumentTypeChange = (e) => {
    const value = e.target.value;
    setShowDocumentNameInput(value === 'Other Document');
    setFormData({
      ...formData,
      document_type: value,
      custom_document_name: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    let documentTypeToSend = formData.document_type;

    if (formData.document_type === 'Other Document' && formData.custom_document_name.trim()) {
      documentTypeToSend = formData.custom_document_name.trim();
    } else if (!formData.document_type) {
      setError('Please select a document type');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const actualFormData = new FormData();
      actualFormData.append('employee_id', employeeId);
      actualFormData.append('document_type', documentTypeToSend);
      actualFormData.append('file', formData.file);

      const response = await uploadEmployeeDocument(actualFormData);

      const extractedIssueDate = response.data?.issue_date;
      const extractedExpiryDate = response.data?.expiry_date;
      const documentId = response.data?.document_id || response.data?.id;

      if ((extractedIssueDate || extractedExpiryDate) && documentId) {
        await updateDocumentDates(documentId, {
          issue_date: extractedIssueDate || '',
          expiry_date: extractedExpiryDate || ''
        });
        toast.success('Document uploaded! Dates automatically extracted from file.');
      } else {
        toast.success('Document uploaded successfully! You can add issue/expiry dates by clicking Edit.');
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
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

            {showDocumentNameInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={formData.custom_document_name}
                  onChange={(e) => setFormData({ ...formData, custom_document_name: e.target.value })}
                  placeholder="Enter document name (e.g., Resume, Cover Letter, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={showDocumentNameInput}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will be used as the document type
                </p>
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
// DOCUMENT METADATA MODAL
// ============================================
const DocumentMetadataModal = ({ isOpen, onClose, document, onUpdateSuccess }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    if (isOpen && document) {
      setFormData({
        issue_date: document.issue_date || '',
        expiry_date: document.expiry_date || '',
      });
      setError('');
    }
  }, [isOpen, document]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      await updateDocumentDates(document.id, {
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date
      });
      toast.success('Document dates updated successfully!');
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update document dates');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Document Dates</h2>
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
                Document Name
              </label>
              <p className="text-sm text-gray-800 font-medium bg-gray-50 p-2 rounded">
                {document?.file_name || document?.document_type}
              </p>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">Leave empty if not applicable</p>
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
              <p className="text-xs text-gray-500 mt-1">Leave empty if no expiry date</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <FaSpinner className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// CHECKLIST ITEM COMPONENT
// ============================================
const ChecklistItem = ({ item, isUploaded, documents, onUpload, onDelete, onView, onEdit }) => {
  const itemDocuments = documents.filter(doc =>
    doc.document_type === item.type ||
    doc.document_type?.includes(item.type.split(' ')[0])
  );

  const hasApprovedDoc = itemDocuments.some(doc => doc.verify === 'approved');

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

            {itemDocuments.length > 0 && (
              <div className="mt-3 space-y-2">
                {itemDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDelete={onDelete}
                    onView={onView}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {!hasApprovedDoc ? (
          <button
            onClick={() => onUpload(item.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${isUploaded ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg whitespace-nowrap ml-3`}
          >
            {isUploaded ? <FaEdit size={12} /> : <FaUpload size={12} />} {isUploaded ? 'Replace' : 'Upload'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg whitespace-nowrap ml-3 font-medium">
            <FaCheckCircle size={12} /> Verified
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// OTHER DOCUMENTS SECTION
// ============================================
const OtherDocumentsSection = ({ documents, onUpload, onDelete, onView, onEdit }) => {
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
            <div className="grid grid-cols-1 gap-3">
              {otherDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={onDelete}
                  onView={onView}
                  onEdit={onEdit}
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

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [metadata, setMetadata] = useState({ issueDate: '', expiryDate: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Get logged in employee from localStorage
      const employeeStr = localStorage.getItem('employee');
      if (!employeeStr) {
        // Fallback to user if employee not found
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          toast.error('User session not found');
          return;
        }
        const user = JSON.parse(userStr);
        const response = await axiosClient.get(`/employeedata/${user.id}`);
        if (response.data?.success && response.data?.data) {
          const employee = response.data.data;
          setEmployeeId(employee.id);
          if (employee.documents) {
            setDocuments(employee.documents);
          }
        }
        return;
      }

      const employee = JSON.parse(employeeStr);
      setEmployeeId(employee.id);

      // Use the employeedata endpoint with employee.id
      const response = await axiosClient.get(`/employeedata/${employee.id}`);

      if (response.data?.success && response.data?.data) {
        const employee = response.data.data;
        if (employee.documents) {
          setDocuments(employee.documents);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const isCertificateUploaded = (type) => {
    return documents.some(doc => doc.document_type === type);
  };

  const getDocumentsForCertificate = (type) => {
    return documents.filter(doc => doc.document_type === type);
  };

  const openUploadModal = (cert) => {
    setSelectedDocumentType(cert);
    setShowUploadModal(true);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteEmployeeDocument(docId);
      toast.success('Document deleted successfully');
      fetchProfile();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = (document) => {
    if (document.file_url) {
      window.open(`https://api.chrispp.au${document.file_url}`, '_blank');
    }
  };

  const handleEditDocument = (doc) => {
    setSelectedDocument(doc);
    setShowMetadataModal(true);
  };

  const handleUploadSuccess = () => {
    fetchProfile();
  };

  const handleUpdateSuccess = () => {
    fetchProfile();
  };

  const uploadedCount = MANDATORY_CERTIFICATES_LIST.filter(cert => 
    isCertificateUploaded(cert.type)
  ).length;
  const completionPercentage = Math.round((uploadedCount / MANDATORY_CERTIFICATES_LIST.length) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              onEdit={handleEditDocument}
            />
          ))}
        </div>

        <OtherDocumentsSection
          documents={documents}
          onUpload={openUploadModal}
          onDelete={handleDeleteDocument}
          onView={handleViewDocument}
          onEdit={handleEditDocument}
        />

        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          employeeId={employeeId}
          onUploadSuccess={handleUploadSuccess}
          preselectedDocumentType={selectedDocumentType}
        />

        <DocumentMetadataModal
          isOpen={showMetadataModal}
          onClose={() => setShowMetadataModal(false)}
          document={selectedDocument}
          onUpdateSuccess={handleUpdateSuccess}
        />

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
};

export default Documents;

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import usePermissions from "../../hooks/usePermissions";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaFileContract,
  FaUniversity,
  FaExclamationTriangle,
  FaArrowLeft,
  FaDollarSign,
  FaShieldAlt,
  FaPassport,
  FaCalendarAlt,
  FaEdit,
  FaFileAlt,
  FaHistory,
  FaPrint,
  FaShare,
  FaQrcode,
  FaIdCard,
  FaTasks,
  FaChartLine,
  FaDownload,
  FaCopy,
  FaExternalLinkAlt,
  FaEllipsisH,
  FaPlus,
  FaTrash,
  FaEye,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaUpload,
  FaGavel,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { HiOutlineDocumentReport, HiOutlineUserGroup } from "react-icons/hi";
import {
  getEmployee,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  verifyEmployeeDocument,
  changeDocumentStatus,
} from "../../services/employeeService";
import axiosClient from "../../axiosClient";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const REQUIRED_DOCUMENT_TYPES = [
  "Working With Children Check",
  "First Aid Certificate",
  "Police Check",
  "Qualification Certificate",
  "Immunisation Record",
  "Code of Conduct",
  "Induction",
  "Right to Work",
];

const normalizeDocumentType = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const isRequiredDocument = (documentType) => {
  const normalizedType = normalizeDocumentType(documentType);
  if (!normalizedType) return false;

  return REQUIRED_DOCUMENT_TYPES.some((requiredType) => {
    const normalizedRequiredType = normalizeDocumentType(requiredType);
    return (
      normalizedType === normalizedRequiredType ||
      normalizedType.includes(normalizedRequiredType) ||
      normalizedRequiredType.includes(normalizedType)
    );
  });
};

// Detail Field Component
const DetailField = ({ icon, label, value, className = "" }) => (
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
const StatCard = ({ icon, label, value, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-lg font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

// Action Button Component
const ActionButton = ({
  icon,
  label,
  onClick,
  color = "bg-blue-600 hover:bg-blue-700",
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${color}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Document Card Component
const DocumentCard = ({ document, onView, onDelete, canDelete, onStatusChange }) => {
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="text-gray-400" />;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "pdf") return <FaFilePdf className="text-red-500" />;
    if (["doc", "docx"].includes(ext))
      return <FaFileWord className="text-blue-500" />;
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
      return <FaFileImage className="text-green-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = () => {
    if (onStatusChange) {
      const selectClass = document.verify === "approved"
        ? "bg-green-50 text-green-700 border-green-200"
        : document.verify === "rejected"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-amber-50 text-amber-700 border-amber-200";

      return (
        <select
          value={document.verify || "pending"}
          onChange={(e) => onStatusChange(document, e.target.value)}
          className={`px-2.5 py-1 border rounded-full text-[11px] font-semibold focus:outline-none cursor-pointer shadow-sm transition-colors ${selectClass}`}
        >
          {(!document.verify || (document.verify !== "approved" && document.verify !== "rejected")) && (
            <option value="pending" disabled>⏳ Pending</option>
          )}
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
      );
    }

    if (document.verify === "approved") {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
          <FaCheckCircle size={10} /> Approved
        </span>
      );
    }

    if (document.verify === "rejected") {
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

  const required = isRequiredDocument(document.document_type);
  const expired =
    document.expiry_date && new Date(document.expiry_date) < new Date();

  return (
    <div
      className={`bg-white border ${document.verify === "approved" ? "border-green-200" : "border-gray-200"} rounded-lg p-4 hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      {document.verify === "approved" && (
        <FaCheckCircle
          size={60}
          className="absolute -right-3 -top-3 text-green-500 opacity-10 pointer-events-none"
        />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="text-xl mt-1">{getFileIcon(document.file_name)}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800">
                {document.file_name || document.document_type || "Document"}
              </h4>
              {getStatusBadge()}
              {required && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-semibold">
                  Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{document.document_type}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {document.issue_date && (
                <span className="text-xs text-gray-500">
                  Issued: {formatDate(document.issue_date)}
                </span>
              )}
              {document.expiry_date && (
                <span
                  className={`text-xs ${expired ? "text-red-600 font-semibold" : "text-gray-500"}`}
                >
                  Expires: {formatDate(document.expiry_date)}
                  {expired ? " (Expired)" : ""}
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
          {canDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Document"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Uploaded: {formatDate(document.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {document.file_url && (
            <a
              href={`https://api.chrispp.au${document.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FaDownload size={12} /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Upload Modal
const DocumentUploadModal = ({
  isOpen,
  onClose,
  employeeId,
  onUploadSuccess,
  preselectedDocumentType,
  documentMasters,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomDocType, setShowCustomDocType] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    custom_document_type: "",
    issue_date: "",
    expiry_date: "",
    file: null,
    file_name: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: preselectedDocumentType || "",
        custom_document_type: "",
        issue_date: "",
        expiry_date: "",
        file: null,
        file_name: "",
      });
      setShowCustomDocType(
        preselectedDocumentType === "Other" ||
          preselectedDocumentType === "Other Document",
      );
      setError("");
    }
  }, [isOpen, preselectedDocumentType]);

  const handleDocTypeChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, document_type: val }));
    setShowCustomDocType(val === "Other" || val === "Other Document");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileNameWithoutExt = file.name.split(".").slice(0, -1).join(".");

      setFormData((prev) => ({
        ...prev,
        file: file,
        file_name:
          prev.file_name ||
          fileNameWithoutExt
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        document_type:
          prev.document_type ||
          preselectedDocumentType ||
          fileNameWithoutExt
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const actualFormData = new FormData();

      actualFormData.append("employee_id", employeeId);

      const finalDocType = showCustomDocType
        ? formData.custom_document_type || "Other Document"
        : formData.document_type;
      actualFormData.append("document_type", finalDocType);

      actualFormData.append("file", formData.file);
      actualFormData.append(
        "file_name",
        formData.file_name || formData.file.name || "document",
      );

      if (formData.issue_date) {
        actualFormData.append("issue_date", formData.issue_date);
      }
      if (formData.expiry_date) {
        actualFormData.append("expiry_date", formData.expiry_date);
      }

      const orgId = localStorage.getItem("selectedOrgId");
      if (orgId) {
        actualFormData.append("organization_id", orgId);
      }

      await uploadEmployeeDocument(actualFormData);

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error("Upload error details:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        setError(
          errorMessages.join(", ") ||
            "Validation failed. Please check all fields.",
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to upload document. Please try again.",
        );
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
            <h3 className="text-xl font-semibold text-gray-800">
              Upload Document
            </h3>
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
                onChange={handleDocTypeChange}
                disabled={!!preselectedDocumentType}
                className={`w-full px-3 py-2 border rounded-lg ${
                  preselectedDocumentType
                    ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                required
              >
                <option value="">Select Type</option>
                {documentMasters && documentMasters.length > 0 ? (
                  <>
                    {documentMasters.map((master) => (
                      <option key={master.id} value={master.document_type}>
                        {master.icon || "📁"} {master.document_name}
                      </option>
                    ))}
                    <option value="Other Document">📁 Other Document</option>
                  </>
                ) : (
                  <>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Visa">Visa</option>
                    <option value="Work Permit">Work Permit</option>
                    <option value="Employment Contract">
                      Employment Contract
                    </option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Experience Letter">Experience Letter</option>
                    <option value="Salary Slip">Salary Slip</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Tax Document">Tax Document</option>
                    <option value="Education Certificate">
                      Education Certificate
                    </option>
                    <option value="Professional Certificate">
                      Professional Certificate
                    </option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>

            {showCustomDocType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Document Type *
                </label>
                <input
                  type="text"
                  value={formData.custom_document_type || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custom_document_type: e.target.value,
                    })
                  }
                  placeholder="Enter document type (e.g., Certificate of Service)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name *
              </label>
              <input
                type="text"
                value={formData.file_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, file_name: e.target.value })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
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

const FORM_META = {
  "staff-induction": {
    url: (empId) => `/staff-induction-form?employeeId=${empId}`,
    icon: FaClipboardList,
    colorBg: "bg-indigo-100 group-hover:bg-indigo-200",
    colorIcon: "text-indigo-600",
    colorBorder: "hover:border-indigo-500 hover:bg-indigo-50",
    description: "Complete or view staff induction checklist",
  },
  "pidtdc-form": {
    url: (empId) => `/person-in-day-to-day-charge-form?employeeId=${empId}`,
    icon: FaUser,
    colorBg: "bg-purple-100 group-hover:bg-purple-200",
    colorIcon: "text-purple-600",
    colorBorder: "hover:border-purple-500 hover:bg-purple-50",
    description:
      "Consent form for appointment as a Person in Day-to-Day Charge",
  },
  "child-safe-code-of-conduct": {
    url: (empId) => `/child-safe-code-of-policy-form?employeeId=${empId}`,
    icon: FaShieldAlt,
    colorBg: "bg-teal-100 group-hover:bg-teal-200",
    colorIcon: "text-teal-600",
    colorBorder: "hover:border-teal-500 hover:bg-teal-50",
    description: "Child safe code of conduct policy declaration",
  },
  "superannuation-form": {
    url: (empId) => `/superannuation?employeeId=${empId}`,
    icon: FaUniversity,
    colorBg: "bg-blue-100 group-hover:bg-blue-200",
    colorIcon: "text-blue-600",
    colorBorder: "hover:border-blue-500 hover:bg-blue-50",
    description: "Complete or update superannuation details",
  },
  "tfn-declaration": {
    url: (empId) => `/tfn-declaration?employeeId=${empId}`,
    icon: FaFileAlt,
    colorBg: "bg-green-100 group-hover:bg-green-200",
    colorIcon: "text-green-600",
    colorBorder: "hover:border-green-500 hover:bg-green-50",
    description: "Tax File Number declaration details",
  },
  "staff-record": {
    url: (empId) => `/staff-record-form?employeeId=${empId}`,
    icon: FaIdCard,
    colorBg: "bg-orange-100 group-hover:bg-orange-200",
    colorIcon: "text-orange-600",
    colorBorder: "hover:border-orange-500 hover:bg-orange-50",
    description: "Complete or update staff record details",
  },
  "prohibition-notice-declaration": {
    url: (empId) => `/prohibition-notice-declaration-form?employeeId=${empId}`,
    icon: FaGavel,
    colorBg: "bg-red-100 group-hover:bg-red-200",
    colorIcon: "text-red-600",
    colorBorder: "hover:border-red-500 hover:bg-red-50",
    description: "Prohibition notice declaration details",
  },
};

const SortableFormItem = ({ form, employeeId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: form.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease, shadow-md 200ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  const meta = FORM_META[form.slug] || {
    url: (empId) => `/dashboard?employeeId=${empId}`,
    icon: FaFileAlt,
    colorBg: "bg-gray-100 group-hover:bg-gray-200",
    colorIcon: "text-gray-600",
    colorBorder: "hover:border-gray-500 hover:bg-gray-50",
    description: "Compliance and onboarding details",
  };

  const IconComponent = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border rounded-xl transition-all group bg-white relative ${
        isDragging
          ? "border-blue-400 shadow-xl scale-[1.03] ring-4 ring-blue-50/50 cursor-grabbing"
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
      } ${meta.colorBorder}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none"
        title="Drag to reorder"
      >
        <svg
          className="w-4 h-4 text-gray-400 hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <div className={`p-3 rounded-lg transition-colors ${meta.colorBg}`}>
        <IconComponent className={`${meta.colorIcon} text-xl`} />
      </div>

      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-800 truncate">
            {form.form_name}
          </h4>
          {form.is_required === 1 && (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 font-bold rounded-full uppercase tracking-wider shrink-0">
              Required
            </span>
          )}
          {form.is_filled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200 shrink-0">
              <FaCheck size={9} className="shrink-0" />
              Filled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
              Not Filled
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate mt-0.5">
          {meta.description}
        </p>
      </div>

      <a
        href={meta.url(employeeId)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all ml-auto shrink-0 flex items-center justify-center cursor-pointer"
        title={`Open ${form.form_name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FaExternalLinkAlt size={14} />
      </a>
    </div>
  );
};

const SortableProfilePolicyItem = ({ policy, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: policy.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || "transform 200ms ease, shadow-md 200ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  const isViewed =
    policy.viewed === true ||
    policy.viewed === 1 ||
    String(policy.viewed).toLowerCase() === "true";

  const isAcknowledged =
    policy.acknowledged === true ||
    policy.acknowledged === 1 ||
    String(policy.acknowledged).toLowerCase() === "true";

  const targetLink = policy.link || policy.description;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border rounded-xl transition-all bg-white relative ${
        isDragging
          ? "border-blue-400 shadow-xl scale-[1.02] ring-4 ring-blue-50/50 cursor-grabbing"
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none shrink-0"
        title="Drag to reorder"
      >
        <svg
          className="w-4 h-4 text-gray-400 hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg select-none shrink-0">
        <FaShieldAlt className="text-xl" />
      </div>

      <div className="text-left flex-grow min-w-0 pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-800 break-words">
            {policy.policy_name}
          </h4>
          {policy.is_required === 1 && (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 font-bold rounded-full uppercase tracking-wider shrink-0">
              Required
            </span>
          )}
        </div>
        {targetLink && (
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate inline-flex max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate max-w-[280px]">{targetLink}</span>
            <FaExternalLinkAlt size={10} className="shrink-0" />
          </a>
        )}
      </div>

      {/* Viewed & Acknowledged Statuses */}
      <div className="shrink-0 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            isViewed
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-amber-100 text-amber-700 border border-amber-200"
          }`}
        >
          {isViewed ? (
            <>
              <FaCheck size={10} className="shrink-0" />
              Viewed
            </>
          ) : (
            "Not Viewed"
          )}
        </span>

        <span
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            isAcknowledged
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-amber-100 text-amber-700 border border-amber-200"
          }`}
        >
          {isAcknowledged ? (
            <>
              <FaCheck size={10} className="shrink-0" />
              Acknowledged
            </>
          ) : (
            "Not Acknowledged"
          )}
        </span>
      </div>
    </div>
  );
};

const SortableDocumentMasterItem = ({
  master,
  documents,
  onView,
  onDelete,
  canDelete,
  onUpload,
  onStatusChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: master.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || "transform 200ms ease, shadow-md 200ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  const itemDocuments = documents.filter(
    (doc) =>
      doc.document_type === master.document_type ||
      doc.document_type
        ?.toLowerCase()
        .includes(master.document_type.split(" ")[0].toLowerCase()),
  );

  const hasApprovedDoc = itemDocuments.some((doc) => doc.verify === "approved");
  const isUploaded = itemDocuments.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-xl p-4 transition-all bg-white relative ${
        isDragging
          ? "border-blue-400 shadow-xl scale-[1.02] ring-4 ring-blue-50/50 cursor-grabbing"
          : isUploaded
            ? "border-green-200 shadow-sm hover:shadow-md hover:border-green-300"
            : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 mt-0.5 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none shrink-0"
            title="Drag to reorder"
          >
            <svg
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <div className="text-xl shrink-0 mt-0.5 select-none">
            {master.icon || "📁"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800 break-words">
                {master.document_name}
              </h4>
              {master.is_required === 1 && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 font-bold rounded-full uppercase tracking-wider shrink-0">
                  Required
                </span>
              )}
              {master.has_expiry === 1 && (
                <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 font-bold rounded-full uppercase tracking-wider shrink-0">
                  Expires {master.expiry_years ? `${master.expiry_years}y` : ""}
                </span>
              )}
            </div>
            {master.description && (
              <p className="text-xs text-gray-500 mt-1 break-words">
                {master.description}
              </p>
            )}

            {/* Nested uploaded document cards */}
            {isUploaded && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {itemDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={onView}
                    onDelete={onDelete}
                    canDelete={canDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {!hasApprovedDoc ? (
            <button
              onClick={() => onUpload(master.document_type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${
                isUploaded
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white rounded-lg whitespace-nowrap`}
            >
              {isUploaded ? <FaEdit size={12} /> : <FaUpload size={12} />}
              {isUploaded ? "Replace" : "Upload"}
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg whitespace-nowrap font-semibold">
              <FaCheckCircle size={12} /> Verified
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OtherDocumentsSection = ({ documents, onView, onDelete, canDelete, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (documents.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-6 bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors border-b border-gray-100"
      >
        <div className="flex items-center gap-2">
          <FaFolder className="text-gray-500 text-lg" />
          <h3 className="font-semibold text-gray-800">Other Documents</h3>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            {documents.length}
          </span>
        </div>
        {isExpanded ? (
          <FaChevronUp className="text-gray-400" />
        ) : (
          <FaChevronDown className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={onView}
                onDelete={onDelete}
                canDelete={canDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formsList, setFormsList] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [documentMastersList, setDocumentMastersList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [preselectedDocType, setPreselectedDocType] = useState(null);
  const [policiesList, setPoliciesList] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    document: null,
    targetStatus: "",
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchForms = async () => {
    try {
      setLoadingForms(true);
      const response = await axiosClient.get("/form-masters", {
        params: { employee_id: id },
      });
      if (response.data?.data) {
        const sorted = [...response.data.data].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        setFormsList(sorted);
      }
    } catch (err) {
      console.error("Error fetching form master order:", err);
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const response = await axiosClient.get("/employee/policies", {
        params: { employee_id: id },
      });
      let policyList = [];
      if (Array.isArray(response.data)) {
        policyList = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        policyList = response.data.data;
      }
      const sorted = [...policyList].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      setPoliciesList(sorted);
    } catch (err) {
      console.error("Error fetching employee policies:", err);
      toast.error("Failed to load employee policies");
    } finally {
      setLoadingPolicies(false);
    }
  };

  const fetchDocumentMasters = async () => {
    try {
      setLoadingMasters(true);
      const response = await axiosClient.get("/document-masters");
      if (response.data?.data) {
        const sorted = [...response.data.data].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        setDocumentMastersList(sorted);
      }
    } catch (err) {
      console.error("Error fetching document master order:", err);
    } finally {
      setLoadingMasters(false);
    }
  };

  useEffect(() => {
    if (activeTab === "forms") {
      fetchForms();
    } else if (activeTab === "documents") {
      fetchDocumentMasters();
      fetchDocuments();
    } else if (activeTab === "policies") {
      fetchPolicies();
    }
  }, [activeTab]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = formsList.findIndex((item) => item.id === active.id);
      const newIndex = formsList.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(formsList, oldIndex, newIndex);
      setFormsList(newOrder);

      const payload = {
        forms: newOrder.map((form, index) => ({
          id: form.id,
          sort_order: index + 1,
        })),
      };

      try {
        const response = await axiosClient.post(
          "/form-masters/update-order",
          payload,
        );
        if (response.data?.status) {
          toast.success("Form order updated successfully!");
        } else {
          toast.error("Failed to update form order");
        }
      } catch (err) {
        console.error("Error updating form order:", err);
        toast.error("Failed to save order on server");
        fetchForms();
      }
    }
  };

  const handleDocumentDragEnd = async (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = documentMastersList.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = documentMastersList.findIndex(
        (item) => item.id === over.id,
      );

      const newOrder = arrayMove(documentMastersList, oldIndex, newIndex);
      setDocumentMastersList(newOrder);

      const payload = {
        documents: newOrder.map((doc, index) => ({
          id: doc.id,
          sort_order: index + 1,
        })),
      };

      try {
        const response = await axiosClient.post(
          "/document-masters/update-order",
          payload,
        );
        if (response.data?.status) {
          toast.success("Document order updated successfully!");
        } else {
          toast.error("Failed to update document order");
        }
      } catch (err) {
        console.error("Error updating document order:", err);
        toast.error("Failed to save document order on server");
        fetchDocumentMasters();
      }
    }
  };

  const handlePolicyDragEnd = async (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = policiesList.findIndex((item) => item.id === active.id);
      const newIndex = policiesList.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(policiesList, oldIndex, newIndex);
      setPoliciesList(newOrder);

      const payload = {
        policies: newOrder.map((policy, index) => ({
          id: policy.id,
          sort_order: index + 1,
        })),
      };

      try {
        const response = await axiosClient.post(
          "/policy-masters/update-order",
          payload,
        );
        if (response.data && response.data.status) {
          toast.success(
            response.data.message || "Policy order updated successfully!",
          );
        } else {
          toast.error("Failed to update policy order");
        }
      } catch (err) {
        console.error("Error updating policy order:", err);
        toast.error("Failed to save policy order on server");
        fetchPolicies();
      }
    }
  };

  const { canEdit } = usePermissions("employee.add_manage_profiles");

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
          throw new Error("Employee not found");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err.response?.data?.message || "Failed to load employee data");
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
      const orgId =
        employee.organization_id ||
        localStorage.getItem("current_organization_id") ||
        localStorage.getItem("organization_id");
      const response = await getEmployeeDocuments(employee.id, orgId);
      const documentsData = response.data?.data || response.data || [];
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleStatusChangeRequest = (doc, newStatus) => {
    setStatusConfirmModal({
      isOpen: true,
      document: doc,
      targetStatus: newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal.document || !statusConfirmModal.targetStatus) return;
    setUpdatingStatus(true);
    try {
      await changeDocumentStatus(
        statusConfirmModal.document.id,
        statusConfirmModal.targetStatus
      );
      toast.success("Document status updated successfully.");
      fetchDocuments();
    } catch (err) {
      console.error("Error updating document status:", err);
      toast.error(err.response?.data?.message || "Failed to update document status.");
    } finally {
      setUpdatingStatus(false);
      setStatusConfirmModal({ isOpen: false, document: null, targetStatus: "" });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
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
      return `${years} year${years > 1 ? "s" : ""}`;
    } else {
      return `${totalMonths} month${totalMonths > 1 ? "s" : ""}`;
    }
  };

  // Handle document upload success
  const handleUploadSuccess = () => {
    fetchDocuments(); // Refresh documents list
  };

  const handleUploadClick = (docType) => {
    setPreselectedDocType(docType);
    setUploadModalOpen(true);
  };

  // Handle view document
  const handleViewDocument = (document) => {
    if (document.file_url) {
      window.open(`https://api.chrispp.au${document.file_url}`, "_blank");
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteEmployeeDocument(documentId);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete document");
      }
    }
  };

  // Handle verify/reject document
  const handleVerifyDocument = async (docId, status) => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) {
        toast.error("Session expired. Please login again.");
        return;
      }

      await verifyEmployeeDocument(docId, {
        verify: status,
        verified_by: user.id,
      });

      toast.success(
        `Document ${status === "approved" ? "approved" : "rejected"} successfully!`,
      );
      fetchDocuments();
    } catch (err) {
      console.error("Error verifying document:", err);
      toast.error(
        err.response?.data?.message || "Failed to update document status",
      );
    }
  };

  // Generate employee stats
  const employeeStats = employee
    ? [
        {
          icon: <FaCalendarAlt className="h-5 w-5" />,
          label: "Tenure",
          value: calculateTenure(employee.joining_date) || "N/A",
          color: "blue",
        },
        {
          icon: <FaBriefcase className="h-5 w-5" />,
          label: "Employment Type",
          value: employee.employment_type || "N/A",
          color: "green",
        },
        {
          icon: <HiOutlineUserGroup className="h-5 w-5" />,
          label: "Department",
          value: employee.department?.name || "N/A",
          color: "purple",
        },
        {
          icon: <FaUser className="h-5 w-5" />,
          label: "Reports To",
          value: employee.manager
            ? `${employee.manager.first_name} ${employee.manager.last_name}`
            : "N/A",
          color: "orange",
        },
      ]
    : [];

  // Quick actions
  const quickActions = [
    ...(canEdit
      ? [
          {
            label: "Edit Profile",
            icon: <FaEdit className="h-4 w-4" />,
            action: () => navigate(`/dashboard/employees/edit/${id}`),
            color: "bg-blue-600 hover:bg-blue-700",
          },
        ]
      : []),
    {
      label: "View Documents",
      icon: <FaFileAlt className="h-4 w-4" />,
      action: () => navigate(`/dashboard/employees/${id}/documents`),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "History",
      icon: <FaHistory className="h-4 w-4" />,
      action: () => navigate(`/dashboard/employees/${id}/history`),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Performance",
      icon: <FaChartLine className="h-4 w-4" />,
      action: () => navigate(`/dashboard/employees/${id}/performance`),
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  // Secondary actions
  const secondaryActions = [
    {
      label: "Print",
      icon: <FaPrint className="h-4 w-4" />,
      action: () => window.print(),
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      label: "Export",
      icon: <FaDownload className="h-4 w-4" />,
      action: () => exportProfile(),
      color: "bg-gray-600 hover:bg-gray-700",
    },
    {
      label: "Share",
      icon: <FaShare className="h-4 w-4" />,
      action: () => shareProfile(),
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  const exportProfile = () => {
    alert("Export feature coming soon!");
  };

  const shareProfile = () => {
    alert("Share feature coming soon!");
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Employee Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested employee could not be found."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard/employees")}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Employee List
              </button>
              <button
                onClick={() => navigate("/dashboard/employees/new")}
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
        preselectedDocumentType={preselectedDocType}
        documentMasters={documentMastersList}
      />

      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate("/dashboard/employees")}
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
                  {employee.first_name?.[0]}
                  {employee.last_name?.[0]}
                </div>
                <span
                  className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold ${
                    employee.status === "Active"
                      ? "bg-green-500 text-white"
                      : employee.status === "On Leave"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
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
                      {employee.designation?.title || "No Designation"}
                      {employee.department?.name &&
                        ` • ${employee.department.name}`}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-200" />
                        <span>{employee.personal_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-blue-200" />
                        <span>{employee.phone_number || "No phone"}</span>
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
                {[
                  "overview",
                  "employment",
                  "financial",
                  "documents",
                  "forms",
                  "policies",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
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
              {activeTab === "overview" && (
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Contact Name1"
                        value={employee.emergency_contact_name}
                      />
                      <DetailField
                        icon={<FaPhone className="h-4 w-4" />}
                        label="Contact Phone1"
                        value={employee.emergency_contact_phone}
                      />
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Relationship1"
                        value={employee.emergency_contact_relationship}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Contact Name2"
                        value={employee.emergency_contact_name2}
                      />
                      <DetailField
                        icon={<FaPhone className="h-4 w-4" />}
                        label="Contact Phone2"
                        value={employee.emergency_contact_phone2}
                      />
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Relationship2"
                        value={employee.emergency_contact_relationship2}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === "employment" && (
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
                        value={
                          employee.manager
                            ? `${employee.manager.first_name} ${employee.manager.last_name}`
                            : "Not assigned"
                        }
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
                          value={employee.applicant.source || "N/A"}
                          className="md:col-span-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === "financial" && (
                <div className="space-y-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 text-sm">
                        Financial information is securely stored and used only
                        for payroll and compliance purposes.
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
                        value={
                          employee.tax_file_number
                            ? "•••• •••• " + employee.tax_file_number.slice(-3)
                            : null
                        }
                      />
                      <DetailField
                        icon={<FaUniversity className="h-4 w-4" />}
                        label="Superannuation Fund"
                        value={employee.superannuation_fund_name}
                      />
                      <DetailField
                        icon={<FaUniversity className="h-4 w-4" />}
                        label="Superannuation Member #"
                        value={
                          employee.superannuation_member_number
                            ? "•••• " +
                              employee.superannuation_member_number.slice(-4)
                            : null
                        }
                      />
                      <DetailField
                        icon={<FaUniversity className="h-4 w-4" />}
                        label="Bank Name"
                        value={employee.bank_name}
                      />
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Account Name"
                        value={employee.account_name}
                      />
                      <DetailField
                        icon={<FaDollarSign className="h-4 w-4" />}
                        label="Bank BSB"
                        value={
                          employee.bank_bsb
                            ? "•••-" + employee.bank_bsb.slice(-3)
                            : null
                        }
                      />
                      <DetailField
                        icon={<FaDollarSign className="h-4 w-4" />}
                        label="Bank Account #"
                        value={
                          employee.bank_account_number
                            ? "•••• " + employee.bank_account_number.slice(-4)
                            : null
                        }
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
              {activeTab === "documents" && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Employee Documents
                      </h3>
                      <p className="text-gray-600">
                        Drag and drop to reorder compliance and mandatory
                        document categories for {employee.first_name}{" "}
                        {employee.last_name}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setPreselectedDocType(null);
                            setUploadModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaPlus /> Upload Document
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/dashboard/employees/${id}/documents`)
                        }
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaFileAlt /> View All
                      </button>
                    </div>
                  </div>

                  {loadingMasters || loadingDocuments ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading documents...</p>
                    </div>
                  ) : documentMastersList.length > 0 ? (
                    <div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDocumentDragEnd}
                      >
                        <SortableContext
                          items={documentMastersList.map((d) => d.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex flex-col gap-3 max-w-3xl">
                            {documentMastersList.map((master) => (
                              <SortableDocumentMasterItem
                                key={master.id}
                                master={master}
                                documents={documents}
                                onView={handleViewDocument}
                                onDelete={handleDeleteDocument}
                                canDelete={canEdit}
                                onUpload={handleUploadClick}
                                onStatusChange={handleStatusChangeRequest}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      <OtherDocumentsSection
                        documents={documents.filter(
                          (doc) =>
                            !documentMastersList.some(
                              (m) =>
                                doc.document_type === m.document_type ||
                                doc.document_type
                                  ?.toLowerCase()
                                  .includes(
                                    m.document_type.split(" ")[0].toLowerCase(),
                                  ),
                            ),
                        )}
                        onView={handleViewDocument}
                        onDelete={handleDeleteDocument}
                        canDelete={canEdit}
                        onStatusChange={handleStatusChangeRequest}
                      />
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
                            canDelete={canEdit}
                            onStatusChange={handleStatusChangeRequest}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                      <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">
                        No Documents Found
                      </h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        This employee doesn't have any documents yet. Upload
                        important documents like IDs, contracts, certificates,
                        etc.
                      </p>
                      <button
                        onClick={() => {
                          setPreselectedDocType(null);
                          setUploadModalOpen(true);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FaUpload /> Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Forms Tab */}
              {activeTab === "forms" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Employee Onboarding Forms
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop to reorder compliance and onboarding forms
                      completed by {employee.first_name} {employee.last_name}
                    </p>
                  </div>

                  {loadingForms ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        Loading onboarding forms order...
                      </p>
                    </div>
                  ) : formsList.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formsList.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-3 max-w-3xl">
                          {formsList.map((form) => (
                            <SortableFormItem
                              key={form.id}
                              form={form}
                              employeeId={id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                      <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">
                        No Onboarding Forms Found
                      </h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        There are no forms configured for onboarding.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === "policies" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Employee Onboarding Policies
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop to reorder compliance and onboarding
                      policies completed by {employee.first_name}{" "}
                      {employee.last_name}
                    </p>
                  </div>

                  {loadingPolicies ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        Loading onboarding policies order...
                      </p>
                    </div>
                  ) : policiesList.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handlePolicyDragEnd}
                    >
                      <SortableContext
                        items={policiesList.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-3 max-w-3xl">
                          {policiesList.map((policy, index) => (
                            <SortableProfilePolicyItem
                              key={policy.id}
                              policy={policy}
                              index={index}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                      <FaShieldAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">
                        No Onboarding Policies Found
                      </h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        There are no policies configured for onboarding.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Tools */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div> */}
        </div>
      </div>
      {/* Document Status Change Confirmation Modal */}
      {statusConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <FaClock className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Change Document Status
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to change the status of{" "}
                <strong>
                  {statusConfirmModal.document?.file_name ||
                    statusConfirmModal.document?.document_type}
                </strong>{" "}
                to{" "}
                <span className="capitalize font-semibold text-gray-800">
                  {statusConfirmModal.targetStatus}
                </span>
                ?
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() =>
                  setStatusConfirmModal({
                    isOpen: false,
                    document: null,
                    targetStatus: "",
                  })
                }
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-1"
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-1 flex items-center justify-center gap-2"
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Updating...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

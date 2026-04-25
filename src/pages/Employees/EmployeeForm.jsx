import React, { useEffect, useState, useRef } from "react";
import usePermissions from "../../hooks/usePermissions";
import {
  getEmployee,
  updateEmployee,
  getEmployees,
  createEmployeeBasic,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  updateEmployeeDocument,
  getDepartmentsByOrganization,
  getDesignationsByDeptId,
  searchSuperFunds,
} from "../../services/employeeService.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaMedkit,
  FaGavel,
  FaUserShield,
  FaClipboardList,
  FaSearch,
} from "react-icons/fa";
import { useOrganizations } from "../../contexts/OrganizationContext";

const MANDATORY_CERTIFICATES = {
  // Mandatory Certificates & Checks (Purple themed)
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
        regulatoryBody: "Department of Justice and Community Safety",
        icon: "🆔",
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
        borderColor: "border-purple-300",
      },
      {
        id: "first_aid",
        name: "First Aid Certification (HLTAID012)",
        type: "First Aid Certificate",
        required: true,
        hasExpiry: true,
        expiryYears: 3,
        includes: ["CPR", "Asthma", "Anaphylaxis"],
        description: "HLTAID012 including CPR, Asthma & Anaphylaxis management",
        icon: "🚑",
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
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
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
      {
        id: "mandatory_reporting",
        name: "Mandatory Reporting Training",
        type: "Mandatory Reporting",
        required: true,
        hasExpiry: false,
        description: "Protecting Children – Victoria",
        icon: "📋",
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
      {
        id: "child_safe",
        name: "Child Safe Standards Awareness",
        type: "Child Safe Standards",
        required: true,
        hasExpiry: false,
        description: "Child Safe Standards Awareness Training",
        icon: "🛡️",
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
    ],
  },

  // Qualifications (Blue themed)
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
        qualificationCode: "CHC30121",
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
      {
        id: "diploma",
        name: "Diploma in Early Childhood Education & Care",
        type: "Diploma",
        required: false,
        hasExpiry: false,
        description: "Advanced qualification for room leaders",
        icon: "📜",
        qualificationCode: "CHC50121",
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
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
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
    ],
  },

  // Health & Safety Compliance (Green themed)
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
        recommendations: ["Flu", "Pertussis", "MMR", "Hepatitis B"],
        description: "Flu and Pertussis recommended for childcare workers",
        icon: "💉",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      },
      {
        id: "medical_fitness",
        name: "Medical Fitness Declaration",
        type: "Medical Fitness",
        required: true,
        hasExpiry: false,
        description: "Medical fitness to work with children",
        icon: "🩺",
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      },
    ],
  },

  // Identity & Legal (Orange themed)
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
        options: ["Passport", "Driver's Licence", "Birth Certificate"],
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
      },
      {
        id: "right_to_work",
        name: "Right to Work in Australia",
        type: "Right to Work",
        required: true,
        hasExpiry: false,
        description: "Proof of Australian citizenship or valid work visa",
        icon: "🇦🇺",
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
      },
      {
        id: "visa",
        name: "Visa (if applicable)",
        type: "Visa",
        required: false,
        hasExpiry: true,
        description: "Current visa for non-citizens",
        icon: "🛂",
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
      },
    ],
  },

  // Professional Compliance (Red themed)
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
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
      {
        id: "confidentiality",
        name: "Signed Confidentiality Agreement",
        type: "Confidentiality Agreement",
        required: true,
        hasExpiry: false,
        description: "Signed Confidentiality Agreement",
        icon: "🔒",
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
    ],
  },

  // Operational Readiness (Teal themed)
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
        color: "teal",
        bgColor: "bg-teal-100",
        textColor: "text-teal-800",
      },
      {
        id: "food_safety",
        name: "Food Safety Awareness",
        type: "Food Safety",
        required: false,
        hasExpiry: false,
        description: "If handling food",
        icon: "🍽️",
        color: "teal",
        bgColor: "bg-teal-100",
        textColor: "text-teal-800",
      },
      {
        id: "safe_sleep",
        name: "Safe Sleep & SIDS Training",
        type: "Safe Sleep Training",
        required: true,
        hasExpiry: false,
        description: "For educators working with children under 2 years",
        icon: "😴",
        color: "teal",
        bgColor: "bg-teal-100",
        textColor: "text-teal-800",
      },
    ],
  },

  // Annual Training (Pink themed)
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
        color: "pink",
        bgColor: "bg-pink-100",
        textColor: "text-pink-800",
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
        color: "pink",
        bgColor: "bg-pink-100",
        textColor: "text-pink-800",
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
        color: "pink",
        bgColor: "bg-pink-100",
        textColor: "text-pink-800",
      },
    ],
  },
};

// Staff File Requirements
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
// SUPER FUND SEARCH COMPONENT
// ============================================
const SuperFundSearch = ({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search for super fund...",
  disabled = false,
  error = null,
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(value || "");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const debouncedSearch = (searchQuery) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchSuperFunds(searchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelected("");

    if (onChange) {
      onChange(newQuery);
    }

    setShowSuggestions(true);
    debouncedSearch(newQuery);
  };

  const handleSelect = (fundName) => {
    setQuery(fundName);
    setSelected(fundName);
    setShowSuggestions(false);

    if (onSelect) {
      onSelect(fundName);
    }

    if (onChange) {
      onChange(fundName);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelected("");
    setSuggestions([]);

    if (onChange) {
      onChange("");
    }

    if (onSelect) {
      onSelect("");
    }

    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value !== query) {
      setQuery(value || "");
      setSelected(value || "");
    }
  }, [value]);

  const highlightMatch = (text, highlight) => {
    if (!highlight.trim()) {
      return text;
    }

    const regex = new RegExp(
      `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2.5 border ${error ? "border-red-500 bg-red-50" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
          ) : selected ? (
            <div className="flex items-center gap-1">
              <FaCheck className="h-4 w-4 text-green-500" />
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear selection"
              >
                <FaTimes className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear"
            >
              <FaTimes className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </button>
          ) : null}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <FaSpinner className="animate-spin inline mr-2" />
              Searching...
            </div>
          ) : (
            suggestions.map((fund, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(fund)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="text-sm text-gray-900">
                  {highlightMatch(fund, query)}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {showSuggestions &&
        !isLoading &&
        query.length >= 1 &&
        suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No super funds found matching "{query}"
          </div>
        )}
    </div>
  );
};

// File Icon Component
const FileIcon = ({ fileName }) => {
  if (!fileName) return <FaFileAlt className="text-gray-400 text-2xl" />;

  const ext = fileName.split(".").pop()?.toLowerCase();
  const className = "text-2xl";

  if (ext === "pdf")
    return <FaFilePdf className={`${className} text-red-500`} />;
  if (["doc", "docx"].includes(ext))
    return <FaFileWord className={`${className} text-blue-500`} />;
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
    return <FaFileImage className={`${className} text-green-500`} />;
  return <FaFileAlt className={`${className} text-gray-500`} />;
};

// Document Upload Modal
const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  initialData = {},
  employeeId,
}) => {
  const [formData, setFormData] = useState({
    document_type: initialData.document_type || "",
    issue_date: initialData.issue_date || "",
    expiry_date: initialData.expiry_date || "",
    file: null,
    file_name: initialData.file_name || "",
    category: initialData.category || "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const allCertificateTypes = Object.values(MANDATORY_CERTIFICATES).flatMap(
    (category) =>
      category.items.map((item) => ({
        ...item,
        category: category.title,
        categoryColor: category.color,
      })),
  );

  useEffect(() => {
    if (isOpen) {
      setFormData({
        document_type: initialData.document_type || "",
        issue_date: initialData.issue_date || "",
        expiry_date: initialData.expiry_date || "",
        file: null,
        file_name: initialData.file_name || "",
        category: initialData.category || "",
      });
      setError("");
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileNameWithoutExt = file.name.split(".").slice(0, -1).join(".");

      setFormData((prev) => ({
        ...prev,
        file,
        file_name:
          prev.file_name ||
          fileNameWithoutExt
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
      }));
    }
  };

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedCert = allCertificateTypes.find(
      (cert) => cert.type === selectedValue,
    );

    setFormData((prev) => ({
      ...prev,
      document_type: selectedValue,
      category: selectedCert?.category || "",
      expiry_date:
        prev.expiry_date ||
        (selectedCert?.hasExpiry
          ? new Date(
            Date.now() + selectedCert.expiryYears * 365 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0]
          : ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file && !isEdit) {
      setError("Please select a file to upload");
      return;
    }

    if (!formData.document_type) {
      setError("Please select a document type");
      return;
    }

    if (!formData.file_name) {
      setError("Please enter a file name");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = new FormData();

      data.append("employee_id", employeeId);
      data.append("document_type", formData.document_type);
      data.append("file_name", formData.file_name);
      data.append("category", formData.category);

      if (formData.file) {
        data.append("file", formData.file);
      }

      if (formData.issue_date) {
        data.append("issue_date", formData.issue_date);
      }
      if (formData.expiry_date) {
        data.append("expiry_date", formData.expiry_date);
      }

      if (isEdit) {
        data.append("_method", "PUT");
      }

      await onSubmit(employeeId, data, isEdit);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(", ") || "Validation failed");
      } else {
        setError(err.response?.data?.message || "Failed to upload document");
      }
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const groupedTypes = Object.entries(MANDATORY_CERTIFICATES).map(
    ([key, category]) => ({
      ...category,
      key,
    }),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Edit Document" : "Upload New Document"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.document_type}
                onChange={handleDocumentTypeChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Document Type</option>
                {groupedTypes.map((category) => (
                  <optgroup
                    key={category.key}
                    label={category.title}
                    className={category.textColor}
                  >
                    {category.items.map((item) => (
                      <option key={item.id} value={item.type} className="py-1">
                        {item.icon} {item.name}{" "}
                        {item.required ? "(Required)" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {formData.category && (
                <p className="text-xs text-gray-500 mt-1">
                  Category:{" "}
                  <span className="font-medium">{formData.category}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.file_name}
                onChange={(e) =>
                  setFormData({ ...formData, file_name: e.target.value })
                }
                placeholder="Enter a descriptive file name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be the name shown in the documents list
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isEdit && (
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
                    required={!isEdit}
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
            )}
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
              {isEdit ? "Update Document" : "Upload Document"}
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
const DocumentCard = ({ document, onDelete, onEdit, canEdit, canDelete }) => {
  const today = new Date();
  const expiryDate = document.expiry_date
    ? new Date(document.expiry_date)
    : null;

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
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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

  const baseUrl = "https://api.chrispp.com";

  const findCertType = () => {
    for (const category of Object.values(MANDATORY_CERTIFICATES)) {
      const found = category.items.find(
        (item) =>
          item.type === document.document_type ||
          item.name.includes(document.document_type),
      );
      if (found) return found;
    }
    return null;
  };

  const certType = findCertType();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">{getFileIcon(document.file_name)}</div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {document.document_type || "Document"}
            </h4>
            <p className="text-sm text-gray-500">{document.file_name}</p>
            {certType?.includes && (
              <div className="flex gap-1 mt-1">
                {certType.includes.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            {document.category && (
              <span className="text-xs text-gray-400 mt-1 block">
                {document.category}
              </span>
            )}
          </div>
        </div>
        {expiryDate && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}
          >
            {statusText}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {document.issue_date && (
          <div>
            <p className="text-xs text-gray-500">Issue Date</p>
            <p className="text-sm font-medium">
              {formatDate(document.issue_date)}
            </p>
          </div>
        )}
        {document.expiry_date && (
          <div>
            <p className="text-xs text-gray-500">Expiry Date</p>
            <p className="text-sm font-medium">
              {formatDate(document.expiry_date)}
            </p>
            {daysRemaining > 0 && daysRemaining <= 90 && (
              <p className="text-xs text-orange-600 mt-1">
                {daysRemaining} days remaining
              </p>
            )}
          </div>
        )}
      </div>

      {expiryDate && daysRemaining > 0 && daysRemaining <= 90 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${daysRemaining <= 30
                  ? "bg-red-500"
                  : daysRemaining <= 60
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
              style={{ width: `${Math.min(100, (daysRemaining / 90) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

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
        {canEdit && (
          <button
            onClick={() => onEdit(document)}
            className="flex items-center gap-2 px-3 py-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors text-sm"
          >
            <FaEdit />
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(document.id)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <FaTrash />
            Delete
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Uploaded: {formatDate(document.created_at)}
      </div>
    </div>
  );
};

// Compliance Checklist Component with Colors
const ComplianceChecklist = ({ certificates = [] }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(MANDATORY_CERTIFICATES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    ),
  );

  const toggleCategory = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const isCertificateUploaded = (certType) => {
    return certificates.some(
      (doc) =>
        doc.document_type === certType ||
        doc.document_type?.includes(certType) ||
        (certType === "Working With Children Check" &&
          doc.document_type?.includes("WWCC")) ||
        (certType === "First Aid Certificate" &&
          doc.document_type?.includes("First Aid")),
    );
  };

  const getUploadedCertificate = (certType) => {
    return certificates.find(
      (doc) =>
        doc.document_type === certType ||
        doc.document_type?.includes(certType) ||
        (certType === "Working With Children Check" &&
          doc.document_type?.includes("WWCC")) ||
        (certType === "First Aid Certificate" &&
          doc.document_type?.includes("First Aid")),
    );
  };

  const totalRequired = Object.values(MANDATORY_CERTIFICATES).flatMap((cat) =>
    cat.items.filter((item) => item.required),
  ).length;

  const uploadedRequired = Object.values(MANDATORY_CERTIFICATES)
    .flatMap((cat) => cat.items.filter((item) => item.required))
    .filter((item) => isCertificateUploaded(item.type)).length;

  const compliancePercentage =
    Math.round((uploadedRequired / totalRequired) * 100) || 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Compliance Summary
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Compliance</span>
              <span
                className={`text-sm font-bold ${getStatusColor(compliancePercentage)}`}
              >
                {compliancePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${compliancePercentage >= 80
                    ? "bg-green-500"
                    : compliancePercentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                style={{ width: `${compliancePercentage}%` }}
              ></div>
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-800">
            Staff File Requirements
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STAFF_FILE_REQUIREMENTS.map((req) => {
              const isUploaded = certificates.some(
                (doc) =>
                  doc.document_type?.includes(req.name) ||
                  (req.name === "WWCC Copy" &&
                    doc.document_type?.includes("WWCC")) ||
                  (req.name === "First Aid Certificate" &&
                    doc.document_type?.includes("First Aid")),
              );

              return (
                <div
                  key={req.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  {isUploaded ? (
                    <FaCheck className="text-green-500 flex-shrink-0" />
                  ) : (
                    <FaTimes className="text-red-500 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${isUploaded ? "text-gray-800" : "text-gray-500"}`}
                  >
                    {req.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {Object.entries(MANDATORY_CERTIFICATES).map(([key, category]) => {
        const uploadedInCategory = category.items.filter((item) =>
          isCertificateUploaded(item.type),
        ).length;

        return (
          <div
            key={key}
            className={`rounded-lg border overflow-hidden ${category.borderColor || "border-gray-200"}`}
          >
            <button
              onClick={() => toggleCategory(key)}
              className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-colors ${category.bgColor || "bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-${category.color || "gray"}-600 text-xl`}
                >
                  {category.icon}
                </span>
                <div>
                  <h3
                    className={`text-md font-semibold ${category.textColor || "text-gray-800"} text-left`}
                  >
                    {category.title}
                  </h3>
                  <p className="text-xs text-gray-500 text-left">
                    {uploadedInCategory}/{category.items.length} documents
                  </p>
                </div>
              </div>
              {expandedCategories[key] ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>

            {expandedCategories[key] && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-200 bg-white">
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const uploaded = isCertificateUploaded(item.type);
                    const uploadedDoc = getUploadedCertificate(item.type);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${item.bgColor || "bg-gray-50"
                          }`}
                      >
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
                              <p
                                className={`font-medium ${item.textColor || "text-gray-800"}`}
                              >
                                {item.name}
                                {item.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {uploaded && uploadedDoc && (
                            <div className="mt-2 pl-7">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Uploaded:</span>
                                <span className="font-medium text-gray-700">
                                  {uploadedDoc.file_name}
                                </span>
                                {uploadedDoc.expiry_date && (
                                  <>
                                    <span className="text-gray-400">|</span>
                                    <span
                                      className={`${new Date(uploadedDoc.expiry_date) <
                                          new Date()
                                          ? "text-red-600"
                                          : "text-green-600"
                                        }`}
                                    >
                                      Exp:{" "}
                                      {new Date(
                                        uploadedDoc.expiry_date,
                                      ).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          {item.recommendations && (
                            <p className="text-xs text-gray-400 mt-1 pl-7">
                              Recommended: {item.recommendations.join(", ")}
                            </p>
                          )}
                          {item.includes && (
                            <div className="flex flex-wrap gap-1 mt-1 pl-7">
                              {item.includes.map((inc, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-0.5 rounded-full ${category.badgeColor ||
                                    "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {inc}
                                </span>
                              ))}
                            </div>
                          )}
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
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
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
      className={`w-full px-4 py-2.5 rounded-lg border ${error
          ? "border-red-500 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error}
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
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
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
      className={`w-full px-4 py-2.5 rounded-lg border ${error
          ? "border-red-500 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
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
        {error}
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
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
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
      className={`w-full px-4 py-2.5 rounded-lg border ${error
          ? "border-red-500 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error}
      </div>
    )}
  </div>
);

// Tab Component
const TabButton = ({ active, onClick, icon, label, step, completed }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-3 px-6 py-4 w-full rounded-lg transition-all duration-300 ${active
        ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
      }`}
  >
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${active
          ? "bg-blue-100 text-blue-600"
          : completed
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-400"
        }`}
    >
      {completed && !active ? <FaCheck className="text-sm" /> : icon}
    </div>
    <div className="flex flex-col items-start">
      <span
        className={`text-sm font-medium ${active ? "text-blue-700" : completed ? "text-green-700" : "text-gray-600"}`}
      >
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

export default function EmployeeForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formErrors, setFormErrors] = useState({});
  const { canAdd, canEdit, canDelete } = usePermissions('employee.add_manage_profiles');

  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [employeeId, setEmployeeId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const [formData, setFormData] = useState({
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

    employee_code: "",
    joining_date: "",
    room_id: "",
    designation_id: "",
    reporting_manager_id: "",
    employment_type: "",
    status: "On Probation",
    hourly_wage: "",

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
    {
      id: "certificates",
      label: "Certificates",
      icon: <FaCertificate />,
      step: 2,
    },
    { id: "employment", label: "Employment", icon: <FaBriefcase />, step: 3 },
    { id: "payroll", label: "Payroll", icon: <FaDollarSign />, step: 4 },
  ];

  const tabDescriptions = {
    personal: "Step 1: Enter basic personal details to create the employee",
    certificates:
      "Step 2: Upload certificates and documents - View by list or compliance checklist",
    employment: "Step 3: Add employment details",
    payroll: "Step 4: Add payroll information",
  };

  useEffect(() => {
    if (id) {
      //console.log("URL has ID param:", id);
      setEmployeeId(id);
    }
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      //console.log("Setting active tab from URL:", tabParam);
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (employeeId) {
      //console.log("Employee ID changed to:", employeeId, "- fetching data");
      fetchEmployeeData();
      fetchCertificates();
      setCompletedTabs((prev) => new Set([...prev, "personal"]));
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      const params = new URLSearchParams(location.search);
      params.set("tab", activeTab);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      //console.log("URL updated with tab:", activeTab);
    }
  }, [activeTab, employeeId, navigate, location.pathname]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await getEmployee(employeeId);
      setFormData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch employee", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    if (!employeeId) return;

    setLoadingCertificates(true);
    setCertificateError("");

    try {
      // console.log("Fetching certificates for employee:", employeeId);
      const response = await getEmployeeDocuments(employeeId);
      // console.log("Documents response:", response);

      let documentsData = [];

      if (response.data) {
        if (response.data.success === true && response.data.data) {
          documentsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          documentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          documentsData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        documentsData = response;
      }

      setCertificates(Array.isArray(documentsData) ? documentsData : []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
      setCertificateError("Failed to load certificates. Please try again.");
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    if (employeeId && organizationId) {
      getDepartmentsByOrganization(organizationId)
        .then((res) => {
          if (res && res.data && res.data.success === true) {
            const roomsData = res.data.data || [];
            setDepartments(
              roomsData.map((r) => ({
                value: r.id,
                label: r.name,
              })),
            );
          } else if (res && res.data && Array.isArray(res.data)) {
            setDepartments(
              res.data.map((r) => ({
                value: r.id,
                label: r.name,
              })),
            );
          } else {
            setDepartments([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching rooms:", err);
          setDepartments([]);
        });

      getEmployees({ organization_id: organizationId })
        .then((response) => {
          if (response.data && response.data.success === true) {
            const employeesData = response.data.data || [];
            setManagers(
              employeesData.map((e) => ({
                value: e.id,
                label: `${e.first_name} ${e.last_name}`,
              })),
            );
          } else if (response.data && Array.isArray(response.data)) {
            setManagers(
              response.data.map((e) => ({
                value: e.id,
                label: `${e.first_name} ${e.last_name}`,
              })),
            );
          } else {
            setManagers([]);
          }
        })
        .catch((err) => console.error("Failed to fetch managers", err));
    }
  }, [employeeId, organizationId]);

  // FIXED: Designation fetch - using organization-level endpoint
  useEffect(() => {
    const fetchDesignations = async () => {
      // Only fetch if we have an organization ID
      if (!organizationId) {
        //console.log("No organization ID available");
        setDesignations([]);
        return;
      }

      try {
        // console.log(
        //   "Fetching all designations for organization:",
        //   organizationId,
        // );

        // Use the organization-level endpoint to get all designations
        const response = await getDesignationsByDeptId(organizationId);

        console.log("Designations API response:", response);

        let designationsData = [];

        if (response && response.data) {
          if (response.data.success === true && response.data.data) {
            designationsData = response.data.data;
          } else if (Array.isArray(response.data)) {
            designationsData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            designationsData = response.data.data;
          }
        }

        //console.log("Processed designations:", designationsData);

        // Map to the format expected by SelectField
        setDesignations(
          designationsData.map((d) => ({
            value: d.id,
            label: d.title || d.name || "Unknown",
          })),
        );

        // Clear any previous designation errors
        setFormErrors((prev) => ({ ...prev, designation_id: null }));
      } catch (err) {
        console.error("Error fetching designations:", err);
        setDesignations([]);

        // Show user-friendly error message
        setFormErrors((prev) => ({
          ...prev,
          designation_id: "Could not load designations. Please try again.",
        }));
      }
    };

    fetchDesignations();
  }, [organizationId]); // Only depend on organizationId

  const handleChange = (e) => {
    const { name, value } = e.target;
    //console.log(`Field changed: ${name} = ${value}`);

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSuperFundChange = (value) => {
    setFormData((prev) => ({ ...prev, superannuation_fund_name: value }));
    if (formErrors.superannuation_fund_name) {
      setFormErrors((prev) => ({ ...prev, superannuation_fund_name: null }));
    }
  };

  const handleSuperFundSelect = (value) => {
    setFormData((prev) => ({ ...prev, superannuation_fund_name: value }));
  };

  const handleUploadDocument = async (empId, formData, isEdit = false) => {
    try {
      //console.log("Uploading document with employee ID:", empId);
      //console.log("Is edit mode:", isEdit);

      let response;
      if (isEdit && editingDocument) {
        //console.log("Updating document with ID:", editingDocument.id);
        response = await updateEmployeeDocument(editingDocument.id, formData);
      } else {
        //console.log("Creating new document");
        response = await uploadEmployeeDocument(formData);
      }

      //console.log("Upload response:", response);

      await fetchCertificates();
      alert(`Document ${isEdit ? "updated" : "uploaded"} successfully!`);
    } catch (error) {
      console.error("Error in document operation:", error);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);

        if (error.response.data?.errors) {
          const errorMessages = Object.values(
            error.response.data.errors,
          ).flat();
          setCertificateError(errorMessages.join(", "));
        } else if (error.response.data?.message) {
          setCertificateError(error.response.data.message);
        } else {
          setCertificateError("Upload failed. Please try again.");
        }
      } else {
        setCertificateError(error.message || "Operation failed");
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
      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      setCertificateError("Failed to delete document");
    }
  };

  const validatePersonalTab = () => {
    const errors = {};

    if (!formData.first_name?.trim())
      errors.first_name = "First Name is required";
    if (!formData.last_name?.trim()) errors.last_name = "Last Name is required";
    if (!formData.personal_email?.trim())
      errors.personal_email = "Personal Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.personal_email))
      errors.personal_email = "Please enter a valid email address";
    if (!formData.phone_number?.trim())
      errors.phone_number = "Phone Number is required";
    if (!formData.date_of_birth)
      errors.date_of_birth = "Date of Birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.address?.trim()) errors.address = "Address is required";

    return errors;
  };

  const handleCreateEmployee = async () => {
    const errors = validatePersonalTab();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      alert(
        "Please fill in all required personal information fields marked with *",
      );
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const basicEmployeeData = {
      organization_id: organizationId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      personal_email: formData.personal_email,
      phone_number: formData.phone_number,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      address: formData.address,
      emergency_contact_name: formData.emergency_contact_name || "",
      emergency_contact_phone: formData.emergency_contact_phone || "",
      emergency_contact_relationship:
        formData.emergency_contact_relationship || "",
    };

    try {
      //console.log("Creating employee with data:", basicEmployeeData);
      const response = await createEmployeeBasic(basicEmployeeData);
      //console.log("Create employee response:", response);

      const newEmployeeId =
        response.data?.data?.employee?.id ||
        response.data?.data?.id ||
        response.data?.id;

      if (newEmployeeId) {
        setEmployeeId(newEmployeeId);
        setCompletedTabs((prev) => new Set([...prev, "personal"]));
        setActiveTab("certificates");
        navigate(
          `/dashboard/employees/edit/${newEmployeeId}?tab=certificates`,
          { replace: true },
        );
        alert("Employee created successfully! Now you can upload documents.");
      } else {
        console.error("No employee ID in response:", response);
        alert(
          "Employee created but no ID returned. Please check the employee list.",
        );
        navigate("/dashboard/employees");
      }
    } catch (error) {
      console.error("Failed to create employee", error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors || {});
        alert("Please correct the validation errors below.");
      } else {
        alert(
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!employeeId) return;

    setIsSubmitting(true);
    setFormErrors({});

    const data = new FormData();
    for (const key in formData) {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        data.append(key, formData[key]);
      }
    }
    if (organizationId) {
      data.append("organization_id", organizationId);
    }

    try {
      await updateEmployee(employeeId, data);

      setCompletedTabs((prev) => new Set([...prev, activeTab]));

      if (activeTab === "employment") {
        alert("Employment details saved! Now add payroll information.");
        setActiveTab("payroll");
      } else if (activeTab === "payroll") {
        alert("Employee profile completed successfully!");
        navigate("/dashboard/employees");
      }
    } catch (error) {
      console.error("Failed to update employee", error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors || {});
        alert("Please correct the validation errors below.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmploymentSubmit = async () => {
    if (!employeeId) return;

    const employmentErrors = {};

    if (!formData.employee_code?.trim())
      employmentErrors.employee_code = "Employee Code is required";
    if (!formData.joining_date)
      employmentErrors.joining_date = "Joining Date is required";
    if (!formData.room_id) employmentErrors.room_id = "Room is required";
    if (!formData.designation_id)
      employmentErrors.designation_id = "Designation is required";
    if (!formData.employment_type)
      employmentErrors.employment_type = "Employment Type is required";
    if (!formData.status) employmentErrors.status = "Status is required";

    if (Object.keys(employmentErrors).length > 0) {
      setFormErrors(employmentErrors);
      alert("Please fill in all required employment fields marked with *");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const data = new FormData();
    for (const key in formData) {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        data.append(key, formData[key]);
      }
    }
    if (organizationId) {
      data.append("organization_id", organizationId);
    }

    try {
      await updateEmployee(employeeId, data);

      setCompletedTabs((prev) => new Set([...prev, "employment"]));

      alert("Employment details saved! Now add payroll information.");
      setActiveTab("payroll");
    } catch (error) {
      console.error("Failed to update employee", error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors || {});
        alert("Please correct the validation errors below.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayrollSubmit = async () => {
    if (!employeeId) return;

    setIsSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        data.append(key, formData[key]);
      }
    }
    if (organizationId) {
      data.append("organization_id", organizationId);
    }

    try {
      await updateEmployee(employeeId, data);

      setCompletedTabs((prev) => new Set([...prev, "payroll"]));

      alert("Employee profile completed successfully!");
      navigate("/dashboard/employees");
    } catch (error) {
      console.error("Failed to update employee", error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors || {});
        alert("Please correct the validation errors below.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <DocumentUploadModal
        isOpen={isCertificateModalOpen}
        onClose={() => {
          setIsCertificateModalOpen(false);
          setEditingDocument(null);
          setCertificateError(null);
        }}
        onSubmit={handleUploadDocument}
        isEdit={!!editingDocument}
        initialData={editingDocument || {}}
        employeeId={employeeId}
      />

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

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Employees
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {!employeeId ? "Add New Employee" : "Complete Employee Profile"}
          </h1>
          <p className="text-gray-600">
            {!employeeId
              ? "Step 1: Enter basic information to create the employee"
              : activeTab === "certificates"
                ? "Step 2: Upload certificates and documents - View by list or compliance checklist"
                : activeTab === "employment"
                  ? "Step 3: Add employment details"
                  : activeTab === "payroll"
                    ? "Step 4: Add payroll information"
                    : "Edit employee information"}
          </p>
          {employeeId && (
            <p className="text-sm text-blue-600 mt-2">
              Employee ID:{" "}
              <span className="font-mono font-bold">{employeeId}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => {
                    if (!employeeId && tab.id !== "personal") {
                      alert(
                        "Please create the employee first by completing Step 1",
                      );
                      return;
                    }

                    if (tab.id === "personal") {
                      setActiveTab(tab.id);
                    } else if (employeeId) {
                      setActiveTab(tab.id);
                    }
                  }}
                  icon={tab.icon}
                  label={tab.label}
                  step={tab.step}
                  completed={completedTabs.has(tab.id)}
                />
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">{tabDescriptions[activeTab]}</p>
            </div>

            {activeTab === "personal" && (
              <div className="space-y-8">
                <SectionHeader
                  title="Personal Information"
                  description="Basic personal details about the employee"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="First Name"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={formErrors.first_name}
                    required
                    placeholder="Enter first name"
                  />

                  <InputField
                    label="Last Name"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={formErrors.last_name}
                    required
                    placeholder="Enter last name"
                  />

                  <InputField
                    label="Email Address"
                    name="personal_email"
                    id="personal_email"
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
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={formErrors.phone_number}
                    required
                    placeholder="+61 123 456 789"
                  />

                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={formErrors.date_of_birth}
                    required
                  />

                  <SelectField
                    label="Gender"
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                      {
                        value: "Prefer not to say",
                        label: "Prefer not to say",
                      },
                    ]}
                    error={formErrors.gender}
                    required
                    placeholder="-- Select --"
                  />

                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Address"
                      name="address"
                      id="address"
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
                  description="Emergency contact details (optional)"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Emergency Contact Name"
                    name="emergency_contact_name"
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    error={formErrors.emergency_contact_name}
                    placeholder="Enter contact name"
                  />

                  <InputField
                    label="Emergency Contact Phone"
                    name="emergency_contact_phone"
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    error={formErrors.emergency_contact_phone}
                    placeholder="Enter contact phone"
                  />

                  <InputField
                    label="Emergency Contact Relationship"
                    name="emergency_contact_relationship"
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleChange}
                    error={formErrors.emergency_contact_relationship}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <SectionHeader
                    title="Certificates & Documents"
                    description="Upload and manage employee certificates - View by list or compliance checklist"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === "list"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                          }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setViewMode("checklist")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === "checklist"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                          }`}
                      >
                        Compliance Checklist
                      </button>
                    </div>

                    {employeeId && canAdd && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDocument(null);
                          setIsCertificateModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaPlus /> Upload Document
                      </button>
                    )}
                  </div>
                </div>

                {certificateError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium">Error</p>
                        <p className="text-red-600 text-sm">
                          {certificateError}
                        </p>
                        {employeeId && (
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

                {!employeeId ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaInfoCircle className="mx-auto text-gray-400 text-5xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Create Employee First
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Please complete Step 1 (Personal Information) first to
                      create the employee.
                    </p>
                  </div>
                ) : loadingCertificates ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading certificates...
                    </span>
                  </div>
                ) : viewMode === "list" ? (
                  certificates.length > 0 ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {certificates.length}{" "}
                          {certificates.length === 1 ? "document" : "documents"}
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
                            onEdit={(doc) => {
                              setEditingDocument(doc);
                              setIsCertificateModalOpen(true);
                            }}
                            canEdit={canEdit}
                            canDelete={canDelete}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
                        <FaFileAlt className="text-4xl text-gray-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-3">
                        No documents found
                      </h4>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Upload certificates and documents for this employee.
                      </p>
                      {canAdd && (
                        <button
                          onClick={() => {
                            setEditingDocument(null);
                            setIsCertificateModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                          <FaUpload /> Upload First Document
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  <ComplianceChecklist certificates={certificates} />
                )}
              </div>
            )}

            {activeTab === "employment" && employeeId && (
              <div className="space-y-8">
                <SectionHeader
                  title="Employment Details"
                  description="Add employment information"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Employee Code"
                    name="employee_code"
                    id="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                    error={formErrors.employee_code}
                    required
                    placeholder="e.g., EMP-001"
                  />

                  <InputField
                    label="Joining Date"
                    name="joining_date"
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    error={formErrors.joining_date}
                    required
                  />

                  <SelectField
                    label="Room"
                    name="room_id"
                    id="room_id"
                    value={formData.room_id || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      //console.log("Room selected, value:", value);
                      handleChange(e);
                    }}
                    options={departments}
                    error={formErrors.room_id}
                    required
                    placeholder="-- Select Room --"
                  />

                  <SelectField
                    label="Designation"
                    name="designation_id"
                    id="designation_id"
                    value={formData.designation_id || ""}
                    onChange={handleChange}
                    options={designations}
                    error={formErrors.designation_id}
                    required
                    placeholder={
                      designations.length === 0
                        ? "No designations available"
                        : "-- Select Designation --"
                    }
                    disabled={designations.length === 0}
                  />

                  <SelectField
                    label="Employment Type"
                    name="employment_type"
                    id="employment_type"
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
                    id="status"
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
                    id="hourly_wage"
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
                      id="reporting_manager_id"
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

            {activeTab === "payroll" && employeeId && (
              <div className="space-y-8">
                <SectionHeader
                  title="Payroll Information"
                  description="Add payroll and financial details (optional)"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Tax File Number (TFN)"
                    name="tax_file_number"
                    id="tax_file_number"
                    value={formData.tax_file_number}
                    onChange={handleChange}
                    error={formErrors.tax_file_number}
                    placeholder="Enter TFN"
                  />

                  <div className="w-full">
                    <label
                      htmlFor="superannuation_fund_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Superannuation Fund Name
                    </label>
                    <SuperFundSearch
                      value={formData.superannuation_fund_name || ""}
                      onChange={handleSuperFundChange}
                      onSelect={handleSuperFundSelect}
                      placeholder="Search for super fund (e.g., AustralianSuper)"
                      error={formErrors.superannuation_fund_name}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Start typing to search for your super fund
                    </p>
                  </div>

                  <InputField
                    label="Superannuation Member Number"
                    name="superannuation_member_number"
                    id="superannuation_member_number"
                    value={formData.superannuation_member_number}
                    onChange={handleChange}
                    error={formErrors.superannuation_member_number}
                    placeholder="Enter member number"
                  />

                  <InputField
                    label="Bank BSB"
                    name="bank_bsb"
                    id="bank_bsb"
                    value={formData.bank_bsb}
                    onChange={handleChange}
                    error={formErrors.bank_bsb}
                    placeholder="000-000"
                  />

                  <InputField
                    label="Bank Account Number"
                    name="bank_account_number"
                    id="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    error={formErrors.bank_account_number}
                    placeholder="Enter account number"
                  />

                  <InputField
                    label="Visa Type"
                    name="visa_type"
                    id="visa_type"
                    value={formData.visa_type}
                    onChange={handleChange}
                    error={formErrors.visa_type}
                    placeholder="e.g., Permanent Residency"
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Visa Expiry Date"
                      name="visa_expiry_date"
                      id="visa_expiry_date"
                      type="date"
                      value={formData.visa_expiry_date}
                      onChange={handleChange}
                      error={formErrors.visa_expiry_date}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center">
              <div>
                {activeTab !== "personal" && employeeId && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <FaArrowLeft className="text-sm" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/employees")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>

                {!employeeId && activeTab === "personal" ? (
                  <button
                    type="button"
                    onClick={handleCreateEmployee}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        Create Employee
                      </>
                    )}
                  </button>
                ) : employeeId && activeTab === "certificates" ? (
                  <button
                    type="button"
                    onClick={goToNextTab}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    Next: Employment
                    <FaArrowLeft className="text-sm rotate-180" />
                  </button>
                ) : employeeId && activeTab === "employment" ? (
                  <button
                    type="button"
                    onClick={handleEmploymentSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        Save & Go to Payroll
                      </>
                    )}
                  </button>
                ) : employeeId && activeTab === "payroll" ? (
                  <button
                    type="button"
                    onClick={handlePayrollSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        Complete & Finish
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Progress:</span>
              {!employeeId && " Step 1 of 4 - Create employee first"}
              {employeeId &&
                activeTab === "personal" &&
                " Step 1 of 4 - Edit personal information"}
              {employeeId &&
                activeTab === "certificates" &&
                " Step 2 of 4 - Upload documents"}
              {employeeId &&
                activeTab === "employment" &&
                " Step 3 of 4 - Add employment details"}
              {employeeId &&
                activeTab === "payroll" &&
                " Step 4 of 4 - Complete payroll information"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

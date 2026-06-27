import React, { useState, useMemo } from "react";
import {
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilePdf,
  FaEye,
  FaFilter,
} from "react-icons/fa";

// Mock Document Types (referenced from Documents.jsx)
const DOCUMENT_TYPES = [
  { id: "qualification", name: "Qualification Certificate" },
  { id: "cpr", name: "CPR Certificate" },
  { id: "first_aid", name: "First Aid Certificate" },
  { id: "anaphylaxis", name: "Anaphylaxis Certificate" },
  { id: "protecting_children", name: "Mandatory Reporting" },
  { id: "child_safety", name: "Foundations of Child Safety" },
  { id: "child_safety_adv", name: "Advanced Child Safety" },
  { id: "food_safety", name: "Food Safety Certificate" },
  { id: "allergens", name: "Allergens Certificate" },
  { id: "sunsmart", name: "SunSmart Certificate" },
  { id: "sleep_safe", name: "Sleep Safe Certificate" },
  { id: "wwcc", name: "Working With Children Check" },
  { id: "police_check", name: "Police Check" },
  { id: "right_to_work", name: "Right to Work" },
];

// Mock Employees List
const MOCK_EMPLOYEES = [
  { id: 1, name: "Khan Tabrej", email: "khan.tabrej@example.com", code: "EMP001" },
  { id: 2, name: "Ajeet Kumar", email: "ajeet.kumar@example.com", code: "EMP002" },
  { id: 3, name: "Sarah Connor", email: "sarah.connor@example.com", code: "EMP003" },
  { id: 4, name: "John Doe", email: "john.doe@example.com", code: "EMP004" },
  { id: 5, name: "Jane Smith", email: "jane.smith@example.com", code: "EMP005" },
];

// Reference date for simulation: 2026-06-27
const REFERENCE_DATE = new Date("2026-06-27");

// Mock Employee Document Records Matrix
const MOCK_DOCUMENT_RECORDS = [
  // Khan Tabrej (EMP001)
  {
    employeeId: 1,
    docTypeId: "wwcc",
    status: "approved",
    issueDate: "2024-01-15",
    expiryDate: "2029-01-15", // Active
    fileName: "wwcc_khan.pdf",
  },
  {
    employeeId: 1,
    docTypeId: "first_aid",
    status: "approved",
    issueDate: "2024-05-10",
    expiryDate: "2025-05-10", // Expired (relative to June 2026)
    fileName: "first_aid_cert.pdf",
  },
  {
    employeeId: 1,
    docTypeId: "cpr",
    status: "pending",
    issueDate: "2025-06-01",
    expiryDate: "2026-07-15", // Expiring soon (within 30 days of June 27, 2026)
    fileName: "cpr_refresher.pdf",
  },
  {
    employeeId: 1,
    docTypeId: "qualification",
    status: "approved",
    issueDate: "2022-11-20",
    expiryDate: null, // Lifetime validity
    fileName: "bachelors_degree.pdf",
  },

  // Ajeet Kumar (EMP002)
  {
    employeeId: 2,
    docTypeId: "wwcc",
    status: "approved",
    issueDate: "2025-02-10",
    expiryDate: "2030-02-10", // Active
    fileName: "wwcc_ajeet.pdf",
  },
  {
    employeeId: 2,
    docTypeId: "first_aid",
    status: "approved",
    issueDate: "2025-06-15",
    expiryDate: "2026-06-15", // Expired (relative to June 27, 2026)
    fileName: "first_aid_ajeet.pdf",
  },
  {
    employeeId: 2,
    docTypeId: "police_check",
    status: "pending",
    issueDate: "2025-06-20",
    expiryDate: "2028-06-20", // Active
    fileName: "police_check_ajeet.pdf",
  },

  // Sarah Connor (EMP003)
  {
    employeeId: 3,
    docTypeId: "wwcc",
    status: "approved",
    issueDate: "2020-03-01",
    expiryDate: "2025-03-01", // Expired
    fileName: "wwcc_sarah_old.pdf",
  },
  {
    employeeId: 3,
    docTypeId: "right_to_work",
    status: "approved",
    issueDate: "2023-08-10",
    expiryDate: null,
    fileName: "passport_scan.pdf",
  },

  // John Doe (EMP004)
  {
    employeeId: 4,
    docTypeId: "first_aid",
    status: "approved",
    issueDate: "2025-04-18",
    expiryDate: "2026-07-20", // Expiring soon
    fileName: "first_aid_john.pdf",
  },
  {
    employeeId: 4,
    docTypeId: "food_safety",
    status: "approved",
    issueDate: "2025-05-12",
    expiryDate: "2026-05-12", // Expired
    fileName: "food_safety_john.pdf",
  },
];

export default function DocumentTrackingPage() {
  const [viewType, setViewType] = useState("document"); // "document" or "employee"
  const [selectedDocType, setSelectedDocType] = useState("first_aid");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1);
  const [statusFilter, setStatusFilter] = useState("expired"); // Default to expired to highlight it
  const [searchQuery, setSearchQuery] = useState("");
  const [expiryStartDate, setExpiryStartDate] = useState("");
  const [expiryEndDate, setExpiryEndDate] = useState("");

  // Statistics calculation helper
  const stats = useMemo(() => {
    let total = MOCK_DOCUMENT_RECORDS.length;
    let approved = 0;
    let pending = MOCK_DOCUMENT_RECORDS.filter((r) => r.status === "pending").length;
    let expired = 0;
    let expiringSoon = 0;

    MOCK_DOCUMENT_RECORDS.forEach((r) => {
      if (r.expiryDate) {
        const expDate = new Date(r.expiryDate);
        const timeDiff = expDate.getTime() - REFERENCE_DATE.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) {
          expired++;
        } else if (daysDiff <= 30) {
          expiringSoon++;
        } else if (r.status === "approved") {
          approved++;
        }
      } else if (r.status === "approved") {
        approved++;
      }
    });

    // Calculate missing mandatory documents (assuming WWCC and First Aid are mandatory for all 5 employees)
    const mandatoryDocTypes = ["wwcc", "first_aid"];
    let missing = 0;
    MOCK_EMPLOYEES.forEach((emp) => {
      mandatoryDocTypes.forEach((docType) => {
        const hasDoc = MOCK_DOCUMENT_RECORDS.some(
          (r) => r.employeeId === emp.id && r.docTypeId === docType
        );
        if (!hasDoc) missing++;
      });
    });

    return { total, approved, pending, expired, expiringSoon, missing };
  }, []);

  // Expiry calculation helper for status badge
  const getExpiryStatus = (expiryDate, status) => {
    if (!expiryDate) return status;
    const expDate = new Date(expiryDate);
    const timeDiff = expDate.getTime() - REFERENCE_DATE.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return "expired";
    } else if (daysDiff <= 30) {
      return "expiring_soon";
    }
    return status;
  };

  // Format Status Badge
  const getStatusBadge = (expiryStatus) => {
    switch (expiryStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
            <FaCheckCircle className="text-green-500" /> Active / Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
            <FaClock className="text-amber-500" /> Pending Review
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
            <FaTimesCircle className="text-red-500" /> Expired
          </span>
        );
      case "expiring_soon":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 animate-pulse">
            <FaExclamationTriangle className="text-orange-500" /> Expiring Soon (&lt;30d)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-semibold border border-gray-200">
            <FaExclamationTriangle className="text-gray-400" /> Missing
          </span>
        );
    }
  };

  const formatDate = (dateString, expiryStatus) => {
    if (!dateString) return "N/A";
    const dateFormatted = new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (expiryStatus === "expired") {
      const expDate = new Date(dateString);
      const daysOver = Math.abs(Math.floor((REFERENCE_DATE.getTime() - expDate.getTime()) / (1000 * 3600 * 24)));
      return (
        <div>
          <span>{dateFormatted}</span>
          <p className="text-[10px] text-red-500 font-bold mt-0.5">({daysOver} days overdue)</p>
        </div>
      );
    }
    if (expiryStatus === "expiring_soon") {
      const expDate = new Date(dateString);
      const daysLeft = Math.floor((expDate.getTime() - REFERENCE_DATE.getTime()) / (1000 * 3600 * 24));
      return (
        <div>
          <span>{dateFormatted}</span>
          <p className="text-[10px] text-orange-600 font-bold mt-0.5">({daysLeft} days remaining)</p>
        </div>
      );
    }
    return dateFormatted;
  };

  // Filtered list by Document Type
  const filteredByDocType = useMemo(() => {
    const list = MOCK_EMPLOYEES.map((emp) => {
      const record = MOCK_DOCUMENT_RECORDS.find(
        (r) => r.employeeId === emp.id && r.docTypeId === selectedDocType
      );

      const computedStatus = record
        ? getExpiryStatus(record.expiryDate, record.status)
        : "missing";

      return {
        id: emp.id,
        name: emp.name,
        code: emp.code,
        email: emp.email,
        status: computedStatus,
        issueDate: record ? record.issueDate : null,
        expiryDate: record ? record.expiryDate : null,
        fileName: record ? record.fileName : null,
      };
    });

    return list.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      
      const matchesExpiryStart =
        !expiryStartDate || (item.expiryDate && item.expiryDate >= expiryStartDate);
      const matchesExpiryEnd =
        !expiryEndDate || (item.expiryDate && item.expiryDate <= expiryEndDate);

      return matchesSearch && matchesStatus && matchesExpiryStart && matchesExpiryEnd;
    });
  }, [selectedDocType, searchQuery, statusFilter, expiryStartDate, expiryEndDate]);

  // Filtered list by Employee
  const filteredByEmployee = useMemo(() => {
    return DOCUMENT_TYPES.map((docType) => {
      const record = MOCK_DOCUMENT_RECORDS.find(
        (r) => r.employeeId === selectedEmployeeId && r.docTypeId === docType.id
      );

      const computedStatus = record
        ? getExpiryStatus(record.expiryDate, record.status)
        : "missing";

      return {
        id: docType.id,
        name: docType.name,
        status: computedStatus,
        issueDate: record ? record.issueDate : null,
        expiryDate: record ? record.expiryDate : null,
        fileName: record ? record.fileName : null,
      };
    }).filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesExpiryStart =
        !expiryStartDate || (item.expiryDate && item.expiryDate >= expiryStartDate);
      const matchesExpiryEnd =
        !expiryEndDate || (item.expiryDate && item.expiryDate <= expiryEndDate);

      return matchesSearch && matchesStatus && matchesExpiryStart && matchesExpiryEnd;
    });
  }, [selectedEmployeeId, searchQuery, statusFilter, expiryStartDate, expiryEndDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Document Expiry Tracking</h1>
          <p className="text-gray-600 mt-1">
            Focus and monitor expiring, expired, and critical compliance documents to maintain active qualification standards.
          </p>
        </div>

        {/* View Switcher */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 self-start flex gap-1">
          <button
            onClick={() => {
              setViewType("document");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewType === "document"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Filter by Document Type
          </button>
          <button
            onClick={() => {
              setViewType("employee");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewType === "employee"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Filter by Employee
          </button>
        </div>
      </div>

      {/* Stats Section with click triggers */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <button
          onClick={() => setStatusFilter("expired")}
          className={`bg-white p-5 rounded-2xl border text-left shadow-sm flex items-center justify-between transition-all hover:scale-102 hover:shadow-md ${
            statusFilter === "expired" ? "ring-2 ring-red-500 border-transparent" : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Expired Docs</p>
            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.expired}</h3>
          </div>
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl">
            <FaTimesCircle size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("expiring_soon")}
          className={`bg-white p-5 rounded-2xl border text-left shadow-sm flex items-center justify-between transition-all hover:scale-102 hover:shadow-md ${
            statusFilter === "expiring_soon" ? "ring-2 ring-orange-500 border-transparent" : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Expiring Soon</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.expiringSoon}</h3>
          </div>
          <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl">
            <FaExclamationTriangle size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("pending")}
          className={`bg-white p-5 rounded-2xl border text-left shadow-sm flex items-center justify-between transition-all hover:scale-102 hover:shadow-md ${
            statusFilter === "pending" ? "ring-2 ring-amber-500 border-transparent" : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Pending Review</p>
            <h3 className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</h3>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <FaClock size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`bg-white p-5 rounded-2xl border text-left shadow-sm flex items-center justify-between transition-all hover:scale-102 hover:shadow-md ${
            statusFilter === "approved" ? "ring-2 ring-green-500 border-transparent" : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Active / Verified</p>
            <h3 className="text-3xl font-bold text-green-700 mt-1">{stats.approved}</h3>
          </div>
          <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl">
            <FaCheckCircle size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("missing")}
          className={`bg-white p-5 rounded-2xl border text-left shadow-sm flex items-center justify-between transition-all hover:scale-102 hover:shadow-md ${
            statusFilter === "missing" ? "ring-2 ring-gray-600 border-transparent" : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Missing Mandatory</p>
            <h3 className="text-3xl font-bold text-gray-700 mt-1">{stats.missing}</h3>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <FaExclamationTriangle size={20} />
          </div>
        </button>
      </div>

      {/* Main Filter Control & Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {viewType === "document" ? (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <FaFilter className="text-gray-500 shrink-0" />
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {DOCUMENT_TYPES.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <FaUser className="text-gray-500 shrink-0" />
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {MOCK_EMPLOYEES.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {["all", "expired", "expiring_soon", "pending", "approved", "missing"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    statusFilter === filter
                      ? "bg-gray-800 border-gray-800 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter === "approved"
                    ? "Active/Verified"
                    : filter === "expiring_soon"
                    ? "Expiring Soon (<30d)"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={
                viewType === "document"
                  ? "Search employee name or code..."
                  : "Search document name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Custom Expiry Date Filters */}
        <div className="px-6 py-3 flex flex-wrap gap-4 items-center bg-gray-50/20 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Expiry Range:</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">From:</label>
            <input
              type="date"
              value={expiryStartDate}
              onChange={(e) => setExpiryStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">To:</label>
            <input
              type="date"
              value={expiryEndDate}
              onChange={(e) => setExpiryEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          {(expiryStartDate || expiryEndDate) && (
            <button
              onClick={() => {
                setExpiryStartDate("");
                setExpiryEndDate("");
              }}
              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 font-semibold transition-all"
            >
              Clear Expiry Range
            </button>
          )}
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          {viewType === "document" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Employee Code</th>
                  <th className="px-6 py-4">Document Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredByDocType.length > 0 ? (
                  filteredByDocType.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{row.name}</p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{row.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {DOCUMENT_TYPES.find((d) => d.id === selectedDocType)?.name}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.issueDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.expiryDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.fileName ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FaFilePdf className="text-red-500" /> {row.fileName}
                            </span>
                            <button
                              onClick={() => alert(`Viewing file: ${row.fileName}`)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Document"
                            >
                              <FaEye />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No File</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No records found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200">
                  <th className="px-6 py-4">Document Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Associated File</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredByEmployee.length > 0 ? (
                  filteredByEmployee.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{row.name}</td>
                      <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.issueDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.expiryDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {row.fileName ? (
                          <span className="flex items-center gap-1.5">
                            <FaFilePdf className="text-red-500 shrink-0" />
                            {row.fileName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not Uploaded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.fileName && (
                          <button
                            onClick={() => alert(`Viewing file: ${row.fileName}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                          >
                            <FaEye /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No records found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

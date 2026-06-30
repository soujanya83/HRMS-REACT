import React, { useState, useMemo, useEffect } from "react";
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
import { useOrganizations } from "../../contexts/OrganizationContext";
import { getEmployees } from "../../services/employeeService";
import axiosClient from "../../axiosClient";

const BASE_URL = "https://api.chrispp.au";
const REFERENCE_DATE = new Date();

export default function DocumentTrackingPage() {
  const { selectedOrganization } = useOrganizations();

  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [statusFilter, setStatusFilter] = useState("expired"); // Default to expired
  const [searchQuery, setSearchQuery] = useState("");
  const [expiryStartDate, setExpiryStartDate] = useState("");
  const [expiryEndDate, setExpiryEndDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [documentRecords, setDocumentRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    if (!selectedOrganization?.id) return;
    try {
      const res = await getEmployees({
        organization_id: selectedOrganization.id,
      });
      let empData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          empData = res.data;
        } else if (res.data.data) {
          if (Array.isArray(res.data.data)) {
            empData = res.data.data;
          } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
            empData = res.data.data.data;
          }
        }
      }
      setEmployees(empData);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch document types
  const fetchDocTypes = async () => {
    if (!selectedOrganization?.id) return;
    try {
      const res = await axiosClient.get("/employee-documents/types", {
        params: { organization_id: selectedOrganization.id },
      });
      let types = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          types = res.data;
        } else if (res.data.data) {
          if (Array.isArray(res.data.data)) {
            types = res.data.data;
          } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
            types = res.data.data.data;
          }
        }
      }
      setDocTypes(types);
    } catch (err) {
      console.error("Error fetching document types:", err);
    }
  };

  // Fetch all document records for the organization
  const fetchDocumentRecords = async (page = 1) => {
    if (!selectedOrganization?.id) return;
    setLoading(true);
    try {
      const params = {
        organization_id: selectedOrganization.id,
        page,
        per_page: 15,
      };

      if (selectedDocType) {
        params.document_type = selectedDocType;
      }
      if (selectedEmployeeId) {
        params.employee_id = selectedEmployeeId;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter === "expired") {
        params.expiry_filter = "expired";
      } else if (["pending", "approved", "rejected"].includes(statusFilter)) {
        params.verify = statusFilter;
      } else if (statusFilter === "expiring_soon") {
        params.expiry_filter = "expiring_soon";
      }

      const res = await axiosClient.get("/employee-documents", { params });

      let recordsList = [];
      let total = 0;
      let lastPg = 1;
      let currentPg = page;

      const resData = res.data?.data;
      if (resData) {
        if (Array.isArray(resData.data)) {
          recordsList = resData.data;
          total = resData.total || 0;
          lastPg = resData.last_page || 1;
          currentPg = resData.current_page || page;
        } else if (Array.isArray(resData)) {
          recordsList = resData;
          total = resData.length;
        }
      } else if (Array.isArray(res.data)) {
        recordsList = res.data;
        total = res.data.length;
      }

      setDocumentRecords(recordsList);
      setTotalRecords(total);
      setLastPage(lastPg);
      setCurrentPage(currentPg);
    } catch (err) {
      console.error("Error fetching document records:", err);
      setDocumentRecords([]);
      setTotalRecords(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      fetchDocumentRecords(page);
    }
  };

  // Load configuration dropdowns once on mount/org change
  useEffect(() => {
    if (selectedOrganization?.id) {
      setSelectedEmployeeId("");
      setSelectedDocType("");
      fetchEmployees();
      fetchDocTypes();
    }
  }, [selectedOrganization?.id]);

  // Load document records reactively when parameters change
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchDocumentRecords(1);
    }
  }, [
    selectedOrganization?.id,
    selectedDocType,
    selectedEmployeeId,
    statusFilter,
    searchQuery,
  ]);

  // Expiry calculation helper for status badge
  const getExpiryStatus = (expiryDate, status) => {
    if (!expiryDate) return status;
    const expDate = new Date(expiryDate);
    const timeDiff = expDate.getTime() - new Date().getTime();
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
            <FaCheckCircle className="text-green-500" /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
            <FaClock className="text-amber-500" /> Pending
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
            <FaTimesCircle className="text-red-500" /> Expired
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
            <FaTimesCircle className="text-red-500" /> Rejected
          </span>
        );
      case "expiring_soon":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 animate-pulse">
            <FaExclamationTriangle className="text-orange-500" /> Expiring Soon
            (&lt;30d)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-semibold border border-gray-200">
            <FaExclamationTriangle className="text-gray-400" />{" "}
            {expiryStatus === "rejected" ? "Rejected" : "Missing"}
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

    const now = new Date();
    if (expiryStatus === "expired") {
      const expDate = new Date(dateString);
      const daysOver = Math.abs(
        Math.floor((now.getTime() - expDate.getTime()) / (1000 * 3600 * 24)),
      );
      return (
        <div>
          <span>{dateFormatted}</span>
          <p className="text-[10px] text-red-500 font-bold mt-0.5">
            ({daysOver} days overdue)
          </p>
        </div>
      );
    }
    if (expiryStatus === "expiring_soon") {
      const expDate = new Date(dateString);
      const daysLeft = Math.floor(
        (expDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
      );
      return (
        <div>
          <span>{dateFormatted}</span>
          <p className="text-[10px] text-orange-600 font-bold mt-0.5">
            ({daysLeft} days remaining)
          </p>
        </div>
      );
    }
    return dateFormatted;
  };

  // Unified filtered records list
  const filteredRecords = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const safeRecords = Array.isArray(documentRecords) ? documentRecords : [];
    const safeDocTypes = Array.isArray(docTypes) ? docTypes : [];

    if (statusFilter === "missing") {
      const targetTypes = selectedDocType ? [selectedDocType] : safeDocTypes;
      const targetEmployees = selectedEmployeeId
        ? safeEmployees.filter((e) => e.id === Number(selectedEmployeeId))
        : safeEmployees;

      const missingList = [];
      targetEmployees.forEach((emp) => {
        targetTypes.forEach((typeName) => {
          const hasRecord = safeRecords.some(
            (r) =>
              r && r.employee_id === emp.id && r.document_type === typeName,
          );
          if (!hasRecord) {
            missingList.push({
              id: `missing-${emp.id}-${typeName}`,
              name:
                `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
                "Unknown",
              email: emp.email || "N/A",
              code: emp.employee_code || `EMP${emp.id}`,
              documentType: typeName,
              status: "missing",
              issueDate: null,
              expiryDate: null,
              fileName: null,
              fileUrl: null,
            });
          }
        });
      });

      return missingList.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    }

    const list = safeRecords.map((record) => {
      const emp = record.employee;
      const computedStatus = getExpiryStatus(
        record.expiry_date,
        record.verify || record.status,
      );

      return {
        id: record.id,
        name: emp
          ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim()
          : "Deleted Employee",
        email: emp?.personal_email || emp?.email || "N/A",
        code: emp?.employee_code || `EMP${record.employee_id}`,
        documentType: record.document_type,
        status: computedStatus,
        issueDate: record.issue_date,
        expiryDate: record.expiry_date,
        fileName:
          record.file_name ||
          (record.file_url ? record.file_url.split("/").pop() : null),
        fileUrl: record.file_url,
      };
    });

    return list.filter((item) => {
      const matchesExpiryStart =
        !expiryStartDate ||
        (item.expiryDate && item.expiryDate >= expiryStartDate);
      const matchesExpiryEnd =
        !expiryEndDate || (item.expiryDate && item.expiryDate <= expiryEndDate);

      return matchesExpiryStart && matchesExpiryEnd;
    });
  }, [
    employees,
    documentRecords,
    docTypes,
    selectedDocType,
    selectedEmployeeId,
    searchQuery,
    statusFilter,
    expiryStartDate,
    expiryEndDate,
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Document Expiry Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Focus and monitor expiring, expired, and critical compliance
            documents to maintain active qualification standards.
          </p>
        </div>
      </div>

      {/* Main Filter Control & Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {/* Document Type Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaFilter className="text-gray-500 shrink-0" />
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">All Document Types</option>
                {docTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaUser className="text-gray-500 shrink-0" />
              <select
                value={selectedEmployeeId || ""}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} (
                    {emp.employee_code || `EMP${emp.id}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                "all",
                "expired",
                "expiring_soon",
                "pending",
                "approved",
                "rejected",
                "missing",
              ].map((filter) => (
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
                    ? "Approved"
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
              placeholder="Search employee name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Custom Expiry Date Filters */}
        <div className="px-6 py-3 flex flex-wrap gap-4 items-center bg-gray-50/20 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Custom Expiry Range:
          </span>
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
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
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
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {row.name}
                            </p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {row.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.documentType}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.issueDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(row.expiryDate, row.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.fileName ? (
                          <div className="flex items-center justify-end">
                            {row.fileUrl ? (
                              <a
                                href={`${BASE_URL}${row.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-200"
                                title="View Document"
                              >
                                <FaEye /> View
                              </a>
                            ) : (
                              <button
                                onClick={() => alert(`File: ${row.fileName}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-200"
                                title="View Document"
                              >
                                <FaEye /> View
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No File
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No records found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {Array.from({ length: lastPage }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pg
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

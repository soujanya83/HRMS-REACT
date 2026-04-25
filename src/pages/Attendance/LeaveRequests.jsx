// LeaveRequests.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import usePermissions from "../../hooks/usePermissions";
import {
  FaSync,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaSpinner,
  FaInfoCircle,
  FaFileAlt,
  FaUser,
  FaBriefcase,
  FaRedoAlt,
  FaFilter,
  FaSearch,
  FaChevronDown,
  FaTimes,
  FaUsers,
  FaEye,
  FaTrash,
  FaCloudUploadAlt,
  FaDownload,
  FaCopy
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import axiosClient from "../../axiosClient";
import { useOrganizations } from "../../contexts/OrganizationContext";
import employeeService from "../../services/employeeService";
import { employeeService as empServiceNamed } from "../../services/employeeService";
import InfiniteScrollEmployeeDropdown from "../../components/common/InfiniteScrollEmployeeDropdown";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};



const LeaveRequests = () => {
  const { selectedOrganization } = useOrganizations();
  const { canAdd, canEdit } = usePermissions('attendance.leave_requests');

  // Get current user role and info from localStorage
  const userRole = (localStorage.getItem('CURRENT_USER_ROLE') || '').toLowerCase();
  const isEmployee = userRole === 'employee';
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  // State for employees
  const [employees, setEmployees] = useState([]);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeeLastPage, setEmployeeLastPage] = useState(1);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // State for leave types
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // State for leave history
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // State for selected leave details
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showLeaveDetails, setShowLeaveDetails] = useState(false);

  // Color palette state
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // State for leave application form
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch employees on component mount
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchEmployees();
      // Auto-select after a short delay to ensure employees are loaded
      if (isEmployee) {
        setTimeout(() => autoSelectEmployee(), 500);
      }
    }
  }, [selectedOrganization]);

  // Fetch leave types on component mount
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchLeaveTypes();
    }
  }, [selectedOrganization]);

  // Fetch leave history when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      const empId = selectedEmployee.id;
      setFormData(prev => ({ ...prev, employee_id: empId }));
      fetchLeaveHistory(empId); // Added this to auto-fetch history
    }
  }, [selectedEmployee]);

  // Apply filters whenever filters or leaveHistory changes
  useEffect(() => {
    applyFilters();
  }, [filters, leaveHistory]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.search) count++;
    setActiveFilters(count);
  }, [filters]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Fetch employees from API with pagination
  const fetchEmployees = async (page = 1, search = '', append = false) => {
    if (!selectedOrganization?.id) return;
    if (employeesLoading) return;

    setEmployeesLoading(true);
    if (page === 1) setLoadingEmployees(true);
    try {
      const params = {
        organization_id: selectedOrganization.id,
        page
      };
      if (search) params.search = search;

      const response = await empServiceNamed.getAllEmployees(params);

      let pageData = [];
      let lastPage = 1;
      if (response?.success === true && response?.data) {
        if (Array.isArray(response.data.data)) {
          pageData = response.data.data;
          lastPage = response.data.last_page || 1;
        } else if (Array.isArray(response.data)) {
          pageData = response.data;
        }
      } else if (response?.data?.success === true && response?.data?.data) {
        if (Array.isArray(response.data.data.data)) {
          pageData = response.data.data.data;
          lastPage = response.data.data.last_page || 1;
        } else if (Array.isArray(response.data.data)) {
          pageData = response.data.data;
        }
      }

      setEmployeeLastPage(lastPage);
      setEmployeePage(page);

      if (append) {
        setEmployees(prev => [...prev, ...pageData]);
      } else {
        setEmployees(pageData);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      if (page === 1) showToast("Failed to load employees", "error");
    } finally {
      setEmployeesLoading(false);
      setLoadingEmployees(false);
    }
  };

  // Load next page of employees
  const loadMoreEmployees = useCallback(() => {
    if (employeePage < employeeLastPage && !employeesLoading) {
      fetchEmployees(employeePage + 1, employeeSearch, true);
    }
  }, [employeePage, employeeLastPage, employeesLoading, employeeSearch, selectedOrganization]);

  // Auto-select employee for 'employee' role after employees load
  const autoSelectEmployee = async () => {
    if (!isEmployee || !currentUser?.email || !selectedOrganization?.id) return;

    try {
      const searchRes = await empServiceNamed.getAllEmployees({
        organization_id: selectedOrganization.id,
        search: currentUser.email
      });

      let matchList = [];
      if (searchRes?.success && searchRes?.data?.data) {
        matchList = searchRes.data.data;
      } else if (searchRes?.data?.success && searchRes?.data?.data?.data) {
        matchList = searchRes.data.data.data;
      }

      const match = matchList.find(
        emp => emp.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
          emp.user_id === currentUser.id
      );

      if (match) {
        const empId = String(match.employee_id || match.id);
        // Set as selectedEmployee for the form
        setSelectedEmployee({ ...match, id: match.employee_id || match.id });
        setFormData(prev => ({ ...prev, employee_id: empId }));
        // Ensure the matched employee is in the list
        setEmployees(prev => {
          const exists = prev.some(e => String(e.employee_id || e.id) === empId);
          return exists ? prev : [match, ...prev];
        });
        //console.log('👤 Auto-selected employee:', match.name, empId);
      }
    } catch (err) {
      console.error('Error auto-selecting employee:', err);
    }
  };

  // Fetch leave types from API
  const fetchLeaveTypes = async () => {
    if (!selectedOrganization?.id) return;

    setLoadingLeaveTypes(true);
    try {
      //console.log("Fetching leave types...");
      const response = await axiosClient.post('/xero-leave-types', {
        organization_id: selectedOrganization.id
      });

      //console.log("Leave types response:", response.data);

      if (response.data?.success === true && Array.isArray(response.data.data)) {
        setLeaveTypes(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leave types:", error);
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  // Fetch leave history for selected employee
  const fetchLeaveHistory = async (employeeId) => {
    if (!selectedOrganization?.id || !employeeId) return;

    setLoadingHistory(true);
    setHistoryError(null);
    setShowHistory(true);

    try {
      //console.log(`Fetching leave history for employee ${employeeId}...`);
      const response = await axiosClient.get('/xero/leaves', {
        params: {
          organization_id: selectedOrganization.id,
          employee_id: employeeId,
        }
      });

      //console.log("Leave history response:", response.data);

      if (response.data?.status === true && Array.isArray(response.data.data)) {
        setLeaveHistory(response.data.data);
        setFilteredHistory(response.data.data);

        if (response.data.data.length === 0) {
          showToast(`No leave history found for this employee`, "info");
        } else {
          showToast(`Found ${response.data.data.length} leave records`, "success");
        }
      }
    } catch (error) {
      console.error("Failed to fetch leave history:", error);
      setHistoryError(
        error.response?.data?.message ||
        error.message ||
        "Failed to load leave history"
      );
      showToast("Failed to load leave history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  // View leave details
  const viewLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setShowLeaveDetails(true);
  };

  // Apply filters to leave history
  const applyFilters = () => {
    let filtered = [...leaveHistory];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(item =>
        item.status?.toUpperCase() === filters.status.toUpperCase()
      );
    }

    // Filter by date range
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at || item.start_date);
        return itemDate >= start;
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at || item.start_date);
        return itemDate <= end;
      });
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title?.toLowerCase().includes(searchTerm)) ||
        (item.description?.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredHistory(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
    setFilteredHistory(leaveHistory);
    showToast("Filters cleared", "success");
  };

  // Sync leave types from Xero
  const syncLeaveTypes = async () => {
    if (!selectedOrganization?.id) {
      showToast("Please select an organization first", "error");
      return;
    }

    setLoadingSync(true);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      //console.log("Syncing leave types from Xero...");

      const response = await axiosClient.post('/xero/leaves/sync-types', {
        organization_id: selectedOrganization.id.toString()
      });

      //console.log("Sync types response:", response.data);

      if (response.data?.status === true) {
        setSyncSuccess(`Successfully synced ${response.data.data?.length || 0} leave types from Xero`);
        showToast(`Synced ${response.data.data?.length || 0} leave types`, "success");

        // Refresh leave types after sync
        await fetchLeaveTypes();
      } else {
        throw new Error(response.data?.message || "Failed to sync leave types");
      }
    } catch (error) {
      console.error("Sync error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to sync leave types from Xero";
      setSyncError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoadingSync(false);
    }
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setShowHistory(false); // Reset history view when employee changes
    setLeaveHistory([]); // Clear history
    setFilteredHistory([]);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.employee_id) {
      errors.employee_id = "Please select an employee";
    }
    if (!formData.leave_type_id) {
      errors.leave_type_id = "Please select a leave type";
    }
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      errors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        errors.end_date = "End date cannot be before start date";
      }
    }
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters";
    }

    return errors;
  };

  // Calculate number of days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrganization?.id) {
      showToast("Please select an organization first", "error");
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      // console.log("Submitting leave request...");

      // Find selected leave type to get its Xero leave type ID
      const selectedLeaveType = leaveTypes.find(
        type => type.xero_leave_type_id === formData.leave_type_id || type.id.toString() === formData.leave_type_id
      );

      const leaveTypeId = selectedLeaveType?.xero_leave_type_id || formData.leave_type_id;

      const response = await axiosClient.post('/xero/leaves/apply', {
        organization_id: selectedOrganization.id.toString(),
        employee_id: formData.employee_id.toString(),
        leave_type_id: leaveTypeId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description.trim(),
      });

      //console.log("Submit response:", response.data);

      if (response.data?.status === true) {
        setSubmitSuccess(response.data.message || "Leave request submitted successfully");
        showToast("Leave request submitted successfully!", "success");

        // Reset form but keep employee selected
        setFormData({
          employee_id: selectedEmployee?.id || "",
          leave_type_id: leaveTypes.length > 0 ? (leaveTypes[0].xero_leave_type_id || leaveTypes[0].id) : "",
          start_date: "",
          end_date: "",
          description: "",
        });
        setFormErrors({});

        // Refresh leave history for the selected employee
        if (selectedEmployee) {
          await fetchLeaveHistory(selectedEmployee.id);
        }
      } else {
        throw new Error(response.data?.message || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit leave request";
      setSubmitError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle className="text-green-500" /> },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock className="text-yellow-500" /> },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimesCircle className="text-red-500" /> },
      'SCHEDULED': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaClock className="text-blue-500" /> },
    };

    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    const style = statusMap[normalizedStatus] || statusMap.PENDING;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status || 'Pending'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Calculate total days for display
  const totalDays = calculateDays(formData.start_date, formData.end_date);

  // If no organization is selected
  if (!selectedOrganization?.id) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization to manage Xero leaves</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          //console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          //console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] ${toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
              }`}>
              {toast.type === 'success' ? (
                <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
              ) : (
                <FaTimesCircle className="text-red-500 text-xl flex-shrink-0" />
              )}
              <p className={`text-sm font-medium flex-1 ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                {toast.message}
              </p>
              <button
                onClick={() => setToast({ show: false, message: '', type: 'success' })}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-400 text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Leave Details Modal */}
        {showLeaveDetails && selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaFileAlt className="text-blue-600" />
                    Leave Details
                  </h2>
                  <button
                    onClick={() => setShowLeaveDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Leave ID</p>
                        <p className="text-sm font-medium">{selectedLeave.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Xero Leave ID</p>
                        <p className="text-sm font-medium break-all">{selectedLeave.xero_leave_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Title</p>
                        <p className="text-sm font-medium">{selectedLeave.title || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p>{getStatusBadge(selectedLeave.status)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Date Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium">{formatDate(selectedLeave.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-sm font-medium">{formatDate(selectedLeave.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium">
                          {calculateDays(selectedLeave.start_date, selectedLeave.end_date)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Applied Date</p>
                        <p className="text-sm font-medium">{formatDateTime(selectedLeave.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Employee Info */}
                  {selectedLeave.employee_connection && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-3">Employee Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Employee Name</p>
                          <p className="text-sm font-medium">
                            {selectedLeave.employee_connection.employee?.first_name} {selectedLeave.employee_connection.employee?.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Xero Employee ID</p>
                          <p className="text-sm font-medium break-all">{selectedLeave.xero_employee_id}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Xero Data */}
                  {selectedLeave.xero_data && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-3">Xero Data</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Leave Periods</p>
                          {selectedLeave.xero_data.LeavePeriods?.map((period, index) => (
                            <div key={index} className="text-sm mt-1 p-2 bg-white rounded">
                              <p>Status: {period.LeavePeriodStatus}</p>
                              <p>Units: {period.NumberOfUnits}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowLeaveDetails(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Xero Leave Management
                </h1>
                <p className="text-gray-600">
                  Select employee, sync leave types, apply for leaves, and track leave history
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <FaBriefcase className="text-gray-400" />
                <span className="text-sm text-gray-600">Organization:</span>
                <span className="font-semibold text-gray-900">{selectedOrganization.name}</span>
              </div>
            </div>
          </div>

          {/* Sync Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <FaSync className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-1">
                      Sync Xero Leave Types
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Fetch the latest leave types from your Xero account
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={syncLeaveTypes}
                    disabled={loadingSync}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loadingSync ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <FaSync />
                        Sync Leave Types
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Sync Status */}
              {syncSuccess && (
                <div className="mt-4 bg-green-500/20 text-green-100 p-3 rounded-lg flex items-center gap-2">
                  <FaCheckCircle />
                  <span className="text-sm">{syncSuccess}</span>
                </div>
              )}
              {syncError && (
                <div className="mt-4 bg-red-500/20 text-red-100 p-3 rounded-lg flex items-center gap-2">
                  <FaTimesCircle />
                  <span className="text-sm">{syncError}</span>
                </div>
              )}

              {/* Leave Types Summary */}
              {leaveTypes.length > 0 && (
                <div className="mt-4 bg-white/10 p-4 rounded-lg">
                  <p className="text-white text-sm mb-2">
                    {leaveTypes.length} leave types available:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {leaveTypes.slice(0, 5).map((type) => (
                      <span
                        key={type.id}
                        className="px-3 py-1 bg-white/20 text-white text-xs rounded-full"
                      >
                        {type.name} {type.is_paid_leave === 1 ? '(Paid)' : '(Unpaid)'}
                      </span>
                    ))}
                    {leaveTypes.length > 5 && (
                      <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                        +{leaveTypes.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Employee Selection and Apply Leave Form - Left Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg sticky top-6">
                {/* Employee Selection Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaUsers />
                    Select Employee
                  </h2>
                  <p className="text-blue-100 text-xs mt-1">
                    Choose an employee to manage leaves
                  </p>
                </div>

                {/* Employee Dropdown */}
                <div className="p-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <InfiniteScrollEmployeeDropdown
                    employees={employees}
                    value={selectedEmployee ? String(selectedEmployee.employee_id || selectedEmployee.id) : ''}
                    selectedName={selectedEmployee ? `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim() || selectedEmployee.name : ''}
                    onChange={(val) => {
                      if (val && val !== 'all') {
                        const emp = employees.find(e => String(e.employee_id || e.id) === val);
                        if (emp) {
                          handleEmployeeSelect({ ...emp, id: emp.employee_id || emp.id });
                        }
                      } else {
                        handleEmployeeSelect(null);
                      }
                    }}
                    onLoadMore={loadMoreEmployees}
                    hasMore={employeePage < employeeLastPage}
                    isLoading={employeesLoading}
                    onSearch={(q) => {
                      setEmployeeSearch(q);
                      fetchEmployees(1, q, false);
                    }}
                    placeholder="Select an employee"
                    required
                    disabled={isEmployee}
                  />
                </div>

                {/* Apply Leave Form - Only show if employee selected and user has permission */}
                {selectedEmployee && canAdd && (
                  <>
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FaPaperPlane />
                        Apply for Leave
                      </h2>
                      <p className="text-blue-100 text-xs mt-1">
                        Submit a new leave request for {selectedEmployee.first_name} {selectedEmployee.last_name}
                      </p>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6">
                      <div className="space-y-5">
                        {/* Leave Type Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Leave Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="leave_type_id"
                            value={formData.leave_type_id}
                            onChange={handleInputChange}
                            className={`w-full border ${formErrors.leave_type_id ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                          >
                            <option value="">Select a leave type</option>
                            {leaveTypes.length > 0 ? (
                              leaveTypes.map((type) => (
                                <option key={type.id} value={type.xero_leave_type_id}>
                                  {type.name} {type.is_paid_leave === 1 ? '(Paid)' : '(Unpaid)'}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                {loadingLeaveTypes ? "Loading leave types..." : "Please sync leave types first"}
                              </option>
                            )}
                          </select>
                          {formErrors.leave_type_id && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <FaInfoCircle />
                              {formErrors.leave_type_id}
                            </p>
                          )}
                        </div>

                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              name="start_date"
                              value={formData.start_date}
                              onChange={handleInputChange}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full border ${formErrors.start_date ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                            />
                          </div>
                          {formErrors.start_date && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <FaInfoCircle />
                              {formErrors.start_date}
                            </p>
                          )}
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              name="end_date"
                              value={formData.end_date}
                              onChange={handleInputChange}
                              min={formData.start_date || new Date().toISOString().split('T')[0]}
                              className={`w-full border ${formErrors.end_date ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                            />
                          </div>
                          {formErrors.end_date && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <FaInfoCircle />
                              {formErrors.end_date}
                            </p>
                          )}
                        </div>

                        {/* Duration Summary */}
                        {formData.start_date && formData.end_date && totalDays > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700">
                              Total duration: <span className="font-bold">{totalDays}</span> day{totalDays !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description/Reason <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Please provide a detailed reason for your leave request..."
                            className={`w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none`}
                          />
                          {formErrors.description && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <FaInfoCircle />
                              {formErrors.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500 text-right">
                            {formData.description.length}/500 characters
                          </p>
                        </div>

                        {/* Submit Status */}
                        {submitSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                            <p className="text-sm text-green-700">{submitSuccess}</p>
                          </div>
                        )}
                        {submitError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                            <FaTimesCircle className="text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{submitError}</p>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submitting || leaveTypes.length === 0}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {submitting ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane />
                              Apply Leave
                            </>
                          )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          * Required fields. Your request will be sent to Xero for approval.
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Leave History Table - Right Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaFileAlt />
                        Leave History
                      </h2>
                      {selectedEmployee && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedEmployee && (
                        <>
                          <button
                            onClick={() => fetchLeaveHistory(selectedEmployee.id)}
                            disabled={loadingHistory}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <FaEye className={loadingHistory ? 'animate-spin' : ''} />
                            View Leave History
                          </button>
                          <button
                            onClick={() => selectedEmployee && fetchLeaveHistory(selectedEmployee.id)}
                            disabled={loadingHistory}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            title="Refresh leave history"
                          >
                            <FaRedoAlt className={loadingHistory ? 'animate-spin' : ''} />
                            Refresh
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show message if no employee selected */}
                {!selectedEmployee ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                      <FaUsers className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Employee Selected
                    </h3>
                    <p className="text-gray-500">
                      Please select an employee from the dropdown to view their leave history
                    </p>
                  </div>
                ) : !showHistory ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                      <FaEye className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Click to View History
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Click the "View Leave History" button to see leave records for {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </p>
                  </div>
                ) : loadingHistory ? (
                  <div className="flex justify-center items-center py-16">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading leave history...</span>
                  </div>
                ) : historyError ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 inline-flex p-4 rounded-full mb-4">
                      <FaTimesCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Failed to Load History
                    </h3>
                    <p className="text-gray-500 mb-4">{historyError}</p>
                    <button
                      onClick={() => fetchLeaveHistory(selectedEmployee.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : leaveHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                      <FaFileAlt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Leave History
                    </h3>
                    <p className="text-gray-500">
                      No leave records found for {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Filter Panel */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${showFilters || activeFilters > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          <FaFilter />
                          Filters
                          {activeFilters > 0 && (
                            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                              {activeFilters}
                            </span>
                          )}
                          <FaChevronDown className={`text-xs transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <p className="text-sm text-gray-500">
                          Showing {filteredHistory.length} of {leaveHistory.length} records
                        </p>
                      </div>

                      {showFilters && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Search Filter */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Search
                            </label>
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search by title..."
                                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Status Filter */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Status
                            </label>
                            <select
                              name="status"
                              value={filters.status}
                              onChange={handleFilterChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="all">All Status</option>
                              <option value="APPROVED">Approved</option>
                              <option value="PENDING">Pending</option>
                              <option value="SCHEDULED">Scheduled</option>
                            </select>
                          </div>

                          {/* Start Date Filter */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              From Date
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              value={filters.startDate}
                              onChange={handleFilterChange}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* End Date Filter */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              name="endDate"
                              value={filters.endDate}
                              onChange={handleFilterChange}
                              min={filters.startDate}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Filter Actions */}
                      {activeFilters > 0 && (
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Table with Actions */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              End Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Applied Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredHistory.map((leave) => {
                            const startDate = formatDate(leave.start_date);
                            const endDate = formatDate(leave.end_date);
                            const days = calculateDays(leave.start_date, leave.end_date);

                            return (
                              <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-gray-900">
                                    {leave.title || leave.description || 'Leave Request'}
                                  </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-900">{startDate}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-900">{endDate}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-900">
                                    {days} day{days !== 1 ? 's' : ''}
                                  </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(leave.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-500">
                                    {formatDate(leave.created_at)}
                                  </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => viewLeaveDetails(leave)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="View Details"
                                    >
                                      <FaEye />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveRequests;
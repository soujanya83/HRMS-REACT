import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaDownload,
  FaSync,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaDesktop,
  FaExclamationTriangle,
  FaFingerprint,
  FaUsers,
  FaSpinner,
  FaSave,
  FaEdit,
  FaTimes,
  FaCheck,
  FaTrash,
  FaRegClock,
  FaCoffee,
  FaMoneyBill,
  FaCalendar,
  FaBuilding,
  FaHome,
  FaPercent,
  FaDollarSign,
  FaStickyNote
} from "react-icons/fa";
import { attendanceService, attendanceRuleService } from "../../services/attendanceService";
import { employeeService } from "../../services/employeeService";
import { useOrganizations } from "../../contexts/OrganizationContext";

const AttendanceTracking = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for attendance rules
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState(null);
  const [rulesSuccess, setRulesSuccess] = useState(null);
  const [existingRule, setExistingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedOrganization } = useOrganizations();

  // Attendance Rules Form State
  const [ruleForm, setRuleForm] = useState({
    shift_name: "",
    check_in: "09:00",
    check_out: "18:00",
    break_start: "13:00",
    break_end: "14:00",
    late_grace_minutes: 15,
    half_day_after_minutes: 240,
    allow_overtime: true,
    overtime_rate: 1.5,
    weekly_off_days: "Sunday",
    flexible_hours: false,
    absent_after_minutes: 480,
    is_remote_applicable: true,
    rounding_minutes: 5,
    cross_midnight: false,
    late_penalty_amount: 0,
    absent_penalty_amount: 0,
    relaxation: "",
    policy_notes: "",
    policy_version: "1.0",
    is_active: true
  });

  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    employee_id: "all",
    department: "all",
    status: "all",
    search: "",
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    onTime: 0,
    onLeave: 0,
  });

  // Weekly days options
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch initial data
  useEffect(() => {
    if (selectedOrganization) {
      fetchInitialData();
    }
  }, [selectedOrganization]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees
      const employeesResponse = await employeeService.getEmployees({
        organization_id: selectedOrganization.id,
      });

      // Fetch attendance data
      const attendanceResponse = await attendanceService.getAttendance({
        organization_id: selectedOrganization.id,
        from_date: filters.start_date,
        to_date: filters.end_date,
      });

      console.log("Attendance API response:", attendanceResponse);

      // Handle employees data
      const employeesData = employeesResponse.data?.data || 
                           employeesResponse.data || 
                           [];

      // Handle attendance data
      let attendanceData = [];
      if (attendanceResponse.data?.success === true) {
        if (attendanceResponse.data.data?.data && Array.isArray(attendanceResponse.data.data.data)) {
          // Structure: {success: true, data: {current_page: 1, data: [...]}}
          attendanceData = attendanceResponse.data.data.data;
        } else if (Array.isArray(attendanceResponse.data.data)) {
          attendanceData = attendanceResponse.data.data;
        }
      }

      console.log("Processed attendance data:", attendanceData);
      setEmployees(employeesData);
      setAttendanceData(attendanceData);

      // Extract departments from employees
      const departmentsMap = new Map();
      employeesData.forEach((emp) => {
        if (emp.department_id) {
          const deptId = emp.department_id;
          const deptName = emp.department_name || `Department ${deptId}`;
          
          if (!departmentsMap.has(deptId)) {
            departmentsMap.set(deptId, {
              id: deptId,
              name: deptName
            });
          }
        }
      });
      
      const departmentsList = Array.from(departmentsMap.values());
      console.log("Departments extracted:", departmentsList);
      setDepartments(departmentsList);

      calculateStats(attendanceData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      setEmployees([]);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance rules when modal opens
  const fetchAttendanceRules = async () => {
    if (!selectedOrganization?.id) {
      setRulesError("No organization selected");
      return;
    }

    setRulesLoading(true);
    setRulesError(null);
    setRulesSuccess(null);

    try {
      // Call API to get attendance rules by organization ID
      const response = await attendanceRuleService.getRulesByOrganization(selectedOrganization.id);
      
      console.log("Attendance Rules API Response:", response.data);
      
      if (response.data && response.data.status === true && response.data.data) {
        const rulesData = response.data.data;
        
        if (Array.isArray(rulesData) && rulesData.length > 0) {
          // Get the first rule (assuming one rule per organization)
          const organizationRule = rulesData[0];
          console.log("Found existing rule for organization:", organizationRule);
          
          setExistingRule(organizationRule);
          
          // Pre-fill form with existing data
          setRuleForm({
            shift_name: organizationRule.shift_name || "",
            check_in: organizationRule.check_in || "09:00",
            check_out: organizationRule.check_out || "18:00",
            break_start: organizationRule.break_start || "13:00",
            break_end: organizationRule.break_end || "14:00",
            late_grace_minutes: organizationRule.late_grace_minutes || 15,
            half_day_after_minutes: organizationRule.half_day_after_minutes || 240,
            allow_overtime: organizationRule.allow_overtime !== undefined ? organizationRule.allow_overtime : true,
            overtime_rate: parseFloat(organizationRule.overtime_rate) || 1.5,
            weekly_off_days: organizationRule.weekly_off_days || "Sunday",
            flexible_hours: organizationRule.flexible_hours !== undefined ? organizationRule.flexible_hours : false,
            absent_after_minutes: organizationRule.absent_after_minutes || 480,
            is_remote_applicable: organizationRule.is_remote_applicable !== undefined ? organizationRule.is_remote_applicable : true,
            rounding_minutes: organizationRule.rounding_minutes || 5,
            cross_midnight: organizationRule.cross_midnight !== undefined ? organizationRule.cross_midnight : false,
            late_penalty_amount: parseFloat(organizationRule.late_penalty_amount) || 0,
            absent_penalty_amount: parseFloat(organizationRule.absent_penalty_amount) || 0,
            relaxation: organizationRule.relaxation || "",
            policy_notes: organizationRule.policy_notes || "",
            policy_version: organizationRule.policy_version || "1.0",
            is_active: organizationRule.is_active !== undefined ? organizationRule.is_active : true
          });
        } else {
          console.log("No rule found for organization - will create new");
          setExistingRule(null);
          resetRuleForm();
        }
      } else {
        console.log("No rules data found in response");
        setExistingRule(null);
        resetRuleForm();
      }
    } catch (err) {
      console.error("Error fetching attendance rules:", err);
      
      // Check if it's a 404 error (no rules exist)
      if (err.response?.status === 404) {
        console.log("No attendance rules found - will create new");
        setExistingRule(null);
        resetRuleForm();
        setRulesError(null);
      } else {
        setRulesError(err.response?.data?.message || "Failed to load attendance rules");
      }
    } finally {
      setRulesLoading(false);
    }
  };

  // Open attendance rules modal
  const handleOpenRulesModal = async () => {
    setShowRulesModal(true);
    setRulesError(null);
    setRulesSuccess(null);
    await fetchAttendanceRules();
  };

  // Reset form to defaults
  const resetRuleForm = () => {
    setRuleForm({
      shift_name: "",
      check_in: "09:00",
      check_out: "18:00",
      break_start: "13:00",
      break_end: "14:00",
      late_grace_minutes: 15,
      half_day_after_minutes: 240,
      allow_overtime: true,
      overtime_rate: 1.5,
      weekly_off_days: "Sunday",
      flexible_hours: false,
      absent_after_minutes: 480,
      is_remote_applicable: true,
      rounding_minutes: 5,
      cross_midnight: false,
      late_penalty_amount: 0,
      absent_penalty_amount: 0,
      relaxation: "",
      policy_notes: "",
      policy_version: "1.0",
      is_active: true
    });
  };

  // Handle form input changes
  const handleRuleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRuleForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  // Handle select multiple for weekly off days
  const handleWeeklyOffDaysChange = (e) => {
    const { value, checked } = e.target;
    const currentDays = ruleForm.weekly_off_days.split(',').filter(day => day.trim());
    
    let updatedDays;
    if (checked) {
      updatedDays = [...currentDays, value];
    } else {
      updatedDays = currentDays.filter(day => day !== value);
    }
    
    setRuleForm(prev => ({
      ...prev,
      weekly_off_days: updatedDays.join(',')
    }));
  };

  // Handle form submission
  const handleRulesSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRulesError(null);
    setRulesSuccess(null);

    if (!selectedOrganization?.id) {
      setRulesError("No organization selected");
      setIsSubmitting(false);
      return;
    }

    // Prepare data for API
    const formData = {
      ...ruleForm,
      organization_id: Number(selectedOrganization.id),
      // Convert boolean values
      allow_overtime: ruleForm.allow_overtime ? 1 : 0,
      flexible_hours: ruleForm.flexible_hours ? 1 : 0,
      is_remote_applicable: ruleForm.is_remote_applicable ? 1 : 0,
      cross_midnight: ruleForm.cross_midnight ? 1 : 0,
      is_active: ruleForm.is_active ? 1 : 0
    };

    console.log("Submitting form data:", formData);

    try {
      let response;
      
      if (existingRule) {
        // Update existing rule
        console.log("Updating rule with ID:", existingRule.id);
        response = await attendanceRuleService.updateRule(existingRule.id, formData);
      } else {
        // Create new rule
        console.log("Creating new rule");
        response = await attendanceRuleService.createRule(formData);
      }

      console.log("API Response:", response.data);

      if (response.data.status === true) {
        setRulesSuccess(response.data.message || (existingRule ? "Attendance rule updated successfully!" : "Attendance rule created successfully!"));
        // Refresh rules
        await fetchAttendanceRules();
        
        // Auto-close modal after success
        setTimeout(() => {
          setShowRulesModal(false);
        }, 2000);
      } else {
        setRulesError(response.data.message || "Failed to save attendance rule");
      }
    } catch (err) {
      console.error("Error saving attendance rule:", err);
      setRulesError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || "Failed to save attendance rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete rule
  const handleDeleteRule = async () => {
    if (!existingRule || !window.confirm("Are you sure you want to delete this attendance rule?")) {
      return;
    }

    setIsSubmitting(true);
    setRulesError(null);

    try {
      const response = await attendanceRuleService.deleteRule(existingRule.id);
      
      if (response.data.status === true) {
        setRulesSuccess(response.data.message || "Attendance rule deleted successfully!");
        setExistingRule(null);
        resetRuleForm();
        
        setTimeout(() => {
          setShowRulesModal(false);
        }, 2000);
      } else {
        setRulesError(response.data.message || "Failed to delete attendance rule");
      }
    } catch (err) {
      console.error("Error deleting attendance rule:", err);
      setRulesError(err.response?.data?.message || "Failed to delete attendance rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate work hours
  const calculateWorkHours = () => {
    const checkIn = new Date(`2000-01-01T${ruleForm.check_in}`);
    const checkOut = new Date(`2000-01-01T${ruleForm.check_out}`);
    
    let diff = (checkOut - checkIn) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    
    return diff.toFixed(1);
  };

  const calculateStats = (data) => {
    const attendanceArray = Array.isArray(data) ? data : [];
    
    const present = attendanceArray.filter(emp => 
      emp.status && emp.status.toLowerCase() === "present"
    ).length;
    
    const absent = attendanceArray.filter(emp => 
      emp.status && emp.status.toLowerCase() === "absent"
    ).length;
    
    const late = attendanceArray.filter(emp => 
      emp.is_late && emp.is_late !== "0"
    ).length;
    
    const onTime = present - late;
    const onLeave = attendanceArray.filter(emp => 
      emp.status && (emp.status.toLowerCase() === "on_leave" || emp.status.toLowerCase() === "on leave")
    ).length;

    setStats({
      totalEmployees: employees.length,
      present,
      absent,
      late,
      onTime,
      onLeave,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchInitialData();
  };

  const handleExport = async () => {
    try {
      const dataToExport = Array.isArray(attendanceData) ? attendanceData : [];
      const csvContent = convertToCSV(dataToExport);
      downloadCSV(
        csvContent,
        `attendance-${filters.start_date}-to-${filters.end_date}.csv`
      );
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: "bg-green-100 text-green-800 border border-green-200",
      Present: "bg-green-100 text-green-800 border border-green-200",
      absent: "bg-red-100 text-red-800 border border-red-200",
      Absent: "bg-red-100 text-red-800 border border-red-200",
      late: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Late: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "On Leave": "bg-blue-100 text-blue-800 border border-blue-200",
      on_leave: "bg-blue-100 text-blue-800 border border-blue-200",
    };

    return `px-3 py-1 text-xs font-semibold rounded-full ${
      statusConfig[status] || "bg-gray-100 text-gray-800 border border-gray-200"
    }`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTimeDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter data based on current filters
  const filteredData = Array.isArray(attendanceData)
    ? attendanceData.filter((record) => {
        const employee = record.employee || {};
        const matchesSearch =
          !filters.search ||
          (employee.first_name && employee.first_name.toLowerCase().includes(filters.search.toLowerCase())) ||
          (employee.last_name && employee.last_name.toLowerCase().includes(filters.search.toLowerCase())) ||
          (employee.employee_code && employee.employee_code.toLowerCase().includes(filters.search.toLowerCase()));

        const matchesDepartment =
          filters.department === "all" ||
          (employee.department_id && employee.department_id.toString() === filters.department.toString());

        const matchesStatus =
          filters.status === "all" ||
          (record.status && record.status.toLowerCase() === filters.status.toLowerCase());

        return matchesSearch && matchesDepartment && matchesStatus;
      })
    : [];

  const statusCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: FaUsers,
      color: "blue",
    },
    {
      label: "Present Today",
      value: stats.present,
      icon: FaUserCheck,
      color: "green",
    },
    {
      label: "Absent",
      value: stats.absent,
      icon: FaUserTimes,
      color: "red",
    },
    {
      label: "Late Arrivals",
      value: stats.late,
      icon: FaClock,
      color: "yellow",
    },
    {
      label: "On Time",
      value: stats.onTime,
      icon: FaUserCheck,
      color: "purple",
    },
    {
      label: "On Leave",
      value: stats.onLeave,
      icon: FaCalendarAlt,
      color: "indigo",
    },
  ];

  if (loading && attendanceData.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Attendance Tracking
            </h1>
            <p className="text-gray-600">
              Monitor and manage employee attendance in real-time
            </p>
          </div>
          
          {/* Attendance Rules Button */}
          <button
            onClick={handleOpenRulesModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <FaClock className="h-4 w-4" />
            Attendance Rules
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statusCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`text-${stat.color}-500 text-xl`}>
                  <stat.icon />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 flex-1">{error}</span>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative max-w-md">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  Start Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) =>
                      handleFilterChange("start_date", e.target.value)
                    }
                    className="block w-full border border-gray-300 pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  End Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) =>
                      handleFilterChange("end_date", e.target.value)
                    }
                    className="block w-full border border-gray-300 pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  value={filters.employee_id}
                  onChange={(e) =>
                    handleFilterChange("employee_id", e.target.value)
                  }
                  className="block w-full border border-gray-300 rounded-lg shadow-smfocus:border-blue-500 py-2.5 px-3 bg-white focus:outline-none focus:ring-2  focus:border-transparent transition-colors"
                >
                  <option value="all">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={`dept-${dept.id}`} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm  focus:border-blue-500 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Check In/Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <FaClock className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          No attendance records found
                        </p>
                        <p className="text-gray-500">
                          Try adjusting your filters or refresh the data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-700 font-medium">
                              {record.employee?.first_name?.[0] || "E"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {record.employee?.first_name} {record.employee?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employee?.employee_code}
                            </div>
                            <div className="text-xs text-gray-400">
                              {record.employee?.department_id ? `Department ${record.employee.department_id}` : 'No Department'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-green-500 text-sm" />
                            <span className="font-medium">
                              {formatTime(record.check_in)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FaClock className="text-red-500 text-sm" />
                            <span className="font-medium">
                              {formatTime(record.check_out)}
                            </span>
                          </div>
                          {record.is_late && record.is_late !== "0" && (
                            <div className="text-xs text-yellow-600 mt-1 font-medium">
                              Late arrival
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {record.total_work_hours || "0.00"} hours
                        </div>
                        {record.is_overtime && record.is_overtime !== 0 && (
                          <div className="text-xs text-blue-600 font-medium">
                            Overtime
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(record.status)}>
                          {record.status
                            ? record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                            onClick={() => {
                              alert(`Viewing details for ${record.employee?.first_name}'s attendance`);
                            }}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Summary ({filters.start_date} to {filters.end_date})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Employees Present",
                value: stats.present,
                color: "blue",
              },
              {
                label: "On Time Rate",
                value:
                  stats.totalEmployees > 0
                    ? Math.round((stats.onTime / stats.totalEmployees) * 100)
                    : 0,
                color: "green",
                suffix: "%",
              },
              {
                label: "Late Arrival Rate",
                value:
                  stats.totalEmployees > 0
                    ? Math.round((stats.late / stats.totalEmployees) * 100)
                    : 0,
                color: "yellow",
                suffix: "%",
              },
              {
                label: "Absence Rate",
                value:
                  stats.totalEmployees > 0
                    ? Math.round((stats.absent / stats.totalEmployees) * 100)
                    : 0,
                color: "red",
                suffix: "%",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className={`text-2xl font-bold text-${item.color}-600`}>
                  {item.value}
                  {item.suffix || ""}
                </div>
                <div className="text-sm text-gray-600 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {existingRule ? "Edit Attendance Rules" : "Add Attendance Rules"}
                </h2>
                <p className="text-gray-600 text-sm">
                  {existingRule ? "Update existing rules" : "Create new rules"} for {selectedOrganization?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setRulesError(null);
                  setRulesSuccess(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Loading State */}
              {rulesLoading && (
                <div className="text-center py-8">
                  <FaSpinner className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading attendance rules...</p>
                </div>
              )}

              {/* Error Message */}
              {rulesError && !rulesLoading && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-700">{rulesError}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {rulesSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <FaCheck className="text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-700">{rulesSuccess}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              {!rulesLoading && (
                <form onSubmit={handleRulesSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaRegClock /> Basic Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shift Name
                        </label>
                        <input
                          type="text"
                          name="shift_name"
                          value={ruleForm.shift_name}
                          onChange={handleRuleFormChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Regular Office Hours"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-in Time
                          </label>
                          <input
                            type="time"
                            name="check_in"
                            value={ruleForm.check_in}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-out Time
                          </label>
                          <input
                            type="time"
                            name="check_out"
                            value={ruleForm.check_out}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800">Work Hours:</span>
                          <span className="text-lg font-bold text-blue-600">{calculateWorkHours()} hours</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {formatTimeDisplay(ruleForm.check_in)} - {formatTimeDisplay(ruleForm.check_out)}
                        </div>
                      </div>
                    </div>

                    {/* Break Time Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaCoffee /> Break Time
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break Start
                          </label>
                          <input
                            type="time"
                            name="break_start"
                            value={ruleForm.break_start}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break End
                          </label>
                          <input
                            type="time"
                            name="break_end"
                            value={ruleForm.break_end}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Overtime Settings */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="allow_overtime"
                              checked={ruleForm.allow_overtime}
                              onChange={handleRuleFormChange}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Allow Overtime</span>
                          </label>
                          
                          <div className="flex items-center gap-2">
                            <FaPercent className="text-gray-400" />
                            <input
                              type="number"
                              name="overtime_rate"
                              value={ruleForm.overtime_rate}
                              onChange={handleRuleFormChange}
                              step="0.1"
                              min="1"
                              className="w-20 border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="1.5"
                            />
                            <span className="text-sm text-gray-500">Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grace Period & Penalties */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaClock /> Grace Period & Penalties
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Late Grace (minutes)
                          </label>
                          <input
                            type="number"
                            name="late_grace_minutes"
                            value={ruleForm.late_grace_minutes}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Late Penalty ($)
                          </label>
                          <div className="flex items-center">
                            <FaDollarSign className="text-gray-400 mr-2" />
                            <input
                              type="number"
                              name="late_penalty_amount"
                              value={ruleForm.late_penalty_amount === 0 ? '' : ruleForm.late_penalty_amount}
                              onChange={handleRuleFormChange}
                              onFocus={(e) => {
                                if (ruleForm.late_penalty_amount === 0) {
                                  e.target.value = '';
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  setRuleForm(prev => ({ ...prev, late_penalty_amount: 0 }));
                                }
                              }}
                              step="0.01"
                              min="0"
                              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Half Day After (minutes)
                          </label>
                          <input
                            type="number"
                            name="half_day_after_minutes"
                            value={ruleForm.half_day_after_minutes}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Absent After (minutes)
                          </label>
                          <input
                            type="number"
                            name="absent_after_minutes"
                            value={ruleForm.absent_after_minutes}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Absent Penalty ($)
                        </label>
                        <div className="flex items-center">
                          <FaDollarSign className="text-gray-400 mr-2" />
                          <input
                            type="number"
                            name="absent_penalty_amount"
                            value={ruleForm.absent_penalty_amount === 0 ? '' : ruleForm.absent_penalty_amount}
                            onChange={handleRuleFormChange}
                            onFocus={(e) => {
                              if (ruleForm.absent_penalty_amount === 0) {
                                e.target.value = '';
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setRuleForm(prev => ({ ...prev, absent_penalty_amount: 0 }));
                              }
                            }}
                            step="0.01"
                            min="0"
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaBuilding /> Additional Settings
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weekly Off Days
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {weekDays.map(day => {
                            const isSelected = ruleForm.weekly_off_days.split(',').includes(day);
                            return (
                              <label key={day} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  value={day}
                                  checked={isSelected}
                                  onChange={handleWeeklyOffDaysChange}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{day}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="flexible_hours"
                            checked={ruleForm.flexible_hours}
                            onChange={handleRuleFormChange}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Flexible Hours</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="is_remote_applicable"
                            checked={ruleForm.is_remote_applicable}
                            onChange={handleRuleFormChange}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Remote Work Allowed</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="cross_midnight"
                            checked={ruleForm.cross_midnight}
                            onChange={handleRuleFormChange}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Cross Midnight Shift</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={ruleForm.is_active}
                            onChange={handleRuleFormChange}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Active Rule</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rounding Minutes
                        </label>
                        <input
                          type="number"
                          name="rounding_minutes"
                          value={ruleForm.rounding_minutes}
                          onChange={handleRuleFormChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaStickyNote /> Notes & Version
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relaxation
                          </label>
                          <input
                            type="text"
                            name="relaxation"
                            value={ruleForm.relaxation}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Flexible break times"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Policy Version
                          </label>
                          <input
                            type="text"
                            name="policy_version"
                            value={ruleForm.policy_version}
                            onChange={handleRuleFormChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1.0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Notes
                        </label>
                        <textarea
                          name="policy_notes"
                          value={ruleForm.policy_notes}
                          onChange={handleRuleFormChange}
                          rows="3"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional notes about the attendance policy..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    {/* <div className="flex gap-2">
                      {existingRule && (
                        <button
                          type="button"
                          onClick={handleDeleteRule}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          <FaTrash /> Delete Rule
                        </button>
                      )}
                    </div> */}
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRulesModal(false);
                          setRulesError(null);
                          setRulesSuccess(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            {existingRule ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <FaSave />
                            {existingRule ? "Update Rule" : "Create Rule"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
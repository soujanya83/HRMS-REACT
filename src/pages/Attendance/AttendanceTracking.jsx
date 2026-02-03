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
  FaStickyNote,
  FaUser,
  FaCalculator
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

  // State for view details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [calculatedHours, setCalculatedHours] = useState({
    totalHours: 0,
    breakHours: 0,
    netHours: 0,
    overtimeHours: 0
  });

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

  // Update initial filters to get more data
  const [filters, setFilters] = useState({
    start_date: "2026-01-01", // Start from Jan 2026 to see all data
    end_date: "2026-02-28",   // End in Feb 2026
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

  // Function to calculate hours from check-in and check-out times
  const calculateHours = (checkIn, checkOut, breakDuration = 0) => {
    if (!checkIn || !checkOut) {
      return {
        total: "0.00",
        break: "0.00",
        net: "0.00",
        overtime: "0.00"
      };
    }

    try {
      // Parse times
      const [inHour, inMinute] = checkIn.split(':').map(Number);
      const [outHour, outMinute] = checkOut.split(':').map(Number);

      // Calculate total minutes
      let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
      
      // Handle cross-midnight (if check-out is earlier than check-in)
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Add 24 hours
      }

      // Calculate hours
      const totalHours = totalMinutes / 60;
      const breakHours = (breakDuration || 0) / 60;
      const netHours = Math.max(0, totalHours - breakHours);
      
      // Calculate overtime (assuming 8 hours regular work day)
      const overtimeHours = Math.max(0, netHours - 8);

      return {
        total: totalHours.toFixed(2),
        break: breakHours.toFixed(2),
        net: netHours.toFixed(2),
        overtime: overtimeHours.toFixed(2)
      };
    } catch (error) {
      console.error("Error calculating hours:", error);
      return {
        total: "0.00",
        break: "0.00",
        net: "0.00",
        overtime: "0.00"
      };
    }
  };

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

      console.log("Fetching data for org:", selectedOrganization.id);
      console.log("Date range:", filters.start_date, "to", filters.end_date);

      // Fetch employees
      const employeesResponse = await employeeService.getEmployees({
        organization_id: selectedOrganization.id,
      });

      // Fetch attendance data - USE CORRECT PARAMETER NAMES
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

      // Handle attendance data - FIXED
      let attendanceData = [];
      if (attendanceResponse.data?.success === true) {
        if (attendanceResponse.data.data?.data && Array.isArray(attendanceResponse.data.data.data)) {
          // Structure: {success: true, data: {current_page: 1, data: [...]}}
          attendanceData = attendanceResponse.data.data.data;
        } else if (Array.isArray(attendanceResponse.data.data)) {
          attendanceData = attendanceResponse.data.data;
        } else if (Array.isArray(attendanceResponse.data)) {
          attendanceData = attendanceResponse.data;
        }
      }

      console.log("Processed attendance data:", attendanceData);
      console.log("Number of attendance records:", attendanceData.length);
      
      // Check for duplicate employee records
      const employeeIds = attendanceData.map(record => record.employee_id);
      const uniqueEmployeeIds = [...new Set(employeeIds)];
      console.log("Unique employee IDs in attendance:", uniqueEmployeeIds);

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

  // Function to handle view details
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    
    // Calculate hours for this record
    const hours = calculateHours(
      record.check_in, 
      record.check_out, 
      record.break_duration
    );
    
    setCalculatedHours({
      totalHours: parseFloat(hours.total) || 0,
      breakHours: parseFloat(hours.break) || 0,
      netHours: parseFloat(hours.net) || 0,
      overtimeHours: parseFloat(hours.overtime) || 0
    });
    
    setShowDetailsModal(true);
  };

  // Function to handle view notes
  const handleViewNotes = (record) => {
    console.log("View notes for:", record);
    if (record.notes) {
      alert(`Notes for ${record.employee?.first_name}:\n\n${record.notes}`);
    } else {
      alert("No notes available for this record.");
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

    // Prepare data for API - FIXED: Use correct field names
    const formData = {
      shift_name: ruleForm.shift_name,
      check_in: ruleForm.check_in,
      check_out: ruleForm.check_out,
      break_start: ruleForm.break_start,
      break_end: ruleForm.break_end,
      late_grace_minutes: ruleForm.late_grace_minutes,
      half_day_after_minutes: ruleForm.half_day_after_minutes,
      allow_overtime: ruleForm.allow_overtime,
      overtime_rate: ruleForm.overtime_rate,
      weekly_off_days: ruleForm.weekly_off_days,
      flexible_hours: ruleForm.flexible_hours,
      absent_after_minutes: ruleForm.absent_after_minutes,
      is_remote_applicable: ruleForm.is_remote_applicable,
      rounding_minutes: ruleForm.rounding_minutes,
      cross_midnight: ruleForm.cross_midnight,
      late_penalty_amount: ruleForm.late_penalty_amount,
      absent_penalty_amount: ruleForm.absent_penalty_amount,
      relaxation: ruleForm.relaxation,
      policy_notes: ruleForm.policy_notes,
      policy_version: ruleForm.policy_version,
      is_active: ruleForm.is_active,
      organization_id: Number(selectedOrganization.id)
    };

    console.log("Submitting form data:", formData);

    try {
      let response;
      
      if (existingRule) {
        // Update existing rule - USE PUT
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
      
      // Check for 405 error specifically
      if (err.response?.status === 405) {
        setRulesError("Method not allowed. Trying PUT method instead of POST...");
        // Try with PUT method
        try {
          const putResponse = await attendanceRuleService.updateRule(existingRule.id, formData);
          if (putResponse.data.status === true) {
            setRulesSuccess("Attendance rule updated successfully!");
            await fetchAttendanceRules();
            setTimeout(() => {
              setShowRulesModal(false);
            }, 2000);
          }
        } catch (putError) {
          setRulesError(putError.response?.data?.message || "Failed to save attendance rule");
        }
      } else {
        setRulesError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || "Failed to save attendance rule");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate work hours for rules modal
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
      emp.is_late && emp.is_late !== "0" && emp.is_late !== "0.00"
    ).length;
    
    const onTime = present - late;
    const onLeave = attendanceArray.filter(emp => 
      emp.status && (emp.status.toLowerCase() === "on_leave" || emp.status.toLowerCase() === "on leave")
    ).length;

    // Count unique employees
    const uniqueEmployeeIds = [...new Set(attendanceArray.map(record => record.employee_id))];
    const uniqueEmployeesCount = uniqueEmployeeIds.length;

    setStats({
      totalEmployees: uniqueEmployeesCount, // Use unique employee count
      present,
      absent,
      late,
      onTime,
      onLeave,
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Refresh data when date filters change
    if (key === 'start_date' || key === 'end_date') {
      fetchAttendanceData(newFilters);
    }
  };

  const fetchAttendanceData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        organization_id: selectedOrganization.id,
        from_date: filterParams.start_date,
        to_date: filterParams.end_date,
        ...(filterParams.employee_id !== "all" && {
          employee_id: filterParams.employee_id,
        }),
      };

      const response = await attendanceService.getAttendance(params);

      // Handle the response structure
      let data = [];
      if (response.data && response.data.success && response.data.data) {
        if (response.data.data.data) {
          data = response.data.data.data; // Paginated response
        } else {
          data = response.data.data; // Direct array
        }
      }

      console.log("Refreshed attendance data:", data);
      console.log("Number of records:", data.length);
      setAttendanceData(data);
      calculateStats(data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to load attendance data.");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAttendanceData();
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
      return new Date(dateTimeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeString;
    }
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

        const matchesEmployee =
          filters.employee_id === "all" ||
          (record.employee_id && record.employee_id.toString() === filters.employee_id.toString());

        return matchesSearch && matchesDepartment && matchesStatus && matchesEmployee;
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
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Date Range:</span> {formatDate(filters.start_date)} to {formatDate(filters.end_date)} | 
              <span className="font-medium ml-2">Records:</span> {attendanceData.length} | 
              <span className="font-medium ml-2">Unique Employees:</span> {stats.totalEmployees}
            </div>
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
              {/* <div>
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
              </div> */}

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
                  filteredData.map((record) => {
                    // Calculate hours for this record
                    const hours = calculateHours(
                      record.check_in, 
                      record.check_out, 
                      record.break_duration
                    );
                    
                    return (
                      <tr
                        key={`${record.id}-${record.date}`} // Use combination of id and date for unique key
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
                              <div className="text-sm font-medium text-gray-900">
                                {record.employee?.first_name || "Unknown"} {record.employee?.last_name || ""}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.employee?.employee_code || "No ID"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatDate(record.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employee?.department_name || "No Department"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <FaClock className="h-4 w-4 text-green-500 mr-2" />
                              <span className="font-medium">In: </span>
                              <span className="ml-1 text-gray-700">
                                {formatTime(record.check_in) || "-"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaClock className="h-4 w-4 text-red-500 mr-2" />
                              <span className="font-medium">Out: </span>
                              <span className="ml-1 text-gray-700">
                                {formatTime(record.check_out) || "-"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaCoffee className="h-4 w-4 text-yellow-500 mr-2" />
                              <span className="font-medium">Break: </span>
                              <span className="ml-1 text-gray-700">
                                {record.break_duration ? `${record.break_duration} mins` : "-"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {hours.net} hrs
                          </div>
                          <div className="text-sm text-gray-500">
                            {parseFloat(hours.overtime) > 0 ? (
                              <span className="flex items-center">
                                <FaMoneyBill className="h-3 w-3 text-yellow-600 mr-1" />
                                OT: {hours.overtime} hrs
                              </span>
                            ) : (
                              "No overtime"
                            )}
                          </div>
                          {record.is_late && parseFloat(record.is_late) > 0 && (
                            <div className="text-sm text-red-600 font-medium mt-1">
                              Late by {record.is_late} mins
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(record.status)}>
                            {record.status?.replace("_", " ") || "Unknown"}
                          </span>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              {record.check_in_device === "mobile" ? (
                                <>
                                  <FaMobileAlt className="h-3 w-3 mr-1" />
                                  Mobile check-in
                                </>
                              ) : record.check_in_device === "web" ? (
                                <>
                                  <FaDesktop className="h-3 w-3 mr-1" />
                                  Web check-in
                                </>
                              ) : (
                                record.check_in_device || "No device info"
                              )}
                            </div>
                            {record.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                                {record.location}
                              </div>
                            )}
                            {record.attendance_type === "biometric" && (
                              <div className="flex items-center text-xs text-blue-500">
                                <FaFingerprint className="h-3 w-3 mr-1" />
                                Biometric
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                              onClick={() => handleViewDetails(record)}
                            >
                              View
                            </button>
                            {record.notes && (
                              <button
                                className="text-purple-600 hover:text-purple-900 px-3 py-1.5 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                                onClick={() => handleViewNotes(record)}
                              >
                                Notes
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination/Info Footer */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing <span className="font-medium">{filteredData.length}</span> of{" "}
            <span className="font-medium">{attendanceData.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleRefresh}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Attendance Details
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedRecord.employee?.first_name} {selectedRecord.employee?.last_name} - {formatDate(selectedRecord.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Employee Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUser className="mr-2" />
                      Employee Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRecord.employee?.first_name || "Unknown"} {selectedRecord.employee?.last_name || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Employee Code</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRecord.employee?.employee_code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Department</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRecord.employee?.department_name || "No Department"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Designation</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRecord.employee?.designation || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Details */}
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaClock className="mr-2" />
                      Attendance Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(selectedRecord.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <span className={getStatusBadge(selectedRecord.status)}>
                          {selectedRecord.status?.replace("_", " ") || "Unknown"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check In Time</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatTime(selectedRecord.check_in) || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check Out Time</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatTime(selectedRecord.check_out) || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Break Duration</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedRecord.break_duration ? `${selectedRecord.break_duration} minutes` : "No break"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hours Calculation */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaCalculator className="mr-2" />
                      Hours Calculation
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold text-green-600">
                          {calculatedHours.totalHours.toFixed(2)} hrs
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Break Time</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {calculatedHours.breakHours.toFixed(2)} hrs
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Net Hours</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {calculatedHours.netHours.toFixed(2)} hrs
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Overtime</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {calculatedHours.overtimeHours.toFixed(2)} hrs
                        </p>
                      </div>
                    </div>
                    {selectedRecord.is_late && parseFloat(selectedRecord.is_late) > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <FaExclamationTriangle className="text-red-500 mr-2" />
                          <p className="text-red-700 font-medium">
                            Late by {selectedRecord.is_late} minutes
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Device Type</p>
                        <p className="text-gray-900">
                          {selectedRecord.check_in_device === "mobile" ? (
                            <span className="flex items-center">
                              <FaMobileAlt className="mr-2" /> Mobile Device
                            </span>
                          ) : selectedRecord.check_in_device === "web" ? (
                            <span className="flex items-center">
                              <FaDesktop className="mr-2" /> Web Browser
                            </span>
                          ) : (
                            selectedRecord.check_in_device || "Unknown"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Attendance Type</p>
                        <p className="text-gray-900">
                          {selectedRecord.attendance_type === "biometric" ? (
                            <span className="flex items-center">
                              <FaFingerprint className="mr-2" /> Biometric
                            </span>
                          ) : (
                            selectedRecord.attendance_type || "Manual"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-gray-900">
                          {selectedRecord.location || "Location not recorded"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedRecord.notes && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <FaStickyNote className="mr-2" />
                        Notes
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {existingRule ? "Edit Attendance Rules" : "Create Attendance Rules"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure attendance policies for {selectedOrganization?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRulesModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                {/* Status Messages */}
                {rulesError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm mt-1">{rulesError}</p>
                    </div>
                  </div>
                )}

                {rulesSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-700 font-medium">Success</p>
                      <p className="text-green-600 text-sm mt-1">{rulesSuccess}</p>
                    </div>
                  </div>
                )}

                {rulesLoading ? (
                  <div className="text-center py-12">
                    <FaSpinner className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading attendance rules...</p>
                  </div>
                ) : (
                  <form onSubmit={handleRulesSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaBuilding className="inline mr-2" />
                          Basic Settings
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shift Name *
                          </label>
                          <input
                            type="text"
                            name="shift_name"
                            value={ruleForm.shift_name}
                            onChange={handleRuleFormChange}
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Regular Shift, Night Shift"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Check In Time
                            </label>
                            <input
                              type="time"
                              name="check_in"
                              value={ruleForm.check_in}
                              onChange={handleRuleFormChange}
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Check Out Time
                            </label>
                            <input
                              type="time"
                              name="check_out"
                              value={ruleForm.check_out}
                              onChange={handleRuleFormChange}
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center text-sm text-blue-700">
                            <FaRegClock className="mr-2" />
                            <span className="font-medium">Work Hours: </span>
                            <span className="ml-1">{calculateWorkHours()} hours</span>
                          </div>
                        </div>
                      </div>

                      {/* Break Settings */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaCoffee className="inline mr-2" />
                          Break Settings
                        </h4>
                        
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
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="flex items-center text-sm text-yellow-700">
                            <FaCoffee className="mr-2" />
                            <span className="font-medium">Break Duration: </span>
                            <span className="ml-1">1 hour</span>
                          </div>
                        </div>
                      </div>

                      {/* Grace Period & Thresholds */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaExclamationTriangle className="inline mr-2" />
                          Grace Period & Thresholds
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Late Grace Period (minutes)
                          </label>
                          <input
                            type="number"
                            name="late_grace_minutes"
                            value={ruleForm.late_grace_minutes}
                            onChange={handleRuleFormChange}
                            min="0"
                            max="120"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Half Day After (minutes)
                          </label>
                          <input
                            type="number"
                            name="half_day_after_minutes"
                            value={ruleForm.half_day_after_minutes}
                            onChange={handleRuleFormChange}
                            min="0"
                            max="720"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mark Absent After (minutes)
                          </label>
                          <input
                            type="number"
                            name="absent_after_minutes"
                            value={ruleForm.absent_after_minutes}
                            onChange={handleRuleFormChange}
                            min="0"
                            max="1440"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>

                      {/* Overtime & Penalties */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaMoneyBill className="inline mr-2" />
                          Overtime & Penalties
                        </h4>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="allow_overtime"
                            name="allow_overtime"
                            checked={ruleForm.allow_overtime}
                            onChange={handleRuleFormChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="allow_overtime" className="ml-2 block text-sm text-gray-700">
                            Allow Overtime
                          </label>
                        </div>

                        {ruleForm.allow_overtime && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Overtime Rate (x regular rate)
                            </label>
                            <div className="relative">
                              <FaPercent className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                              <input
                                type="number"
                                name="overtime_rate"
                                value={ruleForm.overtime_rate}
                                onChange={handleRuleFormChange}
                                step="0.1"
                                min="1"
                                max="3"
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Late Penalty Amount
                            </label>
                            <div className="relative">
                              <FaDollarSign className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                              <input
                                type="number"
                                name="late_penalty_amount"
                                value={ruleForm.late_penalty_amount}
                                onChange={handleRuleFormChange}
                                min="0"
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Absent Penalty Amount
                            </label>
                            <div className="relative">
                              <FaDollarSign className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                              <input
                                type="number"
                                name="absent_penalty_amount"
                                value={ruleForm.absent_penalty_amount}
                                onChange={handleRuleFormChange}
                                min="0"
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Off Days */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaCalendar className="inline mr-2" />
                          Weekly Off Days
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {weekDays.map(day => {
                            const isSelected = ruleForm.weekly_off_days.split(',').includes(day);
                            return (
                              <div key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`day-${day}`}
                                  value={day}
                                  checked={isSelected}
                                  onChange={handleWeeklyOffDaysChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-700">
                                  {day}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Additional Settings */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaHome className="inline mr-2" />
                          Additional Settings
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="flexible_hours"
                              name="flexible_hours"
                              checked={ruleForm.flexible_hours}
                              onChange={handleRuleFormChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="flexible_hours" className="ml-2 block text-sm text-gray-700">
                              Flexible Working Hours
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="is_remote_applicable"
                              name="is_remote_applicable"
                              checked={ruleForm.is_remote_applicable}
                              onChange={handleRuleFormChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_remote_applicable" className="ml-2 block text-sm text-gray-700">
                              Allow Remote Attendance
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="cross_midnight"
                              name="cross_midnight"
                              checked={ruleForm.cross_midnight}
                              onChange={handleRuleFormChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="cross_midnight" className="ml-2 block text-sm text-gray-700">
                              Shift Crosses Midnight
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="is_active"
                              name="is_active"
                              checked={ruleForm.is_active}
                              onChange={handleRuleFormChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                              Rule is Active
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Rounding (minutes)
                          </label>
                          <input
                            type="number"
                            name="rounding_minutes"
                            value={ruleForm.rounding_minutes}
                            onChange={handleRuleFormChange}
                            min="0"
                            max="60"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>

                      {/* Notes & Version */}
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          <FaStickyNote className="inline mr-2" />
                          Policy Details
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relaxation / Special Cases
                          </label>
                          <textarea
                            name="relaxation"
                            value={ruleForm.relaxation}
                            onChange={handleRuleFormChange}
                            rows="2"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., 2 grace days per month, special cases..."
                          />
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
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Additional policy details, terms, and conditions..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Policy Version
                            </label>
                            <input
                              type="text"
                              name="policy_version"
                              value={ruleForm.policy_version}
                              onChange={handleRuleFormChange}
                              className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="e.g., 1.0, 2.1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {existingRule ? (
                          <div className="flex items-center gap-2">
                            <FaEdit className="text-blue-500" />
                            <span>Editing existing rule created on {formatDate(existingRule.created_at)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaSave className="text-green-500" />
                            <span>Creating new attendance rule</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRulesModal(false)}
                          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        
                        {existingRule && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this attendance rule?")) {
                                console.log("Delete rule");
                                alert("Delete rule functionality would be implemented here");
                              }
                            }}
                            className="px-5 py-2.5 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                            disabled={isSubmitting}
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AttendanceTracking;
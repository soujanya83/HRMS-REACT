import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../axiosClient';
import { 
  FaSearch, 
  FaFilter, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaPlus,
  FaHistory,
  FaSpinner,
  FaUsers,
  FaBuilding,
  FaRedoAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaInfoCircle,
  FaCoffee,
  FaHourglassHalf
} from 'react-icons/fa';
import { HiX } from "react-icons/hi";
import manualAdjustmentService from "../../services/manualAdjustmentService";
import { employeeService } from "../../services/employeeService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
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
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
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
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
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

const ManualAdjustments = () => {
  const { selectedOrganization } = useOrganizations();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [editingAdjustment, setEditingAdjustment] = useState(null);
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    search: '',
    startDate: '',
    endDate: '',
    employee_id: 'all'
  });

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // New adjustment form state - UPDATED with break times
  const [newAdjustment, setNewAdjustment] = useState({
    employee_id: '',
    organization_id: '',
    attendance_id: '',
    date: '',
    original_check_in: '09:00',
    original_check_out: '18:00',
    original_break_start: '13:00',
    original_break_end: '14:00',
    adjusted_check_in: '09:00',
    adjusted_check_out: '18:00',
    adjusted_break_start: '13:00',
    adjusted_break_end: '14:00',
    reason: '',
    created_by: 4
  });

  // Edit form state - UPDATED with break times
  const [editForm, setEditForm] = useState({
    adjusted_check_in: '',
    adjusted_check_out: '',
    adjusted_break_start: '',
    adjusted_break_end: ''
  });

  // Stats state
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // User ID (replace with actual user ID from your auth system)
  const userId = 4;

  // Fetch all data when organization changes
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchInitialData();
    }
  }, [selectedOrganization]);

  // Fetch initial data
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdjustments(),
        fetchEmployees(),
        fetchDepartments()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch adjustments from API with filters
  const fetchAdjustments = async () => {
    if (!selectedOrganization?.id) {
      toast.error('Please select an organization');
      return;
    }
    
    try {
      const params = {};
      
      // Apply filters to API params
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.date) params.date = filters.date;
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.search) params.search = filters.search;
      if (filters.employee_id !== 'all') params.employee_id = filters.employee_id;

      const response = await manualAdjustmentService.getAdjustmentsList(
        selectedOrganization.id, 
        params
      );
      
      if (response.data?.status === true && Array.isArray(response.data.data)) {
        const transformedData = transformAdjustmentsData(response.data.data);
        setAdjustments(transformedData);
        calculateStats(transformedData);
      } else {
        setAdjustments([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch adjustments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch adjustments');
      setAdjustments([]);
    }
  };

  // Transform API data to component format - UPDATED with break times
  const transformAdjustmentsData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => {
      // Extract department name from employee data
      let departmentName = 'N/A';
      if (item.employee?.department_id) {
        const dept = departments.find(d => d.id === item.employee.department_id);
        departmentName = dept ? dept.name : `Dept ${item.employee.department_id}`;
      }
      
      return {
        id: item.id,
        employee_id: item.employee?.employee_code || `EMP${item.employee_id}`,
        employee_name: item.employee ? 
          `${item.employee.first_name || ''} ${item.employee.last_name || ''}`.trim() : 
          `Employee ${item.employee_id}`,
        department: departmentName,
        department_id: item.employee?.department_id || null,
        adjustment_date: item.date,
        original_check_in: formatTimeForDisplay(item.original_check_in),
        original_check_out: formatTimeForDisplay(item.original_check_out),
        original_break_start: formatTimeForDisplay(item.original_break_start),
        original_break_end: formatTimeForDisplay(item.original_break_end),
        adjusted_check_in: formatTimeForDisplay(item.adjusted_check_in),
        adjusted_check_out: formatTimeForDisplay(item.adjusted_check_out),
        adjusted_break_start: formatTimeForDisplay(item.adjusted_break_start),
        adjusted_break_end: formatTimeForDisplay(item.adjusted_break_end),
        reason: item.reason || '',
        status: item.status?.toLowerCase() || 'pending',
        approved_by: item.approved_by || null,
        approved_by_name: item.approved_by_name || '-',
        requested_date: item.created_at || new Date().toISOString(),
        total_hours_change: calculateTimeDifference(
          item.original_check_in,
          item.original_check_out,
          item.adjusted_check_in,
          item.adjusted_check_out,
          item.original_break_start,
          item.original_break_end,
          item.adjusted_break_start,
          item.adjusted_break_end
        ),
        raw_data: item,
        employee_raw: item.employee,
        attendance_raw: item.attendance
      };
    });
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    if (!selectedOrganization?.id) return;
    
    try {
      const response = await employeeService.getAllEmployees({ 
        organization_id: selectedOrganization.id 
      });
      
      let employeesData = [];
      if (response?.data?.success === true && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        employeesData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setEmployees([]);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    if (!selectedOrganization?.id) return;
    
    try {
      const response = await axiosClient.get(`/organizations/${selectedOrganization.id}/departments`);
      
      let departmentsData = [];
      if (response?.data?.success === true && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        departmentsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      }
      
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  // Load existing attendance when employee and date are selected - UPDATED with break times
  const loadExistingAttendance = useCallback(async () => {
    if (!newAdjustment.employee_id || !newAdjustment.date) return;
    
    try {
      const response = await manualAdjustmentService.getAttendanceByEmployeeDate(
        newAdjustment.employee_id,
        newAdjustment.date
      );
      
      if (response.data?.success === true && response.data.data) {
        const attendance = response.data.data;
        setNewAdjustment(prev => ({
          ...prev,
          attendance_id: attendance.id,
          // Use the actual check_in/check_out/break times from attendance
          original_check_in: attendance.check_in || '09:00',
          original_check_out: attendance.check_out || '18:00',
          original_break_start: attendance.break_start || '13:00',
          original_break_end: attendance.break_end || '14:00',
          adjusted_check_in: attendance.check_in || '09:00',
          adjusted_check_out: attendance.check_out || '18:00',
          adjusted_break_start: attendance.break_start || '13:00',
          adjusted_break_end: attendance.break_end || '14:00',
          organization_id: attendance.organization_id || selectedOrganization.id
        }));
      } else {
        // No existing attendance found - keep default times
        setNewAdjustment(prev => ({
          ...prev,
          attendance_id: '',
          original_check_in: '09:00',
          original_check_out: '18:00',
          original_break_start: '13:00',
          original_break_end: '14:00',
          adjusted_check_in: '09:00',
          adjusted_check_out: '18:00',
          adjusted_break_start: '13:00',
          adjusted_break_end: '14:00'
        }));
      }
    } catch (error) {
      console.log('No existing attendance found for this date', error);
      // On 404 error, just keep the default times
      setNewAdjustment(prev => ({
        ...prev,
        attendance_id: '',
        original_check_in: '09:00',
        original_check_out: '18:00',
        original_break_start: '13:00',
        original_break_end: '14:00',
        adjusted_check_in: '09:00',
        adjusted_check_out: '18:00',
        adjusted_break_start: '13:00',
        adjusted_break_end: '14:00'
      }));
    }
  }, [newAdjustment.employee_id, newAdjustment.date, selectedOrganization]);

  // Handle new adjustment form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdjustment(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes - UPDATED with break times
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters and fetch data
  const applyFilters = () => {
    fetchAdjustments();
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      date: '',
      search: '',
      startDate: '',
      endDate: '',
      employee_id: 'all'
    });
  };

  // Submit new adjustment request - UPDATED with break times validation
  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!newAdjustment.employee_id || !newAdjustment.date || !newAdjustment.reason) {
        toast.error('Employee, Date, and Reason are required fields');
        setSubmitting(false);
        return;
      }

      if (!newAdjustment.adjusted_check_in && !newAdjustment.adjusted_check_out && 
          !newAdjustment.adjusted_break_start && !newAdjustment.adjusted_break_end) {
        toast.error('Please adjust at least one time (check-in, check-out, or break time)');
        setSubmitting(false);
        return;
      }

      // Prepare data for API
      const adjustmentData = {
        employee_id: parseInt(newAdjustment.employee_id),
        organization_id: selectedOrganization.id,
        attendance_id: newAdjustment.attendance_id ? parseInt(newAdjustment.attendance_id) : null,
        date: newAdjustment.date,
        original_check_in: formatTimeForAPI(newAdjustment.original_check_in),
        original_check_out: formatTimeForAPI(newAdjustment.original_check_out),
        original_break_start: formatTimeForAPI(newAdjustment.original_break_start),
        original_break_end: formatTimeForAPI(newAdjustment.original_break_end),
        adjusted_check_in: formatTimeForAPI(newAdjustment.adjusted_check_in) || null,
        adjusted_check_out: formatTimeForAPI(newAdjustment.adjusted_check_out) || null,
        adjusted_break_start: formatTimeForAPI(newAdjustment.adjusted_break_start) || null,
        adjusted_break_end: formatTimeForAPI(newAdjustment.adjusted_break_end) || null,
        reason: newAdjustment.reason,
        created_by: userId
      };

      // Remove null values
      Object.keys(adjustmentData).forEach(key => {
        if (adjustmentData[key] === null || adjustmentData[key] === undefined) {
          delete adjustmentData[key];
        }
      });

      const response = await manualAdjustmentService.createAdjustment(adjustmentData);
      
      if (response.data?.status === true) {
        toast.success('Adjustment request submitted successfully!');
        setShowAdjustmentForm(false);
        resetNewAdjustmentForm();
        fetchAdjustments();
      } else {
        toast.error(response.data?.message || 'Failed to submit adjustment request');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      
      // Show detailed validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join('\n');
          toast.error(`Validation Error:\n${errorMessages}`);
        } else {
          toast.error(error.response.data?.message || 'Validation error occurred');
        }
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to submit adjustment request';
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset new adjustment form - UPDATED with break times
  const resetNewAdjustmentForm = () => {
    setNewAdjustment({
      employee_id: '',
      organization_id: selectedOrganization?.id || '',
      attendance_id: '',
      date: '',
      original_check_in: '09:00',
      original_check_out: '18:00',
      original_break_start: '13:00',
      original_break_end: '14:00',
      adjusted_check_in: '09:00',
      adjusted_check_out: '18:00',
      adjusted_break_start: '13:00',
      adjusted_break_end: '14:00',
      reason: '',
      created_by: userId
    });
  };

  // Open view modal for adjustment
  const handleViewAdjustment = async (adjustmentId) => {
    try {
      const response = await manualAdjustmentService.getAdjustmentById(adjustmentId);
      
      if (response.data) {
        setSelectedAdjustment(response.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error viewing adjustment:', error);
      toast.error('Failed to load adjustment details');
    }
  };

  // Open edit modal for adjustment - UPDATED with break times
  const handleEditAdjustment = (adjustment) => {
    setEditingAdjustment(adjustment);
    setEditForm({
      adjusted_check_in: adjustment.adjusted_check_in.replace(/ [AP]M$/, ''),
      adjusted_check_out: adjustment.adjusted_check_out.replace(/ [AP]M$/, ''),
      adjusted_break_start: adjustment.adjusted_break_start ? adjustment.adjusted_break_start.replace(/ [AP]M$/, '') : '13:00',
      adjusted_break_end: adjustment.adjusted_break_end ? adjustment.adjusted_break_end.replace(/ [AP]M$/, '') : '14:00'
    });
    setShowEditModal(true);
  };

  // Submit edit form - UPDATED with break times
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      const editData = {
        adjusted_check_in: formatTimeForAPI(editForm.adjusted_check_in),
        adjusted_check_out: formatTimeForAPI(editForm.adjusted_check_out),
        adjusted_break_start: formatTimeForAPI(editForm.adjusted_break_start),
        adjusted_break_end: formatTimeForAPI(editForm.adjusted_break_end)
      };

      const response = await manualAdjustmentService.updateAdjustment(editingAdjustment.id, editData);
      
      if (response.data?.status === true) {
        toast.success('Adjustment updated successfully!');
        setShowEditModal(false);
        fetchAdjustments();
      } else {
        toast.error(response.data?.message || 'Failed to update adjustment');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update adjustment');
    }
  };

  // Approve adjustment
  const handleApprove = async (adjustmentId) => {
    if (!window.confirm('Are you sure you want to approve this adjustment?')) return;
    
    try {
      const response = await manualAdjustmentService.approveAdjustment(adjustmentId, userId);
      
      if (response.data?.status === true) {
        toast.success('Adjustment approved successfully!');
        fetchAdjustments();
      } else {
        toast.error(response.data?.message || 'Failed to approve adjustment');
      }
      
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve adjustment');
    }
  };

  // Reject adjustment
  const handleReject = async (adjustmentId) => {
    if (!window.confirm('Are you sure you want to reject this adjustment?')) return;
    
    try {
      const response = await manualAdjustmentService.rejectAdjustment(adjustmentId, userId);
      
      if (response.data?.status === true) {
        toast.success('Adjustment rejected successfully!');
        fetchAdjustments();
      } else {
        toast.error(response.data?.message || 'Failed to reject adjustment');
      }
      
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject adjustment');
    }
  };

  // Delete adjustment
  const handleDelete = async (adjustmentId) => {
    if (!window.confirm('Are you sure you want to delete this adjustment? This action cannot be undone.')) return;
    
    try {
      const response = await manualAdjustmentService.deleteAdjustment(adjustmentId);
      
      if (response.status === 200 || response.status === 204) {
        toast.success('Adjustment deleted successfully!');
        fetchAdjustments();
      } else {
        toast.error('Failed to delete adjustment');
      }
      
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Failed to delete adjustment');
    }
  };

  // Export adjustments to CSV - UPDATED with break times
  const exportAdjustments = () => {
    if (filteredAdjustments.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const exportData = filteredAdjustments.map(adj => ({
      'Employee Name': adj.employee_name,
      'Employee ID': adj.employee_id,
      'Department': adj.department,
      'Date': adj.adjustment_date,
      'Original Check-in': adj.original_check_in,
      'Original Check-out': adj.original_check_out,
      'Original Break Start': adj.original_break_start || '--:--',
      'Original Break End': adj.original_break_end || '--:--',
      'Adjusted Check-in': adj.adjusted_check_in,
      'Adjusted Check-out': adj.adjusted_check_out,
      'Adjusted Break Start': adj.adjusted_break_start || '--:--',
      'Adjusted Break End': adj.adjusted_break_end || '--:--',
      'Reason': adj.reason,
      'Status': adj.status.charAt(0).toUpperCase() + adj.status.slice(1),
      'Hours Change': adj.total_hours_change,
      'Requested Date': formatDateTime(adj.requested_date),
      'Approved By': adj.approved_by_name
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `adjustments-${selectedOrganization?.name || 'org'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${exportData.length} adjustments`);
  };

  // Format time for display (HH:MM AM/PM)
  const formatTimeForDisplay = (timeString) => {
    if (!timeString || timeString === '00:00:00' || timeString === '--:--' || timeString === null || timeString === 'null') {
      return '--:--';
    }
    
    try {
      let timeToFormat = timeString;
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length === 3) {
          timeToFormat = `${parts[0]}:${parts[1]}`;
        }
      }
      
      const [hours, minutes] = timeToFormat.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return timeString;
      }
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      
      return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      error
      return timeString;
    }
  };

  // Format time for API (HH:MM:SS)
  const formatTimeForAPI = (timeString) => {
    if (!timeString || timeString === '--:--' || timeString === '') {
      return null;
    }
    
    if (!timeString.trim()) {
      return null;
    }
    
    // If time is in format "09:30 AM", convert to "09:30:00"
    if (timeString.includes(' ')) {
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':');
      
      hours = parseInt(hours);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    }
    
    // If already in HH:MM format, add seconds
    if (timeString.length === 5 && timeString.includes(':')) {
      return `${timeString}:00`;
    }
    
    // If already in HH:MM:SS format, return as is
    if (timeString.length === 8 && timeString.includes(':')) {
      return timeString;
    }
    
    return timeString;
  };

  // Format date-time for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      let date;
      if (dateTimeString.includes('T')) {
        date = new Date(dateTimeString);
      } else {
        date = new Date(dateTimeString.replace(' ', 'T'));
      }
      
      if (isNaN(date.getTime())) {
        return dateTimeString;
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      error
      return dateTimeString;
    }
  };

  // Calculate time difference between original and adjusted times - UPDATED with break times
  const calculateTimeDifference = (origIn, origOut, adjIn, adjOut, origBreakStart, origBreakEnd, adjBreakStart, adjBreakEnd) => {
    const toMinutes = (timeStr) => {
      if (!timeStr || timeStr === '--:--' || timeStr === '00:00:00' || timeStr === null) return 0;
      
      try {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;5
        return (hours || 0) * 60 + (minutes || 0);
      } catch {
        return 0;
      }
    };

    const origInMin = toMinutes(origIn);
    const origOutMin = toMinutes(origOut);
    const adjInMin = toMinutes(adjIn);
    const adjOutMin = toMinutes(adjOut);
    
    const origBreakStartMin = toMinutes(origBreakStart);
    const origBreakEndMin = toMinutes(origBreakEnd);
    const adjBreakStartMin = toMinutes(adjBreakStart);
    const adjBreakEndMin = toMinutes(adjBreakEnd);

    const origBreakDuration = Math.max(0, origBreakEndMin - origBreakStartMin);
    const adjBreakDuration = Math.max(0, adjBreakEndMin - adjBreakStartMin);

    const origNetDuration = Math.max(0, origOutMin - origInMin) - origBreakDuration;
    const adjNetDuration = Math.max(0, adjOutMin - adjInMin) - adjBreakDuration;
    
    const diff = adjNetDuration - origNetDuration;
    
    if (Math.abs(diff) < 1) return '±0h 00m';
    
    const hours = Math.floor(Math.abs(diff) / 60);
    const minutes = Math.abs(diff) % 60;
    const sign = diff > 0 ? '+' : '-';
    
    return `${sign}${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // Calculate statistics from adjustments data
  const calculateStats = (data) => {
    const dataArray = Array.isArray(data) ? data : [];
    
    const approved = dataArray.filter(adj => 
      adj.status === 'approved'
    ).length;
    const pending = dataArray.filter(adj => 
      adj.status === 'pending'
    ).length;
    const rejected = dataArray.filter(adj => 
      adj.status === 'rejected'
    ).length;

    setStats({
      totalRequests: dataArray.length,
      approved,
      pending,
      rejected
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    const statusConfig = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[statusLower] || 'bg-gray-100 text-gray-800'}`;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  // Filter adjustments based on filters
  const filteredAdjustments = adjustments.filter(adj => {
    // Status filter
    if (filters.status !== 'all' && adj.status !== filters.status) {
      return false;
    }
    
    // Employee filter
    if (filters.employee_id !== 'all' && adj.employee_id !== filters.employee_id) {
      return false;
    }
    
    // Date filter
    if (filters.date && adj.adjustment_date !== filters.date) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate && new Date(adj.adjustment_date) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(adj.adjustment_date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        adj.employee_name?.toLowerCase().includes(searchLower) ||
        adj.employee_id?.toLowerCase().includes(searchLower) ||
        adj.reason?.toLowerCase().includes(searchLower) ||
        adj.department?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Loading state
  if (loading && adjustments.length === 0) {
    return (
      <div 
        className="p-6 min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading manual adjustments...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {selectedOrganization?.name}</p>
        </div>
      </div>
    );
  }

  // No organization selected
  if (!selectedOrganization?.id) {
    return (
      <div 
        className="p-6 min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaBuilding className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600 mb-4">Please select an organization to view manual adjustments</p>
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
          console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div 
        className="p-4 md:p-6 lg:p-8 min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusDraggable pauseOnHover />
        
        {/* View Adjustment Modal - UPDATED with break times display */}
        {showViewModal && selectedAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[80] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Adjustment Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Employee Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Employee Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Employee Name</p>
                      <p className="font-medium">
                        {selectedAdjustment.employee?.first_name} {selectedAdjustment.employee?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employee Code</p>
                      <p className="font-medium">{selectedAdjustment.employee?.employee_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">
                        {departments.find(d => d.id === selectedAdjustment.employee?.department_id)?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedAdjustment.employee?.personal_email}</p>
                    </div>
                  </div>
                </div>
                
                {/* Adjustment Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" /> Adjustment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Adjustment Date</p>
                      <p className="font-medium">
                        {new Date(selectedAdjustment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={getStatusBadge(selectedAdjustment.status)}>
                        {selectedAdjustment.status?.charAt(0).toUpperCase() + selectedAdjustment.status?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="font-medium">User ID: {selectedAdjustment.created_by}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">{formatDateTime(selectedAdjustment.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Time Comparison - UPDATED with break times */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Time Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3 text-center">Original Times</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-semibold">{formatTimeForDisplay(selectedAdjustment.original_check_in)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-semibold">{formatTimeForDisplay(selectedAdjustment.original_check_out)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-gray-600 flex items-center gap-1">
                            <FaCoffee className="text-yellow-500" /> Break:
                          </span>
                          <span className="font-semibold">
                            {formatTimeForDisplay(selectedAdjustment.original_break_start)} - {formatTimeForDisplay(selectedAdjustment.original_break_end)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-700 mb-3 text-center">Adjusted Times</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600">Check-in:</span>
                          <span className="font-semibold text-blue-700">{formatTimeForDisplay(selectedAdjustment.adjusted_check_in)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600">Check-out:</span>
                          <span className="font-semibold text-blue-700">{formatTimeForDisplay(selectedAdjustment.adjusted_check_out)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                          <span className="text-blue-600 flex items-center gap-1">
                            <FaCoffee className="text-blue-500" /> Break:
                          </span>
                          <span className="font-semibold text-blue-700">
                            {formatTimeForDisplay(selectedAdjustment.adjusted_break_start)} - {formatTimeForDisplay(selectedAdjustment.adjusted_break_end)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Difference */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Time Change:</span>
                      <span className={`text-lg font-bold ${
                        calculateTimeDifference(
                          selectedAdjustment.original_check_in,
                          selectedAdjustment.original_check_out,
                          selectedAdjustment.adjusted_check_in,
                          selectedAdjustment.adjusted_check_out,
                          selectedAdjustment.original_break_start,
                          selectedAdjustment.original_break_end,
                          selectedAdjustment.adjusted_break_start,
                          selectedAdjustment.adjusted_break_end
                        ).includes('+') 
                          ? 'text-green-600' 
                          : calculateTimeDifference(
                              selectedAdjustment.original_check_in,
                              selectedAdjustment.original_check_out,
                              selectedAdjustment.adjusted_check_in,
                              selectedAdjustment.adjusted_check_out,
                              selectedAdjustment.original_break_start,
                              selectedAdjustment.original_break_end,
                              selectedAdjustment.adjusted_break_start,
                              selectedAdjustment.adjusted_break_end
                            ).includes('-')
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {calculateTimeDifference(
                          selectedAdjustment.original_check_in,
                          selectedAdjustment.original_check_out,
                          selectedAdjustment.adjusted_check_in,
                          selectedAdjustment.adjusted_check_out,
                          selectedAdjustment.original_break_start,
                          selectedAdjustment.original_break_end,
                          selectedAdjustment.adjusted_break_start,
                          selectedAdjustment.adjusted_break_end
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Reason */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reason for Adjustment</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedAdjustment.reason}</p>
                  </div>
                </div>
                
                {/* Approval Information */}
                {selectedAdjustment.approved_by && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Approval Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Approved By</p>
                        <p className="font-medium">User ID: {selectedAdjustment.approved_by}</p>
                      </div>
                      {selectedAdjustment.approved_at && (
                        <div>
                          <p className="text-sm text-gray-600">Approved At</p>
                          <p className="font-medium">{formatDateTime(selectedAdjustment.approved_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Adjustment Modal - UPDATED with break times */}
        {showEditModal && editingAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[80] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Adjustment</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjusted Check-in *
                    </label>
                    <input
                      type="time"
                      name="adjusted_check_in"
                      value={editForm.adjusted_check_in}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjusted Check-out *
                    </label>
                    <input
                      type="time"
                      name="adjusted_check_out"
                      value={editForm.adjusted_check_out}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaCoffee className="text-purple-500" /> Break Time Adjustments
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break Start
                        </label>
                        <input
                          type="time"
                          name="adjusted_break_start"
                          value={editForm.adjusted_break_start}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break End
                        </label>
                        <input
                          type="time"
                          name="adjusted_break_end"
                          value={editForm.adjusted_break_end}
                          onChange={handleEditInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* New Adjustment Modal - UPDATED with break times */}
        {showAdjustmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[80] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Request Manual Adjustment</h2>
                <button
                  onClick={() => {
                    setShowAdjustmentForm(false);
                    resetNewAdjustmentForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitAdjustment}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee *
                      </label>
                      <select
                        name="employee_id"
                        value={newAdjustment.employee_id}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(() => loadExistingAttendance(), 100);
                        }}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} ({emp.employee_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjustment Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newAdjustment.date}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTimeout(() => loadExistingAttendance(), 100);
                        }}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Time Adjustments - UPDATED with break times */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Time Adjustments</h3>
                    
                    {/* Check In/Out Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Check-in
                        </label>
                        <input
                          type="time"
                          name="original_check_in"
                          value={newAdjustment.original_check_in.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Check-out
                        </label>
                        <input
                          type="time"
                          name="original_check_out"
                          value={newAdjustment.original_check_out.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Check-in *
                        </label>
                        <input
                          type="time"
                          name="adjusted_check_in"
                          value={newAdjustment.adjusted_check_in.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Check-out *
                        </label>
                        <input
                          type="time"
                          name="adjusted_check_out"
                          value={newAdjustment.adjusted_check_out.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Break Time Section - NEW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 col-span-4 mb-2">
                        <FaCoffee className="text-yellow-600" />
                        <h4 className="text-sm font-semibold text-yellow-800">Break Time Adjustments</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Break Start
                        </label>
                        <input
                          type="time"
                          name="original_break_start"
                          value={newAdjustment.original_break_start.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Break End
                        </label>
                        <input
                          type="time"
                          name="original_break_end"
                          value={newAdjustment.original_break_end.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Break Start
                        </label>
                        <input
                          type="time"
                          name="adjusted_break_start"
                          value={newAdjustment.adjusted_break_start.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Break End
                        </label>
                        <input
                          type="time"
                          name="adjusted_break_end"
                          value={newAdjustment.adjusted_break_end.replace(/ [AP]M$/, '')}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      * Note: Adjust at least one time (check-in, check-out, or break time). Original times will be auto-loaded if attendance exists for this date.
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Adjustment *
                    </label>
                    <textarea
                      name="reason"
                      value={newAdjustment.reason}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a detailed reason for this adjustment..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustmentForm(false);
                      resetNewAdjustmentForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manual Adjustments</h1>
              <p className="text-gray-600">Manage and approve attendance adjustment requests</p>
              <div className="flex items-center gap-2 mt-1">
                <FaBuilding className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  Organization: <span className="font-semibold">{selectedOrganization.name}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchInitialData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <FaRedoAlt className={loading ? 'animate-spin' : ''} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
                </div>
                <FaHistory className="text-blue-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                </div>
                <FaClock className="text-yellow-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
                </div>
                <FaTimesCircle className="text-red-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaFilter /> Filters
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaSearch /> Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by name, ID, or reason..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={filters.employee_id}
                onChange={(e) => handleFilterChange('employee_id', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>

              <div className="relative">
                <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
              </div>

              <div className="relative">
                <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>Showing {filteredAdjustments.length} of {adjustments.length} adjustments</span>
              {filteredAdjustments.length !== adjustments.length && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAdjustments}
                disabled={filteredAdjustments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload /> Export ({filteredAdjustments.length})
              </button>
              <button
                onClick={() => setShowAdjustmentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> New Adjustment
              </button>
            </div>
          </div>

          {/* Adjustments Table - UPDATED to show break times in Time Changes column */}
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Time Changes</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No adjustments found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {adjustments.length === 0 
                          ? 'No adjustment requests in the system. Click "New Adjustment" to create one.' 
                          : 'No adjustments match your current filters. Try adjusting your filter criteria.'
                        }
                      </p>
                      {adjustments.length === 0 && (
                        <button
                          onClick={() => setShowAdjustmentForm(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          <FaPlus /> Create First Adjustment
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adjustment) => (
                    <tr key={adjustment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUsers className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {adjustment.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">{adjustment.employee_id}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <FaBuilding /> {adjustment.department}
                            </div>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(adjustment.adjustment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDateTime(adjustment.requested_date)}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="text-gray-500 text-xs">Original: </span>
                            <span className="font-medium">{adjustment.original_check_in} - {adjustment.original_check_out}</span>
                          </div>
                          <div className="mb-1">
                            <span className="text-gray-500 text-xs">Adjusted: </span>
                            <span className="font-medium text-blue-600">{adjustment.adjusted_check_in} - {adjustment.adjusted_check_out}</span>
                          </div>
                          
                          {/* Break Time Display - NEW */}
                          {(adjustment.original_break_start !== '--:--' || adjustment.adjusted_break_start !== '--:--') && (
                            <div className="mt-2 pt-1 border-t border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">Break Times:</div>
                              <div className="flex items-center text-xs mb-1">
                                <span className="text-gray-500 w-12">Orig:</span>
                                <span className="font-mono text-gray-600">{adjustment.original_break_start || '--:--'} - {adjustment.original_break_end || '--:--'}</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <span className="text-gray-500 w-12">Adj:</span>
                                <span className="font-mono text-blue-600">{adjustment.adjusted_break_start || '--:--'} - {adjustment.adjusted_break_end || '--:--'}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className={`text-xs font-medium mt-2 ${
                            adjustment.total_hours_change.includes('+') 
                              ? 'text-green-600' 
                              : adjustment.total_hours_change.includes('-')
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            Net Change: {adjustment.total_hours_change}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {adjustment.reason.length > 100 ? 
                            `${adjustment.reason.substring(0, 100)}...` : 
                            adjustment.reason
                          }
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(adjustment.status)}
                          <span className={getStatusBadge(adjustment.status)}>
                            {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
                          </span>
                        </div>
                        {adjustment.approved_by_name !== '-' && adjustment.approved_by_name && (
                          <div className="text-xs text-gray-500 mt-1">
                            By: {adjustment.approved_by_name}
                          </div>
                        )}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewAdjustment(adjustment.id)}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {adjustment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(adjustment.id)}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <FaUserCheck />
                              </button>
                              <button
                                onClick={() => handleReject(adjustment.id)}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <FaUserTimes />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleEditAdjustment(adjustment)}
                            className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          
                          {/* Show delete button only for rejected adjustments */}
                          {adjustment.status === 'rejected' && (
                            <button
                              onClick={() => handleDelete(adjustment.id)}
                              className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                       </td>
                     </tr>
                  ))
                )}
              </tbody>
             </table>
          </div>
          
          {/* Pagination */}
          {filteredAdjustments.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredAdjustments.length} adjustments
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManualAdjustments;
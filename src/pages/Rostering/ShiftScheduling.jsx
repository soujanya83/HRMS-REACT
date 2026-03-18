import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaDownload,
  FaUser,
  FaClock,
  FaExchangeAlt,
  FaCopy,
  FaSave,
  FaTimes,
  FaUndo,
  FaRedo,
  FaExclamationTriangle,
  FaPalette,
  FaRandom,
  FaCoffee,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaStopwatch,
  FaDollarSign
} from 'react-icons/fa';
import {
  HiX,
} from "react-icons/hi";
import { useOrganizations } from '../../contexts/OrganizationContext';
import shiftSchedulingService from '../../services/shiftSchedulingService';
import employeeService from '../../services/employeeService';

// Pastel color options for background
const PASTEL_COLORS = [
  { name: 'Soft Pink', value: '#FFD1DC', textColor: 'text-gray-800' },
  { name: 'Mint Green', value: '#C1E1C1', textColor: 'text-gray-800' },
  { name: 'Peach', value: '#FFDAB9', textColor: 'text-gray-800' },
  { name: 'Baby Blue', value: '#B5D8FF', textColor: 'text-gray-800' },
  { name: 'Soft Yellow', value: '#FFFACD', textColor: 'text-gray-800' },
  { name: 'Cultured White', value: '#FCFCFC', textColor: 'text-gray-800' },
  { name: 'Soft White', value: '#FDFDFE', textColor: 'text-gray-800' },
];

// Color Palette Component
const ColorPalette = ({ isOpen, onClose, onColorSelect }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Choose Pastel Color</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <HiX size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {PASTEL_COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-full p-4 rounded-lg transition-transform hover:scale-105 flex items-center justify-between"
                style={{ backgroundColor: color.value }}
              >
                <span className={`font-medium ${color.textColor}`}>{color.name}</span>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.value }} />
              </button>
            ))}
          </div>
          
          {/* Reset to default button */}
          <button
            onClick={() => {
              onColorSelect('#f9fafb'); // Default bg-gray-50
              onClose();
            }}
            className="w-full mt-6 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
};

const ShiftScheduling = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('list');
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#f9fafb');
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [hourlyRates, setHourlyRates] = useState({});
  const [loadingRates, setLoadingRates] = useState(false);

  const { selectedOrganization, organizations, isLoading: orgLoading } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const [newShift, setNewShift] = useState({
    organization_id: organizationId,
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_start: '13:00',
    break_end: '14:00',
    break_grace_minutes: 0,
    color_code: '#4CAF50',
    notes: '',
    shift_type: 'custom',
    // New fields for employee assignment
    employee_id: '',
    hourly_rate: 0,
    estimated_amount: 0
  });

  // Predefined shift options with break times
  const predefinedShifts = [
    { 
      name: 'Morning Shift', 
      color: '#4CAF50', 
      start_time: '09:00', 
      end_time: '17:00',
      break_start: '13:00',
      break_end: '14:00',
      break_duration: 60,
      break_grace_minutes: 0
    },
    { 
      name: 'Mid Shift', 
      color: '#2196F3', 
      start_time: '12:00', 
      end_time: '20:00',
      break_start: '16:00',
      break_end: '17:00',
      break_duration: 60,
      break_grace_minutes: 0
    },
    { 
      name: 'Late Shift', 
      color: '#FF9800', 
      start_time: '15:00', 
      end_time: '23:00',
      break_start: '19:00',
      break_end: '20:00',
      break_duration: 60,
      break_grace_minutes: 0
    },
  ];

  // Color options
  const colorOptions = [
    { name: 'Green', value: '#4CAF50' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Red', value: '#F44336' },
    { name: 'Cyan', value: '#00BCD4' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Brown', value: '#795548' },
    { name: 'Gray', value: '#9E9E9E' },
    { name: 'No Color', value: '#FFFFFF' },
  ];

  // Update newShift when organization changes
  useEffect(() => {
    if (organizationId) {
      setNewShift(prev => ({ ...prev, organization_id: organizationId }));
      fetchEmployees();
    }
  }, [organizationId]);

  // Fetch shifts when organization changes
  useEffect(() => {
    if (organizationId && !orgLoading) {
      fetchShifts();
    }
  }, [organizationId, showDeleted, orgLoading]);

  // Calculate estimated amount whenever net hours or hourly rate changes
  useEffect(() => {
    if (newShift.employee_id && hourlyRates[newShift.employee_id]) {
      const netHours = calculateNetWorkingHours(
        newShift.start_time,
        newShift.end_time,
        newShift.break_start,
        newShift.break_end,
        newShift.break_grace_minutes
      );
      
      const rate = hourlyRates[newShift.employee_id];
      const estimatedAmount = netHours * rate;
      
      setNewShift(prev => ({
        ...prev,
        hourly_rate: rate,
        estimated_amount: parseFloat(estimatedAmount.toFixed(2))
      }));
    }
  }, [
    newShift.employee_id,
    newShift.start_time,
    newShift.end_time,
    newShift.break_start,
    newShift.break_end,
    newShift.break_grace_minutes,
    hourlyRates
  ]);

  const fetchEmployees = async () => {
    if (!organizationId) return;
    
    try {
      setLoadingRates(true);
      // Fetch employees for this organization
      const response = await employeeService.getEmployees({ organization_id: organizationId });
      console.log('📋 Employees API response:', response);
      
      // Handle different response structures based on your API
      let employeesData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        employeesData = response;
      }
      
      setEmployees(employeesData);
      
      // Fetch hourly rates for employees (you may need to adjust this based on your API)
      const rates = {};
      employeesData.forEach(employee => {
        // Try to get rate from employee data if available, otherwise use default
        rates[employee.id] = employee.hourly_rate || employee.pay_rate || 25; // Default fallback rate
      });
      
      setHourlyRates(rates);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingRates(false);
    }
  };

  const fetchShifts = async () => {
    if (!organizationId) {
      setError('No organization selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let response;
      if (showDeleted) {
        response = await shiftSchedulingService.getDeletedShifts();
      } else {
        response = await shiftSchedulingService.getShifts({ organization_id: organizationId });
      }
      
      console.log('📋 Shifts API response:', response);
      
      // Handle the response structure you showed
      let shiftsData = [];
      if (response?.success && Array.isArray(response.data)) {
        shiftsData = response.data;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          shiftsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          shiftsData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        shiftsData = response;
      }
      
      setShifts(shiftsData);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError(error.response?.data?.message || 'Failed to load shifts. Please try again.');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate break duration
  const calculateBreakDuration = (breakStart, breakEnd) => {
    if (!breakStart || !breakEnd) return 0;
    
    const start = new Date(`2000-01-01T${breakStart}`);
    const end = new Date(`2000-01-01T${breakEnd}`);
    
    let diff = (end - start) / (1000 * 60);
    if (diff < 0) diff += 24 * 60;
    
    return Math.round(diff);
  };

  // Calculate total shift duration
  const calculateTotalDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let diff = (end - start) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    
    return parseFloat(diff.toFixed(1));
  };

  // Calculate net working hours (excluding breaks and considering grace minutes)
  const calculateNetWorkingHours = (startTime, endTime, breakStart, breakEnd, breakGraceMinutes = 0) => {
    const totalDuration = calculateTotalDuration(startTime, endTime);
    const breakMinutes = calculateBreakDuration(breakStart, breakEnd);
    const breakHours = breakMinutes / 60;
    const graceHours = breakGraceMinutes / 60;
    
    // Grace minutes are usually added to break time (buffer before/after break)
    const totalBreakHours = (breakMinutes + breakGraceMinutes) / 60;
    
    return parseFloat((totalDuration - totalBreakHours).toFixed(1));
  };

  // Calculate total break including grace minutes
  const calculateTotalBreakWithGrace = (breakDuration, breakGraceMinutes) => {
    return (breakDuration || 0) + (breakGraceMinutes || 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'break_start' || name === 'break_end') {
      const newBreakStart = name === 'break_start' ? value : newShift.break_start;
      const newBreakEnd = name === 'break_end' ? value : newShift.break_end;
      
      setNewShift(prev => ({
        ...prev,
        [name]: value,
        break_duration: calculateBreakDuration(newBreakStart, newBreakEnd)
      }));
    } else if (name === 'break_grace_minutes') {
      const numValue = parseInt(value) || 0;
      setNewShift(prev => ({
        ...prev,
        [name]: Math.max(0, Math.min(120, numValue)) // Limit grace minutes between 0-120
      }));
    } else if (name === 'employee_id') {
      setNewShift(prev => ({ ...prev, [name]: value }));
    } else {
      setNewShift(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePredefinedShiftSelect = (shift) => {
    setNewShift({
      ...newShift,
      name: shift.name,
      color_code: shift.color,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_start: shift.break_start,
      break_end: shift.break_end,
      break_duration: shift.break_duration,
      break_grace_minutes: shift.break_grace_minutes || 0,
      shift_type: 'predefined'
    });
  };

  const handleCustomShift = () => {
    setNewShift(prev => ({ 
      ...prev, 
      name: '',
      shift_type: 'custom',
      color_code: '#4CAF50',
      break_start: '13:00',
      break_end: '14:00',
      break_duration: 60,
      break_grace_minutes: 0
    }));
  };

  const handleColorSelect = (color) => {
    setNewShift(prev => ({ ...prev, color_code: color }));
  };

  const generateRandomColor = () => {
    const colors = colorOptions.map(c => c.value);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setNewShift(prev => ({ ...prev, color_code: randomColor }));
  };

  const handleSubmitShift = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!newShift.name.trim()) {
      setError('Shift name is required');
      return;
    }

    if (!newShift.start_time || !newShift.end_time) {
      setError('Start and end times are required');
      return;
    }

    if (!organizationId) {
      setError('No organization selected');
      return;
    }

    // Validate break times
    if (newShift.break_start && newShift.break_end) {
      const totalDuration = calculateTotalDuration(newShift.start_time, newShift.end_time);
      const totalBreakHours = (newShift.break_duration + newShift.break_grace_minutes) / 60;
      
      if (totalBreakHours >= totalDuration) {
        setError('Total break duration (including grace minutes) cannot be longer than total shift duration');
        return;
      }
    }

    try {
      // Prepare shift data - only include fields that exist in your API
      const shiftData = {
        organization_id: organizationId,
        name: newShift.name,
        start_time: newShift.start_time,
        end_time: newShift.end_time,
        break_start: newShift.break_start,
        break_end: newShift.break_end,
        break_grace_minutes: newShift.break_grace_minutes,
        color_code: newShift.color_code,
        notes: newShift.notes,
        // Add employee-related fields (you may need to add these to your backend)
        employee_id: newShift.employee_id || null,
        hourly_rate: newShift.hourly_rate || 0,
        estimated_amount: newShift.estimated_amount || 0
      };

      if (editingShift) {
        await shiftSchedulingService.updateShift(editingShift.id, shiftData);
        setSuccessMessage('Shift updated successfully!');
      } else {
        await shiftSchedulingService.createShift(shiftData);
        setSuccessMessage('Shift created successfully!');
      }

      await fetchShifts();
      resetForm();
      setShowShiftForm(false);
      setEditingShift(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving shift:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.join?.('\n') || 
                      'Failed to save shift. Please try again.';
      setError(errorMsg);
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setNewShift({
      organization_id: organizationId,
      name: shift.name,
      start_time: formatTimeForInput(shift.start_time),
      end_time: formatTimeForInput(shift.end_time),
      break_start: shift.break_start ? formatTimeForInput(shift.break_start) : '13:00',
      break_end: shift.break_end ? formatTimeForInput(shift.break_end) : '14:00',
      break_duration: shift.break_duration || 60,
      break_grace_minutes: shift.break_grace_minutes || 0,
      color_code: shift.color_code || '#4CAF50',
      notes: shift.notes || '',
      shift_type: 'custom',
      // Load employee data if it exists in the shift
      employee_id: shift.employee_id || '',
      hourly_rate: shift.hourly_rate || 0,
      estimated_amount: shift.estimated_amount || 0
    });
    setShowShiftForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await shiftSchedulingService.deleteShift(id);
        setSuccessMessage('Shift deleted successfully!');
        await fetchShifts();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting shift:', error);
        setError(error.response?.data?.message || 'Failed to delete shift. Please try again.');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await shiftSchedulingService.restoreShift(id);
      setSuccessMessage('Shift restored successfully!');
      setShowDeleted(false);
      await fetchShifts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error restoring shift:', error);
      setError(error.response?.data?.message || 'Failed to restore shift. Please try again.');
    }
  };

  const handleCopyShift = (shift) => {
    setNewShift({
      organization_id: organizationId,
      name: `${shift.name} (Copy)`,
      start_time: formatTimeForInput(shift.start_time),
      end_time: formatTimeForInput(shift.end_time),
      break_start: shift.break_start ? formatTimeForInput(shift.break_start) : '13:00',
      break_end: shift.break_end ? formatTimeForInput(shift.break_end) : '14:00',
      break_duration: shift.break_duration || 60,
      break_grace_minutes: shift.break_grace_minutes || 0,
      color_code: shift.color_code || '#4CAF50',
      notes: shift.notes || '',
      shift_type: 'custom',
      employee_id: shift.employee_id || '',
      hourly_rate: shift.hourly_rate || 0,
      estimated_amount: shift.estimated_amount || 0
    });
    setEditingShift(null);
    setShowShiftForm(true);
  };

  const resetForm = () => {
    setNewShift({
      organization_id: organizationId,
      name: '',
      start_time: '09:00',
      end_time: '17:00',
      break_start: '13:00',
      break_end: '14:00',
      break_duration: 60,
      break_grace_minutes: 0,
      color_code: '#4CAF50',
      notes: '',
      shift_type: 'custom',
      employee_id: '',
      hourly_rate: 0,
      estimated_amount: 0
    });
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return '09:00';
    // Handle time format from API (e.g., "09:00:00" -> "09:00")
    return timeString.substring(0, 5);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const time = timeString.split(':');
    const hour = parseInt(time[0]);
    const minute = time[1] || '00';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportShifts = () => {
    const dataStr = JSON.stringify(shifts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `shifts-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (orgLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization data...</p>
        </div>
      </div>
    );
  }

  if (!organizationId && organizations.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Organization</h2>
          <p className="text-gray-600 mb-4">Please create or select an organization first.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Color Palette Toggle Button */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white p-2 rounded-l-lg shadow-lg hover:shadow-xl transition-all z-30 group"
        style={{ writingMode: 'vertical-rl' }}
      >
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-xs font-medium">Colors</span>
        </div>
      </button>

      {/* Color Palette Component */}
      <ColorPalette 
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onColorSelect={setBackgroundColor}
      />

      <div 
        className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Management</h1>
                <p className="text-gray-600">
                  {selectedOrganization?.name ? `Managing shifts for ${selectedOrganization.name}` : 'Create and manage shift schedules with break times'}
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Shifts</p>
                  <p className="text-2xl font-bold text-gray-800">{shifts.length}</p>
                </div>
                <FaCalendarAlt className="text-blue-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Net Hours</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {shifts.length > 0 
                      ? (shifts.reduce((total, shift) => total + calculateNetWorkingHours(
                          shift.start_time, shift.end_time, shift.break_start, shift.break_end, shift.break_grace_minutes
                        ), 0) / shifts.length).toFixed(1)
                      : '0'}h
                  </p>
                </div>
                <FaHourglassHalf className="text-green-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Break</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {shifts.length > 0 
                      ? formatMinutes(shifts.reduce((total, shift) => total + (shift.break_duration || 0), 0) / shifts.length)
                      : '0'}
                  </p>
                </div>
                <FaCoffee className="text-purple-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Employees</p>
                  <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
                </div>
                <FaUser className="text-yellow-500 text-xl" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {showDeleted ? 'Deleted' : 'Active'}
                  </p>
                </div>
                <FaClock className="text-orange-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                List View
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShiftForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!organizationId}
              >
                <FaPlus /> Create Shift
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search shifts by name..."
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Shifts List View */}
          {view === 'list' && (
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Shift Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timing</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Break</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Color</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shifts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No shifts found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {showDeleted ? 'No deleted shifts available' : 'Create your first shift to get started'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    shifts.map((shift) => {
                      const netHours = calculateNetWorkingHours(
                        shift.start_time, shift.end_time, shift.break_start, shift.break_end, shift.break_grace_minutes
                      );
                      const totalBreakWithGrace = calculateTotalBreakWithGrace(
                        shift.total_break_minutes || 60, 
                        shift.break_grace_minutes || 0
                      );
                      
                      return (
                        <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold border border-gray-200"
                                style={{ backgroundColor: shift.color_code || '#4CAF50' }}
                              >
                                {shift.name ? shift.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'S'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {shift.name || 'Unnamed Shift'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {shift.organization?.name || selectedOrganization?.name || 'Organization'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {calculateTotalDuration(shift.start_time, shift.end_time)}h total
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {shift.break_start && shift.break_end ? (
                              <>
                                <div className="text-sm text-gray-900">
                                  {formatTime(shift.break_start)} - {formatTime(shift.break_end)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatMinutes(parseInt(shift.total_break_minutes) || 60)}
                                  {shift.break_grace_minutes > 0 && (
                                    <span className="ml-1 text-xs text-purple-600">
                                      (+{shift.break_grace_minutes}m grace)
                                    </span>
                                  )}
                                </div>
                                {shift.break_grace_minutes > 0 && (
                                  <div className="text-xs text-gray-400">
                                    Total: {formatMinutes(totalBreakWithGrace)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">No break</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-600">
                              {netHours.toFixed(1)}h
                            </div>
                            <div className="text-xs text-gray-500">
                              working hours
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="h-6 w-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: shift.color_code || '#4CAF50' }}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {shift.color_code || '#4CAF50'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              showDeleted 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {showDeleted ? 'Deleted' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {showDeleted ? (
                                <button
                                  onClick={() => handleRestore(shift.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                  title="Restore"
                                >
                                  <FaUndo /> Restore
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(shift)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    title="Edit"
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleCopyShift(shift)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                    title="Copy"
                                  >
                                    <FaCopy /> Copy
                                  </button>
                                  <button
                                    onClick={() => handleDelete(shift.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                    title="Delete"
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </>
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
          )}

          {/* Shift Form Modal */}
          {showShiftForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingShift ? 'Edit Shift' : 'Create New Shift'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowShiftForm(false);
                      setEditingShift(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {!organizationId ? (
                  <div className="text-center p-8">
                    <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-gray-600">Please select an organization first.</p>
                    <button
                      onClick={() => setShowShiftForm(false)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitShift}>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Shift Type</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Predefined Shifts */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select:</h4>
                          {predefinedShifts.map((shift, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handlePredefinedShiftSelect(shift)}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                newShift.name === shift.name 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <div 
                                  className="h-6 w-6 rounded-full mr-3 border border-gray-300"
                                  style={{ backgroundColor: shift.color }}
                                />
                                <div>
                                  <div className="font-medium text-gray-800">{shift.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)} 
                                    (Break: {formatTime(shift.break_start)}-{formatTime(shift.break_end)})
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          <button
                            type="button"
                            onClick={handleCustomShift}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              newShift.shift_type === 'custom'
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full mr-3 border border-dashed border-gray-400 flex items-center justify-center">
                                <span className="text-xs text-gray-600">+</span>
                              </div>
                              <div className="font-medium text-gray-800">Custom Shift</div>
                            </div>
                          </button>
                        </div>

                        {/* Custom Shift Form */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Shift Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={newShift.name}
                              onChange={handleInputChange}
                              required
                              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter custom shift name"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Color *
                              </label>
                              <button
                                type="button"
                                onClick={generateRandomColor}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FaRandom className="text-xs" />
                                Random
                              </button>
                            </div>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="color"
                                name="color_code"
                                value={newShift.color_code}
                                onChange={handleInputChange}
                                required
                                className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                name="color_code"
                                value={newShift.color_code}
                                onChange={handleInputChange}
                                required
                                pattern="^#[0-9A-Fa-f]{6}$"
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#4CAF50"
                                title="Enter a hex color code (e.g., #4CAF50)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optional: Employee Assignment Section (you can uncomment this if you want to add employees to shifts) */}
                    {/* 
                    <div className="border-t pt-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        Employee Assignment (Optional)
                      </h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Employee
                        </label>
                        <select
                          name="employee_id"
                          value={newShift.employee_id}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select an employee (optional)</option>
                          {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name} - {employee.employee_code || 'No Code'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {loadingRates && (
                        <div className="text-center py-2">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Loading employees...</span>
                        </div>
                      )}
                    </div>
                    */}

                    {/* Shift Times Section */}
                    <div className="border-t pt-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Shift Times</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            name="start_time"
                            value={newShift.start_time}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time *
                          </label>
                          <input
                            type="time"
                            name="end_time"
                            value={newShift.end_time}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Break Times Section */}
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaCoffee className="text-purple-500" />
                        Break Time (Optional)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Break Start
                          </label>
                          <input
                            type="time"
                            name="break_start"
                            value={newShift.break_start}
                            onChange={handleInputChange}
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
                            value={newShift.break_end}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Break Grace Minutes Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <FaStopwatch className="text-indigo-500" />
                          Break Grace Minutes
                          <span className="text-xs text-gray-500 font-normal">(Buffer time before/after break)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="break_grace_minutes"
                            value={newShift.break_grace_minutes}
                            onChange={handleInputChange}
                            min="0"
                            max="120"
                            step="5"
                            className="w-32 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-600">minutes (0-120)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Additional time allowed for break preparation and return
                        </p>
                      </div>

                      {/* Duration Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">Total Duration</div>
                          <div className="text-lg font-bold text-blue-800">
                            {calculateTotalDuration(newShift.start_time, newShift.end_time)}h
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-medium text-purple-700">Break Duration</div>
                          <div className="text-lg font-bold text-purple-800">
                            {formatMinutes(newShift.break_duration)}
                          </div>
                          {newShift.break_grace_minutes > 0 && (
                            <div className="text-xs text-purple-600">
                              +{newShift.break_grace_minutes}m grace
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Net Working Hours</div>
                          <div className="text-lg font-bold text-green-800">
                            {calculateNetWorkingHours(
                              newShift.start_time, 
                              newShift.end_time, 
                              newShift.break_start, 
                              newShift.break_end,
                              newShift.break_grace_minutes
                            )}h
                          </div>
                          {newShift.break_grace_minutes > 0 && (
                            <div className="text-xs text-green-600">
                              Total break: {formatMinutes(newShift.break_duration + newShift.break_grace_minutes)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          name="notes"
                          value={newShift.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Additional notes about this shift..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setShowShiftForm(false);
                          setEditingShift(null);
                          resetForm();
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        {editingShift ? (
                          <>
                            <FaSave /> Update Shift
                          </>
                        ) : (
                          <>
                            <FaPlus /> Create Shift
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShiftScheduling;
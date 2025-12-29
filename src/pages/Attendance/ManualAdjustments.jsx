import React, { useState, useEffect } from 'react';
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
  FaRedoAlt
} from 'react-icons/fa';
import { attendanceService, employeeService } from '../../services/attendanceService';

const ManualAdjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(15); // Default to your organization ID
  
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    date: '',
    search: '',
    startDate: '',
    endDate: '',
    employee_id: 'all'
  });

  const [newAdjustment, setNewAdjustment] = useState({
    employee_id: '',
    date: '',
    original_check_in: '',
    original_check_out: '',
    adjusted_check_in: '',
    adjusted_check_out: '',
    reason: '',
    type: 'Check-in Adjustment',
    notes: ''
  });

  // Stats data
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Static fallback employees
  const staticEmployees = [
    { id: 1, name: 'John Smith', employee_id: 'EMP001', department: 'Engineering' },
    { id: 2, name: 'Sarah Johnson', employee_id: 'EMP002', department: 'Marketing' },
    { id: 3, name: 'Mike Chen', employee_id: 'EMP003', department: 'Sales' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all initial data
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch adjustments from API
  const fetchAdjustments = async () => {
    try {
      // Build query params
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.date) params.date = filters.date;
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
      if (filters.search) params.search = filters.search;
      if (filters.employee_id !== 'all') params.employee_id = filters.employee_id;
      if (filters.department !== 'all') params.department = filters.department;

      // Fetch from API
      const response = await attendanceService.getAttendance(params);
      
      // Extract adjustments from response
      const adjustmentsData = extractAdjustmentsFromResponse(response);
      setAdjustments(adjustmentsData);
      calculateStats(adjustmentsData);
      
    } catch (error) {
      console.error('Failed to fetch adjustments:', error);
      // Use empty array on error
      setAdjustments([]);
    }
  };

  // Extract adjustments from API response
  const extractAdjustmentsFromResponse = (response) => {
    const responseData = response.data;
    
    // Check different possible response formats
    if (Array.isArray(responseData)) {
      return transformAdjustmentsData(responseData);
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      return transformAdjustmentsData(responseData.data);
    } else if (responseData?.success === true && responseData.data && Array.isArray(responseData.data)) {
      return transformAdjustmentsData(responseData.data);
    } else if (responseData) {
      // Single object response
      return transformAdjustmentsData([responseData]);
    }
    
    return [];
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      
      let employeesData = [];
      if (response?.data?.success === true && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      }
      
      setEmployees(employeesData.length > 0 ? employeesData : staticEmployees);
    } catch (error) {
      console.log('Using static employee data',error  );
      setEmployees(staticEmployees);
    }
  };

  // Fetch departments from organization-specific endpoint
  const fetchDepartments = async () => {
    try {
      // Use the organization-specific endpoint
const response = await axiosClient.get(`/organizations/${selectedOrganizationId}/departments`);      
      console.log('Departments API response:', response.data);
      
      let departmentsData = [];
      if (response?.data?.success === true && Array.isArray(response.data.data)) {
        departmentsData = response.data.data.map(dept => ({
          id: dept.id,
          name: dept.name,
          description: dept.description
        }));
      } else if (Array.isArray(response?.data)) {
        departmentsData = response.data.map(dept => ({
          id: dept.id,
          name: dept.name,
          description: dept.description
        }));
      }
      
      console.log('Processed departments:', departmentsData);
      setDepartments(departmentsData);
      
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      // Use empty array on error
      setDepartments([]);
    }
  };

  // Transform API data to component format
  const transformAdjustmentsData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => ({
      id: item.id || Math.random(),
      employee_id: item.employee?.employee_id || item.employee_id || `EMP${item.employee?.id || item.employee_id || '000'}`,
      employee_name: item.employee?.name || `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.trim() || 'Unknown Employee',
      department: item.employee?.department || item.department || 'N/A',
      adjustment_date: item.date || item.adjustment_date,
      original_check_in: formatTimeForDisplay(item.original_check_in || item.check_in),
      original_check_out: formatTimeForDisplay(item.original_check_out || item.check_out),
      adjusted_check_in: formatTimeForDisplay(item.adjusted_check_in),
      adjusted_check_out: formatTimeForDisplay(item.adjusted_check_out),
      reason: item.reason || item.description || item.notes || '',
      status: item.status || item.adjustment_status || 'pending',
      requested_by: item.requested_by || item.created_by?.name || item.employee?.name || 'System',
      approved_by: item.approved_by || item.approver?.name || item.approved_by_name || '-',
      requested_date: item.created_at || item.requested_date || new Date().toISOString(),
      total_hours_change: calculateTimeDifference(
        item.original_check_in || item.check_in,
        item.original_check_out || item.check_out,
        item.adjusted_check_in,
        item.adjusted_check_out
      ),
      type: item.type || item.adjustment_type || 'Check-in Adjustment'
    }));
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString || timeString === '00:00:00' || timeString === '--:--') return '--:--';
    
    try {
      const timeParts = timeString.toString().split(':');
      const hour = parseInt(timeParts[0]) || 0;
      const minute = timeParts[1] || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute} ${period}`;
    } catch (error) {
      error
      return timeString;
    }
  };

  // Calculate time difference
  const calculateTimeDifference = (origIn, origOut, adjIn, adjOut) => {
    const toMinutes = (timeStr) => {
      if (!timeStr || timeStr === '--:--') return 0;
      
      try {
        const [hours, minutes] = timeStr.toString().split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
      } catch {
        return 0;
      }
    };

    const origInMin = toMinutes(origIn);
    const origOutMin = toMinutes(origOut);
    const adjInMin = toMinutes(adjIn);
    const adjOutMin = toMinutes(adjOut);

    const origDuration = Math.max(0, origOutMin - origInMin);
    const adjDuration = Math.max(0, adjOutMin - adjInMin);
    
    const diff = adjDuration - origDuration;
    
    if (diff === 0) return '±0h 00m';
    
    const hours = Math.floor(Math.abs(diff) / 60);
    const minutes = Math.abs(diff) % 60;
    const sign = diff > 0 ? '+' : '-';
    
    return `${sign}${hours}h ${minutes}m`;
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const dataArray = Array.isArray(data) ? data : [];
    
    const approved = dataArray.filter(adj => 
      adj.status === 'approved' || adj.status === 'Approved'
    ).length;
    const pending = dataArray.filter(adj => 
      adj.status === 'pending' || adj.status === 'Pending'
    ).length;
    const rejected = dataArray.filter(adj => 
      adj.status === 'rejected' || adj.status === 'Rejected'
    ).length;

    setStats({
      totalRequests: dataArray.length,
      approved,
      pending,
      rejected
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchAdjustments();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      department: 'all',
      date: '',
      search: '',
      startDate: '',
      endDate: '',
      employee_id: 'all'
    });
    fetchAdjustments();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdjustment(prev => ({ ...prev, [name]: value }));
  };

  // Load existing attendance when employee and date are selected
  const loadExistingAttendance = async () => {
    if (!newAdjustment.employee_id || !newAdjustment.date) return;
    
    try {
      const response = await attendanceService.getAttendanceForModification(
        newAdjustment.employee_id, 
        newAdjustment.date
      );
      
      if (response.data) {
        const attendance = response.data;
        setNewAdjustment(prev => ({
          ...prev,
          original_check_in: attendance.check_in || '',
          original_check_out: attendance.check_out || '',
          adjusted_check_in: attendance.check_in || '',
          adjusted_check_out: attendance.check_out || ''
        }));
      }
    } catch (error) {
      console.log('No existing attendance found for this date',error);
      setNewAdjustment(prev => ({
        ...prev,
        original_check_in: '',
        original_check_out: '',
        adjusted_check_in: '',
        adjusted_check_out: ''
      }));
    }
  };

  // Submit new adjustment request
  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!newAdjustment.employee_id || !newAdjustment.date || !newAdjustment.reason) {
        alert('❌ Employee ID, Date, and Reason are required');
        setSubmitting(false);
        return;
      }

      if (!newAdjustment.adjusted_check_in && !newAdjustment.adjusted_check_out) {
        alert('❌ Please adjust at least one time (check-in or check-out)');
        setSubmitting(false);
        return;
      }

      const attendanceData = {
        employee_id: newAdjustment.employee_id,
        date: newAdjustment.date,
        check_in: formatTimeForAPI(newAdjustment.adjusted_check_in) || null,
        check_out: formatTimeForAPI(newAdjustment.adjusted_check_out) || null,
        reason: newAdjustment.reason,
        type: newAdjustment.type,
        notes: newAdjustment.notes
      };

      Object.keys(attendanceData).forEach(key => {
        if (attendanceData[key] === null || attendanceData[key] === '') {
          delete attendanceData[key];
        }
      });

      const response = await attendanceService.createAttendance(attendanceData);
      
      alert('✅ Adjustment request submitted successfully!');
      setShowAdjustmentForm(false);
      resetForm();
      fetchAdjustments();
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.errors?.join?.('\n') || 
                         'Failed to submit adjustment request';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Format time for API (HH:MM:SS)
  const formatTimeForAPI = (timeString) => {
    if (!timeString) return null;
    return timeString.length === 5 ? `${timeString}:00` : timeString;
  };

  // Reset form
  const resetForm = () => {
    setNewAdjustment({
      employee_id: '',
      date: '',
      original_check_in: '',
      original_check_out: '',
      adjusted_check_in: '',
      adjusted_check_out: '',
      reason: '',
      type: 'Check-in Adjustment',
      notes: ''
    });
  };

  // Handle approve action
  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this adjustment?')) return;
    
    try {
      // Update locally for demo
      setAdjustments(prev => 
        prev.map(adj => 
          adj.id === id ? { ...adj, status: 'approved', approved_by: 'You' } : adj
        )
      );
      
      alert('✅ Adjustment approved successfully!');
      
    } catch (error) {
      console.error('Approval error:', error);
      alert('❌ Failed to approve adjustment');
    }
  };

  // Handle reject action
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this adjustment?')) return;
    
    try {
      setAdjustments(prev => 
        prev.map(adj => 
          adj.id === id ? { ...adj, status: 'rejected', approved_by: 'You' } : adj
        )
      );
      
      alert('✅ Adjustment rejected successfully!');
      
    } catch (error) {
      console.error('Rejection error:', error);
      alert('❌ Failed to reject adjustment');
    }
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

  // Filter adjustments based on search
  const filteredAdjustments = adjustments.filter(adj => {
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

  // Export adjustments data
  const exportAdjustments = () => {
    const dataStr = JSON.stringify(filteredAdjustments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = `adjustments-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    alert(`✅ Exported ${filteredAdjustments.length} adjustments`);
  };

  // Loading state
  if (loading && adjustments.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading data from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manual Adjustments</h1>
            <p className="text-gray-600">Manage and approve attendance adjustment requests</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchAdjustments}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              <FaRedoAlt className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
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
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              {employees.length > 0 ? (
                employees.map(emp => (
                  <option key={emp.id || emp.employee_id} value={emp.id || emp.employee_id}>
                    {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} ({emp.employee_id})
                  </option>
                ))
              ) : (
                <option value="" disabled>No employees available</option>
              )}
            </select>

            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.length > 0 ? (
                departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading departments...</option>
              )}
            </select>

            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />

            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredAdjustments.length} of {adjustments.length} adjustments
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportAdjustments}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={filteredAdjustments.length === 0}
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

        {/* Adjustment Form Modal */}
        {showAdjustmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Request Manual Adjustment</h2>
                <button
                  onClick={() => {
                    setShowAdjustmentForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitAdjustment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      {employees.length > 0 ? (
                        employees.map(emp => (
                          <option key={emp.id || emp.employee_id} value={emp.id || emp.employee_id}>
                            {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} ({emp.employee_id})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No employees available</option>
                      )}
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
                    />
                  </div>

                  {/* Time Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Time Adjustments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Check-in
                        </label>
                        <input
                          type="time"
                          name="original_check_in"
                          value={newAdjustment.original_check_in}
                          readOnly
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Check-out
                        </label>
                        <input
                          type="time"
                          name="original_check_out"
                          value={newAdjustment.original_check_out}
                          readOnly
                          className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Check-in
                        </label>
                        <input
                          type="time"
                          name="adjusted_check_in"
                          value={newAdjustment.adjusted_check_in}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjusted Check-out
                        </label>
                        <input
                          type="time"
                          name="adjusted_check_out"
                          value={newAdjustment.adjusted_check_out}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Note: Adjust at least one time (check-in or check-out)
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Type
                    </label>
                    <select
                      name="type"
                      value={newAdjustment.type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Check-in Adjustment">Check-in Adjustment</option>
                      <option value="Check-out Adjustment">Check-out Adjustment</option>
                      <option value="System Correction">System Correction</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newAdjustment.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional notes or comments..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustmentForm(false);
                      resetForm();
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

        {/* Adjustments Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date & Type</th>
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
                        ? 'No adjustment requests in the system' 
                        : 'Try adjusting your filters'
                      }
                    </p>
                    {adjustments.length === 0 && (
                      <button
                        onClick={() => setShowAdjustmentForm(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create First Adjustment
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
                        <div className="text-xs text-gray-500">{adjustment.type}</div>
                        <div className="text-xs text-gray-400">
                          Requested: {new Date(adjustment.requested_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Original:</span>
                          <span>{adjustment.original_check_in} - {adjustment.original_check_out}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Adjusted:</span>
                          <span>{adjustment.adjusted_check_in} - {adjustment.adjusted_check_out}</span>
                        </div>
                        <div className={`text-xs font-medium ${
                          adjustment.total_hours_change.includes('+') 
                            ? 'text-green-600' 
                            : adjustment.total_hours_change.includes('-')
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {adjustment.total_hours_change}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {adjustment.reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        By: {adjustment.requested_by}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(adjustment.status)}
                        <span className={getStatusBadge(adjustment.status)}>
                          {adjustment.status}
                        </span>
                      </div>
                      {adjustment.approved_by !== '-' && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {adjustment.approved_by}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(adjustment.status === 'pending' || adjustment.status === 'Pending') ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(adjustment.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(adjustment.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualAdjustments;
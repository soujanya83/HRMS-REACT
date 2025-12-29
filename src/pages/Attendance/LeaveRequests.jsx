import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
  FaStethoscope,
  FaUmbrellaBeach,
  FaHome,
  FaBaby,
  FaSpinner,
  FaRedoAlt,
  FaInfoCircle
} from "react-icons/fa";
import { leaveService } from "../../services/leaveService";
import { attendanceService } from "../../services/attendanceService";

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  
  const [filters, setFilters] = useState({
    status: "all",
    leaveType: "all",
    department: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employee_id: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    emergency_contact: "",
    notes: "",
    attachment: null,
  });

  // Stats data
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Default leave types if API doesn't return any
  const defaultLeaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Work From Home",
    "Half Day",
    "Casual Leave",
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
        fetchLeaveRequests(),
        fetchEmployees(),
        fetchLeaveTypes()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave requests from API
  const fetchLeaveRequests = async () => {
    try {
      console.log('Fetching leave requests...');
      const response = await leaveService.getLeaves();
      console.log('Leave API response:', response.data);

      let leaveData = [];
      
      if (response.data?.status === true) {
        // Your API returns: {status: true, message: "...", data: [...]}
        if (Array.isArray(response.data.data)) {
          leaveData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        leaveData = response.data;
      }

      console.log('Processed leave data:', leaveData);
      setLeaveRequests(leaveData);
      calculateStats(leaveData);
      
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      // Fallback to empty array on error
      setLeaveRequests([]);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await attendanceService.getEmployees();
      console.log('Employees API response:', response.data);

      let employeesData = [];
      
      if (response.data?.success === true && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data?.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      }

      console.log('Processed employees:', employeesData);
      setEmployees(employeesData);
      
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Use static employees as fallback
      setEmployees([
        { id: 1, name: 'John Smith', employee_id: 'EMP001', department: 'Engineering' },
        { id: 2, name: 'Sarah Johnson', employee_id: 'EMP002', department: 'Marketing' },
        { id: 3, name: 'Mike Chen', employee_id: 'EMP003', department: 'Sales' }
      ]);
    }
  };

  // Fetch leave types from API
  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveService.getLeaveTypes();
      console.log('Leave types API response:', response.data);

      let typesData = [];
      
      if (response.data?.status === true && Array.isArray(response.data.data)) {
        typesData = response.data.data.map(type => type.name || type);
      } else if (Array.isArray(response.data?.data)) {
        typesData = response.data.data.map(type => type.name || type);
      } else if (Array.isArray(response.data)) {
        typesData = response.data.map(type => type.name || type);
      }

      // If no types from API, use defaults
      if (typesData.length === 0) {
        typesData = defaultLeaveTypes;
      }

      console.log('Processed leave types:', typesData);
      setLeaveTypes(typesData);
      
      // Set default leave type
      if (typesData.length > 0 && !newLeaveRequest.leave_type) {
        setNewLeaveRequest(prev => ({ ...prev, leave_type: typesData[0] }));
      }
      
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
      setLeaveTypes(defaultLeaveTypes);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const dataArray = Array.isArray(data) ? data : [];
    
    const pending = dataArray.filter(req => 
      req.status === 'Pending' || req.status === 'pending'
    ).length;
    const approved = dataArray.filter(req => 
      req.status === 'Approved' || req.status === 'approved'
    ).length;
    const rejected = dataArray.filter(req => 
      req.status === 'Rejected' || req.status === 'rejected'
    ).length;

    setStats({
      totalRequests: dataArray.length,
      pending,
      approved,
      rejected,
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveRequest(prev => ({ ...prev, [name]: value }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewLeaveRequest(prev => ({ ...prev, attachment: file }));
  };

  // Calculate total days
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Handle date change
  const handleDateChange = (field, value) => {
    setNewLeaveRequest(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Submit leave request
  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!newLeaveRequest.employee_id || !newLeaveRequest.start_date || !newLeaveRequest.end_date || !newLeaveRequest.reason) {
        alert('❌ Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const leaveData = {
        employee_id: newLeaveRequest.employee_id,
        leave_type: newLeaveRequest.leave_type || leaveTypes[0],
        start_date: newLeaveRequest.start_date,
        end_date: newLeaveRequest.end_date,
        reason: newLeaveRequest.reason,
        emergency_contact: newLeaveRequest.emergency_contact || '',
        notes: newLeaveRequest.notes || '',
        status: 'pending' // Default status
      };

      // Calculate total days
      const totalDays = calculateTotalDays(newLeaveRequest.start_date, newLeaveRequest.end_date);
      leaveData.total_days = totalDays;

      console.log('Submitting leave data:', leaveData);

      let response;
      if (editingRequest) {
        // Update existing leave request
        response = await leaveService.approveLeave(editingRequest.id, {
          ...leaveData,
          action: 'update'
        });
      } else {
        // Create new leave request
        response = await leaveService.createLeave(newLeaveRequest.employee_id, leaveData);
      }

      console.log('Submit response:', response.data);

      if (response.data?.status === true || response.data?.success === true) {
        alert('✅ Leave request submitted successfully!');
        setShowLeaveForm(false);
        resetForm();
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(response.data?.message || 'Failed to submit leave request');
      }

    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join?.('\n') || 
                          error.message || 
                          'Failed to submit leave request';
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle approve leave
  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) return;
    
    try {
      const response = await leaveService.approveLeave(id, {
        action: 'approve',
        notes: 'Leave approved by manager'
      });

      if (response.data?.status === true || response.data?.success === true) {
        alert('✅ Leave request approved!');
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(response.data?.message || 'Failed to approve leave request');
      }
    } catch (error) {
      console.error('Approval error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to approve leave request';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Handle reject leave
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this leave request?')) return;
    
    try {
      const response = await leaveService.approveLeave(id, {
        action: 'reject',
        notes: 'Leave rejected by manager'
      });

      if (response.data?.status === true || response.data?.success === true) {
        alert('✅ Leave request rejected!');
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(response.data?.message || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to reject leave request';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Handle edit leave
  const handleEdit = (request) => {
    console.log('Editing request:', request);
    setEditingRequest(request);
    setNewLeaveRequest({
      employee_id: request.employee_id?.toString() || '',
      leave_type: request.leave_type || leaveTypes[0],
      start_date: request.start_date || '',
      end_date: request.end_date || '',
      reason: request.reason || '',
      emergency_contact: request.emergency_contact || '',
      notes: request.notes || '',
      attachment: null,
    });
    setShowLeaveForm(true);
  };

  // Handle delete leave
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;

    try {
      const response = await leaveService.deleteLeave(id);

      if (response.data?.status === true || response.data?.success === true) {
        alert('✅ Leave request deleted successfully!');
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(response.data?.message || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to delete leave request';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewLeaveRequest({
      employee_id: "",
      leave_type: leaveTypes[0] || "",
      start_date: "",
      end_date: "",
      reason: "",
      emergency_contact: "",
      notes: "",
      attachment: null,
    });
    setEditingRequest(null);
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

  // Get leave type icon
  const getLeaveTypeIcon = (type) => {
    const typeLower = type?.toLowerCase();
    switch (typeLower) {
      case 'annual leave':
        return <FaUmbrellaBeach className="text-blue-500" />;
      case 'sick leave':
        return <FaStethoscope className="text-red-500" />;
      case 'emergency leave':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'maternity leave':
        return <FaBaby className="text-pink-500" />;
      case 'paternity leave':
        return <FaBaby className="text-blue-500" />;
      case 'work from home':
        return <FaHome className="text-green-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  // Filter leave requests based on filters
  const filteredLeaveRequests = leaveRequests.filter(request => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        request.employee_name?.toLowerCase().includes(searchLower) ||
        request.employee_id?.toLowerCase().includes(searchLower) ||
        request.reason?.toLowerCase().includes(searchLower) ||
        request.department?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      const requestStatus = request.status?.toLowerCase();
      const filterStatus = filters.status.toLowerCase();
      if (requestStatus !== filterStatus) return false;
    }

    // Leave type filter
    if (filters.leaveType !== 'all') {
      const requestType = request.leave_type?.toLowerCase();
      const filterType = filters.leaveType.toLowerCase();
      if (requestType !== filterType) return false;
    }

    // Department filter
    if (filters.department !== 'all') {
      const requestDept = request.department?.toLowerCase();
      const filterDept = filters.department.toLowerCase();
      if (requestDept !== filterDept) return false;
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(request.start_date);
      const filterStart = new Date(filters.startDate);
      if (startDate < filterStart) return false;
    }

    if (filters.endDate) {
      const endDate = new Date(request.end_date);
      const filterEnd = new Date(filters.endDate);
      if (endDate > filterEnd) return false;
    }

    return true;
  });

  // Export leave requests
  const exportLeaveRequests = () => {
    const dataStr = JSON.stringify(filteredLeaveRequests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = `leave-requests-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    alert(`✅ Exported ${filteredLeaveRequests.length} leave requests`);
  };

  // Apply filters
  const applyFilters = () => {
    // The filtering is done in real-time via filteredLeaveRequests
    console.log('Filters applied:', filters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      leaveType: "all",
      department: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  // Loading state
  if (loading && leaveRequests.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading leave requests from API...</p>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Leave Requests
            </h1>
            <p className="text-gray-600">
              Manage and approve employee leave applications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLeaveRequests}
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
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalRequests}
                </p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.approved}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.rejected}
                </p>
              </div>
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
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
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.leaveType}
              onChange={(e) =>
                handleFilterChange("leaveType", e.target.value)
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Leave Types</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) =>
                handleFilterChange("department", e.target.value)
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value)
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value)
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredLeaveRequests.length} of {leaveRequests.length} leave requests
            {filteredLeaveRequests.length !== leaveRequests.length && ' (filtered)'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportLeaveRequests}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={filteredLeaveRequests.length === 0}
            >
              <FaDownload /> Export ({filteredLeaveRequests.length})
            </button>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> New Request
            </button>
          </div>
        </div>

        {/* Leave Request Form Modal */}
        {showLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingRequest ? "Edit Leave Request" : "New Leave Request"}
                </h2>
                <button
                  onClick={() => {
                    setShowLeaveForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitLeaveRequest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={newLeaveRequest.employee_id}
                      onChange={handleInputChange}
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
                      Leave Type *
                    </label>
                    <select
                      name="leave_type"
                      value={newLeaveRequest.leave_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={newLeaveRequest.start_date}
                      onChange={(e) =>
                        handleDateChange("start_date", e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={newLeaveRequest.end_date}
                      onChange={(e) =>
                        handleDateChange("end_date", e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      name="emergency_contact"
                      value={newLeaveRequest.emergency_contact}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Emergency contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {newLeaveRequest.attachment && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ File selected: {newLeaveRequest.attachment.name}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leave *
                    </label>
                    <textarea
                      name="reason"
                      value={newLeaveRequest.reason}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a detailed reason for your leave..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newLeaveRequest.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveForm(false);
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
                    ) : editingRequest ? (
                      'Update Request'
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Leave Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Reason & Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No leave requests found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {leaveRequests.length === 0 
                        ? 'No leave requests in the system' 
                        : 'Try adjusting your filters'
                      }
                    </p>
                    {leaveRequests.length === 0 && (
                      <button
                        onClick={() => setShowLeaveForm(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create First Request
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLeaveRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.employee_name || `Employee ${request.employee_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.employee_id}
                      </div>
                      <div className="text-xs text-gray-400">
                        {request.department || 'N/A'}
                      </div>
                      {request.emergency_contact && (
                        <div className="text-xs text-gray-500 mt-1">
                          Contact: {request.emergency_contact}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        {getLeaveTypeIcon(request.leave_type)}
                        <div>
                          <div className="font-medium">{request.leave_type}</div>
                          <div className="text-xs text-gray-500">
                            Applied:{" "}
                            {request.applied_date ? new Date(request.applied_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">
                          {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'N/A'} -{" "}
                          {request.end_date ? new Date(request.end_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.total_days || calculateTotalDays(request.start_date, request.end_date)} day
                          {request.total_days !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        <div className="font-medium">{request.reason}</div>
                        {request.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {request.notes}
                          </div>
                        )}
                        {request.attachment && (
                          <div className="text-xs text-blue-600 mt-1">
                            📎 Attachment provided
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                      </div>
                      {request.approved_by && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {request.approved_by}
                        </div>
                      )}
                      {request.approved_date && (
                        <div className="text-xs text-gray-500">
                          On:{" "}
                          {new Date(request.approved_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {(request.status === 'pending' || request.status === 'Pending') && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(request)}
                          className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
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
    </div>
  );
};

export default LeaveRequests;
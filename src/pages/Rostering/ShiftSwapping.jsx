/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  FaExchangeAlt,
  FaSearch,
  FaPlus,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaBell,
  FaDownload,
  FaSync,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationCircle,
  FaSpinner,
  FaChartBar,
  FaFileInvoiceDollar,
  FaCalculator,
  FaUserTie,
  FaMoneyBillWave
} from "react-icons/fa";
import shiftSwapService from '../../services/shiftSchedulingService';
import { useOrganizations } from '../../contexts/OrganizationContext';

const ShiftSwapping = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestToReject, setSelectedRequestToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [employees, setEmployees] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    status: "all",
    employee: "all",
  });

  const { selectedOrganization } = useOrganizations();
  const [currentUserId, setCurrentUserId] = useState(3); // This should come from your auth context

  const [newRequest, setNewRequest] = useState({
    requester_employee_id: currentUserId,
    requester_roster_id: "",
    requested_employee_id: "",
    requested_roster_id: "",
    requester_reason: "",
  });

  // Fetch all data on component mount
  useEffect(() => {
    if (selectedOrganization) {
      fetchAllData();
    }
  }, [selectedOrganization]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data - handle departments error gracefully
      const [
        swapRequestsResponse,
        employeesResponse,
        rostersResponse,
        shiftsResponse,
        departmentsResponse
      ] = await Promise.allSettled([
        shiftSwapService.getSwapRequests({
          organization_id: selectedOrganization.id
        }),
        shiftSwapService.getEmployees({
          organization_id: selectedOrganization.id
        }),
        shiftSwapService.getRosters({
          organization_id: selectedOrganization.id
        }),
        shiftSwapService.getShifts({
          organization_id: selectedOrganization.id
        }),
        shiftSwapService.getDepartments({
          organization_id: selectedOrganization.id
        }).catch(() => ({ success: false, data: [] })) // Handle departments error
      ]);

      // Process swap requests
      if (swapRequestsResponse.status === 'fulfilled' && swapRequestsResponse.value?.success) {
        setSwapRequests(swapRequestsResponse.value.data || []);
      } else {
        setSwapRequests([]);
      }

      // Process employees
      if (employeesResponse.status === 'fulfilled' && employeesResponse.value?.success) {
        const employeesData = employeesResponse.value.data || [];
        const formattedEmployees = employeesData.map(emp => ({
          id: emp.id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          department_id: emp.department_id,
          employee_code: emp.employee_code,
          department_name: emp.department?.name || `Department ${emp.department_id}`,
          department: emp.department?.name || 'General'
        }));
        setEmployees(formattedEmployees);
        
        // Extract unique departments from employees if departments API fails
        if (departmentsResponse.status !== 'fulfilled' || !departmentsResponse.value?.success) {
          const uniqueDepartments = [...new Set(formattedEmployees.map(emp => emp.department_name))];
          setDepartments(uniqueDepartments);
        }
      } else {
        setEmployees([]);
      }

      // Process rosters
      if (rostersResponse.status === 'fulfilled' && rostersResponse.value?.success) {
        setRosters(rostersResponse.value.data || []);
      } else {
        setRosters([]);
      }

      // Process shifts
      if (shiftsResponse.status === 'fulfilled' && shiftsResponse.value?.success) {
        setShifts(shiftsResponse.value.data || []);
      } else {
        setShifts([]);
      }

      // Process departments (only if API call succeeded)
      if (departmentsResponse.status === 'fulfilled' && departmentsResponse.value?.success) {
        const departmentsData = departmentsResponse.value.data || [];
        setDepartments(departmentsData.map(dept => dept.name || dept.title || dept.department_name));
      } else if (employeesResponse.status === 'fulfilled' && employeesResponse.value?.success) {
        // Already handled above - extracting from employees
      } else {
        setDepartments(["IT", "Design", "Management", "Testing", "HR"]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setSwapRequests([]);
      setEmployees([]);
      setRosters([]);
      setShifts([]);
      setDepartments(["IT", "Design", "Management", "Testing", "HR"]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  // When requester roster is selected, automatically set the requested employee to the roster's employee
  const handleRequesterRosterChange = (rosterId) => {
    const selectedRoster = rosters.find(r => r.id == rosterId);
    if (selectedRoster) {
      setNewRequest(prev => ({
        ...prev,
        requester_roster_id: rosterId,
        // Set requested employee to the employee who owns this roster
        requested_employee_id: selectedRoster.employee_id
      }));
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      // Validate form
      if (!newRequest.requester_roster_id || !newRequest.requested_roster_id || !newRequest.requester_reason) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await shiftSwapService.createSwapRequest(newRequest);
      
      if (response.success) {
        alert('Swap request created successfully!');
        setShowShiftForm(false);
        resetForm();
        await fetchAllData(); // Refresh all data
      } else {
        throw new Error(response.message || 'Failed to create swap request');
      }
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert(error.message || 'Failed to create swap request. Please try again.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this swap request?')) return;
    
    try {
      const response = await shiftSwapService.approveSwapRequest(requestId);
      
      if (response.success) {
        alert('Swap request approved successfully!');
        await fetchAllData(); // Refresh all data
        
        // Close details modal if open
        if (selectedRequest?.id === requestId) {
          setSelectedRequest(null);
        }
      } else {
        throw new Error(response.message || 'Failed to approve swap request');
      }
    } catch (error) {
      console.error('Error approving swap request:', error);
      alert(error.message || 'Failed to approve swap request. Please try again.');
    }
  };

  const openRejectModal = (requestId) => {
    setSelectedRequestToReject(requestId);
    setShowRejectModal(true);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequestToReject) return;
    
    try {
      const response = await shiftSwapService.rejectSwapRequest(selectedRequestToReject, {
        rejection_reason: rejectionReason
      });
      
      if (response.success) {
        alert('Swap request rejected successfully!');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedRequestToReject(null);
        await fetchAllData(); // Refresh all data
        
        // Close details modal if open
        if (selectedRequest?.id === selectedRequestToReject) {
          setSelectedRequest(null);
        }
      } else {
        throw new Error(response.message || 'Failed to reject swap request');
      }
    } catch (error) {
      console.error('Error rejecting swap request:', error);
      alert(error.message || 'Failed to reject swap request. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this swap request?')) return;
    
    try {
      const response = await shiftSwapService.deleteSwapRequest(requestId);
      
      if (response.success) {
        alert('Swap request deleted successfully!');
        await fetchAllData(); // Refresh all data
        
        // Close details modal if open
        if (selectedRequest?.id === requestId) {
          setSelectedRequest(null);
        }
      } else {
        throw new Error(response.message || 'Failed to delete swap request');
      }
    } catch (error) {
      console.error('Error deleting swap request:', error);
      alert(error.message || 'Failed to delete swap request. Please try again.');
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await shiftSwapService.getSwapRequest(requestId);
      
      if (response.success) {
        setSelectedRequest(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      alert(error.message || 'Failed to load request details. Please try again.');
    }
  };

  const handleRefresh = async () => {
    await fetchAllData();
  };

  const handleExport = () => {
    try {
      const csvContent = convertToCSV(filteredRequests);
      downloadCSV(csvContent, `shift-swaps-${new Date().toISOString().split('T')[0]}.csv`);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = ['ID', 'Requester', 'Requested Employee', 'Requester Roster Date', 'Requested Roster Date', 'Status', 'Reason', 'Created At'];
    const rows = data.map(request => [
      request.id || '',
      request.requester ? `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim() : '',
      request.requested_employee ? `${request.requested_employee.first_name || ''} ${request.requested_employee.last_name || ''}`.trim() : '',
      request.requester_roster?.roster_date ? new Date(request.requester_roster.roster_date).toLocaleDateString() : '',
      request.requested_roster?.roster_date ? new Date(request.requested_roster.roster_date).toLocaleDateString() : '',
      request.status || '',
      request.requester_reason || '',
      request.created_at ? new Date(request.created_at).toLocaleString() : ''
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setNewRequest({
      requester_employee_id: currentUserId,
      requester_roster_id: "",
      requested_employee_id: "",
      requested_roster_id: "",
      requester_reason: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      approved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pending", icon: FaClock },
      approved: { label: "Approved", icon: FaCheck },
      rejected: { label: "Rejected", icon: FaTimes },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusColor(
          status
        )}`}
      >
        <IconComponent className="mr-1" />
        {config.label}
      </span>
    );
  };

  // Get rosters for current user
  const currentUserRosters = rosters.filter(r => r.employee_id == currentUserId);
  
  // Get rosters for the selected employee to swap with
  const requestedEmployeeRosters = rosters.filter(r => r.employee_id == newRequest.requested_employee_id);

  // Filter requests based on current filters
  const filteredRequests = swapRequests.filter((request) => {
    const requesterName = request.requester ? 
      `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.toLowerCase().trim() : '';
    
    const requestedEmployeeName = request.requested_employee ? 
      `${request.requested_employee.first_name || ''} ${request.requested_employee.last_name || ''}`.toLowerCase().trim() : '';

    const requesterDeptName = request.requester?.department?.name || 
                             request.requester?.department_name || 
                             employees.find(e => e.id === request.requester_employee_id)?.department_name || '';

    const matchesSearch =
      !filters.search ||
      requesterName.includes(filters.search.toLowerCase()) ||
      requestedEmployeeName.includes(filters.search.toLowerCase()) ||
      (request.requester_reason && request.requester_reason.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesStatus =
      filters.status === "all" || 
      (request.status && request.status.toLowerCase() === filters.status);
    
    const matchesDepartment =
      filters.department === "all" ||
      requesterDeptName.toLowerCase().includes(filters.department.toLowerCase());

    const matchesEmployee =
      filters.employee === "all" ||
      request.requester_employee_id?.toString() === filters.employee ||
      request.requested_employee_id?.toString() === filters.employee;

    return matchesSearch && matchesStatus && matchesDepartment && matchesEmployee;
  });

  const stats = {
    total: swapRequests.length,
    pending: swapRequests.filter(req => req.status === "pending").length,
    approved: swapRequests.filter(req => req.status === "approved").length,
    rejected: swapRequests.filter(req => req.status === "rejected").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shift swap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Swapping Management</h1>
              <p className="text-gray-600">Manage and approve employee shift swap requests</p>
            </div>
            {selectedOrganization && (
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
                Organization: <span className="font-semibold">{selectedOrganization.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <FaExchangeAlt className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</p>
              </div>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.approved}</p>
              </div>
              <FaCheck className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.rejected}</p>
              </div>
              <FaTimes className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setShowShiftForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus /> New Request
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>

            {/* Department filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange("department", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Employee filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={filters.employee}
                onChange={(e) => handleFilterChange("employee", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">
                    Swap Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%] min-w-[150px]">
                    Shift Dates & Times
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[24%] min-w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaExchangeAlt className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No shift swap requests found</p>
                        <p className="text-gray-500">Click "New Request" to create your first request</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Swap Details */}
                      <td className="px-4 py-3 w-[22%] min-w-[180px]">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <FaExchangeAlt className="text-blue-600 text-lg" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {request.requester ? 
                                `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim() : 
                                'Unknown'} ↔ {
                                request.requested_employee ? 
                                `${request.requested_employee.first_name || ''} ${request.requested_employee.last_name || ''}`.trim() : 
                                'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.requester_roster?.roster_date ? 
                                formatDate(request.requester_roster.roster_date) : ''} ↔ {
                                request.requested_roster?.roster_date ? 
                                formatDate(request.requested_roster.roster_date) : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Shift Dates & Times */}
                      <td className="px-4 py-3 w-[18%] min-w-[150px] text-sm text-gray-900">
                        <div>
                          <div className="font-medium mb-1">
                            {request.requester_roster?.roster_date ? 
                              formatDate(request.requester_roster.roster_date) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.requester_roster?.start_time} - {request.requester_roster?.end_time}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Shift: {request.requester_roster?.shift_id ? 
                              shifts.find(s => s.id === request.requester_roster.shift_id)?.name || 'N/A' : 
                              'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 w-[22%] min-w-[180px]">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {request.requester_reason || 'No reason provided'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 w-[14%] min-w-[120px]">
                        {getStatusBadge(request.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {request.created_at && formatDate(request.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 w-[24%] min-w-[200px] text-sm font-medium">
                        <div className="flex gap-2">
                         <button
  onClick={() => handleViewDetails(request.id)}
  className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
  title="View Details"
>
  <FaEye size={10} /> View
</button>
                          
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Approve"
                              >
                                <FaCheck /> Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(request.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Reject"
                              >
                                <FaTimes /> Reject
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
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

        {/* Summary Footer */}
        {filteredRequests.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {swapRequests.length} shift swap requests
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Pending approval:{" "}
                <span className="text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </div>
        )}

        {/* Request Form Modal */}
        {showShiftForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Create Shift Swap Request</h2>
                <button
                  onClick={() => {
                    setShowShiftForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Shift to Swap *
                    </label>
                    <select
                      name="requester_roster_id"
                      required
                      value={newRequest.requester_roster_id}
                      onChange={(e) => handleRequesterRosterChange(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    >
                      <option value="">Select Your Shift</option>
                      {currentUserRosters.map((roster) => {
                        const shift = shifts.find(s => s.id === roster.shift_id);
                        return (
                          <option key={roster.id} value={roster.id}>
                            {roster.roster_date ? formatDate(roster.roster_date) : 'No date'} - 
                            {roster.start_time} to {roster.end_time}
                            {shift ? ` (${shift.name})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee to Swap With *
                    </label>
                    <select
                      name="requested_employee_id"
                      required
                      value={newRequest.requested_employee_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    >
                      <option value="">Select Employee</option>
                      {employees
                        .filter(emp => emp.id !== currentUserId)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.employee_code}) - {emp.department_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {newRequest.requested_employee_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desired Shift from {employees.find(e => e.id == newRequest.requested_employee_id)?.name} *
                      </label>
                      <select
                        name="requested_roster_id"
                        required
                        value={newRequest.requested_roster_id}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      >
                        <option value="">Select Desired Shift</option>
                        {requestedEmployeeRosters.map((roster) => {
                          const shift = shifts.find(s => s.id === roster.shift_id);
                          return (
                            <option key={roster.id} value={roster.id}>
                              {roster.roster_date ? formatDate(roster.roster_date) : 'No date'} - 
                              {roster.start_time} to {roster.end_time}
                              {shift ? ` (${shift.name})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Swap *
                    </label>
                    <textarea
                      name="requester_reason"
                      rows="3"
                      required
                      value={newRequest.requester_reason}
                      onChange={handleInputChange}
                      placeholder="Please provide a reason for this shift swap request..."
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShiftForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <FaExchangeAlt /> Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Reject Swap Request</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    placeholder="Provide reason for rejection..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectRequest}
                    className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <FaTimes /> Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Swap Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedRequest.status)}
                  <div className="text-sm text-gray-500">
                    Created: {selectedRequest.created_at ? formatDateTime(selectedRequest.created_at) : 'N/A'}
                  </div>
                </div>

                {/* Swap Summary */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="font-bold text-lg mb-2">
                        {selectedRequest.requester ? 
                          `${selectedRequest.requester.first_name || ''} ${selectedRequest.requester.last_name || ''}`.trim() : 
                          'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {selectedRequest.requester_roster?.roster_date ? 
                          formatDate(selectedRequest.requester_roster.roster_date) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedRequest.requester_roster?.start_time} - {selectedRequest.requester_roster?.end_time}
                      </div>
                    </div>

                    <FaExchangeAlt className="text-blue-500 text-3xl" />

                    <div className="text-center">
                      <div className="font-bold text-lg mb-2">
                        {selectedRequest.requested_employee ? 
                          `${selectedRequest.requested_employee.first_name || ''} ${selectedRequest.requested_employee.last_name || ''}`.trim() : 
                          'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {selectedRequest.requested_roster?.roster_date ? 
                          formatDate(selectedRequest.requested_roster.roster_date) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedRequest.requested_roster?.start_time} - {selectedRequest.requested_roster?.end_time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Requester Details */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <FaUser className="mr-2 text-blue-500" />
                      Requester Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Employee:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requester ? 
                            `${selectedRequest.requester.first_name || ''} ${selectedRequest.requester.last_name || ''}`.trim() : 
                            'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Employee Code:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requester?.employee_code || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Shift Date:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requester_roster?.roster_date ? 
                            formatDate(selectedRequest.requester_roster.roster_date) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Shift Time:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requester_roster?.start_time || 'N/A'} - {selectedRequest.requester_roster?.end_time || 'N/A'}
                        </span>
                      </div>
                      {selectedRequest.requester_roster?.shift_id && (
                        <div>
                          <span className="text-gray-600">Shift Name:</span>
                          <span className="ml-2 font-medium">
                            {shifts.find(s => s.id === selectedRequest.requester_roster.shift_id)?.name || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requested Employee Details */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <FaUser className="mr-2 text-green-500" />
                      Requested Employee Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Employee:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requested_employee ? 
                            `${selectedRequest.requested_employee.first_name || ''} ${selectedRequest.requested_employee.last_name || ''}`.trim() : 
                            'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Employee Code:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requested_employee?.employee_code || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Desired Date:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requested_roster?.roster_date ? 
                            formatDate(selectedRequest.requested_roster.roster_date) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Desired Time:</span>
                        <span className="ml-2 font-medium">
                          {selectedRequest.requested_roster?.start_time || 'N/A'} - {selectedRequest.requested_roster?.end_time || 'N/A'}
                        </span>
                      </div>
                      {selectedRequest.requested_roster?.shift_id && (
                        <div>
                          <span className="text-gray-600">Shift Name:</span>
                          <span className="ml-2 font-medium">
                            {shifts.find(s => s.id === selectedRequest.requested_roster.shift_id)?.name || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason and Notes */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Reason for Swap</h3>
                  <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
                    {selectedRequest.requester_reason || 'No reason provided'}
                  </div>

                  {selectedRequest.manager_approver && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Approved by:</h4>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">Manager ID: {selectedRequest.manager_approver_id}</p>
                        <p className="text-xs text-gray-500">
                          Approved at: {selectedRequest.manager_approved_at ? formatDateTime(selectedRequest.manager_approved_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRequest.rejection_reason && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        Rejection Reason:
                      </h4>
                      <div className="bg-red-50 p-4 rounded border border-red-100">
                        <p className="text-sm text-red-700">{selectedRequest.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === "pending" && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FaCheck /> Approve Request
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequestToReject(selectedRequest.id);
                        setSelectedRequest(null);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FaTimes /> Reject Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftSwapping;
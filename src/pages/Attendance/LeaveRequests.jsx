import React, { useState, useEffect } from 'react';
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
  FaBaby
} from 'react-icons/fa';

// Static data for leave requests
const staticLeaveRequests = [
  {
    id: 1,
    employee_id: 'EMP001',
    employee_name: 'John Smith',
    department: 'Engineering',
    leave_type: 'Annual Leave',
    start_date: '2024-04-01',
    end_date: '2024-04-05',
    total_days: 5,
    reason: 'Family vacation',
    status: 'Pending',
    applied_date: '2024-03-15',
    approved_by: null,
    approved_date: null,
    emergency_contact: '+1234567890',
    attachment: null,
    notes: 'Need to attend family function'
  },
  {
    id: 2,
    employee_id: 'EMP002',
    employee_name: 'Sarah Johnson',
    department: 'Marketing',
    leave_type: 'Sick Leave',
    start_date: '2024-03-25',
    end_date: '2024-03-26',
    total_days: 2,
    reason: 'Medical appointment',
    status: 'Approved',
    applied_date: '2024-03-20',
    approved_by: 'HR Manager',
    approved_date: '2024-03-21',
    emergency_contact: '+1234567891',
    attachment: 'medical_certificate.pdf',
    notes: 'Regular health checkup'
  },
  {
    id: 3,
    employee_id: 'EMP003',
    employee_name: 'Mike Chen',
    department: 'Sales',
    leave_type: 'Emergency Leave',
    start_date: '2024-03-22',
    end_date: '2024-03-22',
    total_days: 1,
    reason: 'Family emergency',
    status: 'Approved',
    applied_date: '2024-03-21',
    approved_by: 'Team Lead',
    approved_date: '2024-03-21',
    emergency_contact: '+1234567892',
    attachment: null,
    notes: 'Urgent family matter'
  },
  {
    id: 4,
    employee_id: 'EMP005',
    employee_name: 'Robert Wilson',
    department: 'Engineering',
    leave_type: 'Maternity Leave',
    start_date: '2024-05-01',
    end_date: '2024-08-01',
    total_days: 93,
    reason: 'Childbirth',
    status: 'Pending',
    applied_date: '2024-03-18',
    approved_by: null,
    approved_date: null,
    emergency_contact: '+1234567893',
    attachment: 'medical_report.pdf',
    notes: 'Expected delivery in May'
  },
  {
    id: 5,
    employee_id: 'EMP006',
    employee_name: 'Lisa Brown',
    department: 'Design',
    leave_type: 'Work From Home',
    start_date: '2024-03-28',
    end_date: '2024-03-29',
    total_days: 2,
    reason: 'Home renovation',
    status: 'Rejected',
    applied_date: '2024-03-22',
    approved_by: 'HR Manager',
    approved_date: '2024-03-23',
    emergency_contact: '+1234567894',
    attachment: null,
    notes: 'Request denied due to project deadlines'
  }
];

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    department: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employee_id: '',
    leave_type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    notes: '',
    attachment: null
  });

  // Stats data
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const leaveTypes = [
    'Annual Leave',
    'Sick Leave',
    'Emergency Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Work From Home',
    'Half Day',
    'Casual Leave'
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaveRequests(staticLeaveRequests);
      calculateStats(staticLeaveRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (data) => {
    const pending = data.filter(req => req.status === 'Pending').length;
    const approved = data.filter(req => req.status === 'Approved').length;
    const rejected = data.filter(req => req.status === 'Rejected').length;

    setStats({
      totalRequests: data.length,
      pending,
      approved,
      rejected
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewLeaveRequest(prev => ({ ...prev, attachment: file }));
  };

  const handleSubmitLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      // In real implementation, this would call createLeaveRequest API
      const formData = new FormData();
      Object.keys(newLeaveRequest).forEach(key => {
        if (newLeaveRequest[key]) {
          formData.append(key, newLeaveRequest[key]);
        }
      });

      alert('Leave request submitted successfully!');
      setShowLeaveForm(false);
      setNewLeaveRequest({
        employee_id: '',
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: '',
        emergency_contact: '',
        notes: '',
        attachment: null
      });
      
      // Refresh the list
      setLoading(true);
      setTimeout(() => {
        setLeaveRequests(staticLeaveRequests);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      // In real implementation, this would call approveLeaveRequest API
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === id ? { 
            ...req, 
            status: 'Approved', 
            approved_by: 'You',
            approved_date: new Date().toISOString().split('T')[0]
          } : req
        )
      );
      alert('Leave request approved!');
    } catch (error) {
      console.error('Error approving leave request:', error);
      alert('Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    try {
      // In real implementation, this would call rejectLeaveRequest API
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === id ? { 
            ...req, 
            status: 'Rejected', 
            approved_by: 'You',
            approved_date: new Date().toISOString().split('T')[0]
          } : req
        )
      );
      alert('Leave request rejected!');
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      alert('Failed to reject leave request');
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setNewLeaveRequest({
      employee_id: request.employee_id,
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
      emergency_contact: request.emergency_contact,
      notes: request.notes,
      attachment: null
    });
    setShowLeaveForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    
    try {
      // In real implementation, this would call deleteLeaveRequest API
      setLeaveRequests(prev => prev.filter(req => req.id !== id));
      alert('Leave request deleted successfully!');
    } catch (error) {
      console.error('Error deleting leave request:', error);
      alert('Failed to delete leave request');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Approved': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <FaCheckCircle className="text-green-500" />;
      case 'Pending': return <FaClock className="text-yellow-500" />;
      case 'Rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'Annual Leave': return <FaUmbrellaBeach className="text-blue-500" />;
      case 'Sick Leave': return <FaStethoscope className="text-red-500" />;
      case 'Emergency Leave': return <FaExclamationTriangle className="text-orange-500" />;
      case 'Maternity Leave': return <FaBaby className="text-pink-500" />;
      case 'Paternity Leave': return <FaBaby className="text-blue-500" />;
      case 'Work From Home': return <FaHome className="text-green-500" />;
      default: return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDateChange = (field, value) => {
    setNewLeaveRequest(prev => {
      const updated = { ...prev, [field]: value };
      if (updated.start_date && updated.end_date) {
        // Auto-calculate total days
        const totalDays = calculateTotalDays(updated.start_date, updated.end_date);
        // You might want to update total_days if your API expects it
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Requests</h1>
          <p className="text-gray-600">Manage and approve employee leave applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
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
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
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

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-grow">
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select 
                value={filters.leaveType}
                onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select 
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Design">Design</option>
              </select>

              <input 
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLeaveForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> New Request
              </button>
              <button
                onClick={() => alert('Exporting leave requests...')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Leave Request Form Modal */}
        {showLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingRequest ? 'Edit Leave Request' : 'New Leave Request'}
              </h2>
              <form onSubmit={handleSubmitLeaveRequest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={newLeaveRequest.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Employee ID"
                    />
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
                      {leaveTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
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
                      onChange={(e) => handleDateChange('end_date', e.target.value)}
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
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveForm(false);
                      setEditingRequest(null);
                      setNewLeaveRequest({
                        employee_id: '',
                        leave_type: 'Annual Leave',
                        start_date: '',
                        end_date: '',
                        reason: '',
                        emergency_contact: '',
                        notes: '',
                        attachment: null
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRequest ? 'Update Request' : 'Submit Request'}
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Leave Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reason & Notes</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">{request.employee_id}</div>
                    <div className="text-xs text-gray-400">{request.department}</div>
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
                          Applied: {new Date(request.applied_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.total_days} day{request.total_days !== 1 ? 's' : ''}
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
                        On: {new Date(request.approved_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {request.status === 'Pending' && (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {leaveRequests.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
            <p className="text-gray-600 mb-4">There are no leave requests to display.</p>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;
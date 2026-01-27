import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaSearch, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaDownload,
  FaThumbsUp,
  FaThumbsDown,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChartBar,
  FaUserTie,
  FaFileInvoiceDollar
} from 'react-icons/fa';

const OvertimeTracking = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    employee: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [newRequest, setNewRequest] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '17:00',
    end_time: '20:00',
    hours: 3,
    reason: '',
    project: '',
    rate_type: '1.5x',
    notes: ''
  });

  // Mock data
  const employees = [
    { id: 1, name: 'John Smith', department: 'Engineering', hourly_rate: 75 },
    { id: 2, name: 'Sarah Johnson', department: 'Marketing', hourly_rate: 65 },
    { id: 3, name: 'Mike Chen', department: 'Sales', hourly_rate: 70 },
    { id: 4, name: 'Lisa Brown', department: 'Design', hourly_rate: 68 }
  ];

  const projects = [
    'Website Redesign',
    'Mobile App Development',
    'Q2 Marketing Campaign',
    'Client Proposals',
    'Internal Training',
    'System Maintenance'
  ];

  const rateTypes = [
    { value: '1.5x', label: 'Time & Half (1.5x)', multiplier: 1.5 },
    { value: '2x', label: 'Double Time (2x)', multiplier: 2 },
    { value: '2.5x', label: 'Holiday Rate (2.5x)', multiplier: 2.5 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOvertimeRequests([
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Smith',
          employee_department: 'Engineering',
          date: '2024-03-25',
          start_time: '17:00',
          end_time: '20:00',
          hours: 3,
          reason: 'Urgent client deployment',
          project: 'Website Redesign',
          rate_type: '1.5x',
          hourly_rate: 75,
          total_amount: 337.5,
          status: 'approved',
          submitted_date: '2024-03-25',
          approved_by: 'Project Manager',
          approved_date: '2024-03-26',
          notes: 'Completed deployment and testing'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Sarah Johnson',
          employee_department: 'Marketing',
          date: '2024-03-24',
          start_time: '18:00',
          end_time: '21:30',
          hours: 3.5,
          reason: 'Campaign launch preparation',
          project: 'Q2 Marketing Campaign',
          rate_type: '1.5x',
          hourly_rate: 65,
          total_amount: 341.25,
          status: 'pending',
          submitted_date: '2024-03-24',
          notes: 'Finalized campaign assets and scheduling'
        },
        {
          id: 3,
          employee_id: 3,
          employee_name: 'Mike Chen',
          employee_department: 'Sales',
          date: '2024-03-23',
          start_time: '19:00',
          end_time: '22:00',
          hours: 3,
          reason: 'Client emergency meeting',
          project: 'Client Proposals',
          rate_type: '2x',
          hourly_rate: 70,
          total_amount: 420,
          status: 'approved',
          submitted_date: '2024-03-23',
          approved_by: 'Sales Director',
          approved_date: '2024-03-24',
          notes: 'Emergency client meeting for contract renewal'
        },
        {
          id: 4,
          employee_id: 4,
          employee_name: 'Lisa Brown',
          employee_department: 'Design',
          date: '2024-03-22',
          start_time: '16:30',
          end_time: '19:30',
          hours: 3,
          reason: 'UI design sprint',
          project: 'Mobile App Development',
          rate_type: '1.5x',
          hourly_rate: 68,
          total_amount: 306,
          status: 'rejected',
          submitted_date: '2024-03-22',
          rejected_by: 'HR Manager',
          rejected_date: '2024-03-23',
          rejection_reason: 'Not pre-approved by manager',
          notes: 'Completed design mockups'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));

    // Calculate hours when start or end time changes
    if (name === 'start_time' || name === 'end_time') {
      calculateHours();
    }
  };

  const calculateHours = () => {
    if (newRequest.start_time && newRequest.end_time) {
      const start = new Date(`2000-01-01T${newRequest.start_time}`);
      const end = new Date(`2000-01-01T${newRequest.end_time}`);
      const diff = (end - start) / (1000 * 60 * 60);
      setNewRequest(prev => ({ ...prev, hours: Math.max(diff, 0) }));
    }
  };

  const calculateAmount = () => {
    const employee = employees.find(emp => emp.id === parseInt(newRequest.employee_id));
    const rateType = rateTypes.find(rt => rt.value === newRequest.rate_type);
    
    if (employee && rateType) {
      return (employee.hourly_rate * rateType.multiplier * newRequest.hours).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    // API call would go here
    alert('Overtime request submitted!');
    setShowRequestForm(false);
    setEditingRequest(null);
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setNewRequest(request);
    setShowRequestForm(true);
  };

  const handleApprove = (id) => {
    setOvertimeRequests(prev => prev.map(req => 
      req.id === id ? { 
        ...req, 
        status: 'approved',
        approved_by: 'You',
        approved_date: new Date().toISOString().split('T')[0]
      } : req
    ));
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      setOvertimeRequests(prev => prev.map(req => 
        req.id === id ? { 
          ...req, 
          status: 'rejected',
          rejected_by: 'You',
          rejected_date: new Date().toISOString().split('T')[0],
          rejection_reason: reason
        } : req
      ));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this overtime request?')) {
      setOvertimeRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };
    return `px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="mr-1" />;
      case 'rejected': return <FaTimesCircle className="mr-1" />;
      default: return <FaClock className="mr-1" />;
    }
  };

  const filteredRequests = overtimeRequests.filter(req => {
    if (filters.status !== 'all' && req.status !== filters.status) return false;
    if (filters.employee !== 'all' && req.employee_id.toString() !== filters.employee) return false;
    if (filters.search && !req.employee_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.startDate && req.date < filters.startDate) return false;
    if (filters.endDate && req.date > filters.endDate) return false;
    return true;
  });

  const stats = {
    total: overtimeRequests.length,
    pending: overtimeRequests.filter(req => req.status === 'pending').length,
    approved: overtimeRequests.filter(req => req.status === 'approved').length,
    rejected: overtimeRequests.filter(req => req.status === 'rejected').length,
    totalCost: overtimeRequests.filter(req => req.status === 'approved').reduce((sum, req) => sum + req.total_amount, 0)
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading overtime requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Overtime Tracking</h1>
          <p className="text-gray-600">Manage and approve employee overtime requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <FaClock className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalCost)}</p>
              </div>
              <FaChartBar className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus /> New Request
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input 
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>

            {/* End Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input 
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Overtime Requests Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%] min-w-[160px]">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                    Hours & Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[20%] min-w-[160px]">
                    Project & Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%] min-w-[100px]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%] min-w-[90px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%] min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClock className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No overtime requests found</p>
                        <p className="text-gray-500">No overtime requests match the current filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      {/* Employee */}
                      <td className="px-4 py-3 w-[18%] min-w-[160px]">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {request.employee_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {request.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.employee_department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 w-[16%] min-w-[140px]">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.start_time} - {request.end_time}
                        </div>
                        <div className="text-xs text-gray-400">
                          Submitted: {formatDate(request.submitted_date)}
                        </div>
                      </td>

                      {/* Hours & Rate */}
                      <td className="px-4 py-3 w-[14%] min-w-[120px]">
                        <div className="text-sm">
                          <div className="font-semibold text-orange-600 mb-1">
                            {request.hours}h
                          </div>
                          <div className="text-sm text-gray-500">
                            Rate: {request.rate_type}
                          </div>
                          <div className="text-sm text-gray-500">
                            Base: ${request.hourly_rate}/h
                          </div>
                        </div>
                      </td>

                      {/* Project & Reason */}
                      <td className="px-4 py-3 w-[20%] min-w-[160px]">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">
                            {request.project}
                          </div>
                          <div className="text-sm text-gray-700">
                            {request.reason}
                          </div>
                          {request.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 w-[12%] min-w-[100px]">
                        <div className="font-bold text-green-600 text-sm">
                          ${request.total_amount}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 w-[10%] min-w-[90px]">
                        <div className="flex flex-col space-y-1">
                          <span className={getStatusBadge(request.status)}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.approved_by && (
                            <div className="text-xs text-gray-500">
                              By: {request.approved_by}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 w-[10%] min-w-[120px] text-sm font-medium">
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Approve"
                              >
                                <FaThumbsUp />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Reject"
                              >
                                <FaThumbsDown />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
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
                Showing {filteredRequests.length} of {overtimeRequests.length} overtime requests
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Total overtime cost:{" "}
                <span className="text-orange-600">
                  {formatCurrency(filteredRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_amount, 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Overtime Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingRequest ? 'Edit Overtime Request' : 'New Overtime Request'}
                </h2>
                <button
                  onClick={() => {
                    setShowRequestForm(false);
                    setEditingRequest(null);
                    setNewRequest({
                      employee_id: '',
                      date: new Date().toISOString().split('T')[0],
                      start_time: '17:00',
                      end_time: '20:00',
                      hours: 3,
                      reason: '',
                      project: '',
                      rate_type: '1.5x',
                      notes: ''
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={newRequest.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.department} (${emp.hourly_rate}/h)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newRequest.date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      name="hours"
                      value={newRequest.hours}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0.5"
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={newRequest.start_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={newRequest.end_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Type *
                    </label>
                    <select
                      name="rate_type"
                      value={newRequest.rate_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      {rateTypes.map(rate => (
                        <option key={rate.value} value={rate.value}>
                          {rate.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      name="project"
                      value={newRequest.project}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project} value={project}>{project}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Amount
                    </label>
                    <input
                      type="text"
                      value={`$${calculateAmount()}`}
                      disabled
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-gray-100 font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Overtime *
                    </label>
                    <textarea
                      name="reason"
                      value={newRequest.reason}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Please provide a detailed reason for the overtime request..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newRequest.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setEditingRequest(null);
                      setNewRequest({
                        employee_id: '',
                        date: new Date().toISOString().split('T')[0],
                        start_time: '17:00',
                        end_time: '20:00',
                        hours: 3,
                        reason: '',
                        project: '',
                        rate_type: '1.5x',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <FaSave /> {editingRequest ? 'Update Request' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OvertimeTracking;
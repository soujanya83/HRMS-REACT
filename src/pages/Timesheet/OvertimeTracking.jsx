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
  FaSave
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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return `px-1.5 py-0.5 inline-flex items-center text-[10px] font-semibold rounded-full ${styles[status]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500 text-[10px]" />;
      case 'rejected': return <FaTimesCircle className="text-red-500 text-[10px]" />;
      default: return <FaClock className="text-yellow-500 text-[10px]" />;
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

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <FaClock className="mr-2 text-blue-600 text-lg" />
            Overtime Tracking
          </h1>
          <p className="text-xs text-gray-600">Manage and approve employee overtime requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaClock className="text-blue-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-800">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="text-yellow-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-gray-800">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Cost</p>
                <p className="text-lg font-bold text-gray-800">${stats.totalCost.toFixed(0)}</p>
              </div>
              <FaDollarSign className="text-red-500 text-base" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-4 p-3 bg-white shadow rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 text-xs" />
              <input 
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full border border-gray-300 pl-7 pr-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              value={filters.employee}
              onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Start Date"
            />

            <div className="flex gap-1">
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex-1"
              >
                <FaPlus className="text-xs" /> New Request
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                <FaDownload className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Overtime Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Employee</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Hours & Rate</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Project & Reason</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                          {request.employee_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-[10px]">
                            {request.employee_name}
                          </div>
                          <div className="text-gray-500 text-[10px]">
                            {request.employee_department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-gray-900 text-[10px]">
                        {new Date(request.date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-[10px]">
                        {request.start_time} - {request.end_time}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        Submitted: {new Date(request.submitted_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-[10px]">
                        <div className="font-semibold text-orange-600">{request.hours}h</div>
                        <div className="text-gray-500">
                          Rate: {request.rate_type}
                        </div>
                        <div className="text-gray-500">
                          Base: ${request.hourly_rate}/h
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-[10px]">
                        <div className="font-medium text-gray-900">{request.project}</div>
                        <div className="text-gray-700 mt-1 max-w-[150px] truncate">
                          {request.reason}
                        </div>
                        {request.notes && (
                          <div className="text-gray-500 mt-1 text-[10px] truncate max-w-[150px]">
                            Notes: {request.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-bold text-green-600 text-[10px]">
                        ${request.total_amount}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1 mb-1">
                        {getStatusIcon(request.status)}
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      {request.approved_by && (
                        <div className="text-gray-500 text-[10px]">
                          By: {request.approved_by}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex gap-1">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-700 transition-colors"
                              title="Approve"
                            >
                              <FaThumbsUp size={8} />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="p-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 transition-colors"
                              title="Reject"
                            >
                              <FaThumbsDown size={8} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="p-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <FaClock className="mx-auto text-2xl text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-800 mb-1">No Overtime Requests</h3>
                <p className="text-gray-600 text-xs">No overtime requests match the current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Overtime Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingRequest ? 'Edit Overtime Request' : 'New Overtime Request'}
              </h2>
              <form onSubmit={handleSubmitRequest}>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={newRequest.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newRequest.date}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hours
                      </label>
                      <input
                        type="number"
                        name="hours"
                        value={newRequest.hours}
                        onChange={handleInputChange}
                        step="0.5"
                        min="0.5"
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        name="start_time"
                        value={newRequest.start_time}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        name="end_time"
                        value={newRequest.end_time}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Rate Type *
                      </label>
                      <select
                        name="rate_type"
                        value={newRequest.rate_type}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {rateTypes.map(rate => (
                          <option key={rate.value} value={rate.value}>{rate.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <select
                        name="project"
                        value={newRequest.project}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project} value={project}>{project}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estimated Amount
                    </label>
                    <input
                      type="text"
                      value={`$${calculateAmount()}`}
                      disabled
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reason for Overtime *
                    </label>
                    <textarea
                      name="reason"
                      value={newRequest.reason}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Please provide a detailed reason for the overtime request..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newRequest.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
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
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <FaSave size={12} /> {editingRequest ? 'Update Request' : 'Submit Request'}
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
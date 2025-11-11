import React, { useState, useEffect } from 'react';
import { 
  FaUserEdit, 
  FaCalendarPlus, 
  FaSearch, 
  FaFilter, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaPlus,
  FaHistory
} from 'react-icons/fa';

// Static data for manual adjustments
const staticAdjustmentsData = [
  {
    id: 1,
    employee_id: 'EMP001',
    employee_name: 'John Smith',
    department: 'Engineering',
    adjustment_date: '2024-03-20',
    original_check_in: '09:05 AM',
    original_check_out: '06:15 PM',
    adjusted_check_in: '09:00 AM',
    adjusted_check_out: '06:15 PM',
    reason: 'Forgot to check-in',
    status: 'Approved',
    requested_by: 'John Smith',
    approved_by: 'HR Manager',
    requested_date: '2024-03-20',
    total_hours_change: '+0h 05m',
    type: 'Check-in Adjustment'
  },
  {
    id: 2,
    employee_id: 'EMP002',
    employee_name: 'Sarah Johnson',
    department: 'Marketing',
    adjustment_date: '2024-03-19',
    original_check_in: '08:55 AM',
    original_check_out: '05:30 PM',
    adjusted_check_in: '08:55 AM',
    adjusted_check_out: '06:00 PM',
    reason: 'Worked late but forgot to check-out',
    status: 'Pending',
    requested_by: 'Sarah Johnson',
    approved_by: '-',
    requested_date: '2024-03-20',
    total_hours_change: '+0h 30m',
    type: 'Check-out Adjustment'
  },
  {
    id: 3,
    employee_id: 'EMP003',
    employee_name: 'Mike Chen',
    department: 'Sales',
    adjustment_date: '2024-03-18',
    original_check_in: '09:25 AM',
    original_check_out: '06:45 PM',
    adjusted_check_in: '09:00 AM',
    adjusted_check_out: '06:45 PM',
    reason: 'Traffic delay',
    status: 'Rejected',
    requested_by: 'Mike Chen',
    approved_by: 'HR Manager',
    requested_date: '2024-03-19',
    total_hours_change: '+0h 25m',
    type: 'Check-in Adjustment'
  },
  {
    id: 4,
    employee_id: 'EMP005',
    employee_name: 'Robert Wilson',
    department: 'Engineering',
    adjustment_date: '2024-03-20',
    original_check_in: '08:45 AM',
    original_check_out: '05:15 PM',
    adjusted_check_in: '08:45 AM',
    adjusted_check_out: '06:15 PM',
    reason: 'Client meeting overtime',
    status: 'Approved',
    requested_by: 'Team Lead',
    approved_by: 'HR Manager',
    requested_date: '2024-03-20',
    total_hours_change: '+1h 00m',
    type: 'Check-out Adjustment'
  },
  {
    id: 5,
    employee_id: 'EMP006',
    employee_name: 'Lisa Brown',
    department: 'Design',
    adjustment_date: '2024-03-17',
    original_check_in: '09:15 AM',
    original_check_out: '06:30 PM',
    adjusted_check_in: '09:00 AM',
    adjusted_check_out: '06:30 PM',
    reason: 'System error',
    status: 'Approved',
    requested_by: 'System Admin',
    approved_by: 'HR Manager',
    requested_date: '2024-03-18',
    total_hours_change: '+0h 15m',
    type: 'System Correction'
  }
];

const ManualAdjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    date: '',
    search: ''
  });

  const [newAdjustment, setNewAdjustment] = useState({
    employee_id: '',
    adjustment_date: '',
    original_check_in: '',
    original_check_out: '',
    adjusted_check_in: '',
    adjusted_check_out: '',
    reason: '',
    type: 'Check-in Adjustment'
  });

  // Stats data
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAdjustments(staticAdjustmentsData);
      calculateStats(staticAdjustmentsData);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (data) => {
    const approved = data.filter(adj => adj.status === 'Approved').length;
    const pending = data.filter(adj => adj.status === 'Pending').length;
    const rejected = data.filter(adj => adj.status === 'Rejected').length;

    setStats({
      totalRequests: data.length,
      approved,
      pending,
      rejected
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdjustment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdjustment = (e) => {
    e.preventDefault();
    // In real implementation, this would call an API
    alert('Adjustment request submitted successfully!');
    setShowAdjustmentForm(false);
    setNewAdjustment({
      employee_id: '',
      adjustment_date: '',
      original_check_in: '',
      original_check_out: '',
      adjusted_check_in: '',
      adjusted_check_out: '',
      reason: '',
      type: 'Check-in Adjustment'
    });
  };

  const handleApprove = (id) => {
    // In real implementation, this would call an API
    setAdjustments(prev => 
      prev.map(adj => 
        adj.id === id ? { ...adj, status: 'Approved', approved_by: 'You' } : adj
      )
    );
  };

  const handleReject = (id) => {
    // In real implementation, this would call an API
    setAdjustments(prev => 
      prev.map(adj => 
        adj.id === id ? { ...adj, status: 'Rejected', approved_by: 'You' } : adj
      )
    );
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manual Adjustments</h1>
          <p className="text-gray-600">Manage and approve attendance adjustment requests</p>
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

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
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
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAdjustmentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> New Adjustment
              </button>
              <button
                onClick={() => alert('Exporting adjustments data...')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Adjustment Form Modal */}
        {showAdjustmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Request Manual Adjustment</h2>
              <form onSubmit={handleSubmitAdjustment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={newAdjustment.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Employee ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Date *
                    </label>
                    <input
                      type="date"
                      name="adjustment_date"
                      value={newAdjustment.adjustment_date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Check-in
                    </label>
                    <input
                      type="time"
                      name="original_check_in"
                      value={newAdjustment.original_check_in}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Request
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
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {adjustment.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">{adjustment.employee_id}</div>
                    <div className="text-xs text-gray-400">{adjustment.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium">{new Date(adjustment.adjustment_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{adjustment.type}</div>
                      <div className="text-xs text-gray-400">Requested: {new Date(adjustment.requested_date).toLocaleDateString()}</div>
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
                        adjustment.total_hours_change.includes('+') ? 'text-green-600' : 'text-red-600'
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
                    {adjustment.status === 'Pending' && (
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
                    )}
                    {adjustment.status !== 'Pending' && (
                      <span className="text-gray-500 text-xs">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualAdjustments;
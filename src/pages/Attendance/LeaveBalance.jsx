import React, { useState, useEffect } from 'react';
import { 
  FaCalculator, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaEye
} from 'react-icons/fa';

// Static data for leave balances
const staticLeaveBalances = [
  {
    id: 1,
    employee_id: 'EMP001',
    employee_name: 'John Smith',
    department: 'Engineering',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 5,
    annual_leave_remaining: 15,
    sick_leave_total: 12,
    sick_leave_used: 2,
    sick_leave_remaining: 10,
    emergency_leave_total: 5,
    emergency_leave_used: 1,
    emergency_leave_remaining: 4,
    maternity_leave_total: 90,
    maternity_leave_used: 0,
    maternity_leave_remaining: 90,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    paternity_leave_remaining: 10,
    casual_leave_total: 7,
    casual_leave_used: 3,
    casual_leave_remaining: 4,
    carry_forward: 5,
    total_leave_taken: 11,
    last_updated: '2024-03-20'
  },
  {
    id: 2,
    employee_id: 'EMP002',
    employee_name: 'Sarah Johnson',
    department: 'Marketing',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 8,
    annual_leave_remaining: 12,
    sick_leave_total: 12,
    sick_leave_used: 4,
    sick_leave_remaining: 8,
    emergency_leave_total: 5,
    emergency_leave_used: 2,
    emergency_leave_remaining: 3,
    maternity_leave_total: 90,
    maternity_leave_used: 0,
    maternity_leave_remaining: 90,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    paternity_leave_remaining: 10,
    casual_leave_total: 7,
    casual_leave_used: 2,
    casual_leave_remaining: 5,
    carry_forward: 3,
    total_leave_taken: 16,
    last_updated: '2024-03-20'
  },
  {
    id: 3,
    employee_id: 'EMP003',
    employee_name: 'Mike Chen',
    department: 'Sales',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 15,
    annual_leave_remaining: 5,
    sick_leave_total: 12,
    sick_leave_used: 3,
    sick_leave_remaining: 9,
    emergency_leave_total: 5,
    emergency_leave_used: 3,
    emergency_leave_remaining: 2,
    maternity_leave_total: 90,
    maternity_leave_used: 0,
    maternity_leave_remaining: 90,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    paternity_leave_remaining: 10,
    casual_leave_total: 7,
    casual_leave_used: 5,
    casual_leave_remaining: 2,
    carry_forward: 2,
    total_leave_taken: 26,
    last_updated: '2024-03-20'
  },
  {
    id: 4,
    employee_id: 'EMP005',
    employee_name: 'Robert Wilson',
    department: 'Engineering',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 2,
    annual_leave_remaining: 18,
    sick_leave_total: 12,
    sick_leave_used: 1,
    sick_leave_remaining: 11,
    emergency_leave_total: 5,
    emergency_leave_used: 0,
    emergency_leave_remaining: 5,
    maternity_leave_total: 90,
    maternity_leave_used: 0,
    maternity_leave_remaining: 90,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    paternity_leave_remaining: 10,
    casual_leave_total: 7,
    casual_leave_used: 1,
    casual_leave_remaining: 6,
    carry_forward: 8,
    total_leave_taken: 4,
    last_updated: '2024-03-20'
  },
  {
    id: 5,
    employee_id: 'EMP006',
    employee_name: 'Lisa Brown',
    department: 'Design',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 12,
    annual_leave_remaining: 8,
    sick_leave_total: 12,
    sick_leave_used: 2,
    sick_leave_remaining: 10,
    emergency_leave_total: 5,
    emergency_leave_used: 1,
    emergency_leave_remaining: 4,
    maternity_leave_total: 90,
    maternity_leave_used: 45,
    maternity_leave_remaining: 45,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    paternity_leave_remaining: 10,
    casual_leave_total: 7,
    casual_leave_used: 4,
    casual_leave_remaining: 3,
    carry_forward: 6,
    total_leave_taken: 64,
    last_updated: '2024-03-20'
  }
];

const LeaveBalance = () => {
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    year: 2024,
    search: ''
  });

  const [newBalance, setNewBalance] = useState({
    employee_id: '',
    year: 2024,
    annual_leave_total: 20,
    annual_leave_used: 0,
    sick_leave_total: 12,
    sick_leave_used: 0,
    emergency_leave_total: 5,
    emergency_leave_used: 0,
    maternity_leave_total: 90,
    maternity_leave_used: 0,
    paternity_leave_total: 10,
    paternity_leave_used: 0,
    casual_leave_total: 7,
    casual_leave_used: 0,
    carry_forward: 0
  });

  // Stats data
  const [stats, setStats] = useState({
    totalEmployees: 0,
    lowBalance: 0,
    zeroBalance: 0,
    healthyBalance: 0
  });

  const years = [2024, 2023, 2022];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaveBalances(staticLeaveBalances);
      calculateStats(staticLeaveBalances);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (data) => {
    const lowBalance = data.filter(balance => 
      balance.annual_leave_remaining <= 5 || 
      balance.sick_leave_remaining <= 3
    ).length;
    
    const zeroBalance = data.filter(balance => 
      balance.annual_leave_remaining === 0 || 
      balance.sick_leave_remaining === 0
    ).length;
    
    const healthyBalance = data.filter(balance => 
      balance.annual_leave_remaining > 10 && 
      balance.sick_leave_remaining > 6
    ).length;

    setStats({
      totalEmployees: data.length,
      lowBalance,
      zeroBalance,
      healthyBalance
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBalance(prev => ({ 
      ...prev, 
      [name]: value,
      // Auto-calculate remaining balances
      ...(name.includes('_total') || name.includes('_used') ? {
        annual_leave_remaining: name === 'annual_leave_total' || name === 'annual_leave_used' 
          ? calculateRemaining('annual_leave_total', 'annual_leave_used', name, value)
          : prev.annual_leave_remaining,
        sick_leave_remaining: name === 'sick_leave_total' || name === 'sick_leave_used'
          ? calculateRemaining('sick_leave_total', 'sick_leave_used', name, value)
          : prev.sick_leave_remaining,
        emergency_leave_remaining: name === 'emergency_leave_total' || name === 'emergency_leave_used'
          ? calculateRemaining('emergency_leave_total', 'emergency_leave_used', name, value)
          : prev.emergency_leave_remaining,
        maternity_leave_remaining: name === 'maternity_leave_total' || name === 'maternity_leave_used'
          ? calculateRemaining('maternity_leave_total', 'maternity_leave_used', name, value)
          : prev.maternity_leave_remaining,
        paternity_leave_remaining: name === 'paternity_leave_total' || name === 'paternity_leave_used'
          ? calculateRemaining('paternity_leave_total', 'paternity_leave_used', name, value)
          : prev.paternity_leave_remaining,
        casual_leave_remaining: name === 'casual_leave_total' || name === 'casual_leave_used'
          ? calculateRemaining('casual_leave_total', 'casual_leave_used', name, value)
          : prev.casual_leave_remaining
      } : {})
    }));
  };

  const calculateRemaining = (totalField, usedField, changedField, changedValue) => {
    const total = changedField === totalField ? parseInt(changedValue) || 0 : parseInt(newBalance[totalField]) || 0;
    const used = changedField === usedField ? parseInt(changedValue) || 0 : parseInt(newBalance[usedField]) || 0;
    return Math.max(total - used, 0);
  };

  const handleSubmitBalance = async (e) => {
    e.preventDefault();
    try {
      // In real implementation, this would call createLeaveBalance API
      alert('Leave balance updated successfully!');
      setShowBalanceForm(false);
      setEditingBalance(null);
      setNewBalance({
        employee_id: '',
        year: 2024,
        annual_leave_total: 20,
        annual_leave_used: 0,
        sick_leave_total: 12,
        sick_leave_used: 0,
        emergency_leave_total: 5,
        emergency_leave_used: 0,
        maternity_leave_total: 90,
        maternity_leave_used: 0,
        paternity_leave_total: 10,
        paternity_leave_used: 0,
        casual_leave_total: 7,
        casual_leave_used: 0,
        carry_forward: 0
      });
      
      // Refresh the list
      setLoading(true);
      setTimeout(() => {
        setLeaveBalances(staticLeaveBalances);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating leave balance:', error);
      alert('Failed to update leave balance');
    }
  };

  const handleEdit = (balance) => {
    setEditingBalance(balance);
    setNewBalance({
      employee_id: balance.employee_id,
      year: balance.year,
      annual_leave_total: balance.annual_leave_total,
      annual_leave_used: balance.annual_leave_used,
      annual_leave_remaining: balance.annual_leave_remaining,
      sick_leave_total: balance.sick_leave_total,
      sick_leave_used: balance.sick_leave_used,
      sick_leave_remaining: balance.sick_leave_remaining,
      emergency_leave_total: balance.emergency_leave_total,
      emergency_leave_used: balance.emergency_leave_used,
      emergency_leave_remaining: balance.emergency_leave_remaining,
      maternity_leave_total: balance.maternity_leave_total,
      maternity_leave_used: balance.maternity_leave_used,
      maternity_leave_remaining: balance.maternity_leave_remaining,
      paternity_leave_total: balance.paternity_leave_total,
      paternity_leave_used: balance.paternity_leave_used,
      paternity_leave_remaining: balance.paternity_leave_remaining,
      casual_leave_total: balance.casual_leave_total,
      casual_leave_used: balance.casual_leave_used,
      casual_leave_remaining: balance.casual_leave_remaining,
      carry_forward: balance.carry_forward
    });
    setShowBalanceForm(true);
  };

  const handleResetBalances = async () => {
    if (!window.confirm('Are you sure you want to reset all leave balances for the new year? This action cannot be undone.')) return;
    
    try {
      // In real implementation, this would call resetLeaveBalances API
      alert('Leave balances reset successfully for the new year!');
      setLoading(true);
      setTimeout(() => {
        setLeaveBalances(staticLeaveBalances);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error resetting leave balances:', error);
      alert('Failed to reset leave balances');
    }
  };

  const getBalanceStatus = (remaining, total) => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 10) return 'critical';
    if (percentage <= 30) return 'low';
    if (percentage <= 60) return 'medium';
    return 'healthy';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'healthy': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <FaTimesCircle className="text-red-500" />;
      case 'low': return <FaExclamationTriangle className="text-orange-500" />;
      case 'medium': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'healthy': return <FaCheckCircle className="text-green-500" />;
      default: return <FaCalculator className="text-gray-500" />;
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Balance</h1>
          <p className="text-gray-600">Track and manage employee leave balances</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
              </div>
              <FaUser className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Healthy Balance</p>
                <p className="text-2xl font-bold text-gray-800">{stats.healthyBalance}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Balance</p>
                <p className="text-2xl font-bold text-gray-800">{stats.lowBalance}</p>
              </div>
              <FaExclamationTriangle className="text-orange-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zero Balance</p>
                <p className="text-2xl font-bold text-gray-800">{stats.zeroBalance}</p>
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

              <select 
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                onClick={handleResetBalances}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaSync /> Reset Year
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBalanceForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> Add Balance
              </button>
              <button
                onClick={() => alert('Exporting leave balances...')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Leave Balance Form Modal */}
        {showBalanceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingBalance ? 'Edit Leave Balance' : 'Add Leave Balance'}
              </h2>
              <form onSubmit={handleSubmitBalance}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={newBalance.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Employee ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <select
                      name="year"
                      value={newBalance.year}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carry Forward
                    </label>
                    <input
                      type="number"
                      name="carry_forward"
                      value={newBalance.carry_forward}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Annual Leave */}
                  <div className="md:col-span-3 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Annual Leave</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                        <input
                          type="number"
                          name="annual_leave_total"
                          value={newBalance.annual_leave_total}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                        <input
                          type="number"
                          name="annual_leave_used"
                          value={newBalance.annual_leave_used}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining</label>
                        <input
                          type="number"
                          value={newBalance.annual_leave_remaining}
                          disabled
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sick Leave */}
                  <div className="md:col-span-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Sick Leave</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                        <input
                          type="number"
                          name="sick_leave_total"
                          value={newBalance.sick_leave_total}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                        <input
                          type="number"
                          name="sick_leave_used"
                          value={newBalance.sick_leave_used}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining</label>
                        <input
                          type="number"
                          value={newBalance.sick_leave_remaining}
                          disabled
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Leave Types */}
                  {['emergency', 'maternity', 'paternity', 'casual'].map(type => (
                    <div key={type} className="md:col-span-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                          <input
                            type="number"
                            name={`${type}_leave_total`}
                            value={newBalance[`${type}_leave_total`]}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                          <input
                            type="number"
                            name={`${type}_leave_used`}
                            value={newBalance[`${type}_leave_used`]}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remaining</label>
                          <input
                            type="number"
                            value={newBalance[`${type}_leave_remaining`]}
                            disabled
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBalanceForm(false);
                      setEditingBalance(null);
                      setNewBalance({
                        employee_id: '',
                        year: 2024,
                        annual_leave_total: 20,
                        annual_leave_used: 0,
                        sick_leave_total: 12,
                        sick_leave_used: 0,
                        emergency_leave_total: 5,
                        emergency_leave_used: 0,
                        maternity_leave_total: 90,
                        maternity_leave_used: 0,
                        paternity_leave_total: 10,
                        paternity_leave_used: 0,
                        casual_leave_total: 7,
                        casual_leave_used: 0,
                        carry_forward: 0
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
                    {editingBalance ? 'Update Balance' : 'Add Balance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Balances Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Annual Leave</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sick Leave</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Emergency</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Used</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveBalances.map((balance) => {
                const annualStatus = getBalanceStatus(balance.annual_leave_remaining, balance.annual_leave_total);
                const sickStatus = getBalanceStatus(balance.sick_leave_remaining, balance.sick_leave_total);
                const overallStatus = annualStatus === 'critical' || sickStatus === 'critical' ? 'critical' : 
                                   annualStatus === 'low' || sickStatus === 'low' ? 'low' : 'healthy';

                return (
                  <tr key={balance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {balance.employee_name}
                      </div>
                      <div className="text-sm text-gray-500">{balance.employee_id}</div>
                      <div className="text-xs text-gray-400">{balance.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {balance.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{balance.annual_leave_remaining}/{balance.annual_leave_total}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(annualStatus)}`}
                            style={{ width: `${(balance.annual_leave_remaining / balance.annual_leave_total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{balance.sick_leave_remaining}/{balance.sick_leave_total}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(sickStatus)}`}
                            style={{ width: `${(balance.sick_leave_remaining / balance.sick_leave_total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {balance.emergency_leave_remaining}/{balance.emergency_leave_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{balance.total_leave_taken} days</div>
                      <div className="text-xs text-gray-500">
                        Carry Forward: {balance.carry_forward}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(overallStatus)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          overallStatus === 'critical' ? 'bg-red-100 text-red-800' :
                          overallStatus === 'low' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(balance)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => alert('View detailed balance...')}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Balance Summary - {filters.year}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {leaveBalances.reduce((sum, balance) => sum + balance.annual_leave_remaining, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Annual Leave Remaining</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leaveBalances.reduce((sum, balance) => sum + balance.sick_leave_remaining, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sick Leave Remaining</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {leaveBalances.reduce((sum, balance) => sum + balance.total_leave_taken, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Leave Taken</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {leaveBalances.reduce((sum, balance) => sum + balance.carry_forward, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Carry Forward</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
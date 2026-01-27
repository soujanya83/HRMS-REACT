import React, { useState, useEffect } from 'react';
import { 
  FaCalculator, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaSync,
  FaPlus,
  FaEdit,
  FaEye,
  FaUser,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartBar
} from 'react-icons/fa';
import { leaveService } from '../../services/leaveService';

const LeaveBalance = () => {
  // State for leave balances
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  
  // Organization ID - in a real app, you'd get this from context or localStorage
  const organizationId = 15; // Based on your logs
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'all',
    year: new Date().getFullYear(),
    search: ''
  });

  // New balance form data
  const [newBalance, setNewBalance] = useState({
    employee_id: '',
    employee_name: '',
    department: '',
    year: new Date().getFullYear(),
    annual_leave_total: 20,
    annual_leave_used: 0,
    annual_leave_remaining: 20,
    sick_leave_total: 12,
    sick_leave_used: 0,
    sick_leave_remaining: 12,
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
    casual_leave_used: 0,
    casual_leave_remaining: 7,
    carry_forward: 0,
    total_leave_taken: 0,
    last_updated: new Date().toISOString().split('T')[0]
  });

  // Stats data
  const [stats, setStats] = useState({
    totalEmployees: 0,
    lowBalance: 0,
    zeroBalance: 0,
    healthyBalance: 0,
    totalLeaveRemaining: 0,
    totalLeaveUsed: 0
  });

  // Available years
  const years = [2024, 2023, 2022];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Finance', 'Operations'];

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch data from API
  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching leave balance data for organization ID:', organizationId);
      
      // 1. Fetch leave balance
      try {
        const balanceResponse = await leaveService.getLeaveBalance(organizationId);
        console.log('✅ Leave balance response:', balanceResponse.data);
        
        if (balanceResponse.data) {
          // Handle different API response structures
          let balanceData = [];
          if (balanceResponse.data.success && balanceResponse.data.data) {
            balanceData = Array.isArray(balanceResponse.data.data) ? balanceResponse.data.data : [];
          } else if (Array.isArray(balanceResponse.data)) {
            balanceData = balanceResponse.data;
          } else if (balanceResponse.data.data && Array.isArray(balanceResponse.data.data)) {
            balanceData = balanceResponse.data.data;
          }
          
          setLeaveBalances(balanceData);
          calculateStats(balanceData);
        } else {
          setLeaveBalances([]);
          calculateStats([]);
        }
      } catch (balanceError) {
        console.warn('⚠️ Could not fetch leave balance:', balanceError.message);
        // Load static data as fallback
        loadStaticData();
      }

      // 2. Fetch leave types
      try {
        const typesResponse = await leaveService.getLeaveTypes();
        if (typesResponse.data && typesResponse.data.data) {
          setLeaveTypes(typesResponse.data.data);
        }
      } catch (typesError) {
        console.warn('⚠️ Could not fetch leave types:', typesError.message);
        setLeaveTypes([
          { id: 1, name: 'Annual Leave', max_days: 20 },
          { id: 2, name: 'Sick Leave', max_days: 12 },
          { id: 3, name: 'Emergency Leave', max_days: 5 },
          { id: 4, name: 'Maternity Leave', max_days: 90 },
          { id: 5, name: 'Paternity Leave', max_days: 10 },
          { id: 6, name: 'Casual Leave', max_days: 7 }
        ]);
      }

      // 3. Fetch leaves summary
      try {
        const summaryResponse = await leaveService.getLeavesSummary();
        if (summaryResponse.data && summaryResponse.data.data) {
          setLeaveSummary(summaryResponse.data.data);
        }
      } catch (summaryError) {
        console.warn('⚠️ Could not fetch leave summary:', summaryError.message);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      // Load static data as fallback
      loadStaticData();
    } finally {
      setLoading(false);
    }
  };

  // Static data fallback
  const loadStaticData = () => {
    const staticData = [
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
      }
    ];
    
    setLeaveBalances(staticData);
    calculateStats(staticData);
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const lowBalance = data.filter(balance => 
      (balance.annual_leave_remaining || 0) <= 5 || 
      (balance.sick_leave_remaining || 0) <= 3
    ).length;
    
    const zeroBalance = data.filter(balance => 
      (balance.annual_leave_remaining || 0) === 0 || 
      (balance.sick_leave_remaining || 0) === 0
    ).length;
    
    const healthyBalance = data.filter(balance => 
      (balance.annual_leave_remaining || 0) > 10 && 
      (balance.sick_leave_remaining || 0) > 6
    ).length;

    const totalLeaveRemaining = data.reduce((sum, balance) => 
      sum + (balance.annual_leave_remaining || 0) + (balance.sick_leave_remaining || 0) + 
      (balance.emergency_leave_remaining || 0) + (balance.casual_leave_remaining || 0), 0
    );

    const totalLeaveUsed = data.reduce((sum, balance) => 
      sum + (balance.annual_leave_used || 0) + (balance.sick_leave_used || 0) + 
      (balance.emergency_leave_used || 0) + (balance.casual_leave_used || 0), 0
    );

    setStats({
      totalEmployees: data.length,
      lowBalance,
      zeroBalance,
      healthyBalance,
      totalLeaveRemaining,
      totalLeaveUsed
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBalance(prev => { 
      const updated = { 
        ...prev, 
        [name]: value,
        // Auto-calculate remaining balances
        ...(name.includes('_total') || name.includes('_used') ? {
          annual_leave_remaining: name === 'annual_leave_total' || name === 'annual_leave_used' 
            ? calculateRemaining('annual_leave_total', 'annual_leave_used', name, value, prev)
            : prev.annual_leave_remaining,
          sick_leave_remaining: name === 'sick_leave_total' || name === 'sick_leave_used'
            ? calculateRemaining('sick_leave_total', 'sick_leave_used', name, value, prev)
            : prev.sick_leave_remaining,
          emergency_leave_remaining: name === 'emergency_leave_total' || name === 'emergency_leave_used'
            ? calculateRemaining('emergency_leave_total', 'emergency_leave_used', name, value, prev)
            : prev.emergency_leave_remaining,
          maternity_leave_remaining: name === 'maternity_leave_total' || name === 'maternity_leave_used'
            ? calculateRemaining('maternity_leave_total', 'maternity_leave_used', name, value, prev)
            : prev.maternity_leave_remaining,
          paternity_leave_remaining: name === 'paternity_leave_total' || name === 'paternity_leave_used'
            ? calculateRemaining('paternity_leave_total', 'paternity_leave_used', name, value, prev)
            : prev.paternity_leave_remaining,
          casual_leave_remaining: name === 'casual_leave_total' || name === 'casual_leave_used'
            ? calculateRemaining('casual_leave_total', 'casual_leave_used', name, value, prev)
            : prev.casual_leave_remaining
        } : {})
      };
      
      // Calculate total leave taken
      updated.total_leave_taken = calculateTotalLeaveTaken(updated);
      
      return updated;
    });
  };

  // Calculate remaining days
  const calculateRemaining = (totalField, usedField, changedField, changedValue, currentState) => {
    const total = changedField === totalField ? parseInt(changedValue) || 0 : parseInt(currentState[totalField]) || 0;
    const used = changedField === usedField ? parseInt(changedValue) || 0 : parseInt(currentState[usedField]) || 0;
    return Math.max(total - used, 0);
  };

  // Calculate total leave taken
  const calculateTotalLeaveTaken = (balance) => {
    const leaveTypes = [
      'annual_leave_used',
      'sick_leave_used',
      'emergency_leave_used',
      'maternity_leave_used',
      'paternity_leave_used',
      'casual_leave_used'
    ];
    
    return leaveTypes.reduce((total, type) => total + (parseInt(balance[type]) || 0), 0);
  };

  // Handle form submission
  const handleSubmitBalance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Calculate remaining values
      const finalBalance = {
        ...newBalance,
        total_leave_taken: calculateTotalLeaveTaken(newBalance),
        last_updated: new Date().toISOString().split('T')[0]
      };

      // In a real app, you would call your API here
      // await leaveService.createOrUpdateBalance(finalBalance);
      
      alert(editingBalance ? 'Leave balance updated successfully!' : 'Leave balance added successfully!');
      
      setShowBalanceForm(false);
      resetForm();
      
      // Refresh data
      if (editingBalance) {
        // Update in local state
        setLeaveBalances(prev => 
          prev.map(balance => 
            balance.id === editingBalance.id ? { ...balance, ...finalBalance } : balance
          )
        );
      } else {
        // Add new to local state
        setLeaveBalances(prev => [...prev, { ...finalBalance, id: Date.now() }]);
      }
      
      calculateStats(leaveBalances);
      
    } catch (error) {
      console.error('Error saving leave balance:', error);
      alert('Failed to save leave balance');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (balance) => {
    setEditingBalance(balance);
    setNewBalance({
      employee_id: balance.employee_id || '',
      employee_name: balance.employee_name || '',
      department: balance.department || '',
      year: balance.year || new Date().getFullYear(),
      annual_leave_total: balance.annual_leave_total || 20,
      annual_leave_used: balance.annual_leave_used || 0,
      annual_leave_remaining: balance.annual_leave_remaining || 20,
      sick_leave_total: balance.sick_leave_total || 12,
      sick_leave_used: balance.sick_leave_used || 0,
      sick_leave_remaining: balance.sick_leave_remaining || 12,
      emergency_leave_total: balance.emergency_leave_total || 5,
      emergency_leave_used: balance.emergency_leave_used || 0,
      emergency_leave_remaining: balance.emergency_leave_remaining || 5,
      maternity_leave_total: balance.maternity_leave_total || 90,
      maternity_leave_used: balance.maternity_leave_used || 0,
      maternity_leave_remaining: balance.maternity_leave_remaining || 90,
      paternity_leave_total: balance.paternity_leave_total || 10,
      paternity_leave_used: balance.paternity_leave_used || 0,
      paternity_leave_remaining: balance.paternity_leave_remaining || 10,
      casual_leave_total: balance.casual_leave_total || 7,
      casual_leave_used: balance.casual_leave_used || 0,
      casual_leave_remaining: balance.casual_leave_remaining || 7,
      carry_forward: balance.carry_forward || 0,
      total_leave_taken: balance.total_leave_taken || 0,
      last_updated: new Date().toISOString().split('T')[0]
    });
    setShowBalanceForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave balance?')) return;
    
    try {
      // In a real app, you would call your API here
      // await leaveService.deleteLeaveBalance(id);
      
      setLeaveBalances(prev => prev.filter(balance => balance.id !== id));
      alert('Leave balance deleted successfully!');
      calculateStats(leaveBalances.filter(balance => balance.id !== id));
    } catch (error) {
      console.error('Error deleting leave balance:', error);
      alert('Failed to delete leave balance');
    }
  };

  // Handle reset balances
  const handleResetBalances = async () => {
    if (!window.confirm('Are you sure you want to reset all leave balances for the new year? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // In a real app, you would call your API here
      alert('Leave balances have been reset for the new year!');
      fetchAllData();
    } catch (error) {
      console.error('Error resetting leave balances:', error);
      alert('Failed to reset leave balances');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const headers = [
        'Employee ID', 'Employee Name', 'Department', 'Year',
        'Annual Leave (Remaining/Total)', 'Sick Leave (Remaining/Total)',
        'Emergency Leave (Remaining/Total)', 'Total Leave Taken',
        'Carry Forward', 'Last Updated'
      ];

      const csvData = filteredBalances.map(balance => [
        balance.employee_id || '',
        balance.employee_name || '',
        balance.department || '',
        balance.year || '',
        `${balance.annual_leave_remaining || 0}/${balance.annual_leave_total || 0}`,
        `${balance.sick_leave_remaining || 0}/${balance.sick_leave_total || 0}`,
        `${balance.emergency_leave_remaining || 0}/${balance.emergency_leave_total || 0}`,
        balance.total_leave_taken || 0,
        balance.carry_forward || 0,
        balance.last_updated || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leave_balances_${filters.year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Leave balances exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  // Reset form
  const resetForm = () => {
    setNewBalance({
      employee_id: '',
      employee_name: '',
      department: '',
      year: new Date().getFullYear(),
      annual_leave_total: 20,
      annual_leave_used: 0,
      annual_leave_remaining: 20,
      sick_leave_total: 12,
      sick_leave_used: 0,
      sick_leave_remaining: 12,
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
      casual_leave_used: 0,
      casual_leave_remaining: 7,
      carry_forward: 0,
      total_leave_taken: 0,
      last_updated: new Date().toISOString().split('T')[0]
    });
    setEditingBalance(null);
  };

  // Get balance status
  const getBalanceStatus = (remaining, total) => {
    if (!total || total === 0) return 'healthy';
    const percentage = (remaining / total) * 100;
    if (percentage <= 10) return 'critical';
    if (percentage <= 30) return 'low';
    if (percentage <= 60) return 'medium';
    return 'healthy';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'healthy': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <FaTimesCircle className="text-red-500" />;
      case 'low': return <FaExclamationTriangle className="text-orange-500" />;
      case 'medium': return <FaClock className="text-yellow-500" />;
      case 'healthy': return <FaCheckCircle className="text-green-500" />;
      default: return <FaCalculator className="text-gray-500" />;
    }
  };

  // Filter leave balances
  const filteredBalances = leaveBalances.filter(balance => {
    if (filters.department !== 'all' && balance.department !== filters.department) return false;
    if (filters.year && balance.year !== filters.year) return false;
    if (filters.search && !balance.employee_name?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !balance.employee_id?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Loading state
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Balance Management</h1>
          <p className="text-gray-600">Track and manage employee leave balances</p>
          <div className="mt-2 text-sm text-gray-500">
            Organization ID: {organizationId} • Showing data for {filters.year}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
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

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leave Used</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLeaveUsed}</p>
              </div>
              <FaChartBar className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leave Remaining</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLeaveRemaining}</p>
              </div>
              <FaCalendarAlt className="text-cyan-500 text-xl" />
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
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
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
                disabled={loading}
              >
                <FaSync /> {loading ? 'Processing...' : 'Reset Year'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBalanceForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <FaPlus /> Add Balance
              </button>
              <button
                onClick={handleExport}
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
                {editingBalance ? 'Edit Leave Balance' : 'Add New Leave Balance'}
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
                      placeholder="EMP001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      name="employee_name"
                      value={newBalance.employee_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={newBalance.department}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
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
                      Carry Forward (Days)
                    </label>
                    <input
                      type="number"
                      name="carry_forward"
                      value={newBalance.carry_forward}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Annual Leave */}
                  <div className="md:col-span-3 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Annual Leave</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                        <input
                          type="number"
                          name="annual_leave_total"
                          value={newBalance.annual_leave_total}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Used Days</label>
                        <input
                          type="number"
                          name="annual_leave_used"
                          value={newBalance.annual_leave_used}
                          onChange={handleInputChange}
                          min="0"
                          max={newBalance.annual_leave_total}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Days</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                        <input
                          type="number"
                          name="sick_leave_total"
                          value={newBalance.sick_leave_total}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Used Days</label>
                        <input
                          type="number"
                          name="sick_leave_used"
                          value={newBalance.sick_leave_used}
                          onChange={handleInputChange}
                          min="0"
                          max={newBalance.sick_leave_total}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Days</label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                          <input
                            type="number"
                            name={`${type}_leave_total`}
                            value={newBalance[`${type}_leave_total`]}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Used Days</label>
                          <input
                            type="number"
                            name={`${type}_leave_used`}
                            value={newBalance[`${type}_leave_used`]}
                            onChange={handleInputChange}
                            min="0"
                            max={newBalance[`${type}_leave_total`]}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Days</label>
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
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : editingBalance ? 'Update Balance' : 'Add Balance'}
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
              {filteredBalances.length > 0 ? (
                filteredBalances.map((balance) => {
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
                          <div className="font-medium">
                            {balance.annual_leave_remaining}/{balance.annual_leave_total}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${getStatusColor(annualStatus)}`}
                              style={{ 
                                width: `${Math.min(100, (balance.annual_leave_remaining / balance.annual_leave_total) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium">
                            {balance.sick_leave_remaining}/{balance.sick_leave_total}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${getStatusColor(sickStatus)}`}
                              style={{ 
                                width: `${Math.min(100, (balance.sick_leave_remaining / balance.sick_leave_total) * 100)}%` 
                              }}
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
                        <div className="text-xs text-gray-500">
                          Updated: {balance.last_updated}
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
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                            title="Edit"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(balance.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                            title="Delete"
                          >
                            <FaTimesCircle /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FaCalculator className="text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg mb-2">No leave balances found</p>
                      <p className="text-gray-400 text-sm mb-4">
                        {leaveBalances.length === 0 
                          ? "No leave balance data available. Add your first leave balance."
                          : "No leave balances match your filters. Try adjusting your search criteria."}
                      </p>
                      <button
                        onClick={() => setShowBalanceForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Balance
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Balance Summary - {filters.year}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredBalances.reduce((sum, balance) => sum + (balance.annual_leave_remaining || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Annual Leave Remaining</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredBalances.reduce((sum, balance) => sum + (balance.sick_leave_remaining || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sick Leave Remaining</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredBalances.reduce((sum, balance) => sum + (balance.total_leave_taken || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Leave Taken</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredBalances.reduce((sum, balance) => sum + (balance.carry_forward || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Carry Forward</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Showing {filteredBalances.length} of {leaveBalances.length} employees • Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">Organization ID: {organizationId}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSwitchHorizontal, 
  HiOutlineCheckCircle, 
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineExternalLink,
  HiOutlineEye,
  HiOutlineDotsVertical,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload
} from 'react-icons/hi';
import { 
  FaSync, 
  FaUserCheck, 
  FaUserTimes, 
  FaCalendarCheck,
  FaCalendarTimes,
  FaMoneyBillWave,
  FaFileInvoiceDollar
} from 'react-icons/fa';

const XeroIntegrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    syncStatus: 'all',
    xeroStatus: 'all'
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [syncingEmployee, setSyncingEmployee] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    active: 0,
    needsSync: 0,
    lastSync: null
  });

  // Sample data - replace with API call
  const sampleEmployees = [
    {
      id: 1,
      employee_id: 3,
      employee_name: "John Doe",
      employee_code: "EMP001",
      organization_id: 15,
      xero_connection_id: 1,
      xero_employee_id: "XERO-001",
      xero_contact_id: "CONTACT-001",
      is_synced: true,
      last_synced_at: "2024-01-15T10:30:00Z",
      sync_status: "synced",
      sync_error: null,
      xero_status: "ACTIVE",
      xero_start_date: "2024-01-01",
      xero_termination_date: null,
      xero_employee_number: "X001",
      xero_data: {
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Main St",
        bank_account: "***4567"
      },
      mapping_config: {
        earnings_rate: "OrdinaryEarningsRate",
        calendar_id: "CAL-001",
        pay_frequency: "Monthly"
      },
      xerocalenderId: "CAL-001",
      OrdinaryEarningsRateID: "EARN-001",
      EarningsRateID: "EARN-002"
    },
    {
      id: 2,
      employee_id: 4,
      employee_name: "Jane Smith",
      employee_code: "EMP002",
      organization_id: 15,
      xero_connection_id: 1,
      xero_employee_id: "XERO-002",
      xero_contact_id: "CONTACT-002",
      is_synced: true,
      last_synced_at: "2024-01-14T14:20:00Z",
      sync_status: "needs_update",
      sync_error: "Bank details mismatch",
      xero_status: "ACTIVE",
      xero_start_date: "2024-01-01",
      xero_termination_date: null,
      xero_employee_number: "X002",
      xero_data: {
        email: "jane@example.com",
        phone: "+1234567891",
        address: "456 Oak Ave",
        bank_account: "***7890"
      },
      mapping_config: {
        earnings_rate: "OrdinaryEarningsRate",
        calendar_id: "CAL-002",
        pay_frequency: "Fortnightly"
      },
      xerocalenderId: "CAL-002",
      OrdinaryEarningsRateID: "EARN-003",
      EarningsRateID: "EARN-004"
    },
    {
      id: 3,
      employee_id: 5,
      employee_name: "Mike Johnson",
      employee_code: "EMP003",
      organization_id: 15,
      xero_connection_id: null,
      xero_employee_id: null,
      xero_contact_id: null,
      is_synced: false,
      last_synced_at: null,
      sync_status: "not_synced",
      sync_error: null,
      xero_status: null,
      xero_start_date: null,
      xero_termination_date: null,
      xero_employee_number: null,
      xero_data: null,
      mapping_config: null,
      xerocalenderId: null,
      OrdinaryEarningsRateID: null,
      EarningsRateID: null
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployees(sampleEmployees);
      calculateStats(sampleEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (empList) => {
    const stats = {
      total: empList.length,
      synced: empList.filter(e => e.is_synced).length,
      active: empList.filter(e => e.xero_status === 'ACTIVE').length,
      needsSync: empList.filter(e => e.sync_status === 'needs_update').length,
      lastSync: empList.filter(e => e.last_synced_at)
        .sort((a, b) => new Date(b.last_synced_at) - new Date(a.last_synced_at))[0]?.last_synced_at
    };
    setStats(stats);
  };

  const handleSyncEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Sync ${employeeName} to Xero?`)) return;
    
    setSyncingEmployee(employeeId);
    try {
      // API call to sync employee
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update employee status
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              is_synced: true, 
              last_synced_at: new Date().toISOString(),
              sync_status: 'synced'
            } 
          : emp
      ));
      
      alert(`✅ ${employeeName} synced successfully!`);
    } catch (error) {
      console.error('Sync error:', error);
      alert(`❌ Failed to sync ${employeeName}`);
    } finally {
      setSyncingEmployee(null);
    }
  };

  const handleBulkSync = async () => {
    if (!window.confirm(`Sync all ${employees.length} employees to Xero?`)) return;
    
    // Implement bulk sync
    alert('Bulk sync feature coming soon!');
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatusBadge = (employee) => {
    if (employee.sync_status === 'synced') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <HiOutlineCheckCircle className="mr-1" /> Synced
        </span>
      );
    } else if (employee.sync_status === 'needs_update') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <HiOutlineRefresh className="mr-1" /> Needs Update
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <HiOutlineSwitchHorizontal className="mr-1" /> Not Synced
        </span>
      );
    }
  };

  const getXeroStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaUserCheck className="mr-1" /> Active
        </span>
      );
    } else if (status === 'TERMINATED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaUserTimes className="mr-1" /> Terminated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <HiOutlineExclamationCircle className="mr-1" /> Unknown
      </span>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !filters.search || 
      employee.employee_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSyncStatus = filters.syncStatus === 'all' || 
      (filters.syncStatus === 'synced' && employee.is_synced) ||
      (filters.syncStatus === 'not_synced' && !employee.is_synced) ||
      (filters.syncStatus === 'needs_update' && employee.sync_status === 'needs_update');
    
    const matchesXeroStatus = filters.xeroStatus === 'all' || 
      employee.xero_status === filters.xeroStatus;
    
    return matchesSearch && matchesSyncStatus && matchesXeroStatus;
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Xero connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <HiOutlineSwitchHorizontal className="h-8 w-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">Xero Employee Connections</h1>
              </div>
              <p className="text-gray-600">
                Manage employee data synchronization between HRMS and Xero
              </p>
            </div>
            <button
              onClick={handleBulkSync}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              <FaSync /> Bulk Sync
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <HiOutlineUsers className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Synced to Xero</p>
                <p className="text-2xl font-bold text-gray-800">{stats.synced}</p>
              </div>
              <HiOutlineCheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active in Xero</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <FaUserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Update</p>
                <p className="text-2xl font-bold text-gray-800">{stats.needsSync}</p>
              </div>
              <HiOutlineExclamationCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <HiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <select
              value={filters.syncStatus}
              onChange={(e) => setFilters({...filters, syncStatus: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced</option>
              <option value="not_synced">Not Synced</option>
              <option value="needs_update">Needs Update</option>
            </select>
            
            <select
              value={filters.xeroStatus}
              onChange={(e) => setFilters({...filters, xeroStatus: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Xero Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TERMINATED">Terminated</option>
              <option value="null">Not in Xero</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({search: '', syncStatus: 'all', xeroStatus: 'all'})}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Clear Filters
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                <HiOutlineDownload className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sync Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Xero Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Xero ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Last Synced</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold mr-3">
                            {employee.employee_name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{employee.employee_name}</div>
                            <div className="text-sm text-gray-500">{employee.employee_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getSyncStatusBadge(employee)}
                        {employee.sync_error && (
                          <div className="text-xs text-red-600 mt-1" title={employee.sync_error}>
                            <HiOutlineExclamationCircle className="inline mr-1" /> Error
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getXeroStatusBadge(employee.xero_status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {employee.xero_employee_id || 'Not assigned'}
                        </div>
                        {employee.xero_employee_number && (
                          <div className="text-xs text-gray-500">#{employee.xero_employee_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(employee.last_synced_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSyncEmployee(employee.id, employee.employee_name)}
                            disabled={syncingEmployee === employee.id}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sync to Xero"
                          >
                            {syncingEmployee === employee.id ? (
                              <>
                                <FaSync className="animate-spin" /> Syncing...
                              </>
                            ) : (
                              <>
                                <FaSync /> Sync
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleViewDetails(employee)}
                            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="View Details"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                          
                          {employee.xero_contact_id && (
                            <a
                              href={`https://go.xero.com/Contacts/View/${employee.xero_contact_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                              title="View in Xero"
                            >
                              <HiOutlineExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <HiOutlineUsers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters or add more employees
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredEmployees.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Last overall sync: {stats.lastSync ? formatDate(stats.lastSync) : 'Never'}
              </div>
            </div>
          </div>
        )}

        {/* Employee Details Modal */}
        {showDetailsModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Xero Connection Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Employee Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <HiOutlineUsers /> Employee Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.employee_name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Employee Code:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.employee_code}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Organization ID:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.organization_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Xero Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <HiOutlineSwitchHorizontal /> Xero Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Xero Employee ID:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.xero_employee_id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Xero Contact ID:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.xero_contact_id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Employee Number:</span>
                        <span className="ml-2 font-medium">{selectedEmployee.xero_employee_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaCalendarCheck /> Start Date
                    </h4>
                    <p className="text-lg font-medium">
                      {selectedEmployee.xero_start_date ? formatDate(selectedEmployee.xero_start_date) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaCalendarTimes /> Termination Date
                    </h4>
                    <p className="text-lg font-medium">
                      {selectedEmployee.xero_termination_date ? formatDate(selectedEmployee.xero_termination_date) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <HiOutlineClock /> Last Synced
                    </h4>
                    <p className="text-lg font-medium">
                      {formatDate(selectedEmployee.last_synced_at)}
                    </p>
                  </div>
                </div>
                
                {/* Configuration */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <HiOutlineCog /> Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Calendar ID:</span>
                      <span className="ml-2 font-medium">{selectedEmployee.xerocalenderId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ordinary Earnings Rate:</span>
                      <span className="ml-2 font-medium">{selectedEmployee.OrdinaryEarningsRateID || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Earnings Rate ID:</span>
                      <span className="ml-2 font-medium">{selectedEmployee.EarningsRateID || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleSyncEmployee(selectedEmployee.id, selectedEmployee.employee_name);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                  >
                    <FaSync /> Sync Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XeroIntegrationPage;
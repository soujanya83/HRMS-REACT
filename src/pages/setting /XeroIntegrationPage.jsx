import React, { useState, useEffect } from 'react';
import {
  HiOutlineSwitchHorizontal,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineExternalLink,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineCog
} from 'react-icons/hi';
import {
  FaSync,
  FaUserCheck,
  FaUserTimes,
  FaCalendarCheck,
  FaCalendarTimes,
  FaSpinner,
  FaPlug,
  FaTimes,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaUser,
  FaBuilding
} from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import axios from 'axios';
import { useOrganizations } from '../../contexts/OrganizationContext';
import axiosClient from '../../axiosClient';

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};



// Xero Integration Service
const xeroService = {
  // 1. Check Xero connection status
  getConnectionStatus: async () => {
    try {
      const response = await axiosClient.get('/xero/status');
      return response.data;
    } catch (error) {
      console.error('Error checking Xero connection status:', error);
      return {
        connected: false,
        tenant: null,
        expires_at: null,
        error: error.message
      };
    }
  },

  // 2. Connect to Xero
  connectToXero: async () => {
    try {
      const response = await axiosClient.get('/xero/connect');
      return response.data;
    } catch (error) {
      console.error('Error connecting to Xero:', error);
      throw error;
    }
  },

  // 3. Get all employees from HRMS
  getAllEmployees: async () => {
    try {
      const response = await axiosClient.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // 4. Check Xero connection for an employee
  // This will try multiple possible endpoints
  getEmployeeXeroConnection: async (employeeId) => {
    const endpoints = [
      `/employees/${employeeId}/xero`,
      `/employees/${employeeId}/xero-details`,
      `/xero/employee/${employeeId}`,
      `/xero/employees/${employeeId}`,
      `/employee/${employeeId}/xero`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await axiosClient.get(endpoint);
        if (response.data) {
          console.log(`✅ Found Xero data at ${endpoint} for employee ${employeeId}:`, response.data);
          return {
            success: true,
            endpoint: endpoint,
            data: response.data.data || response.data,
            connected: true
          };
        }
      } catch (error) {
        // 404 is expected if endpoint doesn't exist
        if (error.response?.status === 404) {
          console.log(`❌ Endpoint ${endpoint} not found (404)`);
          continue;
        }
        console.error(`Error fetching from ${endpoint}:`, error);
      }
    }

    // If no endpoint works, employee is not connected to Xero
    console.log(`No Xero data found for employee ${employeeId}`);
    return {
      success: true,
      endpoint: null,
      data: null,
      connected: false
    };
  },

  // 5. Sync employee to Xero
  syncEmployeeToXero: async (employeeId) => {
    try {
      const response = await axiosClient.post('/xero/sync-employee', {
        employee_id: employeeId,
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing employee to Xero:', error);
      throw error;
    }
  },

  // 6. Bulk sync employees
  bulkSyncEmployees: async (employeeIds) => {
    try {
      const response = await axiosClient.post('/xero/sync-employees', {
        employee_ids: employeeIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk syncing employees:', error);
      throw error;
    }
  }
};

// Main Component
const XeroIntegrationPage = () => {
  const { selectedOrganization } = useOrganizations();
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
  const [xeroConnectionStatus, setXeroConnectionStatus] = useState({
    connected: false,
    tenant: null,
    expires_at: null,
    loading: false
  });
  const [connectingToXero, setConnectingToXero] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingXeroData, setFetchingXeroData] = useState(false);

  // Color palette state
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    active: 0,
    needsSync: 0,
    lastSync: null
  });

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Fetch initial data
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check Xero connection status
      //console.log('Checking Xero connection status...');
      const connectionStatus = await xeroService.getConnectionStatus();
      setXeroConnectionStatus({
        ...connectionStatus,
        loading: false
      });

      // 2. ALWAYS fetch employees, regardless of Xero connection status
      await fetchEmployeesWithXeroStatus();

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      setEmployees([]);
      resetStats();
      setXeroConnectionStatus({
        connected: false,
        tenant: null,
        expires_at: null,
        loading: false
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesWithXeroStatus = async () => {
    try {
      setFetchingXeroData(true);

      // 1. Get all employees from HRMS
      // console.log('Fetching all employees...');
      const employeesResponse = await xeroService.getAllEmployees();

      if (employeesResponse.success && employeesResponse.data) {
        const hrmsEmployees = employeesResponse.data;
        //console.log(`Found ${hrmsEmployees.length} employees in HRMS`);

        // 2. For each employee, check Xero connection status (only if Xero is connected)
        const employeesWithXeroData = await Promise.all(
          hrmsEmployees.map(async (hrmsEmployee) => {
            try {
              let xeroResponse = { connected: false, data: null };

              // Only try to fetch Xero data if Xero is connected
              if (xeroConnectionStatus.connected) {
                xeroResponse = await xeroService.getEmployeeXeroConnection(hrmsEmployee.id);
              }

              // Combine HRMS data with Xero data
              return {
                // HRMS Data
                id: hrmsEmployee.id,
                employee_id: hrmsEmployee.id,
                employee_name: `${hrmsEmployee.first_name || ''} ${hrmsEmployee.last_name || ''}`.trim(),
                employee_code: hrmsEmployee.employee_code,
                organization_id: hrmsEmployee.organization_id,
                department_name: hrmsEmployee.department?.name || 'Unknown',
                designation: hrmsEmployee.designation?.title || 'Unknown',
                status: hrmsEmployee.status,
                personal_email: hrmsEmployee.personal_email,
                phone_number: hrmsEmployee.phone_number,

                // Xero Data (if connected)
                xero_connected: xeroResponse.connected,
                xero_data: xeroResponse.data,
                is_synced: xeroResponse.connected,
                sync_status: xeroResponse.connected ? 'synced' : 'not_synced',
                xero_status: xeroResponse.data?.xero_status || null,
                xero_employee_id: xeroResponse.data?.xero_employee_id || null,
                xero_contact_id: xeroResponse.data?.xero_contact_id || null,
                last_synced_at: xeroResponse.data?.last_synced_at || null,
                sync_error: xeroResponse.data?.sync_error || null,
                xero_start_date: xeroResponse.data?.xero_start_date || null,
                xero_termination_date: xeroResponse.data?.xero_termination_date || null,
                xero_employee_number: xeroResponse.data?.xero_employee_number || null,

                // Additional Xero fields
                xerocalenderId: xeroResponse.data?.xerocalenderId || null,
                OrdinaryEarningsRateID: xeroResponse.data?.OrdinaryEarningsRateID || null,
                EarningsRateID: xeroResponse.data?.EarningsRateID || null
              };
            } catch (error) {
              console.error(`Error processing employee ${hrmsEmployee.id}:`, error);
              return {
                id: hrmsEmployee.id,
                employee_id: hrmsEmployee.id,
                employee_name: `${hrmsEmployee.first_name || ''} ${hrmsEmployee.last_name || ''}`.trim(),
                employee_code: hrmsEmployee.employee_code,
                organization_id: hrmsEmployee.organization_id,
                department_name: hrmsEmployee.department?.name || 'Unknown',
                xero_connected: false,
                is_synced: false,
                sync_status: 'not_synced',
                sync_error: xeroConnectionStatus.connected ? 'Failed to fetch Xero data' : 'Xero not connected'
              };
            }
          })
        );

        setEmployees(employeesWithXeroData);
        calculateStats(employeesWithXeroData);
        // console.log('Employees with Xero data:', employeesWithXeroData);
      } else {
        //console.log('No employees found in HRMS');
        setEmployees([]);
        resetStats();
      }
    } catch (error) {
      console.error('Error fetching employees with Xero status:', error);
      setError('Failed to fetch employee data. Please try again.');
      setEmployees([]);
      resetStats();
    } finally {
      setFetchingXeroData(false);
    }
  };

  const resetStats = () => {
    setStats({
      total: 0,
      synced: 0,
      active: 0,
      needsSync: 0,
      lastSync: null
    });
  };

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

  const handleConnectXero = async () => {
    try {
      setConnectingToXero(true);
      setError(null);

      const response = await xeroService.connectToXero();

      if (response.auth_url) {
        // Redirect to Xero authorization URL
        window.location.href = response.auth_url;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting to Xero:', error);
      setError(error.response?.data?.message || 'Failed to connect to Xero');
    } finally {
      setConnectingToXero(false);
      setShowConnectionModal(false);
    }
  };

  const handleSyncEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Sync ${employeeName} to Xero?`)) return;

    setSyncingEmployee(employeeId);
    setError(null);

    try {
      const response = await xeroService.syncEmployeeToXero(employeeId);

      if (response.success) {
        // Update local state
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId
            ? {
              ...emp,
              is_synced: true,
              last_synced_at: new Date().toISOString(),
              sync_status: 'synced',
              sync_error: null,
              xero_connected: true
            }
            : emp
        ));

        // Recalculate stats
        calculateStats(employees.map(emp =>
          emp.id === employeeId
            ? { ...emp, is_synced: true, sync_status: 'synced' }
            : emp
        ));

        alert(`✅ ${employeeName} synced successfully!`);
      } else {
        throw new Error(response.message || 'Failed to sync employee');
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to sync employee';
      alert(`❌ ${errorMessage}`);

      // Update employee with error
      setEmployees(prev => prev.map(emp =>
        emp.id === employeeId
          ? {
            ...emp,
            sync_status: 'needs_update',
            sync_error: errorMessage
          }
          : emp
      ));
    } finally {
      setSyncingEmployee(null);
    }
  };

  const handleBulkSync = async () => {
    if (!employees.length) {
      alert('No employees to sync');
      return;
    }

    const notSyncedEmployees = employees.filter(emp => !emp.is_synced);
    if (!notSyncedEmployees.length) {
      alert('All employees are already synced!');
      return;
    }

    if (!window.confirm(`Sync ${notSyncedEmployees.length} unsynced employees to Xero?`)) return;

    setLoading(true);
    setError(null);

    try {
      const employeeIds = notSyncedEmployees.map(emp => emp.id);
      const response = await xeroService.bulkSyncEmployees(employeeIds);

      if (response.success) {
        alert(`✅ Bulk sync initiated for ${employeeIds.length} employees!`);
        // Refresh data
        await fetchData();
      } else {
        throw new Error(response.message || 'Bulk sync failed');
      }
    } catch (error) {
      console.error('Bulk sync error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to bulk sync');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSyncStatusBadge = (employee) => {
    if (employee.sync_status === 'synced' || employee.is_synced) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <HiOutlineCheckCircle className="mr-1" /> Synced
        </span>
      );
    } else if (employee.sync_status === 'needs_update') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <HiOutlineRefresh className="mr-1" /> Needs Update
        </span>
      );
    } else if (employee.sync_status === 'error') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <HiOutlineExclamationCircle className="mr-1" /> Error
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <HiOutlineSwitchHorizontal className="mr-1" /> Not Synced
        </span>
      );
    }
  };

  const getXeroStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <FaUserCheck className="mr-1" /> Active
        </span>
      );
    } else if (status === 'TERMINATED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <FaUserTimes className="mr-1" /> Terminated
        </span>
      );
    } else if (status === null || status === undefined) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <HiOutlineExclamationCircle className="mr-1" /> Not in Xero
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <HiOutlineExclamationCircle className="mr-1" /> {status}
      </span>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !filters.search ||
      employee.employee_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSyncStatus = filters.syncStatus === 'all' ||
      (filters.syncStatus === 'synced' && employee.is_synced) ||
      (filters.syncStatus === 'not_synced' && !employee.is_synced) ||
      (filters.syncStatus === 'needs_update' && employee.sync_status === 'needs_update');

    const matchesXeroStatus = filters.xeroStatus === 'all' ||
      employee.xero_status === filters.xeroStatus;

    return matchesSearch && matchesSyncStatus && matchesXeroStatus;
  });

  // No organization selected
  if (!selectedOrganization?.id) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <HiOutlineSwitchHorizontal className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization to manage Xero integrations</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Xero connections...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {selectedOrganization.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          //console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          // console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header - BOTH BUTTONS SIDE BY SIDE */}
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
                {selectedOrganization && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                    <FaBuilding className="mr-2 text-xs" />
                    {selectedOrganization.name}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {/* Connect to Xero Button - Shows when NOT connected */}
                {!xeroConnectionStatus.connected && (
                  <button
                    onClick={() => setShowConnectionModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    disabled={connectingToXero}
                  >
                    {connectingToXero ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPlug />
                    )}
                    {connectingToXero ? 'Connecting...' : 'Connect to Xero'}
                  </button>
                )}

                {/* Bulk Sync Button - Shows when connected */}
                {xeroConnectionStatus.connected && (
                  <button
                    onClick={handleBulkSync}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    disabled={loading || fetchingXeroData}
                  >
                    <FaSync /> Bulk Sync
                  </button>
                )}
              </div>
            </div>

            {/* Connection Status Badge - Below the header */}
            {xeroConnectionStatus.connected && (
              <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 inline-block">
                <FaPlug className="text-green-600" />
                <div className="text-sm">
                  <span className="font-semibold">Connected to Xero</span>
                  {xeroConnectionStatus.tenant && (
                    <span className="ml-2">• Tenant: {xeroConnectionStatus.tenant}</span>
                  )}
                  {xeroConnectionStatus.expires_at && (
                    <span className="ml-2">• Expires: {formatExpiryDate(xeroConnectionStatus.expires_at)}</span>
                  )}
                </div>
                <button
                  onClick={() => fetchData()}
                  className="ml-2 p-1 hover:bg-green-100 rounded transition-colors"
                  title="Refresh Connection"
                >
                  <HiOutlineRefresh className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HiOutlineExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* Loading Xero Data Message */}
          {fetchingXeroData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <FaSpinner className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                <p className="text-blue-700">Fetching Xero connection data for employees...</p>
              </div>
            </div>
          )}

          {/* Stats Cards - ALWAYS SHOW (but with conditional data) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <FaUser className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Synced to Xero</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.synced}</p>
                </div>
                <HiOutlineCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active in Xero</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
                </div>
                <FaUserCheck className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Synced</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total - stats.synced}</p>
                </div>
                <HiOutlineExclamationCircle className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Connection Status Message */}
          {!xeroConnectionStatus.connected && employees.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <HiOutlineExclamationCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-yellow-700">
                  <span className="font-semibold">Xero is not connected.</span>
                  Connect to Xero to enable employee synchronization and view detailed Xero status.
                </p>
              </div>
            </div>
          )}

          {/* Filters - ALWAYS SHOW */}
          <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <HiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sync Status</label>
                <select
                  value={filters.syncStatus}
                  onChange={(e) => setFilters({ ...filters, syncStatus: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white text-sm"
                >
                  <option value="all">All Sync Status</option>
                  <option value="synced">Synced</option>
                  <option value="not_synced">Not Synced</option>
                  <option value="needs_update">Needs Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xero Status</label>
                <select
                  value={filters.xeroStatus}
                  onChange={(e) => setFilters({ ...filters, xeroStatus: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white text-sm"
                >
                  <option value="all">All Xero Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="null">Not in Xero</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => setFilters({ search: '', syncStatus: 'all', xeroStatus: 'all' })}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchData()}
                  className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <HiOutlineRefresh /> Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Employees Table - ALWAYS SHOW */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">Sync Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">Xero Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">
                      {xeroConnectionStatus.connected ? 'Xero ID' : 'Sync Status'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">Last Synced</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 w-[22%] min-w-[180px]">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                              {employee.employee_name?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">{employee.employee_name}</div>
                              <div className="text-sm text-gray-500">{employee.employee_code}</div>
                              <div className="text-xs text-gray-400">{employee.department_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 w-[16%] min-w-[140px]">
                          {getSyncStatusBadge(employee)}
                          {employee.sync_error && (
                            <div className="text-xs text-red-600 mt-1" title={employee.sync_error}>
                              <HiOutlineExclamationCircle className="inline mr-1" /> Error
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 w-[16%] min-w-[140px]">
                          {getXeroStatusBadge(employee.xero_status)}
                        </td>
                        <td className="px-4 py-3 w-[16%] min-w-[140px]">
                          {xeroConnectionStatus.connected ? (
                            <div className="text-sm text-gray-900">
                              {employee.xero_employee_id || 'Not assigned'}
                              {employee.xero_employee_number && (
                                <div className="text-xs text-gray-500">#{employee.xero_employee_number}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">Connect Xero to view</div>
                          )}
                        </td>
                        <td className="px-4 py-3 w-[16%] min-w-[140px]">
                          <div className="text-sm text-gray-900">
                            {formatDate(employee.last_synced_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3 w-[14%] min-w-[140px] text-sm font-medium">
                          <div className="flex gap-2">
                            {!employee.is_synced && xeroConnectionStatus.connected ? (
                              <button
                                onClick={() => handleSyncEmployee(employee.id, employee.employee_name)}
                                disabled={syncingEmployee === employee.id}
                                className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Sync to Xero"
                              >
                                {syncingEmployee === employee.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaSync />
                                )}
                              </button>
                            ) : !xeroConnectionStatus.connected && (
                              <button
                                onClick={() => setShowConnectionModal(true)}
                                className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Connect Xero to sync"
                              >
                                <FaPlug /> Connect
                              </button>
                            )}

                            <button
                              onClick={() => handleViewDetails(employee)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                              title="View Details"
                            >
                              <HiOutlineEye /> View
                            </button>

                            {employee.xero_contact_id && xeroConnectionStatus.connected && (
                              <a
                                href={`https://go.xero.com/Contacts/View/${employee.xero_contact_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                title="View in Xero"
                              >
                                <HiOutlineExternalLink />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <HiOutlineUsers className="text-4xl text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            {employees.length === 0 ? 'No employees found' : 'No employees match your filters'}
                          </p>
                          <p className="text-gray-500">
                            {employees.length === 0 ? 'No employees in the system yet.' : 'Try changing your filters.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer - ALWAYS SHOW */}
          {filteredEmployees.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {filteredEmployees.length} of {employees.length} employees
                  {fetchingXeroData && ' • Fetching Xero data...'}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {xeroConnectionStatus.connected ? (
                    <>
                      {stats.synced} of {stats.total} employees synced to Xero
                      {stats.lastSync && ` • Last sync: ${formatDate(stats.lastSync)}`}
                    </>
                  ) : (
                    <>
                      {stats.total} employees • Connect Xero to enable synchronization
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connection Modal */}
          {showConnectionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[80] p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Connect to Xero</h2>
                  <button
                    onClick={() => setShowConnectionModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="text-center mb-6">
                    <FaPlug className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect Your Xero Account</h3>
                    <p className="text-gray-600">
                      You'll be redirected to Xero to authorize access to your account.
                      This allows secure employee data synchronization.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <HiOutlineExclamationCircle className="mr-2" />
                      Permissions Required
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Read and write employee information</li>
                      <li>• Access payroll data</li>
                      <li>• Manage employee leave and timesheets</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowConnectionModal(false)}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConnectXero}
                      disabled={connectingToXero}
                      className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      {connectingToXero ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FaPlug />
                          Connect to Xero
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details Modal */}
          {showDetailsModal && selectedEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[80] p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Employee Xero Connection Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xl">
                      {selectedEmployee.employee_name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{selectedEmployee.employee_name}</h3>
                      <p className="text-gray-600">{selectedEmployee.employee_code} • {selectedEmployee.department_name}</p>
                      <div className="flex gap-2 mt-1">
                        {getSyncStatusBadge(selectedEmployee)}
                        {getXeroStatusBadge(selectedEmployee.xero_status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Employee Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <HiOutlineUsers /> Employee Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee Code:</span>
                          <span className="font-medium">{selectedEmployee.employee_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{selectedEmployee.department_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Designation:</span>
                          <span className="font-medium">{selectedEmployee.designation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedEmployee.personal_email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedEmployee.phone_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Xero Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <HiOutlineSwitchHorizontal /> Xero Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Xero Employee ID:</span>
                          <span className="font-medium">{selectedEmployee.xero_employee_id || 'Not assigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Xero Contact ID:</span>
                          <span className="font-medium">{selectedEmployee.xero_contact_id || 'Not assigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee Number:</span>
                          <span className="font-medium">{selectedEmployee.xero_employee_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sync Status:</span>
                          <span className="font-medium">{selectedEmployee.is_synced ? 'Synced' : 'Not Synced'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarCheck /> Xero Start Date
                      </h4>
                      <p className="text-lg font-medium">
                        {selectedEmployee.xero_start_date ? formatDate(selectedEmployee.xero_start_date) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarTimes /> Termination Date
                      </h4>
                      <p className="text-lg font-medium">
                        {selectedEmployee.xero_termination_date ? formatDate(selectedEmployee.xero_termination_date) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <HiOutlineClock /> Last Synced
                      </h4>
                      <p className="text-lg font-medium">
                        {formatDate(selectedEmployee.last_synced_at)}
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {selectedEmployee.sync_error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                        <HiOutlineExclamationCircle className="mr-2" />
                        Sync Error
                      </h4>
                      <p className="text-red-700 text-sm">{selectedEmployee.sync_error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                    >
                      Close
                    </button>
                    {!selectedEmployee.is_synced && xeroConnectionStatus.connected && (
                      <button
                        onClick={() => {
                          handleSyncEmployee(selectedEmployee.id, selectedEmployee.employee_name);
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <FaSync /> Sync Now
                      </button>
                    )}
                    {!xeroConnectionStatus.connected && (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setShowConnectionModal(true);
                        }}
                        className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <FaPlug /> Connect Xero
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default XeroIntegrationPage;
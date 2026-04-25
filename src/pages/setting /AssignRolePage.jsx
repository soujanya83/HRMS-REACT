import React, { useState, useEffect } from 'react';
import usePermissions from '../../hooks/usePermissions';
import { HiOutlineUsers, HiOutlineShieldCheck, HiOutlineCheck, HiOutlineX, HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';
import { FaSpinner } from 'react-icons/fa';
import assignRoleService from '../../services/assignRoleService';
import roleService from '../../services/roleService';
import { employeeService } from '../../services/employeeService';
import { useOrganizations } from '../../contexts/OrganizationContext';

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

const AssignRolePage = () => {
  const { canEdit } = usePermissions('settings.assign_roles_to_users');
  const { selectedOrganization: currentOrganization } = useOrganizations();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assigning, setAssigning] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Color palette state
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const roleOptions = [
    { value: 'superadmin', label: 'Super Admin', color: 'bg-red-100 text-red-800', keywords: ['super', 'admin'] },
    { value: 'organization_admin', label: 'Organization Admin', color: 'bg-purple-100 text-purple-800', keywords: ['org', 'admin'] },
    { value: 'hr_manager', label: 'HR Manager', color: 'bg-blue-100 text-blue-800', keywords: ['hr', 'manager'] },
    { value: 'recruiter', label: 'Recruiter', color: 'bg-green-100 text-green-800', keywords: ['recruiter', 'hire'] },
    { value: 'payroll_manager', label: 'Payroll Manager', color: 'bg-yellow-100 text-yellow-800', keywords: ['payroll', 'salary'] },
    { value: 'team_manager', label: 'Team Manager', color: 'bg-indigo-100 text-indigo-800', keywords: ['team', 'lead'] },
    { value: 'employee', label: 'Employee', color: 'bg-gray-100 text-gray-800', keywords: ['employee', 'staff', 'user'] },
  ];

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Debounce logic for search (still useful for local filtering to avoid lag)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle local filtering when data, search, or status changes
  useEffect(() => {
    let filtered = [...employees];

    // Apply search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        (emp.name && emp.name.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term)) ||
        (emp.employee_id && emp.employee_id.toString().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp =>
        emp.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredEmployees(filtered);
    setTotalItems(filtered.length);
    setLastPage(Math.ceil(filtered.length / perPage) || 1);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [employees, debouncedSearchTerm, statusFilter, perPage]);

  // Main data fetch - load all organization data initially
  useEffect(() => {
    if (currentOrganization && currentOrganization.id) {
      fetchAllEmployees();
      fetchAvailableRoles();
    }
  }, [currentOrganization]);

  const fetchAllEmployees = async () => {
    if (!currentOrganization || !currentOrganization.id) {
      setMessage({ type: 'error', text: 'No organization selected' });
      return;
    }

    try {
      setLoading(true);
      // Fetch without page/per_page to get full list for local filtering
      const response = await employeeService.getAllEmployees({
        organization_id: currentOrganization.id,
        per_page: 1000 // High limit to ensure we get all data for local filtering
      });

      let employeesData = [];
      if (response && response.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (response && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      }

      const mappedEmployees = employeesData.map(emp => {
        let roles = [];
        if (Array.isArray(emp.roles)) {
          roles = emp.roles;
        } else if (emp.role_name) {
          roles = typeof emp.role_name === 'string'
            ? emp.role_name.split(',').map(r => r.trim())
            : [emp.role_name];
        }

        return {
          ...emp,
          id: emp.employee_id || emp.user_id,
          name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unnamed',
          email: emp.email || '',
          user_id: emp.user_id,
          roles: roles,
          department_name: emp.department_name || 'N/A'
        };
      });

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage({ type: 'error', text: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  // Helper for pagination
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const fetchAvailableRoles = async () => {
    try {
      const response = await roleService.getRoles();
      if (response && response.status && Array.isArray(response.data)) {
        // Map dynamic roles
        const roles = response.data.map(role => ({
          id: role.id,
          name: role.name,
          // Use name as value for assignment, matching backend expectations
          value: role.name
        }));
        setAvailableRoles(roles);
      } else {
        // Fallback to assignRoleService if roleService fails or returns unexpected format
        const roles = await assignRoleService.getAvailableRoles();
        setAvailableRoles(Array.isArray(roles) ? roles.map(r => ({ name: r, value: r })) : []);
      }
    } catch (error) {
      console.error('Error fetching available roles:', error);
      // Use default roles if API fails
      const defaults = ['superadmin', 'organization_admin', 'hr_manager', 'recruiter', 'payroll_manager', 'team_manager', 'employee'];
      setAvailableRoles(defaults.map(r => ({ name: r, value: r })));
    }
  };

  const fetchUserRoles = async (userId) => {
    if (!currentOrganization || !currentOrganization.id || !userId) return;

    try {
      const roles = await assignRoleService.getUserRoles(currentOrganization.id, userId);
      setUserRoles(Array.isArray(roles) ? roles : []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  // filterEmployees is handled in a reactive useEffect above

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSelectedRole('');
    if (employee && employee.user_id) {
      fetchUserRoles(employee.user_id);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedEmployee || !selectedRole || !currentOrganization) {
      setMessage({ type: 'error', text: 'Please select an employee and a role' });
      return;
    }

    try {
      setAssigning(true);

      // Use user_id instead of employee id
      const userId = selectedEmployee.user_id;

      if (!userId) {
        setMessage({ type: 'error', text: 'User ID not found for this employee' });
        return;
      }

      await assignRoleService.assignRoleToUser(
        currentOrganization.id,
        userId,
        selectedRole
      );

      setMessage({ type: 'success', text: 'Role assigned successfully' });

      // Refresh user roles
      fetchUserRoles(userId);

      // Clear selection
      setSelectedRole('');

      // Refresh employee list
      setTimeout(() => fetchAllEmployees(), 500);
    } catch (error) {
      console.error('Error assigning role:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to assign role'
      });
    } finally {
      setAssigning(false);
    }
  };


  const getRoleDisplayName = (roleValue) => {
    if (!roleValue) return 'N/A';

    // Check if the value is in our predefined options
    const roleOpt = roleOptions.find(r =>
      r.value.toLowerCase() === roleValue.toLowerCase() ||
      r.label.toLowerCase() === roleValue.toLowerCase()
    );
    if (roleOpt) return roleOpt.label;

    // Return the role name as is if it's dynamic
    return roleValue;
  };

  const getRoleColorClass = (roleValue) => {
    if (!roleValue) return 'bg-gray-100 text-gray-800';

    // Check predefined options
    const roleOpt = roleOptions.find(r =>
      r.value.toLowerCase() === roleValue.toLowerCase() ||
      r.label.toLowerCase() === roleValue.toLowerCase()
    );
    if (roleOpt) return roleOpt.color;

    // Try to find a color by keyword for dynamic roles
    const keywordMatch = roleOptions.find(r =>
      r.keywords.some(kw => roleValue.toLowerCase().includes(kw))
    );
    if (keywordMatch) return keywordMatch.color;

    // Default color for unknown dynamic roles
    return 'bg-slate-100 text-slate-800';
  };

  // No organization selected
  if (!currentOrganization?.id) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <HiOutlineUsers className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization to assign roles</p>
        </div>
      </div>
    );
  }

  if (loading && employees.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {currentOrganization.name}</p>
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
          //console.log('Setting background color to:', color);
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HiOutlineUsers className="mr-3 text-blue-600" size={28} />
                Assign Roles to Users
              </h1>
              <p className="text-gray-600 mt-2">
                Manage role assignments for employees in {currentOrganization?.name || 'your organization'}
              </p>
              {currentOrganization && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                  <HiOutlineShieldCheck className="mr-2 text-xs" />
                  {currentOrganization.name}
                </div>
              )}
            </div>

            <button
              onClick={fetchAllEmployees}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiOutlineRefresh className="mr-2" />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">Total Employees</div>
              <div className="text-2xl font-bold text-gray-900">{totalItems || employees.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">With Roles Assigned</div>
              <div className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.roles && emp.roles.length > 0).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">Available Roles</div>
              <div className="text-2xl font-bold text-gray-900">{availableRoles.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-sm text-gray-600">Organization</div>
              <div className="text-lg font-semibold text-gray-900 truncate">{currentOrganization?.name || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <HiOutlineX size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Employee List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center text-gray-800">
                    <HiOutlineUsers className="mr-2 text-blue-600" />
                    Employees
                  </h2>

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="On Probation">On Probation</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          {loading ? 'Searching...' : 'No employees found match your search criteria.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((employee) => (
                        <tr
                          key={employee.user_id || employee.id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedEmployee?.user_id === employee.user_id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {employee.profile_picture ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={employee.profile_picture}
                                    alt={employee.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      {employee.name?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {employee.name || 'Unnamed'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {employee.email || 'No email'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  User ID: {employee.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {employee.department_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.designation?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {employee.roles && employee.roles.length > 0 ? (
                                employee.roles.map((role, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(role)}`}
                                  >
                                    {getRoleDisplayName(role)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">No roles assigned</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : employee.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {employee.status || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmployeeSelect(employee);
                              }}
                              className={`px-3 py-1 rounded-lg transition-colors ${selectedEmployee?.user_id === employee.user_id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {selectedEmployee?.user_id === employee.user_id ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length > 0 && (
                <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * perPage, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> entries
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {/* Simple logic for page numbers: show max 5 buttons */}
                      {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        let pageNum;
                        if (lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= lastPage - 2) {
                          pageNum = lastPage - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                      disabled={currentPage === lastPage || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>

                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5">5 / page</option>
                      <option value="10">10 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Role Assignment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center text-gray-800">
                  <HiOutlineShieldCheck className="mr-2 text-purple-600" />
                  Role Assignment
                </h2>
                {selectedEmployee ? (
                  <p className="text-sm text-gray-600 mt-1">
                    Assign roles to {selectedEmployee.name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Select an employee to assign roles
                  </p>
                )}
              </div>

              <div className="p-6">
                {selectedEmployee ? (
                  <>
                    {/* Selected Employee Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        {selectedEmployee.profile_picture ? (
                          <img
                            className="h-12 w-12 rounded-full mr-3 object-cover"
                            src={selectedEmployee.profile_picture}
                            alt={selectedEmployee.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mr-3">
                            <span className="text-white font-medium text-lg">
                              {selectedEmployee.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedEmployee.name}</h3>
                          <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                          <p className="text-xs text-gray-500">
                            User ID: {selectedEmployee.user_id} • {selectedEmployee.department_name || 'No Dept'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Current Roles:</div>
                        <div className="flex flex-wrap gap-2">
                          {userRoles.length > 0 ? (
                            userRoles.map((role, index) => (
                              <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(role)}`}>
                                {getRoleDisplayName(role)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No roles assigned yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Role to Assign
                      </label>
                      {/* <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={assigning}
                      >
                        <option value="">Choose a role...</option>
                        {availableRoles.map((role) => {
                          const roleOption = roleOptions.find(r => r.value === role);
                          return (
                            <option key={role} value={role}>
                              {roleOption ? roleOption.label : role}
                            </option>
                          );
                        })}
                      </select> */}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {availableRoles.map((role) => {
                          const roleName = role.name || role;
                          const roleValue = role.value || role;
                          return (
                            <button
                              key={role.id || roleValue}
                              type="button"
                              onClick={() => setSelectedRole(roleValue)}
                              className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${selectedRole === roleValue
                                ? 'ring-2 ring-blue-500 shadow-md'
                                : 'hover:bg-gray-50'
                                } ${getRoleColorClass(roleName)}`}
                            >
                              {roleName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assign Button */}
                    {canEdit && (
                      <button
                        onClick={handleAssignRole}
                        disabled={!selectedRole || assigning}
                        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        {assigning ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <HiOutlineCheck className="mr-2" />
                            Assign Selected Role
                          </>
                        )}
                      </button>
                    )}

                    {/* Note */}
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Each user can have only one role per organization.
                        Assigning a new role will replace any existing role.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <HiOutlineUsers className="mx-auto text-gray-300" size={64} />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No employee selected
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Select an employee from the list to assign roles
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Role Distribution</h3>
              <div className="space-y-3">
                {roleOptions.map((role) => {
                  const count = employees.filter(emp => {
                    if (!emp.roles) return false;
                    return emp.roles.some(empRole => {
                      const lowerEmpRole = empRole.toLowerCase();
                      return lowerEmpRole === role.value.toLowerCase() ||
                        lowerEmpRole === role.label.toLowerCase() ||
                        role.keywords.some(kw => lowerEmpRole.includes(kw));
                    });
                  }).length;
                  return (
                    <div key={role.value} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{role.label}</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${role.color}`}>
                        {count} users
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignRolePage;
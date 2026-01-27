// pages/setting /AssignRolePage.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineShieldCheck, HiOutlineCheck, HiOutlineX, HiOutlineSearch, HiOutlineRefresh } from 'react-icons/hi';
import assignRoleService from '../../services/assignRoleService';
import { employeeService } from '../../services/employeeService';
import { useOrganizations } from '../../contexts/OrganizationContext';

const AssignRolePage = () => {
  const { selectedOrganization: currentOrganization } = useOrganizations();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  const roleOptions = [
    { value: 'superadmin', label: 'Super Admin', color: 'bg-red-100 text-red-800' },
    { value: 'organization_admin', label: 'Organization Admin', color: 'bg-purple-100 text-purple-800' },
    { value: 'hr_manager', label: 'HR Manager', color: 'bg-blue-100 text-blue-800' },
    { value: 'recruiter', label: 'Recruiter', color: 'bg-green-100 text-green-800' },
    { value: 'payroll_manager', label: 'Payroll Manager', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'team_manager', label: 'Team Manager', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'employee', label: 'Employee', color: 'bg-gray-100 text-gray-800' },
  ];

  useEffect(() => {
    if (currentOrganization && currentOrganization.id) {
      fetchEmployees();
      fetchAvailableRoles();
    }
  }, [currentOrganization]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    if (!currentOrganization || !currentOrganization.id) {
      setMessage({ type: 'error', text: 'No organization selected' });
      return;
    }
    
    try {
      setLoading(true);
      const response = await employeeService.getAllEmployees({ 
        organization_id: currentOrganization.id 
      });
      
      // Extract employees from the response structure
      let employeesData = [];
      if (response.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      }
      
      // Map the employee name from first_name and last_name
      const employeesWithNames = employeesData.map(emp => ({
        ...emp,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        email: emp.personal_email || emp.user?.email || '',
        user_id: emp.user_id,  // Ensure user_id is available
        roles: emp.roles || []  // Add roles if they exist
      }));
      
      setEmployees(employeesWithNames);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage({ type: 'error', text: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const roles = await assignRoleService.getAvailableRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error fetching available roles:', error);
      // Use default roles if API fails
      setAvailableRoles(['superadmin', 'organization_admin', 'hr_manager', 'recruiter', 'payroll_manager', 'team_manager', 'employee']);
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

  const filterEmployees = () => {
    let filtered = [...employees];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        (emp.name && emp.name.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term)) ||
        (emp.employee_code && emp.employee_code.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    
    setFilteredEmployees(filtered);
  };

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
      
      // Refresh employee list to show updated roles
      setTimeout(() => fetchEmployees(), 500);
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

  const handleRemoveRole = async (roleName) => {
    if (!selectedEmployee || !roleName || !currentOrganization) return;

    if (!window.confirm(`Are you sure you want to remove the ${roleName} role from ${selectedEmployee.name}?`)) {
      return;
    }

    try {
      setRemoving(true);
      await assignRoleService.removeRoleFromUser(
        currentOrganization.id,
        selectedEmployee.user_id,
        roleName
      );
      
      setMessage({ type: 'success', text: 'Role removed successfully' });
      
      // Refresh user roles
      fetchUserRoles(selectedEmployee.user_id);
      
      // Refresh employee list
      setTimeout(() => fetchEmployees(), 500);
    } catch (error) {
      console.error('Error removing role:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to remove role' 
      });
    } finally {
      setRemoving(false);
    }
  };

  const getRoleDisplayName = (roleValue) => {
    const role = roleOptions.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getRoleColorClass = (roleValue) => {
    const role = roleOptions.find(r => r.value === roleValue);
    return role ? role.color : 'bg-gray-100 text-gray-800';
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <HiOutlineUsers className="mr-3 text-brand-blue" size={28} />
              Assign Roles to Users
            </h1>
            <p className="text-gray-600 mt-2">
              Manage role assignments for employees in {currentOrganization?.name || 'your organization'}
            </p>
          </div>
          
          <button
            onClick={fetchEmployees}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <HiOutlineRefresh className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-2xl font-bold">{employees.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">With Roles Assigned</div>
            <div className="text-2xl font-bold">
              {employees.filter(emp => emp.roles && emp.roles.length > 0).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">Available Roles</div>
            <div className="text-2xl font-bold">{availableRoles.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-600">Organization</div>
            <div className="text-lg font-semibold truncate">{currentOrganization?.name || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="float-right"
          >
            <HiOutlineX />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employee List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center">
                  <HiOutlineUsers className="mr-2" />
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
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
                      Department
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
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No employees found. {searchTerm && 'Try a different search term.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr 
                        key={employee.id}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedEmployee?.id === employee.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {employee.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={employee.profile_picture}
                                  alt={employee.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
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
                            {employee.department?.name || 'N/A'}
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
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'active'
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
                            className={`px-3 py-1 rounded ${
                              selectedEmployee?.id === employee.id
                                ? 'bg-brand-blue text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {selectedEmployee?.id === employee.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredEmployees.length > 0 && (
              <div className="p-4 border-t text-sm text-gray-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Role Assignment */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border sticky top-6">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <HiOutlineShieldCheck className="mr-2" />
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
                          className="h-12 w-12 rounded-full mr-3"
                          src={selectedEmployee.profile_picture}
                          alt={selectedEmployee.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium text-lg">
                            {selectedEmployee.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedEmployee.name}</h3>
                        <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                        <p className="text-xs text-gray-500">
                          User ID: {selectedEmployee.user_id} • {selectedEmployee.department?.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Current Roles:</div>
                      <div className="flex flex-wrap gap-2">
                        {userRoles.length > 0 ? (
                          userRoles.map((role, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColorClass(role)}`}>
                                {getRoleDisplayName(role)}
                              </span>
                              <button
                                onClick={() => handleRemoveRole(role)}
                                disabled={removing}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                title="Remove role"
                              >
                                <HiOutlineX size={18} />
                              </button>
                            </div>
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
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
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
                    </select>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {availableRoles.map((role) => {
                        const roleOption = roleOptions.find(r => r.value === role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                              selectedRole === role
                                ? 'ring-2 ring-brand-blue'
                                : 'hover:bg-gray-50'
                            } ${getRoleColorClass(role)}`}
                          >
                            {roleOption ? roleOption.label : role}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assign Button */}
                  <button
                    onClick={handleAssignRole}
                    disabled={!selectedRole || assigning}
                    className="w-full py-3 px-4 bg-brand-blue text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {assigning ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <HiOutlineCheck className="mr-2" />
                        Assign Selected Role
                      </>
                    )}
                  </button>

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
          <div className="mt-6 bg-white rounded-lg shadow border p-4">
            <h3 className="font-medium text-gray-900 mb-3">Role Distribution</h3>
            <div className="space-y-3">
              {roleOptions.map((role) => {
                const count = employees.filter(emp => 
                  emp.roles && emp.roles.includes(role.value)
                ).length;
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
  );
};

export default AssignRolePage;
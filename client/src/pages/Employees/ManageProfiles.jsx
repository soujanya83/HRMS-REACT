import React, { useState, useEffect, useCallback } from "react";
import { getEmployees, updateEmployeeStatus, updateEmployeeManager } from "../../services/employeeService";
import { getDepartmentsByOrgId, getDesignationsByDeptId } from "../../services/organizationService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import { FaEdit, FaSave, FaTimes, FaBuilding, FaBriefcase, FaUser, FaSearch } from 'react-icons/fa';

const StatusBadge = ({ status, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);

    const statusOptions = [
        { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
        { value: 'On Probation', label: 'On Probation', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'On Leave', label: 'On Leave', color: 'bg-blue-100 text-blue-800' },
        { value: 'Inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
        { value: 'Terminated', label: 'Terminated', color: 'bg-red-100 text-red-800' }
    ];

    const handleSave = async () => {
        await onChange(currentStatus);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentStatus(status);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <select 
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                >
                    {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                    <FaSave size={12} />
                </button>
                <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                    <FaTimes size={12} />
                </button>
            </div>
        );
    }

    const statusConfig = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    
    return (
        <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
            </span>
            <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
            >
                <FaEdit size={12} />
            </button>
        </div>
    );
};

const ManagerSelect = ({ employeeId, currentManager, managers, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedManager, setSelectedManager] = useState(currentManager);

    const handleSave = async () => {
        await onChange(selectedManager);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelectedManager(currentManager);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <select 
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    className="text-sm border rounded px-2 py-1 w-full"
                >
                    <option value="">No Manager</option>
                    {managers.map(manager => (
                        <option key={manager.value} value={manager.value}>
                            {manager.label}
                        </option>
                    ))}
                </select>
                <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                    <FaSave size={12} />
                </button>
                <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                    <FaTimes size={12} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
                {currentManager ? managers.find(m => m.value === currentManager)?.label : 'No Manager'}
            </span>
            <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
            >
                <FaEdit size={12} />
            </button>
        </div>
    );
};

export default function ManageProfiles() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [managers, setManagers] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        designation: '',
        status: ''
    });

    const { selectedOrganization } = useOrganizations();

    const fetchData = useCallback(async () => {
        if (!selectedOrganization) {
            setLoading(false);
            setEmployees([]);
            return;
        }

        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                organization_id: selectedOrganization.id,
                department_id: filters.department,
                designation_id: filters.designation,
                status: filters.status
            };

            const [employeesRes, departmentsRes, managersRes] = await Promise.all([
                getEmployees(params),
                getDepartmentsByOrgId(selectedOrganization.id),
                getEmployees({ organization_id: selectedOrganization.id })
            ]);

            setEmployees(employeesRes.data.data);
            setDepartments(departmentsRes.data.data);
            setManagers(managersRes.data.data.map(emp => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name}`
            })));

            if (filters.department) {
                const designationsRes = await getDesignationsByDeptId(filters.department);
                setDesignations(designationsRes.data.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedOrganization, searchTerm, filters]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [fetchData]);

    const handleStatusChange = async (employeeId, newStatus) => {
        try {
            await updateEmployeeStatus(employeeId, newStatus);
            setEmployees(prev => prev.map(emp => 
                emp.id === employeeId ? { ...emp, status: newStatus } : emp
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update employee status");
        }
    };

    const handleManagerChange = async (employeeId, newManagerId) => {
        try {
            await updateEmployeeManager(employeeId, newManagerId);
            setEmployees(prev => prev.map(emp => 
                emp.id === employeeId ? { 
                    ...emp, 
                    reporting_manager: managers.find(m => m.value === newManagerId) 
                } : emp
            ));
        } catch (error) {
            console.error("Failed to update manager:", error);
            alert("Failed to update reporting manager");
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ department: '', designation: '', status: '' });
        setSearchTerm('');
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Employee Profiles</h1>
                <p className="text-gray-600">Quickly update employee status, managers, and other details in bulk</p>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="relative">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <select 
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>

                    <select 
                        value={filters.designation}
                        onChange={(e) => handleFilterChange('designation', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Designations</option>
                        {designations.map(desig => (
                            <option key={desig.id} value={desig.id}>{desig.title}</option>
                        ))}
                    </select>

                    <select 
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On Probation">On Probation</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Terminated">Terminated</option>
                    </select>

                    <button 
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <FaBuilding className="inline mr-1" /> Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <FaBriefcase className="inline mr-1" /> Designation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <FaUser className="inline mr-1" /> Reporting Manager
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading employees...</td></tr>
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {emp.first_name} {emp.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">{emp.employee_code}</div>
                                        <div className="text-xs text-gray-400">{emp.personal_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {emp.department?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {emp.designation?.title || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge 
                                            status={emp.status} 
                                            onChange={(newStatus) => handleStatusChange(emp.id, newStatus)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ManagerSelect 
                                            employeeId={emp.id}
                                            currentManager={emp.reporting_manager?.id}
                                            managers={managers}
                                            onChange={(newManagerId) => handleManagerChange(emp.id, newManagerId)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500">No employees found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
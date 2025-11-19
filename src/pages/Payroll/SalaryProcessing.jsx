import React, { useState, useEffect } from 'react';
import { 
    FaCog, 
    FaSearch, 
    FaFilter,
    FaDownload,
    FaUpload,
    FaPlay,
    FaPause,
    FaEye,
    FaEdit,
    FaMoneyBillWave,
    FaUserCheck,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaCalendarAlt,
    FaCalculator,
    FaFileExport,
    FaSync,
    FaHistory
} from 'react-icons/fa';

const SalaryProcessing = () => {
    const [payrollPeriod, setPayrollPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [processingStatus, setProcessingStatus] = useState('pending');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [filters, setFilters] = useState({
        department: 'all',
        status: 'all',
        search: ''
    });
    const [showRunPayroll, setShowRunPayroll] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        error: 0,
        totalAmount: 0
    });

    // Sample departments
    const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Operations'];

    const [processingProgress, setProcessingProgress] = useState(0);

    // API Base URL
    const API_BASE = 'http://localhost:8000/api';

    // Fetch employees data from API
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE}/salary-processing?month=${payrollPeriod.month}&year=${payrollPeriod.year}&status=${filters.status}&department=${filters.department}&search=${filters.search}`
            );
            const data = await response.json();
            setEmployees(data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            // Fallback to sample data if API fails
            setEmployees(getSampleEmployees());
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/salary-processing/stats?month=${payrollPeriod.month}&year=${payrollPeriod.year}`
            );
            const data = await response.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Process payroll
    const processPayroll = async () => {
        try {
            setProcessingStatus('running');
            const response = await fetch(`${API_BASE}/salary-processing/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_ids: selectedEmployees,
                    month: payrollPeriod.month,
                    year: payrollPeriod.year
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                setProcessingStatus('completed');
                // Refresh data
                fetchEmployees();
                fetchStats();
            } else {
                setProcessingStatus('error');
                console.error('Payroll processing failed:', result.error);
            }
        } catch (error) {
            setProcessingStatus('error');
            console.error('Error processing payroll:', error);
        }
    };

    // Export payroll data
    const exportPayroll = async () => {
        try {
            const response = await fetch(`${API_BASE}/salary-processing/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    month: payrollPeriod.month,
                    year: payrollPeriod.year
                })
            });
            
            const data = await response.json();
            // In a real app, you would download the file
            alert(`Export completed. Total records: ${data.total_records}`);
        } catch (error) {
            console.error('Error exporting payroll:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchStats();
    }, [payrollPeriod, filters]);

    const handleEmployeeSelection = (employeeId) => {
        setSelectedEmployees(prev => 
            prev.includes(employeeId) 
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        }
    };

    const runPayroll = () => {
        setProcessingStatus('running');
        setProcessingProgress(0);
        
        // Simulate processing progress
        const totalSteps = selectedEmployees.length;
        let currentStep = 0;
        
        const processInterval = setInterval(() => {
            currentStep++;
            const progress = (currentStep / totalSteps) * 100;
            setProcessingProgress(progress);
            
            if (currentStep === totalSteps) {
                clearInterval(processInterval);
                // Call actual API
                processPayroll();
            }
        }, 200);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            error: 'bg-red-100 text-red-800',
            running: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaClock,
            completed: FaCheckCircle,
            error: FaExclamationTriangle,
            running: FaSync
        };
        return icons[status] || FaClock;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesDepartment = filters.department === 'all' || employee.department === filters.department;
        const matchesStatus = filters.status === 'all' || employee.status === filters.status;
        const matchesSearch = filters.search === '' || 
                            employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            employee.employee_id.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesDepartment && matchesStatus && matchesSearch;
    });

    // Sample data fallback
    const getSampleEmployees = () => [
        {
            id: 1,
            name: 'John Smith',
            employee_id: 'EMP001',
            department: 'Engineering',
            position: 'Senior Software Engineer',
            basic_salary: 60000,
            total_earnings: 75000,
            total_deductions: 12000,
            net_salary: 63000,
            status: 'pending',
            processed_date: null,
            adjustments: 0,
            overtime_amount: 5000,
            bonus_amount: 10000,
            components_breakdown: {
                pf: 7200,
                esi: 1800,
                tax: 3000
            }
        },
        // ... other sample employees
    ];

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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaCalculator className="mr-3 text-blue-600" />
                        Salary Processing
                    </h1>
                    <p className="text-gray-600">Process payroll for employees and manage salary calculations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaUserCheck className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Processing</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                            </div>
                            <FaClock className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
                            </div>
                            <FaCheckCircle className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">With Errors</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.error}</p>
                            </div>
                            <FaExclamationTriangle className="text-red-500 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Payroll Period Selection */}
                <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payroll Period
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={payrollPeriod.month}
                                        onChange={(e) => setPayrollPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                                        className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={payrollPeriod.year}
                                        onChange={(e) => setPayrollPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                        className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return <option key={year} value={year}>{year}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Processing for: {new Date(payrollPeriod.year, payrollPeriod.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRunPayroll(true)}
                                disabled={selectedEmployees.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <FaPlay /> Run Payroll
                            </button>
                            <button 
                                onClick={exportPayroll}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaDownload /> Export
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <FaHistory /> History
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search employees..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select 
                            value={filters.department}
                            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="error">With Errors</option>
                        </select>

                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                            <FaFilter /> More Filters
                        </button>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Earnings</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deductions</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => {
                                    const StatusIcon = getStatusIcon(employee.status);
                                    return (
                                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(employee.id)}
                                                    onChange={() => handleEmployeeSelection(employee.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <FaUserCheck className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {employee.employee_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{employee.department}</div>
                                                <div className="text-sm text-gray-500">{employee.position}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatCurrency(employee.basic_salary)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(employee.total_earnings)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    +{formatCurrency((employee.overtime_amount || 0) + (employee.bonus_amount || 0) + (employee.adjustments || 0))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-red-600">
                                                    {formatCurrency(employee.total_deductions)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    PF: {formatCurrency(employee.components_breakdown?.pf || 0)} | ESI: {formatCurrency(employee.components_breakdown?.esi || 0)} | Tax: {formatCurrency(employee.components_breakdown?.tax || 0)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-blue-600">
                                                    {formatCurrency(employee.net_salary)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                                                    <StatusIcon className="mr-1" size={12} />
                                                    {employee.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="p-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                                                        title="Recalculate"
                                                    >
                                                        <FaSync />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredEmployees.length === 0 && (
                            <div className="text-center py-12">
                                <FaUserCheck className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No employees found</h3>
                                <p className="text-gray-500">Adjust your filters to see more results.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredEmployees.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredEmployees.length} employees • 
                                Selected: {selectedEmployees.length} • 
                                Total Payroll: {formatCurrency(
                                    filteredEmployees
                                        .filter(emp => selectedEmployees.includes(emp.id))
                                        .reduce((sum, emp) => sum + (emp.net_salary || 0), 0)
                                )}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                Processing ready for {selectedEmployees.length} employees
                            </div>
                        </div>
                    </div>
                )}

                {/* Run Payroll Modal */}
                {showRunPayroll && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
                            <h2 className="text-lg font-bold mb-3">Run Payroll Processing</h2>
                            
                            {processingStatus === 'pending' && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <FaExclamationTriangle className="text-yellow-500 mr-2" />
                                            <span className="text-sm text-yellow-700">
                                                You are about to process payroll for {selectedEmployees.length} employees
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600">
                                        <p><strong>Payroll Period:</strong> {new Date(payrollPeriod.year, payrollPeriod.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                        <p><strong>Total Amount:</strong> {formatCurrency(
                                            employees
                                                .filter(emp => selectedEmployees.includes(emp.id))
                                                .reduce((sum, emp) => sum + (emp.net_salary || 0), 0)
                                        )}</p>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowRunPayroll(false)}
                                            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={runPayroll}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <FaPlay /> Start Processing
                                        </button>
                                    </div>
                                </div>
                            )}

                            {processingStatus === 'running' && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <FaSync className="mx-auto text-3xl text-blue-500 animate-spin mb-2" />
                                        <h3 className="font-semibold text-gray-800">Processing Payroll</h3>
                                        <p className="text-sm text-gray-600">Please wait while we process salaries...</p>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${processingProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-center text-sm text-gray-600">
                                        {Math.round(processingProgress)}% Complete
                                    </div>
                                </div>
                            )}

                            {processingStatus === 'completed' && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <FaCheckCircle className="mx-auto text-3xl text-green-500 mb-2" />
                                        <h3 className="font-semibold text-gray-800">Processing Complete!</h3>
                                        <p className="text-sm text-gray-600">
                                            Payroll has been successfully processed for {selectedEmployees.length} employees.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="text-sm text-green-700">
                                            <p><strong>Total Processed:</strong> {formatCurrency(
                                                employees
                                                    .filter(emp => selectedEmployees.includes(emp.id))
                                                    .reduce((sum, emp) => sum + (emp.net_salary || 0), 0)
                                            )}</p>
                                            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setShowRunPayroll(false);
                                                setProcessingStatus('pending');
                                            }}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryProcessing;
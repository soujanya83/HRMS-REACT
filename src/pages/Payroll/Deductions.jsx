import React, { useState, useEffect } from 'react';
import { 
    FaMoneyBillWave, 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaCopy,
    FaSave,
    FaTimes,
    FaCalculator,
    FaUserTie,
    FaFileInvoiceDollar,
    FaSpinner,
    FaPercentage,
    FaCalendarAlt,
    FaChartBar
} from 'react-icons/fa';

const Deductions = () => {
    const [deductions, setDeductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeductionForm, setShowDeductionForm] = useState(false);
    const [editingDeduction, setEditingDeduction] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: ''
    });

    // Sample data
    const deductionTypes = ['Tax', 'Provident Fund', 'ESI', 'Professional Tax', 'Loan', 'Insurance', 'Other'];
    const statusTypes = ['active', 'inactive'];
    
    const [newDeduction, setNewDeduction] = useState({
        name: '',
        type: '',
        calculation_type: 'fixed',
        value: 0,
        percentage: 0,
        min_amount: 0,
        max_amount: 0,
        applicable_from: new Date().toISOString().split('T')[0],
        applicable_to: '',
        status: 'active',
        description: '',
        applies_to_all: true,
        specific_employees: []
    });

    // Sample deductions data
    const sampleDeductions = [
        {
            id: 1,
            name: 'Provident Fund',
            type: 'Provident Fund',
            calculation_type: 'percentage',
            value: 0,
            percentage: 12,
            min_amount: 0,
            max_amount: 1800,
            applicable_from: '2024-01-01',
            applicable_to: '',
            status: 'active',
            description: 'Employee Provident Fund contribution',
            applies_to_all: true,
            employee_count: 45,
            total_amount: 54000
        },
        {
            id: 2,
            name: 'Professional Tax',
            type: 'Professional Tax',
            calculation_type: 'fixed',
            value: 200,
            percentage: 0,
            min_amount: 0,
            max_amount: 2500,
            applicable_from: '2024-01-01',
            applicable_to: '',
            status: 'active',
            description: 'Monthly professional tax deduction',
            applies_to_all: true,
            employee_count: 45,
            total_amount: 9000
        },
        {
            id: 3,
            name: 'Income Tax',
            type: 'Tax',
            calculation_type: 'slab',
            value: 0,
            percentage: 0,
            min_amount: 0,
            max_amount: 0,
            applicable_from: '2024-04-01',
            applicable_to: '2025-03-31',
            status: 'active',
            description: 'Income tax as per tax slabs',
            applies_to_all: true,
            employee_count: 45,
            total_amount: 125000
        },
        {
            id: 4,
            name: 'ESI Contribution',
            type: 'ESI',
            calculation_type: 'percentage',
            value: 0,
            percentage: 0.75,
            min_amount: 0,
            max_amount: 21000,
            applicable_from: '2024-01-01',
            applicable_to: '',
            status: 'active',
            description: 'Employee State Insurance contribution',
            applies_to_all: false,
            employee_count: 30,
            total_amount: 15750
        },
        {
            id: 5,
            name: 'Loan EMI - John Smith',
            type: 'Loan',
            calculation_type: 'fixed',
            value: 5000,
            percentage: 0,
            min_amount: 0,
            max_amount: 0,
            applicable_from: '2024-01-01',
            applicable_to: '2024-12-31',
            status: 'active',
            description: 'Personal loan EMI deduction',
            applies_to_all: false,
            employee_count: 1,
            total_amount: 5000
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setDeductions(sampleDeductions);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDeduction(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitDeduction = (e) => {
        e.preventDefault();
        
        const deduction = {
            id: editingDeduction ? editingDeduction.id : deductions.length + 1,
            ...newDeduction,
            employee_count: 0,
            total_amount: 0,
            created_at: new Date().toISOString()
        };

        if (editingDeduction) {
            setDeductions(prev => prev.map(d => d.id === editingDeduction.id ? deduction : d));
        } else {
            setDeductions(prev => [deduction, ...prev]);
        }

        setNewDeduction({
            name: '',
            type: '',
            calculation_type: 'fixed',
            value: 0,
            percentage: 0,
            min_amount: 0,
            max_amount: 0,
            applicable_from: new Date().toISOString().split('T')[0],
            applicable_to: '',
            status: 'active',
            description: '',
            applies_to_all: true,
            specific_employees: []
        });
        setShowDeductionForm(false);
        setEditingDeduction(null);
    };

    const handleEdit = (deduction) => {
        setEditingDeduction(deduction);
        setNewDeduction(deduction);
        setShowDeductionForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this deduction?')) {
            setDeductions(prev => prev.filter(deduction => deduction.id !== id));
        }
    };

    const handleDuplicate = (deduction) => {
        const duplicated = {
            ...deduction,
            id: deductions.length + 1,
            name: `${deduction.name} (Copy)`,
            employee_count: 0,
            total_amount: 0
        };
        setDeductions(prev => [duplicated, ...prev]);
    };

    const filteredDeductions = deductions.filter(deduction => {
        const matchesType = filters.type === 'all' || deduction.type === filters.type;
        const matchesStatus = filters.status === 'all' || deduction.status === filters.status;
        const matchesSearch = filters.search === '' || 
                            deduction.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            deduction.description.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
    });

    const stats = {
        total: deductions.length,
        active: deductions.filter(d => d.status === 'active').length,
        employees: deductions.reduce((sum, d) => sum + d.employee_count, 0),
        total_amount: deductions.reduce((sum, d) => sum + d.total_amount, 0)
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading deductions data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Deductions Management</h1>
                    <p className="text-gray-600">Manage and configure employee salary deductions</p>
                </div>

                {/* Stats Cards - Updated to match other pages */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                            </div>
                            <FaFileInvoiceDollar className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Deductions</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
                            </div>
                            <FaCalculator className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Employees Covered</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.employees}</p>
                            </div>
                            <FaUserTie className="text-purple-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.total_amount)}</p>
                            </div>
                            <FaChartBar className="text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mb-6 flex justify-end">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                            <FaDownload /> Export
                        </button>
                        <button
                            onClick={() => setShowDeductionForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <FaPlus /> New Deduction
                        </button>
                    </div>
                </div>

                {/* Filters Section - Updated to match other pages */}
                <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search bar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search deductions..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Type filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select 
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                            >
                                <option value="all">All Types</option>
                                {deductionTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select 
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                            >
                                <option value="all">All Status</option>
                                {statusTypes.map(status => (
                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Deductions Table with narrower column widths */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* Narrower column widths - all set to smaller percentages */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%] min-w-[140px]">
                                        Deduction Details
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                                        Type & Calculation
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                                        Amount/Rate
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%] min-w-[100px]">
                                        Employees
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                                        Applicability
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%] min-w-[90px]">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%] min-w-[140px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDeductions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <FaFileInvoiceDollar className="text-4xl text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900 mb-1">No deductions found</p>
                                                <p className="text-gray-500">Create your first deduction to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDeductions.map((deduction) => (
                                        <tr key={deduction.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Deduction Details - Narrowed */}
                                            <td className="px-4 py-3 w-[18%] min-w-[140px]">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                                                        <FaFileInvoiceDollar className="text-red-600 text-sm" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-gray-900 truncate max-w-[130px]">
                                                            {deduction.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[130px]">
                                                            {deduction.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Type & Calculation - Narrowed */}
                                            <td className="px-4 py-3 w-[14%] min-w-[120px]">
                                                <div className="text-sm font-medium text-gray-900 truncate">{deduction.type}</div>
                                                <div className="text-xs text-gray-500 capitalize truncate">
                                                    {deduction.calculation_type}
                                                </div>
                                            </td>
                                            
                                            {/* Amount/Rate - Narrowed */}
                                            <td className="px-4 py-3 w-[14%] min-w-[120px]">
                                                {deduction.calculation_type === 'percentage' ? (
                                                    <div className="text-sm font-semibold text-blue-600">
                                                        {deduction.percentage}%
                                                    </div>
                                                ) : deduction.calculation_type === 'fixed' ? (
                                                    <div className="text-sm font-semibold text-green-600 truncate">
                                                        {formatCurrency(deduction.value)}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm font-semibold text-purple-600">
                                                        Tax Slabs
                                                    </div>
                                                )}
                                                {(deduction.min_amount > 0 || deduction.max_amount > 0) && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        Min: {formatCurrency(deduction.min_amount)}<br />
                                                        Max: {formatCurrency(deduction.max_amount)}
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Employees - Narrowed */}
                                            <td className="px-4 py-3 w-[12%] min-w-[100px]">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {deduction.employee_count}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {deduction.applies_to_all ? 'All' : 'Specific'}
                                                </div>
                                            </td>
                                            
                                            {/* Applicability - Narrowed */}
                                            <td className="px-4 py-3 w-[14%] min-w-[120px] text-sm text-gray-900">
                                                <div className="truncate">From: {new Date(deduction.applicable_from).toLocaleDateString('en-GB')}</div>
                                                {deduction.applicable_to && (
                                                    <div className="truncate">To: {new Date(deduction.applicable_to).toLocaleDateString('en-GB')}</div>
                                                )}
                                            </td>
                                            
                                            {/* Status - Narrowed */}
                                            <td className="px-4 py-3 w-[10%] min-w-[90px]">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    deduction.status === 'active' 
                                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                    {deduction.status.charAt(0).toUpperCase() + deduction.status.slice(1)}
                                                </span>
                                            </td>
                                            
                                            {/* Actions - Narrowed */}
                                            <td className="px-4 py-3 w-[18%] min-w-[140px] text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(deduction)}
                                                        className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="text-xs" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(deduction)}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                                        title="Duplicate"
                                                    >
                                                        <FaCopy className="text-xs" /> Copy
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(deduction.id)}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                                                        title="Delete"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredDeductions.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredDeductions.length} of {deductions.length} deductions
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                Total monthly deduction:{" "}
                                <span className="text-blue-600">
                                    {formatCurrency(filteredDeductions.reduce((sum, d) => sum + d.total_amount, 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deduction Form Modal - Updated styling */}
                {showDeductionForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingDeduction ? 'Edit Deduction' : 'Create New Deduction'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDeductionForm(false);
                                        setEditingDeduction(null);
                                        setNewDeduction({
                                            name: '',
                                            type: '',
                                            calculation_type: 'fixed',
                                            value: 0,
                                            percentage: 0,
                                            min_amount: 0,
                                            max_amount: 0,
                                            applicable_from: new Date().toISOString().split('T')[0],
                                            applicable_to: '',
                                            status: 'active',
                                            description: '',
                                            applies_to_all: true,
                                            specific_employees: []
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmitDeduction} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deduction Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newDeduction.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                            placeholder="e.g., Provident Fund, Professional Tax"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={newDeduction.type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                                        >
                                            <option value="">Select Type</option>
                                            {deductionTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Calculation Type *
                                        </label>
                                        <select
                                            name="calculation_type"
                                            value={newDeduction.calculation_type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                                        >
                                            <option value="fixed">Fixed Amount</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="slab">Tax Slab</option>
                                        </select>
                                    </div>

                                    {newDeduction.calculation_type === 'fixed' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fixed Amount (₹) *
                                            </label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={newDeduction.value}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                                placeholder="Enter fixed amount"
                                            />
                                        </div>
                                    )}

                                    {newDeduction.calculation_type === 'percentage' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Percentage (%) *
                                            </label>
                                            <input
                                                type="number"
                                                name="percentage"
                                                value={newDeduction.percentage}
                                                onChange={handleInputChange}
                                                required
                                                step="0.01"
                                                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                                placeholder="Enter percentage"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Amount
                                        </label>
                                        <input
                                            type="number"
                                            name="min_amount"
                                            value={newDeduction.min_amount}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                            placeholder="Minimum amount"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Maximum Amount
                                        </label>
                                        <input
                                            type="number"
                                            name="max_amount"
                                            value={newDeduction.max_amount}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                            placeholder="Maximum amount"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Applicable From *
                                        </label>
                                        <input
                                            type="date"
                                            name="applicable_from"
                                            value={newDeduction.applicable_from}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Applicable To
                                        </label>
                                        <input
                                            type="date"
                                            name="applicable_to"
                                            value={newDeduction.applicable_to}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newDeduction.status}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                                        >
                                            {statusTypes.map(status => (
                                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newDeduction.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                            placeholder="Describe this deduction..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeductionForm(false);
                                            setEditingDeduction(null);
                                            setNewDeduction({
                                                name: '',
                                                type: '',
                                                calculation_type: 'fixed',
                                                value: 0,
                                                percentage: 0,
                                                min_amount: 0,
                                                max_amount: 0,
                                                applicable_from: new Date().toISOString().split('T')[0],
                                                applicable_to: '',
                                                status: 'active',
                                                description: '',
                                                applies_to_all: true,
                                                specific_employees: []
                                            });
                                        }}
                                        className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <FaSave /> {editingDeduction ? 'Update Deduction' : 'Create Deduction'}
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

export default Deductions;
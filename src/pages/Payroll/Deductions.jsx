import React, { useState, useEffect } from 'react';
import { 
    FaMoneyBillWave, 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaUpload,
    FaCopy,
    FaSave,
    FaTimes,
    FaCalculator,
    FaUserTie,
    FaBuilding,
    FaChartBar,
    FaPercentage,
    FaCalendarAlt,
    FaFileInvoiceDollar
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
                        <FaMoneyBillWave className="mr-3 text-blue-600" />
                        Deductions Management
                    </h1>
                    <p className="text-gray-600">Manage and configure employee salary deductions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Deductions</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaFileInvoiceDollar className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Deductions</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
                            </div>
                            <FaCalculator className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Employees Covered</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.employees}</p>
                            </div>
                            <FaUserTie className="text-purple-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.total_amount)}</p>
                            </div>
                            <FaChartBar className="text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search deductions..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {deductionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            {statusTypes.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeductionForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <FaPlus /> New Deduction
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Deductions Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deduction Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type & Calculation</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount/Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employees</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applicability</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDeductions.map((deduction) => (
                                    <tr key={deduction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <FaFileInvoiceDollar className="text-red-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {deduction.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {deduction.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{deduction.type}</div>
                                            <div className="text-sm text-gray-500 capitalize">
                                                {deduction.calculation_type}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {deduction.calculation_type === 'percentage' ? (
                                                <div className="text-sm font-semibold text-blue-600">
                                                    {deduction.percentage}%
                                                </div>
                                            ) : deduction.calculation_type === 'fixed' ? (
                                                <div className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(deduction.value)}
                                                </div>
                                            ) : (
                                                <div className="text-sm font-semibold text-purple-600">
                                                    Tax Slabs
                                                </div>
                                            )}
                                            {(deduction.min_amount > 0 || deduction.max_amount > 0) && (
                                                <div className="text-xs text-gray-500">
                                                    Min: {formatCurrency(deduction.min_amount)} | Max: {formatCurrency(deduction.max_amount)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {deduction.employee_count}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {deduction.applies_to_all ? 'All Employees' : 'Specific Employees'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            <div>From: {new Date(deduction.applicable_from).toLocaleDateString()}</div>
                                            {deduction.applicable_to && (
                                                <div>To: {new Date(deduction.applicable_to).toLocaleDateString()}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                deduction.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {deduction.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(deduction)}
                                                    className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(deduction)}
                                                    className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deduction.id)}
                                                    className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredDeductions.length === 0 && (
                            <div className="text-center py-12">
                                <FaFileInvoiceDollar className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No deductions found</h3>
                                <p className="text-gray-500">Create your first deduction to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredDeductions.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredDeductions.length} of {deductions.length} deductions
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                Total monthly deduction: {formatCurrency(filteredDeductions.reduce((sum, d) => sum + d.total_amount, 0))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Deduction Form Modal */}
                {showDeductionForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-3">
                                {editingDeduction ? 'Edit Deduction' : 'Create New Deduction'}
                            </h2>
                            <form onSubmit={handleSubmitDeduction}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {statusTypes.map(status => (
                                                <option key={status} value={status}>{status}</option>
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
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Describe this deduction..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
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
                                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
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
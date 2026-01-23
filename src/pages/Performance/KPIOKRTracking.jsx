// KPIOKRTracking.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaChartLine, 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaUpload,
    FaCopy,
    FaSave,
    FaTimes,
    FaUserTie,
    FaBuilding,
    FaBullseye,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaChartBar,
    FaArrowUp,
    FaArrowDown,
    FaMinus,
    FaSpinner,
    FaSync,
    FaEye,
    FaInfoCircle
} from 'react-icons/fa';

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

const formatNumber = (value, type = 'number') => {
    if (value === null || value === undefined || value === '') return '0';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Invalid';
    
    if (type === 'percentage') {
        return `${numValue.toFixed(1)}%`;
    }
    
    if (type === 'currency') {
        if (numValue >= 10000000) {
            return `₹${(numValue / 10000000).toFixed(1)} Cr`;
        }
        if (numValue >= 100000) {
            return `₹${(numValue / 100000).toFixed(1)} L`;
        }
        if (numValue >= 1000) {
            return `₹${(numValue / 1000).toFixed(1)}K`;
        }
        return `₹${numValue.toFixed(0)}`;
    }
    
    if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M`;
    }
    if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(1)}K`;
    }
    
    return numValue.toFixed(1);
};

const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
};

const getPerformanceStatus = (current, target, thresholdMin) => {
    if (current >= target) return 'exceeding';
    if (current >= thresholdMin && current < target) return 'on_track';
    if (current < thresholdMin) return 'at_risk';
    return 'needs_attention';
};

const getPerformanceColor = (performance) => {
    const colors = {
        exceeding: 'bg-green-100 text-green-800',
        on_track: 'bg-blue-100 text-blue-800',
        needs_attention: 'bg-yellow-100 text-yellow-800',
        at_risk: 'bg-red-100 text-red-800'
    };
    return colors[performance] || 'bg-gray-100 text-gray-800';
};

const getTrendIcon = (trend) => {
    const icons = {
        improving: FaArrowUp,
        declining: FaArrowDown,
        stable: FaMinus
    };
    return icons[trend] || FaMinus;
};

const getTrendColor = (trend) => {
    const colors = {
        improving: 'text-green-600',
        declining: 'text-red-600',
        stable: 'text-yellow-600'
    };
    return colors[trend] || 'text-gray-600';
};

// Helper function to safely convert to array
const ensureArray = (data) => {
    if (!data) return [];
    
    // If it's an Axios response object
    if (data && data.data && data.status === 200) {
        return ensureArray(data.data);
    }
    
    // If it's an object with success and data properties
    if (data && data.success && data.data) {
        return ensureArray(data.data);
    }
    
    if (Array.isArray(data)) return data;
    if (data && data.data && Array.isArray(data.data)) return data.data;
    if (data && typeof data === 'object') {
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
            return values[0];
        }
        return [data];
    }
    return [];
};

// KPI Form Modal Component
const KPIFormModal = ({
    isOpen,
    onClose,
    kpi,
    departments,
    employees,
    onSubmit,
    loading
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'kpi',
        type: 'quantitative',
        department_id: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        frequency: 'monthly',
        trend: 'stable',
        owner_employee_id: '',
        data_source: '',
        threshold_min: 0,
        threshold_max: 0,
        status: 'active'
    });
    
    const [errors, setErrors] = useState({});
    
    // Safely handle departments and employees
    const safeDepartments = useMemo(() => {
        const deptArray = ensureArray(departments);
        return deptArray.filter(dept => dept && typeof dept === 'object');
    }, [departments]);
    
    const safeEmployees = useMemo(() => {
        const empArray = ensureArray(employees);
        
        // Remove duplicates based on id
        const uniqueEmployees = [];
        const seenIds = new Set();
        
        for (const emp of empArray) {
            if (emp && typeof emp === 'object') {
                if (emp.id && !seenIds.has(emp.id)) {
                    seenIds.add(emp.id);
                    uniqueEmployees.push(emp);
                } else if (!emp.id) {
                    uniqueEmployees.push(emp);
                }
            }
        }
        
        return uniqueEmployees;
    }, [employees]);

    const kpiCategories = ['kpi', 'okr', 'metric'];
    const kpiTypes = ['quantitative', 'qualitative', 'financial', 'operational', 'customer', 'employee'];
    const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
    const trends = ['improving', 'declining', 'stable'];

    useEffect(() => {
        if (kpi) {
            setFormData({
                name: kpi.name || '',
                description: kpi.description || '',
                category: kpi.category || 'kpi',
                type: kpi.type || 'quantitative',
                department_id: kpi.department_id?.toString() || kpi.department?.id?.toString() || '',
                target_value: kpi.target_value || 0,
                current_value: kpi.current_value || 0,
                unit: kpi.unit || '',
                frequency: kpi.frequency || 'monthly',
                trend: kpi.trend || 'stable',
                owner_employee_id: kpi.owner_employee_id?.toString() || kpi.owner?.id?.toString() || '',
                data_source: kpi.data_source || '',
                threshold_min: kpi.threshold_min || 0,
                threshold_max: kpi.threshold_max || 0,
                status: kpi.status || 'active'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                category: 'kpi',
                type: 'quantitative',
                department_id: '',
                target_value: 0,
                current_value: 0,
                unit: '',
                frequency: 'monthly',
                trend: 'stable',
                owner_employee_id: '',
                data_source: '',
                threshold_min: 0,
                threshold_max: 0,
                status: 'active'
            });
        }
        setErrors({});
    }, [kpi, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'KPI name is required';
        }
        if (!formData.target_value || formData.target_value <= 0) {
            newErrors.target_value = 'Target value must be greater than 0';
        }
        if (formData.threshold_max < formData.threshold_min) {
            newErrors.threshold_max = 'Maximum threshold must be greater than minimum threshold';
        }
        if (!formData.owner_employee_id) {
            newErrors.owner_employee_id = 'Owner is required';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            // Prepare payload
            const payload = {
                ...formData,
                organization_id: localStorage.getItem('organization_id') || 15,
                target_value: parseFloat(formData.target_value),
                current_value: parseFloat(formData.current_value || 0),
                threshold_min: parseFloat(formData.threshold_min || 0),
                threshold_max: parseFloat(formData.threshold_max || 0),
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                owner_employee_id: formData.owner_employee_id ? parseInt(formData.owner_employee_id) : null
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    general: error.response?.data?.message || 
                           error.message || 
                           'Failed to save KPI. Please try again.'
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {kpi ? 'Edit KPI/OKR' : 'Create New KPI/OKR'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Define and track key performance indicators
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle />
                            {errors.general}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            KPI/OKR Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter KPI/OKR name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={loading}
                            rows="2"
                            className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Describe the KPI/OKR..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {kpiCategories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {kpiTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleInputChange}
                                disabled={loading || safeDepartments.length === 0}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">
                                    {safeDepartments.length === 0 ? 'No departments available' : 'Select Department'}
                                </option>
                                {safeDepartments.map((dept, index) => (
                                    <option key={`dept-${dept.id || index}`} value={dept.id}>
                                        {dept.name || `Department ${dept.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Owner *
                            </label>
                            <select
                                name="owner_employee_id"
                                value={formData.owner_employee_id}
                                onChange={handleInputChange}
                                required
                                disabled={loading || safeEmployees.length === 0}
                                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.owner_employee_id ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">
                                    {safeEmployees.length === 0 ? 'No employees available' : 'Select Owner'}
                                </option>
                                {safeEmployees.map((emp, index) => {
                                    const employeeName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
                                                        emp.employee_code || 
                                                        emp.name || 
                                                        `Employee ${emp.id}`;
                                    return (
                                        <option key={`owner-${emp.id || index}`} value={emp.id}>
                                            {employeeName}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.owner_employee_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.owner_employee_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Value *
                            </label>
                            <input
                                type="number"
                                name="target_value"
                                value={formData.target_value}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                step="0.1"
                                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.target_value ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Target value"
                            />
                            {errors.target_value && (
                                <p className="mt-1 text-xs text-red-600">{errors.target_value}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Value
                            </label>
                            <input
                                type="number"
                                name="current_value"
                                value={formData.current_value}
                                onChange={handleInputChange}
                                disabled={loading}
                                step="0.1"
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Current value"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Threshold
                            </label>
                            <input
                                type="number"
                                name="threshold_min"
                                value={formData.threshold_min}
                                onChange={handleInputChange}
                                disabled={loading}
                                step="0.1"
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Minimum threshold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Threshold
                            </label>
                            <input
                                type="number"
                                name="threshold_max"
                                value={formData.threshold_max}
                                onChange={handleInputChange}
                                disabled={loading}
                                step="0.1"
                                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.threshold_max ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Maximum threshold"
                            />
                            {errors.threshold_max && (
                                <p className="mt-1 text-xs text-red-600">{errors.threshold_max}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., %, $, units"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                            </label>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {frequencies.map(freq => (
                                    <option key={freq} value={freq}>
                                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trend
                            </label>
                            <select
                                name="trend"
                                value={formData.trend}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {trends.map(trend => (
                                    <option key={trend} value={trend}>
                                        {trend.charAt(0).toUpperCase() + trend.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Source
                        </label>
                        <input
                            type="text"
                            name="data_source"
                            value={formData.data_source}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Data source system"
                        />
                    </div>

                    {/* Preview Section */}
                    {formData.target_value > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Performance Preview</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className="font-semibold">
                                        {calculateProgress(formData.current_value, formData.target_value).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${calculateProgress(formData.current_value, formData.target_value)}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Status: {getPerformanceStatus(
                                        formData.current_value,
                                        formData.target_value,
                                        formData.threshold_min,
                                        formData.threshold_max
                                    ).replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || safeEmployees.length === 0}
                            className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <FaSpinner className="animate-spin" />}
                            {kpi ? 'Update KPI/OKR' : 'Create KPI/OKR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// KPI Detail Modal Component
const KPIDetailModal = ({
    isOpen,
    onClose,
    kpi,
    onEdit,
    onDelete,
    onDuplicate,
    onUpdateValue,
    loading
}) => {
    if (!isOpen || !kpi) return null;

    const progress = calculateProgress(kpi.current_value, kpi.target_value);
    const performance = getPerformanceStatus(
        kpi.current_value,
        kpi.threshold_min,
        kpi.threshold_max
    );
    const TrendIcon = getTrendIcon(kpi.trend);

    const getDisplayValue = (value, type) => {
        if (kpi.unit?.toLowerCase() === '%',type) {
            return formatNumber(value, 'percentage');
        }
        if (kpi.unit?.includes('$') || kpi.unit?.includes('₹')) {
            return formatNumber(value, 'currency');
        }
        return formatNumber(value, 'number') + (kpi.unit ? ` ${kpi.unit}` : '');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{kpi.name}</h2>
                        <p className="text-sm text-gray-600">KPI/OKR Details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="font-medium">
                                        {kpi.category?.charAt(0).toUpperCase() + kpi.category?.slice(1) || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium">
                                        {kpi.type?.charAt(0).toUpperCase() + kpi.type?.slice(1) || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Frequency:</span>
                                    <span className="font-medium">
                                        {kpi.frequency?.charAt(0).toUpperCase() + kpi.frequency?.slice(1) || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${kpi.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {kpi.status?.charAt(0).toUpperCase() + kpi.status?.slice(1) || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {kpi.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Source</h3>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-gray-700">{kpi.data_source || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Performance Metrics */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Performance Metrics</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Current Value</div>
                                        <div className="text-lg font-bold text-gray-800">
                                            {getDisplayValue(kpi.current_value)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Target Value</div>
                                        <div className="text-lg font-bold text-blue-800">
                                            {getDisplayValue(kpi.target_value)}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Min Threshold</div>
                                        <div className="text-lg font-bold text-yellow-800">
                                            {getDisplayValue(kpi.threshold_min)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Max Threshold</div>
                                        <div className="text-lg font-bold text-green-800">
                                            {getDisplayValue(kpi.threshold_max)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className="font-semibold">{progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${getPerformanceColor(performance).split(' ')[0]}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getPerformanceColor(performance)}`}>
                                        {performance.replace('_', ' ')}
                                    </span>
                                    <div className={`flex items-center text-xs ${getTrendColor(kpi.trend)}`}>
                                        <TrendIcon className="mr-1" size={12} />
                                        {kpi.trend?.charAt(0).toUpperCase() + kpi.trend?.slice(1)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Update Current Value</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={kpi.current_value}
                                    onChange={(e) => onUpdateValue(kpi.id, parseFloat(e.target.value))}
                                    className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm"
                                    step="0.1"
                                    placeholder="Enter new value"
                                />
                                <span className="text-sm text-gray-600">{kpi.unit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
                    <div className="space-y-1 text-sm">
                        {kpi.created_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">{formatDate(kpi.created_at)}</span>
                            </div>
                        )}
                        {kpi.updated_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium">{formatDate(kpi.updated_at)}</span>
                            </div>
                        )}
                        {kpi.last_updated && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Value Update:</span>
                                <span className="font-medium">{formatDate(kpi.last_updated)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t flex justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(kpi)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <FaEdit /> Edit
                        </button>
                        <button
                            onClick={() => onDuplicate(kpi)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <FaCopy /> Duplicate
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this KPI/OKR?')) {
                                    onDelete(kpi.id);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <FaTrash /> Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const KPIOKRTracking = () => {
    const [kpis, setKpis] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const [filters, setFilters] = useState({
        category: 'all',
        type: 'all',
        department: 'all',
        search: ''
    });

    const [modalState, setModalState] = useState({
        showForm: false,
        showDetail: false,
        selectedKpi: null
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: You'll need to create these services
            // For now, using sample data
            const sampleKpis = [
                {
                    id: 1,
                    name: 'Monthly Revenue Growth',
                    description: 'Percentage growth in monthly revenue compared to previous month',
                    category: 'kpi',
                    type: 'financial',
                    department: { id: 1, name: 'Sales' },
                    target_value: 15,
                    current_value: 12.5,
                    unit: '%',
                    frequency: 'monthly',
                    trend: 'improving',
                    owner: { id: 1, first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
                    data_source: 'CRM System',
                    threshold_min: 10,
                    threshold_max: 20,
                    status: 'active',
                    created_at: '2024-01-15',
                    updated_at: '2024-02-25',
                    last_updated: '2024-02-25'
                },
                {
                    id: 2,
                    name: 'Customer Satisfaction Score',
                    description: 'Average customer satisfaction rating from surveys',
                    category: 'kpi',
                    type: 'customer',
                    department: { id: 2, name: 'Customer Service' },
                    target_value: 4.5,
                    current_value: 4.2,
                    unit: 'rating',
                    frequency: 'weekly',
                    trend: 'stable',
                    owner: { id: 2, first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
                    data_source: 'Survey System',
                    threshold_min: 4.0,
                    threshold_max: 5.0,
                    status: 'active',
                    created_at: '2024-01-20',
                    updated_at: '2024-02-24',
                    last_updated: '2024-02-24'
                }
            ];

            const sampleDepts = [
                { id: 1, name: 'Sales' },
                { id: 2, name: 'Customer Service' },
                { id: 3, name: 'Engineering' },
                { id: 4, name: 'Marketing' },
                { id: 5, name: 'HR' },
                { id: 6, name: 'Finance' }
            ];

            const sampleEmployees = [
                { id: 1, first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
                { id: 2, first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
                { id: 3, first_name: 'Mike', last_name: 'Johnson', employee_code: 'EMP003' },
                { id: 4, first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP004' }
            ];

            setKpis(sampleKpis);
            setDepartments(sampleDepts);
            setEmployees(sampleEmployees);

        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredKpis = kpis.filter(kpi => {
        const matchesCategory = filters.category === 'all' || kpi.category === filters.category;
        const matchesType = filters.type === 'all' || kpi.type === filters.type;
        const matchesDepartment = filters.department === 'all' || 
            (kpi.department && kpi.department.id === parseInt(filters.department));
        
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
            filters.search === '' ||
            (kpi.name || '').toLowerCase().includes(searchLower) ||
            (kpi.description || '').toLowerCase().includes(searchLower) ||
            (kpi.owner?.first_name || '').toLowerCase().includes(searchLower) ||
            (kpi.owner?.last_name || '').toLowerCase().includes(searchLower);

        return matchesCategory && matchesType && matchesDepartment && matchesSearch;
    });

    const stats = {
        total: kpis.length,
        kpis: kpis.filter(k => k.category === 'kpi').length,
        okrs: kpis.filter(k => k.category === 'okr').length,
        metrics: kpis.filter(k => k.category === 'metric').length,
        on_track: kpis.filter(k => getPerformanceStatus(
            k.current_value,
            k.target_value,
            k.threshold_min,
            k.threshold_max
        ) === 'on_track').length,
        at_risk: kpis.filter(k => getPerformanceStatus(
            k.current_value,
            k.target_value,
            k.threshold_min,
            k.threshold_max
        ) === 'at_risk').length,
        exceeding: kpis.filter(k => getPerformanceStatus(
            k.current_value,
            k.target_value,
            k.threshold_min,
            k.threshold_max
        ) === 'exceeding').length
    };

    const handleCreateKPI = async (formData) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newKpi = {
                id: kpis.length + 1,
                ...formData,
                department: departments.find(d => d.id === parseInt(formData.department_id)),
                owner: employees.find(e => e.id === parseInt(formData.owner_employee_id)),
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
                last_updated: new Date().toISOString().split('T')[0]
            };

            setKpis(prev => [newKpi, ...prev]);
            setSuccessMessage('KPI/OKR created successfully!');
            setModalState(prev => ({ ...prev, showForm: false }));
        } catch (err) {
            console.error('Error creating KPI:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to create KPI. Please try again.'
            );
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateKPI = async (id, formData) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setKpis(prev =>
                prev.map(kpi =>
                    kpi.id === id
                        ? {
                            ...kpi,
                            ...formData,
                            department: departments.find(d => d.id === parseInt(formData.department_id)) || kpi.department,
                            owner: employees.find(e => e.id === parseInt(formData.owner_employee_id)) || kpi.owner,
                            updated_at: new Date().toISOString().split('T')[0]
                        }
                        : kpi
                )
            );

            setSuccessMessage('KPI/OKR updated successfully!');
            setModalState(prev => ({
                ...prev,
                showForm: false,
                selectedKpi: null
            }));
        } catch (err) {
            console.error('Error updating KPI:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to update KPI. Please try again.'
            );
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteKPI = async (id) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setKpis(prev => prev.filter(kpi => kpi.id !== id));
            setSuccessMessage('KPI/OKR deleted successfully!');
            setModalState(prev => ({
                ...prev,
                showDetail: false,
                selectedKpi: null
            }));
        } catch (err) {
            console.error('Error deleting KPI:', err);
            setError(
                err.response?.data?.message ||
                'Failed to delete KPI. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicateKPI = async (kpi) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const duplicated = {
                ...kpi,
                id: kpis.length + 1,
                name: `${kpi.name} (Copy)`,
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0]
            };

            setKpis(prev => [duplicated, ...prev]);
            setSuccessMessage('KPI/OKR duplicated successfully!');
        } catch (err) {
            console.error('Error duplicating KPI:', err);
            setError('Failed to duplicate KPI. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateValue = async (id, newValue) => {
        setSaving(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setKpis(prev =>
                prev.map(kpi =>
                    kpi.id === id
                        ? {
                            ...kpi,
                            current_value: newValue,
                            last_updated: new Date().toISOString().split('T')[0],
                            updated_at: new Date().toISOString().split('T')[0]
                        }
                        : kpi
                )
            );
        } catch (err) {
            console.error('Error updating value:', err);
            setError('Failed to update value. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleViewDetails = (kpi) => {
        setModalState({
            ...modalState,
            showDetail: true,
            selectedKpi: kpi
        });
    };

    const handleEditKPI = (kpi) => {
        setModalState({
            ...modalState,
            showForm: true,
            selectedKpi: kpi
        });
    };

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading KPI/OKR data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-green-800 font-medium">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <FaChartLine className="text-purple-600" />
                            KPI / OKR Tracking
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Monitor and track Key Performance Indicators and Objectives & Key Results
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setModalState(prev => ({ ...prev, showForm: true }))}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <FaPlus /> New KPI/OKR
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Metrics</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <FaChartLine className="text-purple-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">KPIs</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.kpis}</p>
                        </div>
                        <FaBullseye className="text-blue-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">OKRs</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.okrs}</p>
                        </div>
                        <FaChartBar className="text-green-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">On Track</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.on_track}</p>
                        </div>
                        <FaCheckCircle className="text-blue-600 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Exceeding</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.exceeding}</p>
                        </div>
                        <FaArrowUp className="text-green-600 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">At Risk</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.at_risk}</p>
                        </div>
                        <FaExclamationTriangle className="text-red-500 text-xl" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search KPIs/OKRs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="kpi">KPI</option>
                        <option value="okr">OKR</option>
                        <option value="metric">Metric</option>
                    </select>

                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Types</option>
                        <option value="quantitative">Quantitative</option>
                        <option value="qualitative">Qualitative</option>
                        <option value="financial">Financial</option>
                        <option value="operational">Operational</option>
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                    </select>

                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI/OKR Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    KPI/OKR Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category & Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Values & Progress
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredKpis.map((kpi) => {
                                const progress = calculateProgress(kpi.current_value, kpi.target_value);
                                const performance = getPerformanceStatus(
                                    kpi.current_value,
                                    kpi.target_value,
                                    kpi.threshold_min,
                                    kpi.threshold_max
                                );
                                const TrendIcon = getTrendIcon(kpi.trend);

                                const getDisplayValue = (value) => {
                                    if (kpi.unit?.toLowerCase() === '%') {
                                        return formatNumber(value, 'percentage');
                                    }
                                    if (kpi.unit?.includes('$') || kpi.unit?.includes('₹')) {
                                        return formatNumber(value, 'currency');
                                    }
                                    return formatNumber(value, 'number') + (kpi.unit ? ` ${kpi.unit}` : '');
                                };

                                return (
                                    <tr key={kpi.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <FaChartLine className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {kpi.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1 max-w-[250px] truncate">
                                                        {kpi.description}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Owner: {kpi.owner?.first_name} {kpi.owner?.last_name}
                                                        {kpi.department && ` • ${kpi.department.name}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {kpi.category?.charAt(0).toUpperCase() + kpi.category?.slice(1)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {kpi.type?.charAt(0).toUpperCase() + kpi.type?.slice(1)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {kpi.frequency?.charAt(0).toUpperCase() + kpi.frequency?.slice(1)}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm">
                                                        <div className="text-gray-600">Current:</div>
                                                        <div className="font-semibold text-gray-900">
                                                            {getDisplayValue(kpi.current_value)}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-right">
                                                        <div className="text-gray-600">Target:</div>
                                                        <div className="font-semibold text-blue-600">
                                                            {getDisplayValue(kpi.target_value)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>0%</span>
                                                        <span>{progress.toFixed(0)}%</span>
                                                        <span>100%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center text-xs ${getTrendColor(kpi.trend)}`}>
                                                        <TrendIcon className="mr-1" size={10} />
                                                        {kpi.trend?.charAt(0).toUpperCase() + kpi.trend?.slice(1)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Last: {formatDate(kpi.last_updated)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getPerformanceColor(performance)}`}>
                                                    {performance.replace('_', ' ')}
                                                </span>
                                                <div>
                                                    <div className="text-xs text-gray-600">Min:</div>
                                                    <div className="text-xs font-semibold text-yellow-600">
                                                        {getDisplayValue(kpi.threshold_min)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-600">Max:</div>
                                                    <div className="text-xs font-semibold text-green-600">
                                                        {getDisplayValue(kpi.threshold_max)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(kpi)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleEditKPI(kpi)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicateKPI(kpi)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Duplicate"
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this KPI/OKR?')) {
                                                            handleDeleteKPI(kpi.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredKpis.length === 0 && (
                        <div className="text-center py-12">
                            <FaChartLine className="mx-auto text-4xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                {filters.search || filters.category !== 'all' || filters.type !== 'all' || filters.department !== 'all'
                                    ? 'No matching KPIs/OKRs found'
                                    : 'No KPIs/OKRs yet'}
                            </h3>
                            <p className="text-gray-500">
                                {filters.search || filters.category !== 'all' || filters.type !== 'all' || filters.department !== 'all'
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Create your first KPI/OKR to get started'}
                            </p>
                            {!(filters.search || filters.category !== 'all' || filters.type !== 'all' || filters.department !== 'all') && (
                                <button
                                    onClick={() => setModalState(prev => ({ ...prev, showForm: true }))}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Create First KPI/OKR
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {filteredKpis.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-sm text-gray-600 mb-2 md:mb-0">
                                Showing {filteredKpis.length} of {kpis.length} KPIs/OKRs
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                                {stats.kpis} KPIs • {stats.okrs} OKRs • {stats.on_track} on track • {stats.at_risk} at risk
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <KPIFormModal
                isOpen={modalState.showForm}
                onClose={() => setModalState(prev => ({
                    ...prev,
                    showForm: false,
                    selectedKpi: null
                }))}
                kpi={modalState.selectedKpi}
                departments={departments}
                employees={employees}
                onSubmit={(formData) => {
                    if (modalState.selectedKpi) {
                        return handleUpdateKPI(modalState.selectedKpi.id, formData);
                    } else {
                        return handleCreateKPI(formData);
                    }
                }}
                loading={saving}
            />

            <KPIDetailModal
                isOpen={modalState.showDetail}
                onClose={() => setModalState(prev => ({
                    ...prev,
                    showDetail: false,
                    selectedKpi: null
                }))}
                kpi={modalState.selectedKpi}
                onEdit={handleEditKPI}
                onDelete={handleDeleteKPI}
                onDuplicate={handleDuplicateKPI}
                onUpdateValue={handleUpdateValue}
                loading={saving}
            />
        </div>
    );
};

export default KPIOKRTracking;
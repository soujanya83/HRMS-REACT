import React, { useState, useEffect } from 'react';
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
    FaMinus
} from 'react-icons/fa';

const KPIOKRTracking = () => {
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showKpiForm, setShowKpiForm] = useState(false);
    const [editingKpi, setEditingKpi] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        category: 'all',
        department: 'all',
        search: ''
    });

    // Sample data
    const kpiTypes = ['Quantitative', 'Qualitative', 'Financial', 'Operational', 'Customer', 'Employee'];
    const categories = ['KPI', 'OKR', 'Metric'];
    const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Operations'];
    const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];
    const trends = ['improving', 'declining', 'stable'];

    const [newKpi, setNewKpi] = useState({
        name: '',
        description: '',
        category: 'KPI',
        type: 'Quantitative',
        department: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        frequency: 'Monthly',
        trend: 'stable',
        owner: '',
        data_source: '',
        threshold_min: 0,
        threshold_max: 0,
        status: 'active'
    });

    // Sample KPIs data
    const sampleKpis = [
        {
            id: 1,
            name: 'Monthly Revenue Growth',
            description: 'Percentage growth in monthly revenue compared to previous month',
            category: 'KPI',
            type: 'Financial',
            department: 'Sales',
            target_value: 15,
            current_value: 12.5,
            unit: '%',
            frequency: 'Monthly',
            trend: 'improving',
            owner: 'Sales Manager',
            data_source: 'CRM System',
            threshold_min: 10,
            threshold_max: 20,
            status: 'active',
            last_updated: '2024-02-25',
            performance: 'on_track'
        },
        {
            id: 2,
            name: 'Customer Satisfaction Score',
            description: 'Average customer satisfaction rating from surveys',
            category: 'KPI',
            type: 'Customer',
            department: 'Customer Service',
            target_value: 4.5,
            current_value: 4.2,
            unit: 'Rating',
            frequency: 'Weekly',
            trend: 'stable',
            owner: 'CS Manager',
            data_source: 'Survey System',
            threshold_min: 4.0,
            threshold_max: 5.0,
            status: 'active',
            last_updated: '2024-02-24',
            performance: 'needs_attention'
        },
        {
            id: 3,
            name: 'Employee Engagement Score',
            description: 'Overall employee engagement and satisfaction',
            category: 'OKR',
            type: 'Employee',
            department: 'HR',
            target_value: 85,
            current_value: 78,
            unit: '%',
            frequency: 'Quarterly',
            trend: 'improving',
            owner: 'HR Manager',
            data_source: 'Employee Surveys',
            threshold_min: 70,
            threshold_max: 90,
            status: 'active',
            last_updated: '2024-02-20',
            performance: 'on_track'
        },
        {
            id: 4,
            name: 'Website Traffic Growth',
            description: 'Monthly unique visitors to company website',
            category: 'Metric',
            type: 'Operational',
            department: 'Marketing',
            target_value: 50000,
            current_value: 42000,
            unit: 'Visitors',
            frequency: 'Monthly',
            trend: 'improving',
            owner: 'Marketing Manager',
            data_source: 'Google Analytics',
            threshold_min: 40000,
            threshold_max: 60000,
            status: 'active',
            last_updated: '2024-02-23',
            performance: 'on_track'
        },
        {
            id: 5,
            name: 'Code Deployment Frequency',
            description: 'Number of code deployments to production per week',
            category: 'KPI',
            type: 'Operational',
            department: 'Engineering',
            target_value: 20,
            current_value: 15,
            unit: 'Deployments',
            frequency: 'Weekly',
            trend: 'declining',
            owner: 'Tech Lead',
            data_source: 'CI/CD System',
            threshold_min: 15,
            threshold_max: 25,
            status: 'active',
            last_updated: '2024-02-22',
            performance: 'needs_attention'
        },
        {
            id: 6,
            name: 'Employee Turnover Rate',
            description: 'Percentage of employees leaving the organization',
            category: 'OKR',
            type: 'Employee',
            department: 'HR',
            target_value: 8,
            current_value: 12,
            unit: '%',
            frequency: 'Quarterly',
            trend: 'declining',
            owner: 'HR Director',
            data_source: 'HRIS',
            threshold_min: 5,
            threshold_max: 10,
            status: 'active',
            last_updated: '2024-02-18',
            performance: 'at_risk'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setKpis(sampleKpis);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewKpi(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitKpi = (e) => {
        e.preventDefault();
        
        const kpi = {
            id: editingKpi ? editingKpi.id : kpis.length + 1,
            ...newKpi,
            last_updated: new Date().toISOString().split('T')[0],
            performance: calculatePerformance(newKpi.current_value, newKpi.target_value, newKpi.threshold_min, newKpi.threshold_max)
        };

        if (editingKpi) {
            setKpis(prev => prev.map(k => k.id === editingKpi.id ? kpi : k));
        } else {
            setKpis(prev => [kpi, ...prev]);
        }

        setNewKpi({
            name: '',
            description: '',
            category: 'KPI',
            type: 'Quantitative',
            department: '',
            target_value: 0,
            current_value: 0,
            unit: '',
            frequency: 'Monthly',
            trend: 'stable',
            owner: '',
            data_source: '',
            threshold_min: 0,
            threshold_max: 0,
            status: 'active'
        });
        setShowKpiForm(false);
        setEditingKpi(null);
    };

    const calculatePerformance = (current, target, min) => {
        if (current >= target) return 'exceeding';
        if (current >= min && current < target) return 'on_track';
        if (current < min) return 'at_risk';
        return 'needs_attention';
    };

    const handleEdit = (kpi) => {
        setEditingKpi(kpi);
        setNewKpi(kpi);
        setShowKpiForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this KPI?')) {
            setKpis(prev => prev.filter(kpi => kpi.id !== id));
        }
    };

    const handleDuplicate = (kpi) => {
        const duplicated = {
            ...kpi,
            id: kpis.length + 1,
            name: `${kpi.name} (Copy)`
        };
        setKpis(prev => [duplicated, ...prev]);
    };

    const handleValueUpdate = (id, newValue) => {
        setKpis(prev => prev.map(kpi => {
            if (kpi.id === id) {
                const performance = calculatePerformance(newValue, kpi.target_value, kpi.threshold_min, kpi.threshold_max);
                return { 
                    ...kpi, 
                    current_value: newValue,
                    performance: performance,
                    last_updated: new Date().toISOString().split('T')[0]
                };
            }
            return kpi;
        }));
    };

    const filteredKpis = kpis.filter(kpi => {
        const matchesType = filters.type === 'all' || kpi.type === filters.type;
        const matchesCategory = filters.category === 'all' || kpi.category === filters.category;
        const matchesDepartment = filters.department === 'all' || kpi.department === filters.department;
        const matchesSearch = filters.search === '' || 
                            kpi.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            kpi.description.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesType && matchesCategory && matchesDepartment && matchesSearch;
    });

    const stats = {
        total: kpis.length,
        kpis: kpis.filter(k => k.category === 'KPI').length,
        okrs: kpis.filter(k => k.category === 'OKR').length,
        metrics: kpis.filter(k => k.category === 'Metric').length,
        on_track: kpis.filter(k => k.performance === 'on_track').length,
        at_risk: kpis.filter(k => k.performance === 'at_risk').length,
        exceeding: kpis.filter(k => k.performance === 'exceeding').length
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

    const getStatusColor = (status) => {
        return status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800';
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
                        <FaChartLine className="mr-3 text-purple-600" />
                        KPI / OKR Tracking
                    </h1>
                    <p className="text-gray-600">Monitor and track Key Performance Indicators and Objectives & Key Results</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Metrics</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaChartLine className="text-purple-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">KPIs</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.kpis}</p>
                            </div>
                            <FaBullseye className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">OKRs</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.okrs}</p>
                            </div>
                            <FaChartBar className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">On Track</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.on_track}</p>
                            </div>
                            <FaCheckCircle className="text-orange-500 text-xl" />
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
                                placeholder="Search KPIs..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {kpiTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

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

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowKpiForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-1"
                            >
                                <FaPlus /> New KPI
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPIs Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">KPI Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category & Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Values & Progress</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Frequency & Trend</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Performance</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredKpis.map((kpi) => {
                                    const TrendIcon = getTrendIcon(kpi.trend);
                                    const progress = (kpi.current_value / kpi.target_value) * 100;
                                    return (
                                        <tr key={kpi.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <FaChartLine className="text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {kpi.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                            {kpi.description}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Owner: {kpi.owner} | Source: {kpi.data_source}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{kpi.category}</div>
                                                <div className="text-sm text-gray-500">{kpi.type}</div>
                                                <div className="text-xs text-gray-400">{kpi.department}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    Target: {kpi.target_value} {kpi.unit}
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    Current: {kpi.current_value} {kpi.unit}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">
                                                    {progress.toFixed(1)}% of target
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{kpi.frequency}</div>
                                                <div className={`flex items-center text-sm ${getTrendColor(kpi.trend)}`}>
                                                    <TrendIcon className="mr-1" size={12} />
                                                    {kpi.trend}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Updated: {new Date(kpi.last_updated).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPerformanceColor(kpi.performance)} mb-1`}>
                                                    {kpi.performance.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(kpi.status)}`}>
                                                    {kpi.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(kpi)}
                                                        className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(kpi)}
                                                        className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(kpi.id)}
                                                        className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={kpi.current_value}
                                                    onChange={(e) => handleValueUpdate(kpi.id, parseFloat(e.target.value))}
                                                    className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Update value"
                                                    step="0.1"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredKpis.length === 0 && (
                            <div className="text-center py-12">
                                <FaChartLine className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No KPIs found</h3>
                                <p className="text-gray-500">Create your first KPI to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredKpis.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredKpis.length} of {kpis.length} KPIs
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {stats.on_track} on track • {stats.at_risk} at risk • {stats.exceeding} exceeding
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Form Modal */}
                {showKpiForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-3">
                                {editingKpi ? 'Edit KPI' : 'Create New KPI'}
                            </h2>
                            <form onSubmit={handleSubmitKpi}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            KPI Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newKpi.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Enter KPI name"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newKpi.description}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Describe the KPI..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={newKpi.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={newKpi.type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {kpiTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <select
                                            name="department"
                                            value={newKpi.department}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frequency *
                                        </label>
                                        <select
                                            name="frequency"
                                            value={newKpi.frequency}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {frequencies.map(freq => (
                                                <option key={freq} value={freq}>{freq}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Target Value *
                                        </label>
                                        <input
                                            type="number"
                                            name="target_value"
                                            value={newKpi.target_value}
                                            onChange={handleInputChange}
                                            required
                                            step="0.1"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Target value"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Value
                                        </label>
                                        <input
                                            type="number"
                                            name="current_value"
                                            value={newKpi.current_value}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Current value"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={newKpi.unit}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="e.g., %, $, Units"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Min Threshold
                                        </label>
                                        <input
                                            type="number"
                                            name="threshold_min"
                                            value={newKpi.threshold_min}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                            value={newKpi.threshold_max}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Maximum threshold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trend
                                        </label>
                                        <select
                                            name="trend"
                                            value={newKpi.trend}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {trends.map(trend => (
                                                <option key={trend} value={trend}>{trend}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Owner *
                                        </label>
                                        <input
                                            type="text"
                                            name="owner"
                                            value={newKpi.owner}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="KPI owner"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data Source
                                        </label>
                                        <input
                                            type="text"
                                            name="data_source"
                                            value={newKpi.data_source}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Data source system"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newKpi.status}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowKpiForm(false);
                                            setEditingKpi(null);
                                            setNewKpi({
                                                name: '',
                                                description: '',
                                                category: 'KPI',
                                                type: 'Quantitative',
                                                department: '',
                                                target_value: 0,
                                                current_value: 0,
                                                unit: '',
                                                frequency: 'Monthly',
                                                trend: 'stable',
                                                owner: '',
                                                data_source: '',
                                                threshold_min: 0,
                                                threshold_max: 0,
                                                status: 'active'
                                            });
                                        }}
                                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <FaSave /> {editingKpi ? 'Update KPI' : 'Create KPI'}
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

export default KPIOKRTracking;
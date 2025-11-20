import React, { useState, useEffect } from 'react';
import { 
    FaBullseye, 
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
    FaChartLine,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaUsers,
    FaChartBar
} from 'react-icons/fa';

const GoalSetting = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        department: 'all',
        search: ''
    });

    // Sample data
    const goalTypes = ['Individual', 'Team', 'Department', 'Organizational'];
    const statusTypes = ['not_started', 'in_progress', 'completed', 'cancelled'];
    const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Operations'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        type: 'Individual',
        department: '',
        assigned_to: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        priority: 'Medium',
        status: 'not_started',
        kpis: [],
        progress: 0
    });

    // Sample goals data
    const sampleGoals = [
        {
            id: 1,
            title: 'Increase Sales Revenue',
            description: 'Achieve 20% growth in quarterly sales revenue',
            type: 'Team',
            department: 'Sales',
            assigned_to: 'Sales Team',
            start_date: '2024-01-01',
            end_date: '2024-03-31',
            target_value: 5000000,
            current_value: 3200000,
            unit: 'INR',
            priority: 'High',
            status: 'in_progress',
            progress: 64,
            kpis: ['Monthly Revenue', 'Conversion Rate', 'New Clients'],
            created_by: 'Sales Manager',
            created_date: '2024-01-01'
        },
        {
            id: 2,
            title: 'Improve Code Quality',
            description: 'Reduce bug count by 30% and improve test coverage',
            type: 'Individual',
            department: 'Engineering',
            assigned_to: 'John Smith',
            start_date: '2024-01-15',
            end_date: '2024-06-15',
            target_value: 30,
            current_value: 15,
            unit: '% Reduction',
            priority: 'Medium',
            status: 'in_progress',
            progress: 50,
            kpis: ['Bug Count', 'Test Coverage', 'Code Review Score'],
            created_by: 'Tech Lead',
            created_date: '2024-01-10'
        },
        {
            id: 3,
            title: 'Launch Marketing Campaign',
            description: 'Successfully launch Q2 product marketing campaign',
            type: 'Department',
            department: 'Marketing',
            assigned_to: 'Marketing Team',
            start_date: '2024-04-01',
            end_date: '2024-06-30',
            target_value: 10000,
            current_value: 0,
            unit: 'Leads',
            priority: 'High',
            status: 'not_started',
            progress: 0,
            kpis: ['Lead Generation', 'Website Traffic', 'Social Engagement'],
            created_by: 'Marketing Head',
            created_date: '2024-03-15'
        },
        {
            id: 4,
            title: 'Employee Training Completion',
            description: 'Ensure 100% completion of mandatory training programs',
            type: 'Organizational',
            department: 'HR',
            assigned_to: 'All Employees',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            target_value: 100,
            current_value: 75,
            unit: '% Completion',
            priority: 'Medium',
            status: 'in_progress',
            progress: 75,
            kpis: ['Training Completion Rate', 'Assessment Scores'],
            created_by: 'HR Manager',
            created_date: '2024-01-01'
        },
        {
            id: 5,
            title: 'Reduce Operational Costs',
            description: 'Achieve 15% reduction in operational expenses',
            type: 'Department',
            department: 'Finance',
            assigned_to: 'Finance Team',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            target_value: 15,
            current_value: 8,
            unit: '% Reduction',
            priority: 'High',
            status: 'in_progress',
            progress: 53,
            kpis: ['Expense Ratio', 'Cost Savings', 'Budget Adherence'],
            created_by: 'CFO',
            created_date: '2024-01-01'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setGoals(sampleGoals);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGoal(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitGoal = (e) => {
        e.preventDefault();
        
        // Calculate progress
        const progress = newGoal.target_value > 0 
            ? Math.round((newGoal.current_value / newGoal.target_value) * 100)
            : 0;

        const goal = {
            id: editingGoal ? editingGoal.id : goals.length + 1,
            ...newGoal,
            progress: progress,
            created_by: 'Current User',
            created_date: new Date().toISOString().split('T')[0]
        };

        if (editingGoal) {
            setGoals(prev => prev.map(g => g.id === editingGoal.id ? goal : g));
        } else {
            setGoals(prev => [goal, ...prev]);
        }

        setNewGoal({
            title: '',
            description: '',
            type: 'Individual',
            department: '',
            assigned_to: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            target_value: 0,
            current_value: 0,
            unit: '',
            priority: 'Medium',
            status: 'not_started',
            kpis: [],
            progress: 0
        });
        setShowGoalForm(false);
        setEditingGoal(null);
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setNewGoal(goal);
        setShowGoalForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            setGoals(prev => prev.filter(goal => goal.id !== id));
        }
    };

    const handleDuplicate = (goal) => {
        const duplicated = {
            ...goal,
            id: goals.length + 1,
            title: `${goal.title} (Copy)`,
            current_value: 0,
            progress: 0,
            status: 'not_started'
        };
        setGoals(prev => [duplicated, ...prev]);
    };

    const handleProgressUpdate = (id, newValue) => {
        setGoals(prev => prev.map(goal => {
            if (goal.id === id) {
                const progress = goal.target_value > 0 
                    ? Math.round((newValue / goal.target_value) * 100)
                    : 0;
                const status = progress >= 100 ? 'completed' : goal.status;
                return { 
                    ...goal, 
                    current_value: newValue, 
                    progress: progress,
                    status: status
                };
            }
            return goal;
        }));
    };

    const filteredGoals = goals.filter(goal => {
        const matchesType = filters.type === 'all' || goal.type === filters.type;
        const matchesStatus = filters.status === 'all' || goal.status === filters.status;
        const matchesDepartment = filters.department === 'all' || goal.department === filters.department;
        const matchesSearch = filters.search === '' || 
                            goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            goal.description.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesType && matchesStatus && matchesDepartment && matchesSearch;
    });

    const stats = {
        total: goals.length,
        in_progress: goals.filter(g => g.status === 'in_progress').length,
        completed: goals.filter(g => g.status === 'completed').length,
        not_started: goals.filter(g => g.status === 'not_started').length,
        avg_progress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0
    };

    const getStatusColor = (status) => {
        const colors = {
            not_started: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Low: 'bg-green-100 text-green-800',
            Medium: 'bg-yellow-100 text-yellow-800',
            High: 'bg-orange-100 text-orange-800',
            Critical: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            not_started: FaClock,
            in_progress: FaChartLine,
            completed: FaCheckCircle,
            cancelled: FaExclamationTriangle
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
                        <FaBullseye className="mr-3 text-blue-600" />
                        Goal Setting
                    </h1>
                    <p className="text-gray-600">Set and track organizational, team, and individual goals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Goals</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaBullseye className="text-blue-500 text-xl" />
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
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.in_progress}</p>
                            </div>
                            <FaChartLine className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Progress</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.avg_progress}%</p>
                            </div>
                            <FaChartBar className="text-purple-500 text-xl" />
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
                                placeholder="Search goals..."
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
                            {goalTypes.map(type => (
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
                                onClick={() => setShowGoalForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <FaPlus /> New Goal
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Goals Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Goal Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type & Assignment</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Target & Progress</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timeline</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status & Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredGoals.map((goal) => {
                                    const StatusIcon = getStatusIcon(goal.status);
                                    return (
                                        <tr key={goal.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <FaBullseye className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {goal.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                            {goal.description}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {goal.kpis.slice(0, 2).join(', ')}
                                                            {goal.kpis.length > 2 && ` +${goal.kpis.length - 2} more`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{goal.type}</div>
                                                <div className="text-sm text-gray-500">{goal.department}</div>
                                                <div className="text-xs text-gray-400">{goal.assigned_to}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {goal.unit === 'INR' ? formatCurrency(goal.target_value) : `${goal.target_value} ${goal.unit}`}
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    Current: {goal.unit === 'INR' ? formatCurrency(goal.current_value) : `${goal.current_value} ${goal.unit}`}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${goal.progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">{goal.progress}%</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                <div>Start: {new Date(goal.start_date).toLocaleDateString()}</div>
                                                <div>End: {new Date(goal.end_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">
                                                    {Math.ceil((new Date(goal.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(goal.status)} mb-1`}>
                                                    <StatusIcon className="mr-1" size={12} />
                                                    {goal.status.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                                                    {goal.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(goal)}
                                                        className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(goal)}
                                                        className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(goal.id)}
                                                        className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={goal.current_value}
                                                    onChange={(e) => handleProgressUpdate(goal.id, parseFloat(e.target.value))}
                                                    className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-xs"
                                                    placeholder="Update progress"
                                                    min="0"
                                                    max={goal.target_value}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredGoals.length === 0 && (
                            <div className="text-center py-12">
                                <FaBullseye className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No goals found</h3>
                                <p className="text-gray-500">Create your first goal to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredGoals.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredGoals.length} of {goals.length} goals
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                Overall Progress: {Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length)}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Goal Form Modal */}
                {showGoalForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-3">
                                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                            </h2>
                            <form onSubmit={handleSubmitGoal}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Goal Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={newGoal.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Enter goal title"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newGoal.description}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Describe the goal..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Goal Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={newGoal.type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {goalTypes.map(type => (
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
                                            value={newGoal.department}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned To *
                                        </label>
                                        <input
                                            type="text"
                                            name="assigned_to"
                                            value={newGoal.assigned_to}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Enter assignee name or team"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={newGoal.start_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={newGoal.end_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Target Value *
                                        </label>
                                        <input
                                            type="number"
                                            name="target_value"
                                            value={newGoal.target_value}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Target value"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={newGoal.unit}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="e.g., %, INR, Units"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Value
                                        </label>
                                        <input
                                            type="number"
                                            name="current_value"
                                            value={newGoal.current_value}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Current value"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={newGoal.priority}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={newGoal.status}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {statusTypes.map(status => (
                                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowGoalForm(false);
                                            setEditingGoal(null);
                                            setNewGoal({
                                                title: '',
                                                description: '',
                                                type: 'Individual',
                                                department: '',
                                                assigned_to: '',
                                                start_date: new Date().toISOString().split('T')[0],
                                                end_date: '',
                                                target_value: 0,
                                                current_value: 0,
                                                unit: '',
                                                priority: 'Medium',
                                                status: 'not_started',
                                                kpis: [],
                                                progress: 0
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
                                        <FaSave /> {editingGoal ? 'Update Goal' : 'Create Goal'}
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

export default GoalSetting;
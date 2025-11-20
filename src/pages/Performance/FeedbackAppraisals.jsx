import React, { useState, useEffect } from 'react';
import { 
    FaComments, 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaUpload,
    FaEye,
    FaUser,
    FaStar,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaFilter,
    FaThumbsUp,
    FaThumbsDown,
    FaReply,
    FaShare,
    FaEnvelope,
    FaExclamationTriangle
} from 'react-icons/fa';

const FeedbackAppraisals = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
        search: ''
    });

    // Sample data
    const feedbackTypes = ['Performance', 'Behavioral', 'Skill-based', 'Project-specific', 'General', '360-degree'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['draft', 'submitted', 'acknowledged', 'actioned', 'closed'];
    const ratingOptions = [1, 2, 3, 4, 5];

    const [newFeedback, setNewFeedback] = useState({
        title: '',
        employee_id: '',
        provider_id: '',
        feedback_type: 'Performance',
        priority: 'medium',
        status: 'draft',
        rating: 0,
        strengths: '',
        areas_improvement: '',
        specific_examples: '',
        action_plan: '',
        follow_up_date: '',
        is_anonymous: false,
        is_shared: false
    });

    // Sample feedback data
    const sampleFeedbacks = [
        {
            id: 1,
            title: 'Q4 Performance Feedback',
            employee_id: 1,
            employee_name: 'John Doe',
            employee_department: 'Engineering',
            provider_id: 2,
            provider_name: 'Jane Smith',
            provider_role: 'Team Lead',
            feedback_type: 'Performance',
            priority: 'high',
            status: 'acknowledged',
            rating: 4,
            strengths: 'Excellent problem-solving skills and technical expertise',
            areas_improvement: 'Could improve documentation and knowledge sharing',
            specific_examples: 'Successfully resolved critical production issue in under 2 hours',
            action_plan: 'Schedule knowledge sharing sessions with junior team members',
            follow_up_date: '2025-02-15',
            is_anonymous: false,
            is_shared: true,
            created_at: '2025-01-20',
            acknowledged_at: '2025-01-22'
        },
        {
            id: 2,
            title: 'Communication Skills Feedback',
            employee_id: 3,
            employee_name: 'Mike Johnson',
            employee_department: 'Marketing',
            provider_id: 4,
            provider_name: 'Sarah Wilson',
            provider_role: 'Manager',
            feedback_type: 'Behavioral',
            priority: 'medium',
            status: 'submitted',
            rating: 3,
            strengths: 'Creative campaign ideas and strong presentation skills',
            areas_improvement: 'Needs to improve cross-department communication',
            specific_examples: 'Missed communicating campaign timeline changes to sales team',
            action_plan: 'Attend communication workshop and provide weekly updates',
            follow_up_date: '2025-02-28',
            is_anonymous: false,
            is_shared: false,
            created_at: '2025-01-18',
            acknowledged_at: null
        },
        {
            id: 3,
            title: 'Technical Skills Assessment',
            employee_id: 5,
            employee_name: 'David Brown',
            employee_department: 'Sales',
            provider_id: 6,
            provider_name: 'Lisa Chen',
            provider_role: 'Senior Sales',
            feedback_type: 'Skill-based',
            priority: 'low',
            status: 'actioned',
            rating: 4,
            strengths: 'Strong product knowledge and customer relationship building',
            areas_improvement: 'Could enhance technical demonstration skills',
            specific_examples: 'Successfully closed enterprise deal worth $500K',
            action_plan: 'Complete advanced product training and practice demos',
            follow_up_date: '2025-02-10',
            is_anonymous: true,
            is_shared: true,
            created_at: '2025-01-15',
            acknowledged_at: '2025-01-16'
        }
    ];

    const employees = [
        { id: 1, name: 'John Doe', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', department: 'Engineering' },
        { id: 3, name: 'Mike Johnson', department: 'Marketing' },
        { id: 4, name: 'Sarah Wilson', department: 'Marketing' },
        { id: 5, name: 'David Brown', department: 'Sales' },
        { id: 6, name: 'Lisa Chen', department: 'Sales' }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setFeedbacks(sampleFeedbacks);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewFeedback(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        
        const feedback = {
            id: editingFeedback ? editingFeedback.id : feedbacks.length + 1,
            ...newFeedback,
            employee_name: employees.find(emp => emp.id === parseInt(newFeedback.employee_id))?.name || '',
            employee_department: employees.find(emp => emp.id === parseInt(newFeedback.employee_id))?.department || '',
            provider_name: employees.find(emp => emp.id === parseInt(newFeedback.provider_id))?.name || '',
            provider_role: 'Manager', // This would typically come from employee data
            created_at: new Date().toISOString().split('T')[0],
            acknowledged_at: newFeedback.status === 'acknowledged' ? new Date().toISOString().split('T')[0] : null
        };

        if (editingFeedback) {
            setFeedbacks(prev => prev.map(f => f.id === editingFeedback.id ? feedback : f));
        } else {
            setFeedbacks(prev => [feedback, ...prev]);
        }

        setNewFeedback({
            title: '',
            employee_id: '',
            provider_id: '',
            feedback_type: 'Performance',
            priority: 'medium',
            status: 'draft',
            rating: 0,
            strengths: '',
            areas_improvement: '',
            specific_examples: '',
            action_plan: '',
            follow_up_date: '',
            is_anonymous: false,
            is_shared: false
        });
        setShowFeedbackForm(false);
        setEditingFeedback(null);
    };

    const handleEdit = (feedback) => {
        setEditingFeedback(feedback);
        setNewFeedback(feedback);
        setShowFeedbackForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            setFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setFeedbacks(prev => prev.map(feedback => 
            feedback.id === id 
                ? { 
                    ...feedback, 
                    status: newStatus,
                    acknowledged_at: newStatus === 'acknowledged' ? new Date().toISOString().split('T')[0] : feedback.acknowledged_at
                } 
                : feedback
        ));
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        const matchesType = filters.type === 'all' || feedback.feedback_type === filters.type;
        const matchesStatus = filters.status === 'all' || feedback.status === filters.status;
        const matchesPriority = filters.priority === 'all' || feedback.priority === filters.priority;
        const matchesSearch = filters.search === '' || 
                            feedback.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            feedback.employee_name.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesType && matchesStatus && matchesPriority && matchesSearch;
    });

    const stats = {
        total: feedbacks.length,
        submitted: feedbacks.filter(f => f.status === 'submitted').length,
        acknowledged: feedbacks.filter(f => f.status === 'acknowledged').length,
        actioned: feedbacks.filter(f => f.status === 'actioned').length,
        high_priority: feedbacks.filter(f => f.priority === 'high' || f.priority === 'critical').length
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FaClock },
            submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted', icon: FaEnvelope },
            acknowledged: { color: 'bg-yellow-100 text-yellow-800', label: 'Acknowledged', icon: FaCheckCircle },
            actioned: { color: 'bg-green-100 text-green-800', label: 'Actioned', icon: FaThumbsUp },
            closed: { color: 'bg-purple-100 text-purple-800', label: 'Closed', icon: FaTimes }
        };

        const config = statusConfig[status] || statusConfig.draft;
        const IconComponent = config.icon;

        return (
            <span className={`px-2 py-1 inline-flex items-center text-xs font-semibold rounded-full ${config.color}`}>
                <IconComponent className="mr-1" size={10} />
                {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            low: { color: 'bg-green-100 text-green-800', label: 'Low' },
            medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
            high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
            critical: { color: 'bg-red-100 text-red-800', label: 'Critical' }
        };

        const config = priorityConfig[priority] || priorityConfig.medium;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getRatingStars = (rating) => {
        return (
            <div className="flex items-center">
                {ratingOptions.map(star => (
                    <FaStar
                        key={star}
                        className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
                        size={12}
                    />
                ))}
                <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
            </div>
        );
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
                        <FaComments className="mr-3 text-green-600" />
                        Feedback & Appraisals
                    </h1>
                    <p className="text-gray-600">Manage employee feedback, 360-degree reviews, and performance appraisals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Feedback</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaComments className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Submitted</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.submitted}</p>
                            </div>
                            <FaEnvelope className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Acknowledged</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.acknowledged}</p>
                            </div>
                            <FaCheckCircle className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">High Priority</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.high_priority}</p>
                            </div>
                            <FaExclamationTriangle className="text-red-500 text-xl" />
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
                                placeholder="Search feedback..."
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
                            {feedbackTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Priorities</option>
                            {priorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFeedbackForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
                            >
                                <FaPlus /> New Feedback
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feedback Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Feedback Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee & Provider</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rating & Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Priority & Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFeedbacks.map((feedback) => (
                                    <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <FaComments className="text-green-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {feedback.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {feedback.strengths}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {feedback.feedback_type} • {feedback.is_anonymous ? 'Anonymous' : 'Identified'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <FaUser className="inline mr-1 text-gray-400" />
                                                {feedback.employee_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {feedback.employee_department}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                From: {feedback.provider_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getRatingStars(feedback.rating)}
                                            <div className="text-sm text-gray-900 mt-1">
                                                {feedback.feedback_type}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {feedback.follow_up_date && `Follow-up: ${feedback.follow_up_date}`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="mb-2">
                                                {getPriorityBadge(feedback.priority)}
                                            </div>
                                            {getStatusBadge(feedback.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(feedback)}
                                                    className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => {/* View details */}}
                                                    className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(feedback.id)}
                                                    className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                            {feedback.status === 'submitted' && (
                                                <button
                                                    onClick={() => handleStatusChange(feedback.id, 'acknowledged')}
                                                    className="w-full mt-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            {feedback.status === 'acknowledged' && (
                                                <button
                                                    onClick={() => handleStatusChange(feedback.id, 'actioned')}
                                                    className="w-full mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                >
                                                    Mark Actioned
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredFeedbacks.length === 0 && (
                            <div className="text-center py-12">
                                <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No feedback found</h3>
                                <p className="text-gray-500">Create your first feedback entry to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredFeedbacks.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {stats.submitted} submitted • {stats.acknowledged} acknowledged • {stats.high_priority} high priority
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback Form Modal */}
                {showFeedbackForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-3">
                                {editingFeedback ? 'Edit Feedback' : 'Create New Feedback'}
                            </h2>
                            <form onSubmit={handleSubmitFeedback}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Feedback Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={newFeedback.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Enter feedback title"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Employee *
                                        </label>
                                        <select
                                            name="employee_id"
                                            value={newFeedback.employee_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Feedback Provider *
                                        </label>
                                        <select
                                            name="provider_id"
                                            value={newFeedback.provider_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select Provider</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Feedback Type *
                                        </label>
                                        <select
                                            name="feedback_type"
                                            value={newFeedback.feedback_type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {feedbackTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority *
                                        </label>
                                        <select
                                            name="priority"
                                            value={newFeedback.priority}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {priorities.map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={newFeedback.status}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rating
                                        </label>
                                        <select
                                            name="rating"
                                            value={newFeedback.rating}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="0">No Rating</option>
                                            {ratingOptions.map(rating => (
                                                <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Follow-up Date
                                        </label>
                                        <input
                                            type="date"
                                            name="follow_up_date"
                                            value={newFeedback.follow_up_date}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_anonymous"
                                            checked={newFeedback.is_anonymous}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        <label className="text-sm text-gray-700">Anonymous Feedback</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_shared"
                                            checked={newFeedback.is_shared}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        <label className="text-sm text-gray-700">Share with Employee</label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Strengths & Positive Feedback
                                        </label>
                                        <textarea
                                            name="strengths"
                                            value={newFeedback.strengths}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="What are the employee's strengths and positive contributions?"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Areas for Improvement
                                        </label>
                                        <textarea
                                            name="areas_improvement"
                                            value={newFeedback.areas_improvement}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="What areas need improvement or development?"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Specific Examples
                                        </label>
                                        <textarea
                                            name="specific_examples"
                                            value={newFeedback.specific_examples}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Provide specific examples or incidents..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Action Plan & Recommendations
                                        </label>
                                        <textarea
                                            name="action_plan"
                                            value={newFeedback.action_plan}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Recommended actions and development plan..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFeedbackForm(false);
                                            setEditingFeedback(null);
                                            setNewFeedback({
                                                title: '',
                                                employee_id: '',
                                                provider_id: '',
                                                feedback_type: 'Performance',
                                                priority: 'medium',
                                                status: 'draft',
                                                rating: 0,
                                                strengths: '',
                                                areas_improvement: '',
                                                specific_examples: '',
                                                action_plan: '',
                                                follow_up_date: '',
                                                is_anonymous: false,
                                                is_shared: false
                                            });
                                        }}
                                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <FaSave /> {editingFeedback ? 'Update Feedback' : 'Create Feedback'}
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

export default FeedbackAppraisals;
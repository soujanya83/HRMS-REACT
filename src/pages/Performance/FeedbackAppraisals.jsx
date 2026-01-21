// FeedbackAppraisals.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaComments, 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaEye,
    FaUser,
    FaStar,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaThumbsUp,
    FaEnvelope,
    FaExclamationTriangle,
    FaSave,
    FaSpinner,
    FaSync,
    FaInfoCircle,
    FaFilter,
    FaCalendarAlt
} from 'react-icons/fa';
import { feedbackService } from '../../services/feedbackService';
import { employeeService } from '../../services/employeeService';

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
           employee.employee_code || 
           employee.name || 
           'Unknown Employee';
};

const getEmployeeDepartment = (employee) => {
    return employee?.department?.name || 
           employee?.employee_department || 
           employee?.department || 
           'Not specified';
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

// Feedback Form Modal Component
const FeedbackFormModal = ({
    isOpen,
    onClose,
    feedback,
    employees,
    onSubmit,
    loading
}) => {
    const [formData, setFormData] = useState({
        organization_id: localStorage.getItem('organization_id') || 15,
        giver_employee_id: '',
        receiver_employee_id: '',
        feedback_content: '',
        type: 'general',
        visibility: 'public',
        performance_review_id: null,
        performance_goal_id: null
    });
    
    const [errors, setErrors] = useState({});
    
    // Safely handle employees
    const safeEmployees = useMemo(() => {
        const employeesArray = ensureArray(employees);
        
        // Remove duplicates based on id
        const uniqueEmployees = [];
        const seenIds = new Set();
        
        for (const emp of employeesArray) {
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

    useEffect(() => {
        if (feedback) {
            setFormData({
                organization_id: feedback.organization_id || localStorage.getItem('organization_id') || 15,
                giver_employee_id: feedback.giver_employee_id?.toString() || '',
                receiver_employee_id: feedback.receiver_employee_id?.toString() || '',
                feedback_content: feedback.feedback_content || '',
                type: feedback.type || 'general',
                visibility: feedback.visibility || 'public',
                performance_review_id: feedback.performance_review_id || null,
                performance_goal_id: feedback.performance_goal_id || null
            });
        } else {
            setFormData({
                organization_id: localStorage.getItem('organization_id') || 15,
                giver_employee_id: '',
                receiver_employee_id: '',
                feedback_content: '',
                type: 'general',
                visibility: 'public',
                performance_review_id: null,
                performance_goal_id: null
            });
        }
        setErrors({});
    }, [feedback, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? null : parseInt(value)) : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.feedback_content.trim()) {
            newErrors.feedback_content = 'Feedback content is required';
        }
        if (!formData.receiver_employee_id) {
            newErrors.receiver_employee_id = 'Receiver is required';
        }
        if (!formData.giver_employee_id) {
            newErrors.giver_employee_id = 'Giver is required';
        }
        if (formData.giver_employee_id === formData.receiver_employee_id) {
            newErrors.giver_employee_id = 'Giver and receiver cannot be the same person';
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
                organization_id: parseInt(formData.organization_id),
                giver_employee_id: parseInt(formData.giver_employee_id),
                receiver_employee_id: parseInt(formData.receiver_employee_id),
                performance_review_id: formData.performance_review_id || null,
                performance_goal_id: formData.performance_goal_id || null
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
                           'Failed to save feedback. Please try again.'
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
                            {feedback ? 'Edit Feedback' : 'Create New Feedback'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Share constructive feedback with colleagues
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
                            Feedback Content *
                        </label>
                        <textarea
                            name="feedback_content"
                            value={formData.feedback_content}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            rows={4}
                            className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.feedback_content ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Provide constructive, specific feedback..."
                        />
                        {errors.feedback_content && (
                            <p className="mt-1 text-xs text-red-600">{errors.feedback_content}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Receiver (Employee) *
                            </label>
                            <select
                                name="receiver_employee_id"
                                value={formData.receiver_employee_id}
                                onChange={handleInputChange}
                                required
                                disabled={loading || safeEmployees.length === 0}
                                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.receiver_employee_id ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">
                                    {safeEmployees.length === 0 ? 'No employees available' : 'Select Receiver'}
                                </option>
                                {safeEmployees.map((emp, index) => (
                                    <option key={`receiver-${emp.id || index}`} value={emp.id}>
                                        {getEmployeeName(emp)} ({emp.employee_code || 'No ID'})
                                    </option>
                                ))}
                            </select>
                            {errors.receiver_employee_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.receiver_employee_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giver (Provider) *
                            </label>
                            <select
                                name="giver_employee_id"
                                value={formData.giver_employee_id}
                                onChange={handleInputChange}
                                required
                                disabled={loading || safeEmployees.length === 0}
                                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.giver_employee_id ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">
                                    {safeEmployees.length === 0 ? 'No employees available' : 'Select Giver'}
                                </option>
                                {safeEmployees.map((emp, index) => (
                                    <option key={`giver-${emp.id || index}`} value={emp.id}>
                                        {getEmployeeName(emp)} ({emp.employee_code || 'No ID'})
                                    </option>
                                ))}
                            </select>
                            {errors.giver_employee_id && (
                                <p className="mt-1 text-xs text-red-600">{errors.giver_employee_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="general">General</option>
                                <option value="positive">Positive</option>
                                <option value="constructive">Constructive</option>
                                <option value="improvement">Improvement</option>
                                <option value="recognition">Recognition</option>
                                <option value="peer_feedback">Peer Feedback</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visibility
                            </label>
                            <select
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="manager_only">Manager Only</option>
                                <option value="team_only">Team Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Performance Review ID (Optional)
                            </label>
                            <input
                                type="number"
                                name="performance_review_id"
                                value={formData.performance_review_id || ''}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Performance Goal ID (Optional)
                            </label>
                            <input
                                type="number"
                                name="performance_goal_id"
                                value={formData.performance_goal_id || ''}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

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
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <FaSpinner className="animate-spin" />}
                            {feedback ? 'Update Feedback' : 'Create Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Feedback Detail Modal Component
const FeedbackDetailModal = ({
    isOpen,
    onClose,
    feedback,
    onEdit,
    onDelete,
    onMarkAsRead,
    loading
}) => {
    if (!isOpen || !feedback) return null;

    const giver = feedback.giver || {};
    const receiver = feedback.receiver || {};
    const isRead = feedback.read_at;
    const canMarkAsRead = !isRead && onMarkAsRead;

    const getTypeBadge = (type) => {
        const typeConfig = {
            general: { color: 'bg-gray-100 text-gray-800', label: 'General' },
            positive: { color: 'bg-green-100 text-green-800', label: 'Positive' },
            constructive: { color: 'bg-yellow-100 text-yellow-800', label: 'Constructive' },
            improvement: { color: 'bg-blue-100 text-blue-800', label: 'Improvement' },
            recognition: { color: 'bg-purple-100 text-purple-800', label: 'Recognition' },
            peer_feedback: { color: 'bg-indigo-100 text-indigo-800', label: 'Peer Feedback' }
        };

        const config = typeConfig[type] || typeConfig.general;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getVisibilityBadge = (visibility) => {
        const visibilityConfig = {
            public: { color: 'bg-green-100 text-green-800', label: 'Public' },
            private: { color: 'bg-red-100 text-red-800', label: 'Private' },
            manager_only: { color: 'bg-yellow-100 text-yellow-800', label: 'Manager Only' },
            team_only: { color: 'bg-purple-100 text-purple-800', label: 'Team Only' }
        };

        const config = visibilityConfig[visibility] || visibilityConfig.public;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (isRead) => {
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isRead ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}>
                {isRead ? 'Read' : 'Unread'}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Feedback Details</h2>
                        <p className="text-sm text-gray-600">Feedback ID: {feedback.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Feedback Content */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Feedback Content</h3>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-800 whitespace-pre-wrap">{feedback.feedback_content}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    {getTypeBadge(feedback.type)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Visibility:</span>
                                    {getVisibilityBadge(feedback.visibility)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    {getStatusBadge(isRead)}
                                </div>
                            </div>
                        </div>

                        {feedback.performance_review_id && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FaInfoCircle className="text-blue-500" />
                                    <span className="text-sm font-medium text-blue-700">
                                        Linked to Performance Review #{feedback.performance_review_id}
                                    </span>
                                </div>
                            </div>
                        )}

                        {feedback.performance_goal_id && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FaInfoCircle className="text-green-500" />
                                    <span className="text-sm font-medium text-green-700">
                                        Linked to Performance Goal #{feedback.performance_goal_id}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - People and Timeline */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Receiver</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{getEmployeeName(receiver)}</p>
                                    <p className="text-sm text-gray-600">
                                        {receiver.employee_code || 'No ID'} • {getEmployeeDepartment(receiver)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Giver</h3>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <FaUser className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{getEmployeeName(giver)}</p>
                                    <p className="text-sm text-gray-600">
                                        {giver.employee_code || 'No ID'} • {getEmployeeDepartment(giver)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">{formatDateTime(feedback.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium">{formatDateTime(feedback.updated_at)}</span>
                                </div>
                                {feedback.read_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Read:</span>
                                        <span className="font-medium text-green-600">
                                            {formatDateTime(feedback.read_at)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Organization</h3>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">
                                    {feedback.organization?.name || `Organization #${feedback.organization_id}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t flex justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(feedback)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <FaEdit /> Edit Feedback
                        </button>
                        {canMarkAsRead && (
                            <button
                                onClick={() => onMarkAsRead(feedback.id)}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <FaCheckCircle /> Mark as Read
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this feedback?')) {
                                    onDelete(feedback.id);
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
const FeedbackAppraisals = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const [filters, setFilters] = useState({
        type: 'all',
        visibility: 'all',
        status: 'all',
        search: ''
    });

    const [modalState, setModalState] = useState({
        showForm: false,
        showDetail: false,
        selectedFeedback: null,
        selectedEmployee: null
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel
            const [feedbacksData, employeesData] = await Promise.all([
                feedbackService.getAllFeedback(),
                employeeService.getAllEmployees()
            ]);

            // Safely set data using ensureArray helper
            const feedbacksArray = ensureArray(feedbacksData);
            const employeesArray = ensureArray(employeesData);

            console.log('Fetched data:', {
                feedbacksCount: feedbacksArray.length,
                employeesCount: employeesArray.length,
                feedbacksSample: feedbacksArray.slice(0, 2),
                employeesSample: employeesArray.slice(0, 2)
            });

            setFeedbacks(feedbacksArray);
            setEmployees(employeesArray);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
            // Set empty arrays on error
            setFeedbacks([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        const matchesType = filters.type === 'all' || feedback.type === filters.type;
        const matchesVisibility = filters.visibility === 'all' || feedback.visibility === filters.visibility;
        const matchesStatus = filters.status === 'all' || 
            (filters.status === 'read' && feedback.read_at) ||
            (filters.status === 'unread' && !feedback.read_at);
        
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
            filters.search === '' ||
            (feedback.feedback_content || '').toLowerCase().includes(searchLower) ||
            (getEmployeeName(feedback.giver) || '').toLowerCase().includes(searchLower) ||
            (getEmployeeName(feedback.receiver) || '').toLowerCase().includes(searchLower) ||
            (feedback.id?.toString() || '').includes(searchLower);

        return matchesType && matchesVisibility && matchesStatus && matchesSearch;
    });

    const stats = {
        total: feedbacks.length,
        unread: feedbacks.filter(f => !f.read_at).length,
        read: feedbacks.filter(f => f.read_at).length,
        public: feedbacks.filter(f => f.visibility === 'public').length,
        positive: feedbacks.filter(f => f.type === 'positive' || f.type === 'recognition').length,
        constructive: feedbacks.filter(f => f.type === 'constructive' || f.type === 'improvement').length
    };

    const handleCreateFeedback = async (formData) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await feedbackService.createFeedback(formData);
            console.log('Create feedback response:', response);

            // Add the new feedback to state
            const newFeedback = {
                id: response.data?.id || Date.now(),
                ...formData,
                giver: employees.find(e => e.id === parseInt(formData.giver_employee_id)),
                receiver: employees.find(e => e.id === parseInt(formData.receiver_employee_id)),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                read_at: null
            };

            setFeedbacks(prev => [newFeedback, ...prev]);
            setSuccessMessage('Feedback created successfully!');
            setModalState(prev => ({ ...prev, showForm: false }));
        } catch (err) {
            console.error('Error creating feedback:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to create feedback. Please try again.'
            );
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateFeedback = async (id, formData) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await feedbackService.updateFeedback(id, formData);
            console.log('Update feedback response:', response);

            // Update feedback in state
            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.id === id
                        ? {
                            ...feedback,
                            ...formData,
                            updated_at: new Date().toISOString(),
                            giver: employees.find(e => e.id === parseInt(formData.giver_employee_id)) || feedback.giver,
                            receiver: employees.find(e => e.id === parseInt(formData.receiver_employee_id)) || feedback.receiver
                        }
                        : feedback
                )
            );

            setSuccessMessage('Feedback updated successfully!');
            setModalState(prev => ({
                ...prev,
                showForm: false,
                selectedFeedback: null
            }));
        } catch (err) {
            console.error('Error updating feedback:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to update feedback. Please try again.'
            );
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFeedback = async (id) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await feedbackService.deleteFeedback(id);
            setFeedbacks(prev => prev.filter(feedback => feedback.id !== id));
            setSuccessMessage('Feedback deleted successfully!');
            setModalState(prev => ({
                ...prev,
                showDetail: false,
                selectedFeedback: null
            }));
        } catch (err) {
            console.error('Error deleting feedback:', err);
            setError(
                err.response?.data?.message ||
                'Failed to delete feedback. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await feedbackService.markAsRead(id);
            console.log('Mark as read response:', response);

            // Update feedback in state
            setFeedbacks(prev =>
                prev.map(feedback =>
                    feedback.id === id
                        ? {
                            ...feedback,
                            read_at: response.data?.read_at || new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                        : feedback
                )
            );

            setSuccessMessage('Feedback marked as read!');
        } catch (err) {
            console.error('Error marking feedback as read:', err);
            setError(
                err.response?.data?.message ||
                'Failed to mark feedback as read. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleViewDetails = (feedback) => {
        setModalState({
            ...modalState,
            showDetail: true,
            selectedFeedback: feedback
        });
    };

    const handleEditFeedback = (feedback) => {
        setModalState({
            ...modalState,
            showForm: true,
            selectedFeedback: feedback
        });
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            general: { color: 'bg-gray-100 text-gray-800', label: 'General' },
            positive: { color: 'bg-green-100 text-green-800', label: 'Positive' },
            constructive: { color: 'bg-yellow-100 text-yellow-800', label: 'Constructive' },
            improvement: { color: 'bg-blue-100 text-blue-800', label: 'Improvement' },
            recognition: { color: 'bg-purple-100 text-purple-800', label: 'Recognition' },
            peer_feedback: { color: 'bg-indigo-100 text-indigo-800', label: 'Peer Feedback' }
        };

        const config = typeConfig[type] || typeConfig.general;
        return (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getVisibilityBadge = (visibility) => {
        const visibilityConfig = {
            public: { color: 'bg-green-100 text-green-800', label: 'Public' },
            private: { color: 'bg-red-100 text-red-800', label: 'Private' },
            manager_only: { color: 'bg-yellow-100 text-yellow-800', label: 'Manager Only' },
            team_only: { color: 'bg-purple-100 text-purple-800', label: 'Team Only' }
        };

        const config = visibilityConfig[visibility] || visibilityConfig.public;
        return (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (readAt) => {
        return (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                readAt ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}>
                {readAt ? 'Read' : 'Unread'}
            </span>
        );
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
                    <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading feedback data...</p>
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
                            <FaComments className="text-green-600" />
                            Feedback & Appraisals
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage employee feedback, 360-degree reviews, and performance appraisals
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
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            disabled={employees.length === 0}
                        >
                            <FaPlus /> New Feedback
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Feedback</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <FaComments className="text-green-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Unread</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.unread}</p>
                        </div>
                        <FaEnvelope className="text-blue-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Read</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.read}</p>
                        </div>
                        <FaCheckCircle className="text-yellow-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Public</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.public}</p>
                        </div>
                        <FaUser className="text-purple-500 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Positive</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.positive}</p>
                        </div>
                        <FaThumbsUp className="text-green-600 text-xl" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Constructive</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.constructive}</p>
                        </div>
                        <FaExclamationTriangle className="text-yellow-600 text-xl" />
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
                            placeholder="Search feedback..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Types</option>
                        <option value="general">General</option>
                        <option value="positive">Positive</option>
                        <option value="constructive">Constructive</option>
                        <option value="improvement">Improvement</option>
                        <option value="recognition">Recognition</option>
                        <option value="peer_feedback">Peer Feedback</option>
                    </select>

                    <select
                        value={filters.visibility}
                        onChange={(e) => handleFilterChange('visibility', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Visibility</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="manager_only">Manager Only</option>
                        <option value="team_only">Team Only</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Status</option>
                        <option value="read">Read</option>
                        <option value="unread">Unread</option>
                    </select>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Feedback Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    People Involved
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type & Visibility
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status & Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredFeedbacks.map((feedback) => {
                                const giver = feedback.giver || {};
                                const receiver = feedback.receiver || {};
                                const isRead = feedback.read_at;

                                return (
                                    <tr key={feedback.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    <FaComments className={`${isRead ? 'text-gray-400' : 'text-green-500'}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        {feedback.feedback_content?.length > 100
                                                            ? `${feedback.feedback_content.substring(0, 100)}...`
                                                            : feedback.feedback_content || 'No content'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        ID: {feedback.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <FaUser className="text-blue-600 text-xs" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            To: {getEmployeeName(receiver)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {getEmployeeDepartment(receiver)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                        <FaUser className="text-green-600 text-xs" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-700">
                                                            From: {getEmployeeName(giver)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div>{getTypeBadge(feedback.type)}</div>
                                                <div>{getVisibilityBadge(feedback.visibility)}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div>{getStatusBadge(feedback.read_at)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(feedback.created_at)}
                                                </div>
                                                {feedback.read_at && (
                                                    <div className="text-xs text-gray-400">
                                                        Read: {formatDate(feedback.read_at)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(feedback)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleEditFeedback(feedback)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                                    title="Edit Feedback"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAsRead(feedback.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title={isRead ? 'Mark as Unread' : 'Mark as Read'}
                                                    disabled={saving}
                                                >
                                                    {isRead ? <FaCheckCircle /> : <FaEnvelope />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this feedback?')) {
                                                            handleDeleteFeedback(feedback.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete Feedback"
                                                    disabled={saving}
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

                    {filteredFeedbacks.length === 0 && (
                        <div className="text-center py-12">
                            <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                {filters.search || filters.type !== 'all' || filters.visibility !== 'all' || filters.status !== 'all'
                                    ? 'No matching feedback found'
                                    : 'No feedback entries yet'}
                            </h3>
                            <p className="text-gray-500">
                                {filters.search || filters.type !== 'all' || filters.visibility !== 'all' || filters.status !== 'all'
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Create your first feedback entry to get started'}
                            </p>
                            {!(filters.search || filters.type !== 'all' || filters.visibility !== 'all' || filters.status !== 'all') && (
                                <button
                                    onClick={() => setModalState(prev => ({ ...prev, showForm: true }))}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Create First Feedback
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {filteredFeedbacks.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-sm text-gray-600 mb-2 md:mb-0">
                                Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                                {stats.unread} unread • {stats.read} read • {stats.public} public • {stats.positive} positive
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FeedbackFormModal
                isOpen={modalState.showForm}
                onClose={() => setModalState(prev => ({
                    ...prev,
                    showForm: false,
                    selectedFeedback: null
                }))}
                feedback={modalState.selectedFeedback}
                employees={employees}
                onSubmit={(formData) => {
                    if (modalState.selectedFeedback) {
                        return handleUpdateFeedback(modalState.selectedFeedback.id, formData);
                    } else {
                        return handleCreateFeedback(formData);
                    }
                }}
                loading={saving}
            />

            <FeedbackDetailModal
                isOpen={modalState.showDetail}
                onClose={() => setModalState(prev => ({
                    ...prev,
                    showDetail: false,
                    selectedFeedback: null
                }))}
                feedback={modalState.selectedFeedback}
                onEdit={handleEditFeedback}
                onDelete={handleDeleteFeedback}
                onMarkAsRead={handleMarkAsRead}
                loading={saving}
            />
        </div>
    );
};

export default FeedbackAppraisals;
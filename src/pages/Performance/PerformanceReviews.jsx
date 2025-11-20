import React, { useState, useEffect } from 'react';
import { 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaDownload,
    FaUpload,
    FaEye,
    FaCalendarAlt,
    FaUser,
    FaStar,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaFilter,
    FaChartBar,
    FaFilePdf,
    FaEnvelope
} from 'react-icons/fa';

const PerformanceReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        department: 'all',
        search: ''
    });

    // Sample data
    const reviewTypes = ['Annual', 'Quarterly', 'Probation', 'Promotion', 'Project-based'];
    const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Operations'];
    const statuses = ['draft', 'in_progress', 'completed', 'cancelled'];
    const ratingScales = ['1-5', '1-10', 'Percentage'];

    const [newReview, setNewReview] = useState({
        title: '',
        employee_id: '',
        reviewer_id: '',
        review_type: 'Annual',
        review_period: '',
        due_date: '',
        status: 'draft',
        rating_scale: '1-5',
        goals: '',
        achievements: '',
        areas_improvement: '',
        overall_rating: 0,
        comments: '',
        recommendations: ''
    });

    // Sample reviews data
    const sampleReviews = [
        {
            id: 1,
            title: 'Q4 2024 Performance Review',
            employee_id: 1,
            employee_name: 'John Doe',
            employee_department: 'Engineering',
            reviewer_id: 2,
            reviewer_name: 'Jane Smith',
            review_type: 'Quarterly',
            review_period: '2024-Q4',
            start_date: '2024-10-01',
            end_date: '2024-12-31',
            due_date: '2025-01-15',
            status: 'completed',
            rating_scale: '1-5',
            overall_rating: 4.2,
            goals: 'Complete project milestones, improve code quality',
            achievements: 'Successfully delivered Project X ahead of schedule',
            areas_improvement: 'Documentation and team collaboration',
            comments: 'Excellent performance this quarter with notable achievements',
            recommendations: 'Consider for lead developer role',
            created_at: '2024-12-15',
            completed_at: '2025-01-10'
        },
        {
            id: 2,
            title: 'Annual Review 2024',
            employee_id: 3,
            employee_name: 'Mike Johnson',
            employee_department: 'Marketing',
            reviewer_id: 4,
            reviewer_name: 'Sarah Wilson',
            review_type: 'Annual',
            review_period: '2024',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            due_date: '2025-02-28',
            status: 'in_progress',
            rating_scale: '1-5',
            overall_rating: 3.8,
            goals: 'Increase brand awareness, lead generation',
            achievements: 'Successful product launch campaign',
            areas_improvement: 'Budget management and ROI tracking',
            comments: 'Strong campaign execution but needs better budget control',
            recommendations: 'Provide budget management training',
            created_at: '2025-01-20',
            completed_at: null
        },
        {
            id: 3,
            title: 'Probation Review',
            employee_id: 5,
            employee_name: 'David Brown',
            employee_department: 'Sales',
            reviewer_id: 6,
            reviewer_name: 'Lisa Chen',
            review_type: 'Probation',
            review_period: 'Probation Period',
            start_date: '2024-11-01',
            end_date: '2025-01-31',
            due_date: '2025-02-07',
            status: 'draft',
            rating_scale: '1-5',
            overall_rating: 0,
            goals: 'Complete sales training, achieve initial targets',
            achievements: '',
            areas_improvement: '',
            comments: '',
            recommendations: '',
            created_at: '2025-01-25',
            completed_at: null
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
            setReviews(sampleReviews);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReview(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        
        const review = {
            id: editingReview ? editingReview.id : reviews.length + 1,
            ...newReview,
            employee_name: employees.find(emp => emp.id === parseInt(newReview.employee_id))?.name || '',
            employee_department: employees.find(emp => emp.id === parseInt(newReview.employee_id))?.department || '',
            reviewer_name: employees.find(emp => emp.id === parseInt(newReview.reviewer_id))?.name || '',
            created_at: new Date().toISOString().split('T')[0],
            completed_at: newReview.status === 'completed' ? new Date().toISOString().split('T')[0] : null
        };

        if (editingReview) {
            setReviews(prev => prev.map(r => r.id === editingReview.id ? review : r));
        } else {
            setReviews(prev => [review, ...prev]);
        }

        setNewReview({
            title: '',
            employee_id: '',
            reviewer_id: '',
            review_type: 'Annual',
            review_period: '',
            due_date: '',
            status: 'draft',
            rating_scale: '1-5',
            goals: '',
            achievements: '',
            areas_improvement: '',
            overall_rating: 0,
            comments: '',
            recommendations: ''
        });
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setNewReview(review);
        setShowReviewForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this performance review?')) {
            setReviews(prev => prev.filter(review => review.id !== id));
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setReviews(prev => prev.map(review => 
            review.id === id 
                ? { 
                    ...review, 
                    status: newStatus,
                    completed_at: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : review.completed_at
                } 
                : review
        ));
    };

    const filteredReviews = reviews.filter(review => {
        const matchesStatus = filters.status === 'all' || review.status === filters.status;
        const matchesType = filters.type === 'all' || review.review_type === filters.type;
        const matchesDepartment = filters.department === 'all' || review.employee_department === filters.department;
        const matchesSearch = filters.search === '' || 
                            review.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            review.employee_name.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesStatus && matchesType && matchesDepartment && matchesSearch;
    });

    const stats = {
        total: reviews.length,
        completed: reviews.filter(r => r.status === 'completed').length,
        in_progress: reviews.filter(r => r.status === 'in_progress').length,
        draft: reviews.filter(r => r.status === 'draft').length,
        overdue: reviews.filter(r => new Date(r.due_date) < new Date() && r.status !== 'completed').length
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FaClock },
            in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: FaEdit },
            completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: FaCheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: FaTimes }
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

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'text-green-600';
        if (rating >= 3) return 'text-yellow-600';
        return 'text-red-600';
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
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
                        <FaChartBar className="mr-3 text-blue-600" />
                        Performance Reviews
                    </h1>
                    <p className="text-gray-600">Manage employee performance reviews and evaluations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reviews</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaChartBar className="text-blue-500 text-xl" />
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
                            <FaEdit className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.overdue}</p>
                            </div>
                            <FaClock className="text-red-500 text-xl" />
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
                                placeholder="Search reviews..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
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
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {reviewTypes.map(type => (
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
                                onClick={() => setShowReviewForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <FaPlus /> New Review
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Review Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee & Reviewer</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Period & Dates</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rating & Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <FaChartBar className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {review.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {review.review_type} Review
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {review.review_period}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <FaUser className="inline mr-1 text-gray-400" />
                                                {review.employee_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {review.employee_department}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Reviewer: {review.reviewer_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                {review.due_date}
                                            </div>
                                            <div className={`text-xs ${isOverdue(review.due_date) && review.status !== 'completed' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                                {isOverdue(review.due_date) && review.status !== 'completed' ? 'Overdue' : 'Due date'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {review.start_date} to {review.end_date}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {review.overall_rating > 0 && (
                                                    <>
                                                        <FaStar className={`${getRatingColor(review.overall_rating)}`} />
                                                        <span className={`text-sm font-semibold ${getRatingColor(review.overall_rating)}`}>
                                                            {review.overall_rating}/5
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {getStatusBadge(review.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(review)}
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
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                            {review.status === 'draft' && (
                                                <button
                                                    onClick={() => handleStatusChange(review.id, 'in_progress')}
                                                    className="w-full mt-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                                                >
                                                    Start Review
                                                </button>
                                            )}
                                            {review.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleStatusChange(review.id, 'completed')}
                                                    className="w-full mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredReviews.length === 0 && (
                            <div className="text-center py-12">
                                <FaChartBar className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No performance reviews found</h3>
                                <p className="text-gray-500">Create your first performance review to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredReviews.length > 0 && (
                    <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredReviews.length} of {reviews.length} reviews
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {stats.completed} completed • {stats.in_progress} in progress • {stats.overdue} overdue
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Form Modal */}
                {showReviewForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-3">
                                {editingReview ? 'Edit Performance Review' : 'Create New Performance Review'}
                            </h2>
                            <form onSubmit={handleSubmitReview}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Review Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={newReview.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Enter review title"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Employee *
                                        </label>
                                        <select
                                            name="employee_id"
                                            value={newReview.employee_id}
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
                                            Reviewer *
                                        </label>
                                        <select
                                            name="reviewer_id"
                                            value={newReview.reviewer_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Select Reviewer</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Review Type *
                                        </label>
                                        <select
                                            name="review_type"
                                            value={newReview.review_type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {reviewTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Review Period
                                        </label>
                                        <input
                                            type="text"
                                            name="review_period"
                                            value={newReview.review_period}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="e.g., 2024-Q4, Annual 2024"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Due Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="due_date"
                                            value={newReview.due_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={newReview.status}
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
                                            Rating Scale
                                        </label>
                                        <select
                                            name="rating_scale"
                                            value={newReview.rating_scale}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            {ratingScales.map(scale => (
                                                <option key={scale} value={scale}>{scale}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Goals & Objectives
                                        </label>
                                        <textarea
                                            name="goals"
                                            value={newReview.goals}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Review goals and objectives..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Key Achievements
                                        </label>
                                        <textarea
                                            name="achievements"
                                            value={newReview.achievements}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Notable achievements during review period..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Areas for Improvement
                                        </label>
                                        <textarea
                                            name="areas_improvement"
                                            value={newReview.areas_improvement}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Areas needing improvement..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Overall Rating
                                        </label>
                                        <input
                                            type="number"
                                            name="overall_rating"
                                            value={newReview.overall_rating}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="0-5 rating"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comments
                                        </label>
                                        <textarea
                                            name="comments"
                                            value={newReview.comments}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Overall comments and feedback..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recommendations
                                        </label>
                                        <textarea
                                            name="recommendations"
                                            value={newReview.recommendations}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Future recommendations and development plans..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                            setNewReview({
                                                title: '',
                                                employee_id: '',
                                                reviewer_id: '',
                                                review_type: 'Annual',
                                                review_period: '',
                                                due_date: '',
                                                status: 'draft',
                                                rating_scale: '1-5',
                                                goals: '',
                                                achievements: '',
                                                areas_improvement: '',
                                                overall_rating: 0,
                                                comments: '',
                                                recommendations: ''
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
                                        <FaSave /> {editingReview ? 'Update Review' : 'Create Review'}
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

export default PerformanceReviews;
import React, { useState, useEffect } from 'react';
import { 
    FaBell, 
    FaSearch, 
    FaFilter,
    FaCheck,
    FaTimes,
    FaTrash,
    FaEnvelope,
    FaExchangeAlt,
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaExclamationTriangle,
    FaInfoCircle
} from 'react-icons/fa';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: ''
    });
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Notification types
    const notificationTypes = {
        shift_swap: { label: 'Shift Swap', icon: FaExchangeAlt, color: 'bg-blue-100 text-blue-800' },
        schedule_change: { label: 'Schedule Change', icon: FaCalendarAlt, color: 'bg-purple-100 text-purple-800' },
        approval: { label: 'Approval Needed', icon: FaCheck, color: 'bg-yellow-100 text-yellow-800' },
        reminder: { label: 'Reminder', icon: FaClock, color: 'bg-green-100 text-green-800' },
        system: { label: 'System Alert', icon: FaInfoCircle, color: 'bg-gray-100 text-gray-800' },
        urgent: { label: 'Urgent', icon: FaExclamationTriangle, color: 'bg-red-100 text-red-800' }
    };

    const statusTypes = ['all', 'unread', 'read', 'archived'];

    // Sample notifications data
    const sampleNotifications = [
        {
            id: 1,
            type: 'shift_swap',
            title: 'Shift Swap Request',
            message: 'John Doe has requested to swap their Morning Shift with your Evening Shift on March 25th',
            sender: 'John Doe',
            timestamp: '2024-03-20T10:30:00',
            status: 'unread',
            priority: 'high',
            action_required: true,
            related_entity: { type: 'shift_swap', id: 123 },
            metadata: {
                requester_shift: 'Morning Shift (09:00-17:00)',
                requested_shift: 'Evening Shift (14:00-22:00)',
                date: '2024-03-25'
            }
        },
        {
            id: 2,
            type: 'approval',
            title: 'Schedule Approval Required',
            message: 'Weekly schedule for Engineering department needs your approval',
            sender: 'System',
            timestamp: '2024-03-20T09:15:00',
            status: 'unread',
            priority: 'medium',
            action_required: true,
            related_entity: { type: 'schedule', id: 456 },
            metadata: {
                department: 'Engineering',
                week: 'March 25-31, 2024',
                employees_count: 12
            }
        },
        {
            id: 3,
            type: 'schedule_change',
            title: 'Schedule Updated',
            message: 'Your shift on March 26th has been changed from Morning to Afternoon',
            sender: 'Manager',
            timestamp: '2024-03-19T16:45:00',
            status: 'read',
            priority: 'medium',
            action_required: false,
            related_entity: { type: 'shift', id: 789 },
            metadata: {
                old_shift: 'Morning (09:00-17:00)',
                new_shift: 'Afternoon (12:00-20:00)',
                date: '2024-03-26'
            }
        },
        {
            id: 4,
            type: 'reminder',
            title: 'Shift Starting Soon',
            message: 'Your Morning Shift starts in 1 hour',
            sender: 'System',
            timestamp: '2024-03-19T08:00:00',
            status: 'read',
            priority: 'low',
            action_required: false,
            related_entity: { type: 'shift', id: 101 },
            metadata: {
                shift_time: '09:00-17:00',
                location: 'Main Office'
            }
        },
        {
            id: 5,
            type: 'urgent',
            title: 'Urgent: Shift Coverage Needed',
            message: 'Emergency shift coverage needed for Night Shift on March 24th',
            sender: 'Operations Manager',
            timestamp: '2024-03-18T14:20:00',
            status: 'read',
            priority: 'high',
            action_required: true,
            related_entity: { type: 'shift', id: 202 },
            metadata: {
                shift: 'Night Shift (22:00-06:00)',
                date: '2024-03-24',
                reason: 'Emergency leave'
            }
        },
        {
            id: 6,
            type: 'system',
            title: 'System Maintenance',
            message: 'Rostering system will be down for maintenance on March 22nd from 2:00 AM to 4:00 AM',
            sender: 'IT Department',
            timestamp: '2024-03-18T11:00:00',
            status: 'read',
            priority: 'low',
            action_required: false,
            related_entity: { type: 'system', id: 303 }
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setNotifications(sampleNotifications);
            setLoading(false);
        }, 1000);
    }, []);

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev => prev.map(notif => 
            notif.id === notificationId 
                ? { ...notif, status: 'read' }
                : notif
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(notif => 
            ({ ...notif, status: 'read' })
        ));
    };

    const handleArchive = (notificationId) => {
        setNotifications(prev => prev.map(notif => 
            notif.id === notificationId 
                ? { ...notif, status: 'archived' }
                : notif
        ));
    };

    const handleDelete = (notificationId) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    };

    const handleAction = (notification) => {
        // Handle notification action (approve, reject, view details, etc.)
        alert(`Action taken for: ${notification.title}`);
        handleMarkAsRead(notification.id);
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return notificationTime.toLocaleDateString();
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: { color: 'bg-red-100 text-red-800', label: 'High' },
            medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
            low: { color: 'bg-green-100 text-green-800', label: 'Low' }
        };
        const config = priorityConfig[priority] || priorityConfig.medium;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesType = filters.type === 'all' || notification.type === filters.type;
        const matchesStatus = filters.status === 'all' || notification.status === filters.status;
        const matchesSearch = filters.search === '' || 
                            notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            notification.message.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
    });

    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => n.status === 'unread').length,
        action_required: notifications.filter(n => n.action_required).length,
        high_priority: notifications.filter(n => n.priority === 'high').length
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
                        <FaBell className="mr-3 text-blue-600" />
                        Rostering Notifications
                    </h1>
                    <p className="text-gray-600">Manage and respond to rostering-related notifications</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Notifications</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaBell className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unread</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.unread}</p>
                            </div>
                            <FaEnvelope className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Action Required</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.action_required}</p>
                            </div>
                            <FaExclamationTriangle className="text-red-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">High Priority</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.high_priority}</p>
                            </div>
                            <FaClock className="text-purple-500 text-xl" />
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
                                placeholder="Search notifications..."
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
                            {Object.entries(notificationTypes).map(([key, type]) => (
                                <option key={key} value={key}>{type.label}</option>
                            ))}
                        </select>

                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <FaCheck /> Mark All Read
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                                <FaFilter />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => {
                                const typeConfig = notificationTypes[notification.type];
                                const IconComponent = typeConfig.icon;
                                
                                return (
                                    <div 
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${
                                            notification.status === 'unread' ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                                                    <IconComponent className="text-lg" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900 text-lg">
                                                            {notification.title}
                                                        </h3>
                                                        {getPriorityBadge(notification.priority)}
                                                        {notification.action_required && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                                                Action Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-gray-600 mb-3">
                                                        {notification.message}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FaUser size={12} />
                                                            From: {notification.sender}
                                                        </span>
                                                        <span>
                                                            {getTimeAgo(notification.timestamp)}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            notification.status === 'unread' 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {notification.status}
                                                        </span>
                                                    </div>

                                                    {/* Notification Metadata */}
                                                    {notification.metadata && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                {Object.entries(notification.metadata).map(([key, value]) => (
                                                                    <div key={key} className="flex">
                                                                        <span className="font-medium text-gray-700 capitalize">
                                                                            {key.replace('_', ' ')}:
                                                                        </span>
                                                                        <span className="ml-2 text-gray-600">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-3 mt-4">
                                                        {notification.action_required && (
                                                            <button
                                                                onClick={() => handleAction(notification)}
                                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                Take Action
                                                            </button>
                                                        )}
                                                        {notification.status === 'unread' && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                                                            >
                                                                Mark as Read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleArchive(notification.id)}
                                                            className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                                                        >
                                                            Archive
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <FaBell className="mx-auto text-4xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications found</h3>
                                <p className="text-gray-500">All caught up! There are no notifications matching your filters.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Footer */}
                {filteredNotifications.length > 0 && (
                    <div className="mt-6 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredNotifications.length} of {notifications.length} notifications
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {stats.unread > 0 && (
                                    <span className="text-blue-600">{stats.unread} unread notifications</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
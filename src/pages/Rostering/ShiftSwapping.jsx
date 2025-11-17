import React, { useState, useEffect } from 'react';
import { 
    FaExchangeAlt, 
    FaSearch, 
    FaPlus, 
    FaClock, 
    FaUser, 
    FaCalendarAlt, 
    FaCheck, 
    FaTimes, 
    FaEye,
    FaFilter,
    FaBell,
    FaDownload,
    FaCopy,
    FaSave
} from 'react-icons/fa';

const ShiftSwapping = () => {
    const [swapRequests, setSwapRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShiftForm, setShowShiftForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        department: 'all',
        status: 'all',
        employee: 'all'
    });

    // Sample data
    const employees = [
        { id: 1, name: 'John Doe', position: 'Software Engineer', department: 'IT' },
        { id: 2, name: 'Jane Smith', position: 'UX Designer', department: 'Design' },
        { id: 3, name: 'Mike Johnson', position: 'Project Manager', department: 'Management' },
        { id: 4, name: 'Sarah Wilson', position: 'QA Engineer', department: 'Testing' },
        { id: 5, name: 'David Brown', position: 'DevOps Engineer', department: 'IT' },
    ];

    const shifts = [
        { id: 1, name: 'Morning Shift', time: '09:00 - 17:00', type: 'regular' },
        { id: 2, name: 'Evening Shift', time: '14:00 - 22:00', type: 'regular' },
        { id: 3, name: 'Night Shift', time: '22:00 - 06:00', type: 'special' },
        { id: 4, name: 'Weekend Shift', time: '10:00 - 18:00', type: 'weekend' },
    ];

    const departments = ['IT', 'Design', 'Management', 'Testing', 'HR'];
    const statusTypes = ['pending', 'approved', 'rejected'];

    const [newRequest, setNewRequest] = useState({
        requester_shift_id: '',
        swap_with_id: '',
        swap_shift_id: '',
        reason: '',
        requester_shift_date: new Date().toISOString().split('T')[0],
        swap_shift_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });

    // Sample swap requests data
    const sampleRequests = [
        {
            id: 1,
            requester_id: 1,
            requester_name: 'John Doe',
            requester_shift_id: 1,
            requester_shift_name: 'Morning Shift',
            requester_shift_date: '2024-01-25',
            swap_with_id: 2,
            swap_with_name: 'Jane Smith',
            swap_shift_id: 2,
            swap_shift_name: 'Evening Shift',
            swap_shift_date: '2024-01-26',
            reason: 'Doctor appointment in the morning',
            status: 'pending',
            created_at: '2024-01-20T10:00:00',
            responded_at: null,
            manager_notes: ''
        },
        {
            id: 2,
            requester_id: 3,
            requester_name: 'Mike Johnson',
            requester_shift_id: 1,
            requester_shift_name: 'Morning Shift',
            requester_shift_date: '2024-01-26',
            swap_with_id: 4,
            swap_with_name: 'Sarah Wilson',
            swap_shift_id: 4,
            swap_shift_name: 'Weekend Shift',
            swap_shift_date: '2024-01-27',
            reason: 'Family event on Saturday',
            status: 'approved',
            created_at: '2024-01-19T14:30:00',
            responded_at: '2024-01-20T09:15:00',
            manager_notes: 'Approved due to valid family event'
        },
        {
            id: 3,
            requester_id: 5,
            requester_name: 'David Brown',
            requester_shift_id: 3,
            requester_shift_name: 'Night Shift',
            requester_shift_date: '2024-01-24',
            swap_with_id: 1,
            swap_with_name: 'John Doe',
            swap_shift_id: 1,
            swap_shift_name: 'Morning Shift',
            swap_shift_date: '2024-01-25',
            reason: 'Need to attend daytime training',
            status: 'rejected',
            created_at: '2024-01-18T16:45:00',
            responded_at: '2024-01-19T11:20:00',
            manager_notes: 'Training can be scheduled on different date'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setSwapRequests(sampleRequests);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        const request = {
            id: swapRequests.length + 1,
            requester_id: 1, // Current user ID
            requester_name: 'John Doe', // Current user name
            requester_shift_id: newRequest.requester_shift_id,
            requester_shift_name: shifts.find(s => s.id === parseInt(newRequest.requester_shift_id))?.name || '',
            requester_shift_date: newRequest.requester_shift_date,
            swap_with_id: newRequest.swap_with_id,
            swap_with_name: employees.find(emp => emp.id === parseInt(newRequest.swap_with_id))?.name || '',
            swap_shift_id: newRequest.swap_shift_id,
            swap_shift_name: shifts.find(s => s.id === parseInt(newRequest.swap_shift_id))?.name || '',
            swap_shift_date: newRequest.swap_shift_date,
            reason: newRequest.reason,
            status: 'pending',
            created_at: new Date().toISOString(),
            responded_at: null,
            manager_notes: ''
        };

        setSwapRequests(prev => [request, ...prev]);
        setNewRequest({
            requester_shift_id: '',
            swap_with_id: '',
            swap_shift_id: '',
            reason: '',
            requester_shift_date: new Date().toISOString().split('T')[0],
            swap_shift_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
        setShowShiftForm(false);
    };

    const handleApproveRequest = (requestId) => {
        setSwapRequests(prev => prev.map(req => 
            req.id === requestId 
                ? { ...req, status: 'approved', responded_at: new Date().toISOString() }
                : req
        ));
    };

    const handleRejectRequest = (requestId) => {
        setSwapRequests(prev => prev.map(req => 
            req.id === requestId 
                ? { ...req, status: 'rejected', responded_at: new Date().toISOString() }
                : req
        ));
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Pending', icon: FaClock },
            approved: { label: 'Approved', icon: FaCheck },
            rejected: { label: 'Rejected', icon: FaTimes }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <span className={`px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full border ${getStatusColor(status)}`}>
                <IconComponent className="mr-1" size={12} />
                {config.label}
            </span>
        );
    };

    const filteredRequests = swapRequests.filter(request => {
        const matchesSearch = request.requester_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            request.swap_with_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            request.reason.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || request.status === filters.status;
        const matchesDepartment = filters.department === 'all' || 
                                 employees.find(emp => emp.id === request.requester_id)?.department === filters.department;
        const matchesEmployee = filters.employee === 'all' || 
                               request.requester_id.toString() === filters.employee || 
                               request.swap_with_id.toString() === filters.employee;

        return matchesSearch && matchesStatus && matchesDepartment && matchesEmployee;
    });

    const stats = {
        total: swapRequests.length,
        pending: swapRequests.filter(req => req.status === 'pending').length,
        approved: swapRequests.filter(req => req.status === 'approved').length,
        rejected: swapRequests.filter(req => req.status === 'rejected').length
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
                        <FaExchangeAlt className="mr-3 text-blue-600" />
                        Shift Swapping Requests
                    </h1>
                    <p className="text-gray-600">Manage and approve employee shift swap requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FaExchangeAlt className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                            </div>
                            <FaClock className="text-yellow-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
                            </div>
                            <FaCheck className="text-green-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
                            </div>
                            <FaTimes className="text-red-500 text-xl" />
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
                                placeholder="Search requests..."
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
                            {statusTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select 
                            value={filters.employee}
                            onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowShiftForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                                <FaPlus /> New Request
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FaDownload />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Swap Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <FaExchangeAlt className="text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {request.requester_name} → {request.swap_with_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {request.requester_shift_name} → {request.swap_shift_name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{request.requester_shift_date}</div>
                                        <div className="text-gray-500">to {request.swap_shift_date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {request.reason}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(request)}
                                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproveRequest(request.id)}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectRequest(request.id)}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <div className="flex flex-col items-center">
                                <FaExchangeAlt className="text-4xl text-gray-300 mb-4" />
                                <p>No shift swap requests found.</p>
                                <p className="text-sm">Click "New Request" to create your first request.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Footer */}
                {filteredRequests.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 mt-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {filteredRequests.length} of {swapRequests.length} requests
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                                {stats.pending > 0 && (
                                    <span className="text-yellow-600">{stats.pending} pending approval</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Form Modal */}
                {showShiftForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Create Shift Swap Request</h2>
                            <form onSubmit={handleSubmitRequest}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Shift to Swap *
                                        </label>
                                        <select
                                            name="requester_shift_id"
                                            required
                                            value={newRequest.requester_shift_id}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Your Shift</option>
                                            {shifts.map(shift => (
                                                <option key={shift.id} value={shift.id}>
                                                    {shift.name} ({shift.time})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Shift Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="requester_shift_date"
                                            required
                                            value={newRequest.requester_shift_date}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Swap With Employee *
                                        </label>
                                        <select
                                            name="swap_with_id"
                                            required
                                            value={newRequest.swap_with_id}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.name} ({emp.department})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Desired Shift *
                                        </label>
                                        <select
                                            name="swap_shift_id"
                                            required
                                            value={newRequest.swap_shift_id}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Desired Shift</option>
                                            {shifts.map(shift => (
                                                <option key={shift.id} value={shift.id}>
                                                    {shift.name} ({shift.time})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Desired Shift Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="swap_shift_date"
                                            required
                                            value={newRequest.swap_shift_date}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason for Swap *
                                        </label>
                                        <textarea
                                            name="reason"
                                            rows="3"
                                            required
                                            value={newRequest.reason}
                                            onChange={handleInputChange}
                                            placeholder="Please provide a reason for this shift swap request..."
                                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowShiftForm(false);
                                            setNewRequest({
                                                requester_shift_id: '',
                                                swap_with_id: '',
                                                swap_shift_id: '',
                                                reason: '',
                                                requester_shift_date: new Date().toISOString().split('T')[0],
                                                swap_shift_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                            });
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <FaExchangeAlt className="mr-2" /> Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Request Details Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Swap Request Details</h2>
                                    <button 
                                        onClick={() => setSelectedRequest(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-blue-800 mb-2">From</h3>
                                            <p className="text-sm"><strong>Employee:</strong> {selectedRequest.requester_name}</p>
                                            <p className="text-sm"><strong>Shift:</strong> {selectedRequest.requester_shift_name}</p>
                                            <p className="text-sm"><strong>Date:</strong> {selectedRequest.requester_shift_date}</p>
                                        </div>
                                        
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-green-800 mb-2">To</h3>
                                            <p className="text-sm"><strong>Employee:</strong> {selectedRequest.swap_with_name}</p>
                                            <p className="text-sm"><strong>Shift:</strong> {selectedRequest.swap_shift_name}</p>
                                            <p className="text-sm"><strong>Date:</strong> {selectedRequest.swap_shift_date}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">Reason</h3>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                                    </div>

                                    {selectedRequest.manager_notes && (
                                        <div>
                                            <h3 className="font-semibold text-gray-700 mb-2">Manager Notes</h3>
                                            <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{selectedRequest.manager_notes}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <strong>Requested:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                                        </div>
                                        {selectedRequest.responded_at && (
                                            <div>
                                                <strong>Responded:</strong> {new Date(selectedRequest.responded_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedRequest.status === 'pending' && (
                                    <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                handleRejectRequest(selectedRequest.id);
                                                setSelectedRequest(null);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                        >
                                            <FaTimes className="mr-2" /> Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApproveRequest(selectedRequest.id);
                                                setSelectedRequest(null);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <FaCheck className="mr-2" /> Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftSwapping;
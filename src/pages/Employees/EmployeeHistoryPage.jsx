import React, { useState, useEffect } from 'react';
import {
  FaHistory, FaFilter, FaCalendar, FaUser,
  FaArrowUp, FaExchangeAlt, FaEdit, FaTrash,
  FaPlus, FaSearch, FaEye, FaFileContract,
  FaUserCheck, FaUserTimes, FaBriefcase, FaBuilding,
  FaTimes, FaRedoAlt, FaChartLine, FaDownload
} from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import {
  getEmploymentHistory,
  createEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory
} from '../../services/employmentHistoryService';

// History Event Component
const HistoryEvent = ({ event, onEdit, onDelete, onView }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'Promotion': return <FaArrowUp className="h-5 w-5 text-green-600" />;
      case 'Transfer': return <FaExchangeAlt className="h-5 w-5 text-blue-600" />;
      case 'Salary Update': return <FaEdit className="h-5 w-5 text-yellow-600" />;
      case 'Termination': return <FaUserTimes className="h-5 w-5 text-red-600" />;
      case 'Joining': return <FaUserCheck className="h-5 w-5 text-green-600" />;
      case 'Designation Change': return <FaBriefcase className="h-5 w-5 text-purple-600" />;
      default: return <FaHistory className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Promotion': return 'bg-green-100 text-green-800 border-green-200';
      case 'Transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Salary Update': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Termination': return 'bg-red-100 text-red-800 border-red-200';
      case 'Joining': return 'bg-green-100 text-green-800 border-green-200';
      case 'Designation Change': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-800">{event.event_type}</h4>
              <span className={`text-xs px-3 py-1 rounded-full border ${getEventColor(event.event_type)}`}>
                {event.event_type}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaCalendar className="h-3.5 w-3.5" />
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <FaUser className="h-3.5 w-3.5" />
                {event.employee_name || `Employee ${event.employee_id}`}
              </span>
              {event.changed_by && (
                <span className="text-xs text-gray-400">
                  By: {event.changed_by}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 self-start sm:self-center">
          <button
            onClick={() => onView(event)}
            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{event.details}</p>
      </div>

      {(event.previous_data || event.new_data) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.previous_data && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs font-medium text-gray-500 mb-1 block">Before:</span>
                <p className="text-sm text-gray-700">{event.previous_data}</p>
              </div>
            )}
            {event.new_data && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-xs font-medium text-blue-500 mb-1 block">After:</span>
                <p className="text-sm text-gray-700">{event.new_data}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ isOpen, onClose, onSubmit, event, employees }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    event_type: '',
    event_date: new Date().toISOString().split('T')[0],
    details: '',
    previous_data: '',
    new_data: '',
    changed_by: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        employee_id: event.employee_id || '',
        event_type: event.event_type || '',
        event_date: event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0],
        details: event.details || '',
        previous_data: event.previous_data || '',
        new_data: event.new_data || '',
        changed_by: event.changed_by || ''
      });
    } else {
      setFormData({
        employee_id: '',
        event_type: '',
        event_date: new Date().toISOString().split('T')[0],
        details: '',
        previous_data: '',
        new_data: '',
        changed_by: ''
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const eventTypes = [
    'Joining',
    'Promotion',
    'Transfer',
    'Designation Change',
    'Salary Update',
    'Department Change',
    'Status Change',
    'Leave Start',
    'Leave End',
    'Termination',
    'Resignation',
    'Contract Renewal',
    'Training Completed',
    'Award Received',
    'Disciplinary Action'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {event ? 'Edit Event' : 'Add New Event'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {event ? 'Update employee history event' : 'Create a new employee history event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Event Type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Changed By
              </label>
              <input
                type="text"
                name="changed_by"
                value={formData.changed_by}
                onChange={handleChange}
                placeholder="Name of person who made changes"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Details *
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the event in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Data (Optional)
              </label>
              <textarea
                name="previous_data"
                value={formData.previous_data}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Previous state or value..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Data (Optional)
              </label>
              <textarea
                name="new_data"
                value={formData.new_data}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="New state or value..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, label, value, color = 'blue', description }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };
  
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

// Main Employment History Component
const EmploymentHistory = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [employees, setEmployees] = useState([]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsResponse = await getEmploymentHistory();
      const eventsData = eventsResponse.data?.data || [];
      setEvents(eventsData);
      setFilteredEvents(eventsData);

      // Fetch employees for dropdown
      // You would need to implement getEmployees here
      // const employeesResponse = await getEmployees();
      // setEmployees(employeesResponse.data?.data || []);
      
      // Mock employees for now
      setEmployees([
        { id: 1, first_name: 'John', last_name: 'Doe', employee_code: 'EMP-001' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP-002' },
        { id: 3, first_name: 'Robert', last_name: 'Johnson', employee_code: 'EMP-003' },
        { id: 4, first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP-004' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === eventTypeFilter);
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(event => new Date(event.event_date) >= new Date(dateRange.start));
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(event => new Date(event.event_date) <= new Date(dateRange.end));
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, eventTypeFilter, dateRange, events]);

  const handleSubmit = async (formData) => {
    try {
      if (selectedEvent) {
        await updateEmploymentHistory(selectedEvent.id, formData);
        alert('Event updated successfully!');
      } else {
        await createEmploymentHistory(formData);
        alert('Event created successfully!');
      }
      setShowForm(false);
      setSelectedEvent(null);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete this event: "${event.event_type}"?`)) return;
    
    try {
      await deleteEmploymentHistory(event.id);
      alert('Event deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleView = (event) => {
    const modalContent = `
      Event Details:
      
      Type: ${event.event_type}
      Date: ${new Date(event.event_date).toLocaleDateString()}
      Employee: ${event.employee_name || `Employee ${event.employee_id}`}
      Changed By: ${event.changed_by || 'System'}
      
      Details: ${event.details}
      
      ${event.previous_data ? `Before: ${event.previous_data}` : ''}
      ${event.new_data ? `After: ${event.new_data}` : ''}
    `;
    alert(modalContent);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEventTypeFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const eventTypes = [...new Set(events.map(event => event.event_type))];

  // Calculate statistics
  const stats = {
    total: events.length,
    recent: events.filter(e => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 30);
      return new Date(e.event_date) > weekAgo;
    }).length,
    promotions: events.filter(e => e.event_type === 'Promotion').length,
    terminations: events.filter(e => e.event_type === 'Termination').length,
    latest: events.length > 0 ? new Date(events[0].event_date).toLocaleDateString() : 'No events'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <EventFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmit}
        event={selectedEvent}
        employees={employees}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employment History</h1>
            <p className="text-gray-600 mt-2">
              Track all employee lifecycle events and organizational changes
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Add New Event
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <FaRedoAlt className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaHistory className="h-6 w-6" />}
            label="Total Events"
            value={stats.total}
            color="blue"
            description="All recorded events"
          />
          <StatCard
            icon={<FaCalendar className="h-6 w-6" />}
            label="Recent Events"
            value={stats.recent}
            color="green"
            description="Last 30 days"
          />
          <StatCard
            icon={<FaArrowUp className="h-6 w-6" />}
            label="Promotions"
            value={stats.promotions}
            color="purple"
            description="Career advancements"
          />
          <StatCard
            icon={<FaUserTimes className="h-6 w-6" />}
            label="Terminations"
            value={stats.terminations}
            color="red"
            description="Employment endings"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Event History</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredEvents.length} of {events.length} events shown
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <FaTimes className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Event Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              placeholder="Start Date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              placeholder="End Date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading employment history...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6">
                <div className="relative">
                  <FaHistory className="h-20 w-20 text-gray-200 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaSearch className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm || eventTypeFilter !== 'all' ? 'No events found' : 'No events recorded yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || eventTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Start tracking employee lifecycle events by adding your first event.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <FaPlus className="inline mr-2" />
                  Add First Event
                </button>
                {searchTerm || eventTypeFilter !== 'all' && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <HistoryEvent
                  key={event.id}
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event)}
                  onView={() => handleView(event)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredEvents.length}</span> of{' '}
                <span className="font-semibold">{events.length}</span> events
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    // Export functionality
                    alert('Export feature coming soon!');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <FaDownload className="h-4 w-4" />
                  Export
                </button>
                <div className="text-sm text-gray-500">
                  Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      {filteredEvents.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FaPlus className="inline mr-2" />
            Add Another Event
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <FaRedoAlt className="inline mr-2" />
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default EmploymentHistory;
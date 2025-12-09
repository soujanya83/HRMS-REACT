import React, { useState, useEffect } from 'react';
import {
  FaHistory, FaFilter, FaCalendar, FaUser,
  FaArrowUp, FaExchangeAlt, FaEdit, FaTrash,
  FaPlus, FaSearch, FaEye, FaFileContract,
  FaUserCheck, FaUserTimes, FaBriefcase, FaBuilding
} from 'react-icons/fa';
import {
  getEmploymentHistory,
  createEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory
} from '../../services/employmentHistoryService';

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
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getEventIcon(event.event_type)}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{event.event_type}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaCalendar className="h-3 w-3" />
              {new Date(event.event_date).toLocaleDateString()}
              <span className="mx-1">•</span>
              <FaUser className="h-3 w-3" />
              {event.employee_name || `Employee ${event.employee_id}`}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onView(event)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
            title="Edit"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700">{event.details}</p>
      </div>

      {(event.previous_data || event.new_data) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {event.previous_data && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">Before:</span>
              <p className="text-sm text-gray-700">{event.previous_data}</p>
            </div>
          )}
          {event.new_data && (
            <div>
              <span className="text-xs font-medium text-gray-500">After:</span>
              <p className="text-sm text-gray-700">{event.new_data}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span className={`text-xs px-2 py-1 rounded-full border ${getEventColor(event.event_type)}`}>
          {event.event_type}
        </span>
        <span className="text-xs text-gray-500">
          By: {event.changed_by || 'System'}
        </span>
      </div>
    </div>
  );
};

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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Event Type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Changed By
              </label>
              <input
                type="text"
                name="changed_by"
                value={formData.changed_by}
                onChange={handleChange}
                placeholder="Name of person who made changes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details *
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the event in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Data (Optional)
              </label>
              <textarea
                name="previous_data"
                value={formData.previous_data}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Previous state or value..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Data (Optional)
              </label>
              <textarea
                name="new_data"
                value={formData.new_data}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New state or value..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {event ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
      setEvents(eventsResponse.data?.data || []);
      setFilteredEvents(eventsResponse.data?.data || []);

      // Fetch employees for dropdown
      // You would need to implement getEmployees here
      // const employeesResponse = await getEmployees();
      // setEmployees(employeesResponse.data?.data || []);
      
      // Mock employees for now
      setEmployees([
        { id: 1, first_name: 'John', last_name: 'Doe', employee_code: 'EMP-001' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP-002' }
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
    // Show detailed view - you can implement a modal for this
    alert(`Event Details:\n\nType: ${event.event_type}\nDate: ${new Date(event.event_date).toLocaleDateString()}\nEmployee: ${event.employee_name}\nDetails: ${event.details}`);
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
    terminations: events.filter(e => e.event_type === 'Termination').length
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Employment History</h2>
            <p className="text-gray-600 mt-1">Track all employee lifecycle events and changes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Add New Event
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <FaHistory className="text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Total Events</div>
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendar className="text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Last 30 Days</div>
              <div className="text-2xl font-bold text-gray-800">{stats.recent}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowUp className="text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Promotions</div>
              <div className="text-2xl font-bold text-gray-800">{stats.promotions}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaUserTimes className="text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Terminations</div>
              <div className="text-2xl font-bold text-gray-800">{stats.terminations}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            placeholder="End Date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading employment history...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchTerm || eventTypeFilter !== 'all' ? 'No events found' : 'No events recorded'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || eventTypeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start tracking employee lifecycle events'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="inline mr-2" />
              Add First Event
            </button>
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredEvents.length} of {events.length} events
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentHistory;
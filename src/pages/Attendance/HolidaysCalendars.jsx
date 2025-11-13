import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaSync,
  FaCalendarCheck,
  FaFlag
} from 'react-icons/fa';

// Static data for holidays
const staticHolidays = [
  {
    id: 1,
    name: 'New Year\'s Day',
    date: '2024-01-01',
    year: 2024,
    type: 'Public Holiday',
    description: 'Celebration of the new year',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 2,
    name: 'Australia Day',
    date: '2024-01-26',
    year: 2024,
    type: 'Public Holiday',
    description: 'National day of Australia',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 3,
    name: 'Good Friday',
    date: '2024-03-29',
    year: 2024,
    type: 'Public Holiday',
    description: 'Christian holiday commemorating the crucifixion of Jesus',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 4,
    name: 'Easter Monday',
    date: '2024-04-01',
    year: 2024,
    type: 'Public Holiday',
    description: 'Day after Easter Sunday',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 5,
    name: 'ANZAC Day',
    date: '2024-04-25',
    year: 2024,
    type: 'Public Holiday',
    description: 'Commemoration of Australian and New Zealand Army Corps',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 6,
    name: 'Christmas Day',
    date: '2024-12-25',
    year: 2024,
    type: 'Public Holiday',
    description: 'Celebration of Christmas',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 7,
    name: 'Boxing Day',
    date: '2024-12-26',
    year: 2024,
    type: 'Public Holiday',
    description: 'Day after Christmas',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 8,
    name: 'Company Picnic',
    date: '2024-06-15',
    year: 2024,
    type: 'Company Event',
    description: 'Annual company picnic and team building',
    is_recurring: true,
    location: 'Sydney Park',
    half_day: true,
    applicable_departments: ['All'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const HolidaysCalendars = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [view, setView] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [filters, setFilters] = useState({
    type: 'all',
    year: 2024,
    search: '',
    month: 'all'
  });

  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'Public Holiday',
    description: '',
    is_recurring: true,
    location: 'National',
    half_day: false,
    applicable_departments: ['All']
  });

  const [stats, setStats] = useState({
    totalHolidays: 0,
    publicHolidays: 0,
    companyEvents: 0,
    upcomingHolidays: 0
  });

  const holidayTypes = [
    'Public Holiday',
    'Company Event',
    'Regional Holiday',
    'Optional Holiday',
    'Training Day'
  ];

  const departments = [
    'All',
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Design',
    'Finance',
    'Operations'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    setTimeout(() => {
      setHolidays(staticHolidays);
      calculateStats(staticHolidays);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (data) => {
    const publicHolidays = data.filter(holiday => holiday.type === 'Public Holiday').length;
    const companyEvents = data.filter(holiday => holiday.type === 'Company Event').length;
    
    const today = new Date();
    const upcomingHolidays = data.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= today;
    }).length;

    setStats({
      totalHolidays: data.length,
      publicHolidays,
      companyEvents,
      upcomingHolidays
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewHoliday(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDepartmentChange = (department) => {
    setNewHoliday(prev => {
      const departments = prev.applicable_departments.includes(department)
        ? prev.applicable_departments.filter(d => d !== department)
        : [...prev.applicable_departments, department];
      
      return { ...prev, applicable_departments: departments };
    });
  };

  const handleSubmitHoliday = async (e) => {
    e.preventDefault();
    try {
      alert('Holiday saved successfully!');
      setShowHolidayForm(false);
      setEditingHoliday(null);
      setNewHoliday({
        name: '',
        date: '',
        type: 'Public Holiday',
        description: '',
        is_recurring: true,
        location: 'National',
        half_day: false,
        applicable_departments: ['All']
      });
      
      setLoading(true);
      setTimeout(() => {
        setHolidays(staticHolidays);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error saving holiday:', error);
      alert('Failed to save holiday');
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description,
      is_recurring: holiday.is_recurring,
      location: holiday.location,
      half_day: holiday.half_day,
      applicable_departments: holiday.applicable_departments
    });
    setShowHolidayForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      alert('Holiday deleted successfully!');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('Failed to delete holiday');
    }
  };

  const handleDuplicateNextYear = async (holiday) => {
    try {
      const nextYearHoliday = {
        ...holiday,
        date: holiday.date.replace(holiday.year.toString(), (holiday.year + 1).toString()),
        year: holiday.year + 1
      };
      delete nextYearHoliday.id;
      
      setHolidays(prev => [...prev, { ...nextYearHoliday, id: Date.now() }]);
      alert('Holiday duplicated for next year!');
    } catch (error) {
      console.error('Error duplicating holiday:', error);
      alert('Failed to duplicate holiday');
    }
  };

  const getHolidayIcon = (type) => {
    switch (type) {
      case 'Public Holiday': return <FaFlag className="text-red-500" />;
      case 'Company Event': return <FaUsers className="text-blue-500" />;
      case 'Regional Holiday': return <FaMapMarkerAlt className="text-green-500" />;
      case 'Optional Holiday': return <FaClock className="text-yellow-500" />;
      case 'Training Day': return <FaClock className="text-purple-500" />;
      default: return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-200 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayHolidays = holidays.filter(holiday => holiday.date === dateString);

      days.push(
        <div key={day} className="h-20 border border-gray-200 p-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <span className={`text-xs font-medium ${
              currentDate.getDay() === 0 || currentDate.getDay() === 6 
                ? 'text-red-500' 
                : 'text-gray-700'
            }`}>
              {day}
            </span>
            {dayHolidays.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                {dayHolidays.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-0.5">
            {dayHolidays.slice(0, 1).map(holiday => (
              <div
                key={holiday.id}
                className={`text-xs p-0.5 rounded truncate ${
                  holiday.type === 'Public Holiday' ? 'bg-red-100 text-red-800' :
                  holiday.type === 'Company Event' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}
                title={holiday.name}
              >
                {holiday.name}
              </div>
            ))}
            {dayHolidays.length > 1 && (
              <div className="text-xs text-gray-500">
                +{dayHolidays.length - 1} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
      {/* Reduced max-width from max-w-7xl to max-w-6xl and adjusted padding */}
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Holidays & Calendars</h1>
          <p className="text-sm text-gray-600">Manage company holidays, events, and calendar schedules</p>
        </div>

        {/* Stats Cards - Made more compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Holidays</p>
                <p className="text-lg font-bold text-gray-800">{stats.totalHolidays}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-lg" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Public Holidays</p>
                <p className="text-lg font-bold text-gray-800">{stats.publicHolidays}</p>
              </div>
              <FaFlag className="text-red-500 text-lg" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Company Events</p>
                <p className="text-lg font-bold text-gray-800">{stats.companyEvents}</p>
              </div>
              <FaUsers className="text-green-500 text-lg" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Upcoming</p>
                <p className="text-lg font-bold text-gray-800">{stats.upcomingHolidays}</p>
              </div>
              <FaCalendarCheck className="text-orange-500 text-lg" />
            </div>
          </div>
        </div>

        {/* View Toggle - Made more compact */}
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex gap-1 p-1 bg-white rounded shadow text-sm">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded transition-colors ${
                view === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1 rounded transition-colors ${
                view === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calendar View
            </button>
          </div>

          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setShowHolidayForm(true)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="text-xs" /> Add Holiday
            </button>
            <button
              onClick={() => alert('Exporting calendar...')}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <FaDownload className="text-xs" /> Export
            </button>
          </div>
        </div>

        {/* Filters - Made more compact */}
        <div className="mb-4 p-3 bg-white shadow rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 text-sm" />
              <input 
                type="text"
                placeholder="Search holidays..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 pl-8 pr-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {holidayTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="border border-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>

            <select 
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Holiday Form Modal - Made more compact */}
        {showHolidayForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
              <form onSubmit={handleSubmitHoliday}>
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Holiday Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newHoliday.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter holiday name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newHoliday.date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={newHoliday.type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {holidayTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newHoliday.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={newHoliday.is_recurring}
                      onChange={handleInputChange}
                      className="rounded focus:ring-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-700">
                      Recurring Yearly
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="half_day"
                      checked={newHoliday.half_day}
                      onChange={handleInputChange}
                      className="rounded focus:ring-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-700">
                      Half Day Event
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newHoliday.description}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter holiday description..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Applicable Departments
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {departments.map(dept => (
                        <div key={dept} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={newHoliday.applicable_departments.includes(dept)}
                            onChange={() => handleDepartmentChange(dept)}
                            className="rounded focus:ring-blue-500"
                          />
                          <label className="text-xs text-gray-700">{dept}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHolidayForm(false);
                      setEditingHoliday(null);
                      setNewHoliday({
                        name: '',
                        date: '',
                        type: 'Public Holiday',
                        description: '',
                        is_recurring: true,
                        location: 'National',
                        half_day: false,
                        applicable_departments: ['All']
                      });
                    }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List View - Made more compact */}
        {view === 'list' && (
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Holiday</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Departments</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Recurring</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {getHolidayIcon(holiday.type)}
                        <div>
                          <div className="font-medium text-gray-900 text-xs">
                            {holiday.name}
                          </div>
                          <div className="text-gray-500 text-xs max-w-xs truncate">
                            {holiday.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-gray-900 text-xs">
                        {new Date(holiday.date).toLocaleDateString('en-AU', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {holiday.half_day && (
                        <div className="text-xs text-orange-600">Half Day</div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        holiday.type === 'Public Holiday' ? 'bg-red-100 text-red-800' :
                        holiday.type === 'Company Event' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {holiday.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900 text-xs">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        {holiday.location}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700 text-xs">
                      {holiday.applicable_departments.join(', ')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        holiday.is_recurring 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {holiday.is_recurring ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(holiday)}
                          className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDuplicateNextYear(holiday)}
                          className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="Duplicate for Next Year"
                        >
                          <FaSync />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday.id)}
                          className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Calendar View - Made more compact */}
        {view === 'calendar' && (
          <div className="bg-white shadow rounded overflow-hidden overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-lg font-semibold text-gray-800">
                  {months[currentMonth]} {currentYear}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                
                {renderCalendar()}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Holidays - Made more compact */}
        <div className="mt-4 bg-white shadow rounded p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Upcoming Holidays</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays
              .filter(holiday => new Date(holiday.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map(holiday => (
                <div key={holiday.id} className="border border-gray-200 rounded p-3 hover:shadow transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {getHolidayIcon(holiday.type)}
                      <h4 className="font-semibold text-gray-800 text-sm">{holiday.name}</h4>
                    </div>
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                      holiday.type === 'Public Holiday' ? 'bg-red-100 text-red-800' :
                      holiday.type === 'Company Event' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {holiday.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{holiday.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(holiday.date).toLocaleDateString()}</span>
                    <span>{holiday.location}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidaysCalendars;
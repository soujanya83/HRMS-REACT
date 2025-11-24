import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaSync,
  FaCalendarCheck,
  FaFlag,
  FaExclamationTriangle
} from 'react-icons/fa';
import { holidayService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useOrganizations } from '../../contexts/OrganizationContext';

const HolidaysCalendars = () => {
  const [holidays, setHolidays] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [view, setView] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [filters, setFilters] = useState({
    type: 'all',
    year: new Date().getFullYear(),
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

  const { selectedOrganization } = useOrganizations();

  const holidayTypes = [
    'Public Holiday',
    'Company Event',
    'Regional Holiday',
    'Optional Holiday',
    'Training Day'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (selectedOrganization) {
      fetchInitialData();
    }
  }, [selectedOrganization]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [holidaysResponse, employeesResponse] = await Promise.all([
        holidayService.getHolidays(),
        employeeService.getEmployees({ organization_id: selectedOrganization.id })
      ]);

      const holidaysData = holidaysResponse.data?.data || holidaysResponse.data || [];
      const employeesData = employeesResponse.data?.data || employeesResponse.data || [];

      setHolidays(holidaysData);
      setEmployees(employeesData);
      
      // Extract departments from employees
      const uniqueDepartments = [...new Set(employeesData
        .map(emp => emp.department)
        .filter(Boolean)
      )];
      setDepartments(['All', ...uniqueDepartments]);

      calculateStats(holidaysData);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (err.response?.status === 401) {
        return;
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please contact administrator.');
      } else {
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const publicHolidays = data.filter(holiday => 
      holiday.type === 'Public Holiday' || holiday.type === 'public_holiday'
    ).length;
    
    const companyEvents = data.filter(holiday => 
      holiday.type === 'Company Event' || holiday.type === 'company_event'
    ).length;
    
    const today = new Date();
    const upcomingHolidays = data.filter(holiday => {
      try {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= today;
      } catch {
        return false;
      }
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
      setError(null);
      
      let result;
      if (editingHoliday) {
        result = await holidayService.updateHoliday(editingHoliday.id, newHoliday);
      } else {
        result = await holidayService.createHoliday(newHoliday);
      }
      
      await fetchInitialData();
      
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
      
    } catch (err) {
      console.error('Error saving holiday:', err);
      setError('Failed to save holiday. Please try again.');
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setNewHoliday({
      name: holiday.name || '',
      date: holiday.date || '',
      type: holiday.type || 'Public Holiday',
      description: holiday.description || '',
      is_recurring: holiday.is_recurring !== undefined ? holiday.is_recurring : true,
      location: holiday.location || 'National',
      half_day: holiday.half_day || false,
      applicable_departments: holiday.applicable_departments || ['All']
    });
    setShowHolidayForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      setError(null);
      await holidayService.deleteHoliday(id);
      await fetchInitialData();
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError('Failed to delete holiday. Please try again.');
    }
  };

  const handleRefresh = async () => {
    await fetchInitialData();
  };

  const handleExport = async () => {
    try {
      const csvContent = convertToCSV(holidays);
      downloadCSV(csvContent, `holidays-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = ['Name', 'Date', 'Type', 'Location', 'Description', 'Recurring', 'Half Day', 'Departments'];
    const rows = data.map(holiday => [
      holiday.name || '',
      holiday.date || '',
      holiday.type || '',
      holiday.location || '',
      holiday.description || '',
      holiday.is_recurring ? 'Yes' : 'No',
      holiday.half_day ? 'Yes' : 'No',
      (holiday.applicable_departments || []).join('; ')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getHolidayIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    switch (typeLower) {
      case 'public holiday':
      case 'public_holiday':
        return <FaFlag className="text-red-500 text-sm" />;
      case 'company event':
      case 'company_event':
        return <FaUsers className="text-blue-500 text-sm" />;
      case 'regional holiday':
      case 'regional_holiday':
        return <FaMapMarkerAlt className="text-green-500 text-sm" />;
      default: 
        return <FaCalendarAlt className="text-gray-500 text-sm" />;
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
      const dayHolidays = holidays.filter(holiday => {
        try {
          return new Date(holiday.date).toISOString().split('T')[0] === dateString;
        } catch {
          return false;
        }
      });

      days.push(
        <div key={day} className="h-20 border border-gray-200 p-1 overflow-hidden hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <span className={`text-xs font-medium ${
              currentDate.getDay() === 0 || currentDate.getDay() === 6 
                ? 'text-red-500' 
                : 'text-gray-700'
            }`}>
              {day}
            </span>
            {dayHolidays.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded font-medium">
                {dayHolidays.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-0.5">
            {dayHolidays.slice(0, 1).map(holiday => (
              <div
                key={holiday.id}
                className={`text-xs p-0.5 rounded truncate ${
                  holiday.type === 'Public Holiday' || holiday.type === 'public_holiday' ? 'bg-red-100 text-red-800 border border-red-200' :
                  holiday.type === 'Company Event' || holiday.type === 'company_event' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  'bg-green-100 text-green-800 border border-green-200'
                }`}
                title={holiday.name}
              >
                {holiday.name}
              </div>
            ))}
            {dayHolidays.length > 1 && (
              <div className="text-xs text-gray-500 font-medium">
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

  // Filter holidays based on current filters
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = !filters.search || 
      holiday.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      holiday.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || 
      holiday.type === filters.type;
    
    const matchesYear = !filters.year || 
      (holiday.year && holiday.year.toString() === filters.year.toString()) ||
      (holiday.date && holiday.date.startsWith(filters.year.toString()));

    const matchesMonth = filters.month === 'all' || 
      (holiday.date && new Date(holiday.date).getMonth().toString() === filters.month);

    return matchesSearch && matchesType && matchesYear && matchesMonth;
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Holidays & Calendars</h1>
          <p className="text-gray-600">Manage company holidays, events, and calendar schedules</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 flex-1">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Holidays', value: stats.totalHolidays, icon: FaCalendarAlt, color: 'blue' },
            { label: 'Public Holidays', value: stats.publicHolidays, icon: FaFlag, color: 'red' },
            { label: 'Company Events', value: stats.companyEvents, icon: FaUsers, color: 'green' },
            { label: 'Upcoming', value: stats.upcomingHolidays, icon: FaCalendarCheck, color: 'orange' }
          ].map((stat, index) => (
            <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`text-${stat.color}-500 text-xl`} />
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-1 p-1 bg-white rounded-lg shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Calendar View
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={loading ? 'animate-spin' : ''} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowHolidayForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus /> Add Holiday
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search holidays..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
            >
              <option value="all">All Types</option>
              {holidayTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>

            <select 
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
            >
              <option value="all">All Months</option>
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Holiday Form Modal */}
        {showHolidayForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                </h2>
              </div>
              <form onSubmit={handleSubmitHoliday} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Holiday Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newHoliday.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter holiday name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newHoliday.date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={newHoliday.type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    >
                      {holidayTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newHoliday.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_recurring"
                      checked={newHoliday.is_recurring}
                      onChange={handleInputChange}
                      className="rounded focus:ring-blue-500 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Recurring Yearly
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="half_day"
                      checked={newHoliday.half_day}
                      onChange={handleInputChange}
                      className="rounded focus:ring-blue-500 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Half Day Event
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newHoliday.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter holiday description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applicable Departments
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {departments.map(dept => (
                        <div key={dept} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newHoliday.applicable_departments.includes(dept)}
                            onChange={() => handleDepartmentChange(dept)}
                            className="rounded focus:ring-blue-500 text-blue-600"
                          />
                          <label className="text-sm text-gray-700">{dept}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
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
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Holiday</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departments</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recurring</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-900 mb-1">No holidays found</p>
                          <p className="text-gray-500">Try adjusting your filters or add a new holiday</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((holiday) => (
                      <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getHolidayIcon(holiday.type)}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {holiday.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {holiday.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(holiday.date).toLocaleDateString('en-AU', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {holiday.half_day && (
                            <div className="text-xs text-orange-600 font-medium">Half Day</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            holiday.type === 'Public Holiday' || holiday.type === 'public_holiday' ? 'bg-red-100 text-red-800 border border-red-200' :
                            holiday.type === 'Company Event' || holiday.type === 'company_event' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {holiday.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            {holiday.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {(holiday.applicable_departments || ['All']).join(', ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            holiday.is_recurring 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {holiday.is_recurring ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(holiday)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              title="Edit"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(holiday.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                              title="Delete"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="min-w-[600px]">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-xl font-semibold text-gray-800">
                  {months[currentMonth]} {currentYear}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0 text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                
                {renderCalendar()}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Holidays */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Holidays</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidays
              .filter(holiday => {
                try {
                  return new Date(holiday.date) >= new Date();
                } catch {
                  return false;
                }
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map(holiday => (
                <div key={holiday.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getHolidayIcon(holiday.type)}
                      <h4 className="font-semibold text-gray-800 text-sm">{holiday.name}</h4>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      holiday.type === 'Public Holiday' || holiday.type === 'public_holiday' ? 'bg-red-100 text-red-800 border border-red-200' :
                      holiday.type === 'Company Event' || holiday.type === 'company_event' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {holiday.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{holiday.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-medium">{new Date(holiday.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {holiday.location}
                    </span>
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
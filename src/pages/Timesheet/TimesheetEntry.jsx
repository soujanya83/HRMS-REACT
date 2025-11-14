import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaPlus, 
  FaTrash, 
  FaBriefcase,
  FaCalculator,
  FaPaperPlane,
  FaEdit,
  FaCopy,
  FaHistory
} from 'react-icons/fa';

// Static data for timesheet entries
const staticProjects = [
  { id: 1, name: 'Website Redesign', code: 'WR-2024', client: 'ABC Corp' },
  { id: 2, name: 'Mobile App Development', code: 'MAD-2024', client: 'XYZ Inc' },
  { id: 3, name: 'CRM Implementation', code: 'CRM-2024', client: 'Acme Ltd' },
  { id: 4, name: 'API Integration', code: 'API-2024', client: 'Tech Solutions' },
  { id: 5, name: 'UI/UX Design', code: 'UX-2024', client: 'Design Studio' }
];

const staticTasks = [
  { id: 1, name: 'Frontend Development', code: 'FE-DEV' },
  { id: 2, name: 'Backend Development', code: 'BE-DEV' },
  { id: 3, name: 'Testing & QA', code: 'TEST' },
  { id: 4, name: 'Design & Prototyping', code: 'DESIGN' },
  { id: 5, name: 'Documentation', code: 'DOCS' },
  { id: 6, name: 'Client Meeting', code: 'MEETING' },
  { id: 7, name: 'Code Review', code: 'REVIEW' },
  { id: 8, name: 'Deployment', code: 'DEPLOY' }
];

const TimesheetEntry = () => {
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [view, setView] = useState('daily'); // 'daily' or 'weekly'
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    project_id: '',
    task_id: '',
    date: selectedDate,
    hours: 0,
    minutes: 0,
    description: '',
    billable: true
  });

  // Stats
  const [stats, setStats] = useState({
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    entriesCount: 0
  });

  // Sample data for demonstration
  const sampleEntries = [
    {
      id: 1,
      project: 'Website Redesign',
      project_code: 'WR-2024',
      task: 'Frontend Development',
      date: selectedDate,
      hours: 6.5,
      description: 'Implemented user dashboard components',
      billable: true,
      status: 'draft'
    },
    {
      id: 2,
      project: 'Mobile App Development',
      project_code: 'MAD-2024',
      task: 'Backend Development',
      date: selectedDate,
      hours: 3.25,
      description: 'API endpoint development for user authentication',
      billable: true,
      status: 'draft'
    },
    {
      id: 3,
      project: 'Internal',
      project_code: 'INT-2024',
      task: 'Team Meeting',
      date: selectedDate,
      hours: 1.0,
      description: 'Weekly team sync meeting',
      billable: false,
      status: 'draft'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setTimesheetEntries(sampleEntries);
      calculateStats(sampleEntries);
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  useEffect(() => {
    setNewEntry(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  function getCurrentWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  const calculateStats = (entries) => {
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    setStats({
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      entriesCount: entries.length
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTimeChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    
    if (field === 'hours') {
      setNewEntry(prev => ({ 
        ...prev, 
        hours: Math.min(numValue, 23),
        minutes: numValue === 24 ? 0 : prev.minutes
      }));
    } else if (field === 'minutes') {
      setNewEntry(prev => {
        let hours = prev.hours;
        let minutes = Math.min(numValue, 59);
        
        if (numValue >= 60) {
          hours += Math.floor(numValue / 60);
          minutes = numValue % 60;
        }
        
        return { 
          ...prev, 
          hours: Math.min(hours, 23),
          minutes 
        };
      });
    }
  };

  const handleSubmitEntry = (e) => {
    e.preventDefault();
    
    const totalHours = newEntry.hours + (newEntry.minutes / 60);
    
    if (totalHours <= 0) {
      alert('Please enter valid time (hours and minutes)');
      return;
    }

    if (!newEntry.project_id || !newEntry.task_id) {
      alert('Please select both project and task');
      return;
    }

    const entryData = {
      ...newEntry,
      id: editingEntry ? editingEntry.id : Date.now(),
      hours: totalHours,
      project: staticProjects.find(p => p.id == newEntry.project_id)?.name,
      project_code: staticProjects.find(p => p.id == newEntry.project_id)?.code,
      task: staticTasks.find(t => t.id == newEntry.task_id)?.name,
      status: 'draft'
    };

    if (editingEntry) {
      setTimesheetEntries(prev => 
        prev.map(entry => entry.id === editingEntry.id ? entryData : entry)
      );
    } else {
      setTimesheetEntries(prev => [...prev, entryData]);
    }

    setShowEntryForm(false);
    setEditingEntry(null);
    setNewEntry({
      project_id: '',
      task_id: '',
      date: selectedDate,
      hours: 0,
      minutes: 0,
      description: '',
      billable: true
    });

    calculateStats(editingEntry 
      ? timesheetEntries.map(entry => entry.id === editingEntry.id ? entryData : entry)
      : [...timesheetEntries, entryData]
    );
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      project_id: staticProjects.find(p => p.name === entry.project)?.id || '',
      task_id: staticTasks.find(t => t.name === entry.task)?.id || '',
      date: entry.date,
      hours: Math.floor(entry.hours),
      minutes: Math.round((entry.hours - Math.floor(entry.hours)) * 60),
      description: entry.description,
      billable: entry.billable
    });
    setShowEntryForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this timesheet entry?')) return;
    
    const updatedEntries = timesheetEntries.filter(entry => entry.id !== id);
    setTimesheetEntries(updatedEntries);
    calculateStats(updatedEntries);
  };

  const handleCopyEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      date: selectedDate
    };
    setTimesheetEntries(prev => [...prev, newEntry]);
    calculateStats([...timesheetEntries, newEntry]);
  };

  const handleSubmitTimesheet = () => {
    if (timesheetEntries.length === 0) {
      alert('No timesheet entries to submit');
      return;
    }

    if (window.confirm('Are you sure you want to submit this timesheet for approval?')) {
      setTimesheetEntries(prev => 
        prev.map(entry => ({ ...entry, status: 'submitted' }))
      );
      alert('Timesheet submitted successfully for approval!');
    }
  };

  const getWeekDates = (weekNumber) => {
    const year = new Date().getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = firstDayOfYear.getDay();
    const firstWeekDate = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstWeekDate);
      date.setDate(firstWeekDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const formatTime = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const getTotalHoursForDate = (date) => {
    return timesheetEntries
      .filter(entry => entry.date === date)
      .reduce((sum, entry) => sum + entry.hours, 0);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Timesheet Entry</h1>
          <p className="text-gray-600">Record and manage your daily work hours</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalHours.toFixed(2)}
                </p>
              </div>
              <FaClock className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.billableHours.toFixed(2)}
                </p>
              </div>
              <FaCalculator className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Billable</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.nonBillableHours.toFixed(2)}
                </p>
              </div>
              <FaBriefcase className="text-orange-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.entriesCount}</p>
              </div>
              <FaHistory className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Date/Week Selection and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* View Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setView('daily')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Daily View
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Weekly View
                </button>
              </div>

              {/* Date Selection */}
              {view === 'daily' ? (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Week:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 52 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Week {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEntryForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> New Entry
              </button>
              <button
                onClick={handleSubmitTimesheet}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPaperPlane /> Submit Timesheet
              </button>
            </div>
          </div>

          {/* Weekly View Header */}
          {view === 'weekly' && (
            <div className="mt-4 grid grid-cols-7 gap-2">
              {getWeekDates(selectedWeek).map((date, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg cursor-pointer transition-colors ${
                    date.toISOString().split('T')[0] === selectedDate
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                >
                  <div className="text-sm font-medium text-gray-700">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xs font-semibold text-blue-600 mt-1">
                    {getTotalHoursForDate(date.toISOString().split('T')[0]).toFixed(1)}h
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timesheet Entry Form Modal */}
        {showEntryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingEntry ? 'Edit Timesheet Entry' : 'New Timesheet Entry'}
              </h2>
              <form onSubmit={handleSubmitEntry}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project *
                    </label>
                    <select
                      name="project_id"
                      value={newEntry.project_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Project</option>
                      {staticProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task *
                    </label>
                    <select
                      name="task_id"
                      value={newEntry.task_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Task</option>
                      {staticTasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.name} ({task.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newEntry.date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Spent *
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={newEntry.hours}
                          onChange={(e) => handleTimeChange('hours', e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Hours"
                        />
                        <span className="text-xs text-gray-500">Hours</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={newEntry.minutes}
                          onChange={(e) => handleTimeChange('minutes', e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Minutes"
                        />
                        <span className="text-xs text-gray-500">Minutes</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Total: {formatTime(newEntry.hours + (newEntry.minutes / 60))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newEntry.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what you worked on..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="billable"
                      checked={newEntry.billable}
                      onChange={handleInputChange}
                      className="rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Billable Hours
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEntryForm(false);
                      setEditingEntry(null);
                      setNewEntry({
                        project_id: '',
                        task_id: '',
                        date: selectedDate,
                        hours: 0,
                        minutes: 0,
                        description: '',
                        billable: true
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timesheet Entries Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Timesheet Entries for {new Date(selectedDate).toLocaleDateString('en-AU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>

          {timesheetEntries.length === 0 ? (
            <div className="text-center py-12">
              <FaClock className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Timesheet Entries</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first timesheet entry.</p>
              <button
                onClick={() => setShowEntryForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Project & Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timesheetEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.project} ({entry.project_code})
                        </div>
                        <div className="text-sm text-gray-500">{entry.task}</div>
                        <div className={`text-xs inline-flex items-center px-2 py-1 rounded-full ${
                          entry.billable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.billable ? 'Billable' : 'Non-Billable'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(entry.hours)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.hours.toFixed(2)} hours
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {entry.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === 'draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : entry.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleCopyEntry(entry)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            title="Copy"
                          >
                            <FaCopy />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-gray-800">
                        Total for {new Date(selectedDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}: 
                        <span className="ml-2 text-blue-600">
                          {stats.totalHours.toFixed(2)} hours
                        </span>
                        <span className="ml-4 text-sm text-gray-600">
                          ({stats.billableHours.toFixed(2)} billable, {stats.nonBillableHours.toFixed(2)} non-billable)
                        </span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Quick Entry</h4>
            <p className="text-sm text-gray-600 mb-3">Common tasks for quick time entry</p>
            <div className="space-y-2">
              {staticTasks.slice(0, 3).map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    setNewEntry(prev => ({
                      ...prev,
                      task_id: task.id,
                      project_id: staticProjects[0].id
                    }));
                    setShowEntryForm(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {task.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Recent Projects</h4>
            <p className="text-sm text-gray-600 mb-3">Your frequently used projects</p>
            <div className="space-y-2">
              {staticProjects.slice(0, 3).map(project => (
                <div key={project.id} className="flex justify-between items-center px-3 py-2 text-sm">
                  <span className="text-gray-700">{project.name}</span>
                  <span className="text-gray-500 text-xs">{project.code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Today's Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Working Hours:</span>
                <span className="font-medium">{stats.totalHours.toFixed(2)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billable Ratio:</span>
                <span className="font-medium">
                  {stats.totalHours > 0 ? ((stats.billableHours / stats.totalHours) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Productivity:</span>
                <span className="font-medium text-green-600">Good</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetEntry;
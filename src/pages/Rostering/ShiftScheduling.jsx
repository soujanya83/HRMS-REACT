import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaUser,
  FaClock,
  FaExchangeAlt,
  FaCopy,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const ShiftScheduling = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [filters, setFilters] = useState({
    department: 'all',
    employee: 'all',
    shiftType: 'all',
    search: ''
  });

  const [newShift, setNewShift] = useState({
    employee_id: '',
    shift_type: 'Morning',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    department: '',
    location: 'Office',
    notes: ''
  });

  // Mock data
  const employees = [
    { id: 1, name: 'John Smith', department: 'Engineering' },
    { id: 2, name: 'Sarah Johnson', department: 'Marketing' },
    { id: 3, name: 'Mike Chen', department: 'Sales' },
    { id: 4, name: 'Lisa Brown', department: 'Design' },
    { id: 5, name: 'Robert Wilson', department: 'Engineering' }
  ];

  const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR'];
  const shiftTypes = ['Morning', 'Afternoon', 'Night', 'Split', 'Flexible'];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setShifts([
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Smith',
          department: 'Engineering',
          shift_type: 'Morning',
          date: '2024-03-25',
          start_time: '09:00',
          end_time: '17:00',
          hours: 8,
          location: 'Office',
          status: 'scheduled',
          notes: 'Regular shift'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Sarah Johnson',
          department: 'Marketing',
          shift_type: 'Morning',
          date: '2024-03-25',
          start_time: '08:00',
          end_time: '16:00',
          hours: 8,
          location: 'Office',
          status: 'scheduled',
          notes: 'Client meeting at 10 AM'
        },
        {
          id: 3,
          employee_id: 3,
          employee_name: 'Mike Chen',
          department: 'Sales',
          shift_type: 'Afternoon',
          date: '2024-03-25',
          start_time: '12:00',
          end_time: '20:00',
          hours: 8,
          location: 'Remote',
          status: 'scheduled',
          notes: 'Working from home'
        },
        {
          id: 4,
          employee_id: 4,
          employee_name: 'Lisa Brown',
          department: 'Design',
          shift_type: 'Morning',
          date: '2024-03-26',
          start_time: '10:00',
          end_time: '18:00',
          hours: 8,
          location: 'Office',
          status: 'scheduled',
          notes: 'Design review at 2 PM'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift(prev => ({ ...prev, [name]: value }));

    // Calculate hours when start or end time changes
    if (name === 'start_time' || name === 'end_time') {
      calculateHours();
    }
  };

  const calculateHours = () => {
    if (newShift.start_time && newShift.end_time) {
      const start = new Date(`2000-01-01T${newShift.start_time}`);
      const end = new Date(`2000-01-01T${newShift.end_time}`);
      const diff = (end - start) / (1000 * 60 * 60);
      setNewShift(prev => ({ ...prev, hours: Math.max(diff, 0) }));
    }
  };

  const handleSubmitShift = (e) => {
    e.preventDefault();
    // API call would go here
    alert('Shift scheduled successfully!');
    setShowShiftForm(false);
    setEditingShift(null);
    setNewShift({
      employee_id: '',
      shift_type: 'Morning',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      department: '',
      location: 'Office',
      notes: ''
    });
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setNewShift({
      employee_id: shift.employee_id,
      shift_type: shift.shift_type,
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      department: shift.department,
      location: shift.location,
      notes: shift.notes
    });
    setShowShiftForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      setShifts(prev => prev.filter(shift => shift.id !== id));
    }
  };

  const handleCopyShift = (shift) => {
    setNewShift({
      employee_id: shift.employee_id,
      shift_type: shift.shift_type,
      date: new Date().toISOString().split('T')[0],
      start_time: shift.start_time,
      end_time: shift.end_time,
      department: shift.department,
      location: shift.location,
      notes: shift.notes
    });
    setEditingShift(null);
    setShowShiftForm(true);
  };

  const handleSwapShift = (shift1, shift2) => {
    // Implement shift swapping logic
    alert(`Swapped shifts between ${shift1.employee_name} and ${shift2.employee_name}`);
  };

  const getShiftColor = (shiftType) => {
    const colors = {
      Morning: 'bg-blue-100 text-blue-800 border-blue-200',
      Afternoon: 'bg-green-100 text-green-800 border-green-200',
      Night: 'bg-purple-100 text-purple-800 border-purple-200',
      Split: 'bg-orange-100 text-orange-800 border-orange-200',
      Flexible: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[shiftType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWeekDates = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDates();

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Scheduling</h1>
          <p className="text-gray-600">Manage and schedule employee shifts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-800">{shifts.length}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {shifts.filter(s => s.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <FaClock className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Different Shifts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(shifts.map(s => s.shift_type)).size}
                </p>
              </div>
              <FaExchangeAlt className="text-purple-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coverage Rate</p>
                <p className="text-2xl font-bold text-gray-800">94%</p>
              </div>
              <FaUser className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* View Toggle and Date Navigation */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded">Previous</button>
            <div className="text-lg font-semibold">
              {view === 'week' && `${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}`}
              {view === 'day' && selectedDate.toLocaleDateString()}
              {view === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">Next</button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowShiftForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Schedule Shift
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search employees..."
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
              value={filters.employee}
              onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <select 
              value={filters.shiftType}
              onChange={(e) => setFilters(prev => ({ ...prev, shiftType: e.target.value }))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shift Types</option>
              {shiftTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input 
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Weekly Schedule View */}
        {view === 'week' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-8 border-b">
              <div className="p-4 font-semibold bg-gray-50">Employee</div>
              {weekDays.map(day => (
                <div key={day} className="p-4 text-center font-semibold border-l bg-gray-50">
                  <div className="text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xs text-gray-500">
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>
            
            {employees.map(employee => (
              <div key={employee.id} className="grid grid-cols-8 border-b">
                <div className="p-4 border-r bg-gray-50">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.department}</div>
                </div>
                {weekDays.map(day => {
                  const dayShifts = shifts.filter(
                    shift => shift.employee_id === employee.id && 
                    shift.date === day.toISOString().split('T')[0]
                  );
                  
                  return (
                    <div key={day} className="p-2 border-l min-h-20">
                      {dayShifts.map(shift => (
                        <div
                          key={shift.id}
                          className={`p-2 mb-1 rounded border ${getShiftColor(shift.shift_type)}`}
                        >
                          <div className="text-xs font-medium">{shift.shift_type}</div>
                          <div className="text-xs">{shift.start_time} - {shift.end_time}</div>
                          <div className="text-xs text-gray-600">{shift.location}</div>
                        </div>
                      ))}
                      {dayShifts.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-4">
                          No shift
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Shifts List View */}
        {(view === 'day' || view === 'month') && (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Shift Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {shift.employee_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {shift.employee_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shift.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(shift.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getShiftColor(shift.shift_type)}`}>
                        {shift.shift_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">{shift.hours}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shift.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleCopyShift(shift)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="Copy"
                        >
                          <FaCopy />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
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
            </table>
          </div>
        )}

        {/* Shift Form Modal */}
        {showShiftForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingShift ? 'Edit Shift' : 'Schedule New Shift'}
              </h2>
              <form onSubmit={handleSubmitShift}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={newShift.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Type *
                    </label>
                    <select
                      name="shift_type"
                      value={newShift.shift_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {shiftTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newShift.date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={newShift.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={newShift.start_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={newShift.end_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      name="hours"
                      value={newShift.hours || 0}
                      onChange={handleInputChange}
                      step="0.5"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      name="location"
                      value={newShift.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newShift.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes about this shift..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShiftForm(false);
                      setEditingShift(null);
                      setNewShift({
                        employee_id: '',
                        shift_type: 'Morning',
                        date: new Date().toISOString().split('T')[0],
                        start_time: '09:00',
                        end_time: '17:00',
                        department: '',
                        location: 'Office',
                        notes: ''
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
                    {editingShift ? 'Update Shift' : 'Schedule Shift'}
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

export default ShiftScheduling;
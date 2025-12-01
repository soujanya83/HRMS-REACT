import React, { useState, useEffect } from 'react';
import { 
    FaCalendarAlt, 
    FaSearch, 
    FaFilter,
    FaDownload,
    FaPrint,
    FaUsers,
    FaClock,
    FaExchangeAlt,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaEdit,
    FaCopy
} from 'react-icons/fa';

const RostersPage = () => {
    const [view, setView] = useState('week'); // 'week' or 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: 'all',
        shiftType: 'all',
        search: ''
    });

    // Sample data
    const employees = [
        { id: 1, name: 'John Smith', department: 'Engineering', position: 'Software Engineer' },
        { id: 2, name: 'Sarah Johnson', department: 'Marketing', position: 'Marketing Manager' },
        { id: 3, name: 'Mike Chen', department: 'Sales', position: 'Sales Executive' },
        { id: 4, name: 'Lisa Brown', department: 'Design', position: 'UI/UX Designer' },
        { id: 5, name: 'Robert Wilson', department: 'Engineering', position: 'DevOps Engineer' },
        { id: 6, name: 'Emma Davis', department: 'HR', position: 'HR Specialist' },
        { id: 7, name: 'James Miller', department: 'Sales', position: 'Sales Manager' },
        { id: 8, name: 'Maria Garcia', department: 'Marketing', position: 'Content Writer' }
    ];

    const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR'];
    const shiftTypes = ['Morning', 'Afternoon', 'Night', 'Split', 'Flexible'];

    const shifts = [
        { id: 1, employee_id: 1, date: '2024-03-25', shift_type: 'Morning', start_time: '09:00', end_time: '17:00', hours: 8 },
        { id: 2, employee_id: 2, date: '2024-03-25', shift_type: 'Morning', start_time: '08:00', end_time: '16:00', hours: 8 },
        { id: 3, employee_id: 3, date: '2024-03-25', shift_type: 'Afternoon', start_time: '12:00', end_time: '20:00', hours: 8 },
        { id: 4, employee_id: 4, date: '2024-03-25', shift_type: 'Morning', start_time: '10:00', end_time: '18:00', hours: 8 },
        { id: 5, employee_id: 5, date: '2024-03-25', shift_type: 'Night', start_time: '22:00', end_time: '06:00', hours: 8 },
        { id: 6, employee_id: 1, date: '2024-03-26', shift_type: 'Morning', start_time: '09:00', end_time: '17:00', hours: 8 },
        { id: 7, employee_id: 2, date: '2024-03-26', shift_type: 'Morning', start_time: '08:00', end_time: '16:00', hours: 8 },
        { id: 8, employee_id: 6, date: '2024-03-26', shift_type: 'Flexible', start_time: '07:00', end_time: '15:00', hours: 8 },
        { id: 9, employee_id: 7, date: '2024-03-26', shift_type: 'Afternoon', start_time: '14:00', end_time: '22:00', hours: 8 },
        { id: 10, employee_id: 8, date: '2024-03-26', shift_type: 'Morning', start_time: '09:00', end_time: '17:00', hours: 8 },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const getWeekDates = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
    };

    const getMonthDates = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const dates = [];
        for (let day = 1; day <= lastDay.getDate(); day++) {
            dates.push(new Date(year, month, day));
        }
        
        // Add padding for first week
        for (let i = 0; i < firstDay.getDay(); i++) {
            dates.unshift(null);
        }
        
        return dates;
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

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const getShiftsForDate = (employeeId, date) => {
        const dateString = date.toISOString().split('T')[0];
        return shifts.filter(shift => 
            shift.employee_id === employeeId && shift.date === dateString
        );
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesDepartment = filters.department === 'all' || employee.department === filters.department;
        const matchesSearch = filters.search === '' || 
                            employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            employee.position.toLowerCase().includes(filters.search.toLowerCase());
        return matchesDepartment && matchesSearch;
    });

    const weekDates = getWeekDates();
    const monthDates = getMonthDates();

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
                        <FaCalendarAlt className="mr-3 text-blue-600" />
                        Weekly & Monthly Rosters
                    </h1>
                    <p className="text-gray-600">View and manage employee schedules by week or month</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
                            </div>
                            <FaUsers className="text-blue-500 text-xl" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Scheduled This Week</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {shifts.filter(s => {
                                        const shiftDate = new Date(s.date);
                                        return shiftDate >= weekDates[0] && shiftDate <= weekDates[6];
                                    }).length}
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
                                <p className="text-2xl font-bold text-gray-800">96%</p>
                            </div>
                            <FaUsers className="text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>

                {/* View Toggle and Date Navigation */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                view === 'week' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Week View
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                view === 'month' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Month View
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigateDate('prev')}
                            className="p-2 hover:bg-gray-100 rounded"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="text-lg font-semibold">
                            {view === 'week' 
                                ? `${weekDates[0].toLocaleDateString()} - ${weekDates[6].toLocaleDateString()}`
                                : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            }
                        </div>
                        <button 
                            onClick={() => navigateDate('next')}
                            className="p-2 hover:bg-gray-100 rounded"
                        >
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <FaDownload /> Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            value={filters.shiftType}
                            onChange={(e) => setFilters(prev => ({ ...prev, shiftType: e.target.value }))}
                            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Shift Types</option>
                            {shiftTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                            <FaFilter /> More Filters
                        </button>
                    </div>
                </div>

                {/* Weekly Roster View */}
                {view === 'week' && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="grid grid-cols-8 border-b">
                            <div className="p-4 font-semibold bg-gray-50">Employee</div>
                            {weekDates.map(day => (
                                <div key={day} className="p-4 text-center font-semibold border-l bg-gray-50">
                                    <div className="text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className="text-xs text-gray-500">
                                        {day.getDate()}/{day.getMonth() + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {filteredEmployees.map(employee => (
                            <div key={employee.id} className="grid grid-cols-8 border-b">
                                <div className="p-4 border-r bg-gray-50">
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-xs text-gray-500">{employee.department}</div>
                                    <div className="text-xs text-gray-400">{employee.position}</div>
                                </div>
                                {weekDates.map(day => {
                                    const dayShifts = getShiftsForDate(employee.id, day);
                                    
                                    return (
                                        <div key={day} className="p-2 border-l min-h-20">
                                            {dayShifts.map(shift => (
                                                <div
                                                    key={shift.id}
                                                    className={`p-2 mb-1 rounded border text-xs ${getShiftColor(shift.shift_type)}`}
                                                >
                                                    <div className="font-medium">{shift.shift_type}</div>
                                                    <div>{shift.start_time} - {shift.end_time}</div>
                                                    <div className="text-gray-600">{shift.hours}h</div>
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

                {/* Monthly Roster View */}
                {view === 'month' && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="grid grid-cols-7 border-b">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-4 text-center font-semibold bg-gray-50">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-7">
                            {monthDates.map((date, index) => (
                                <div key={index} className="min-h-32 border-r border-b p-2">
                                    {date && (
                                        <>
                                            <div className="text-sm font-medium mb-2">
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {shifts
                                                    .filter(shift => shift.date === date.toISOString().split('T')[0])
                                                    .slice(0, 3) // Limit to 3 shifts per day for readability
                                                    .map(shift => {
                                                        const employee = employees.find(emp => emp.id === shift.employee_id);
                                                        return (
                                                            <div
                                                                key={shift.id}
                                                                className={`p-1 rounded text-xs ${getShiftColor(shift.shift_type)}`}
                                                            >
                                                                <div className="font-medium truncate">{employee?.name}</div>
                                                                <div>{shift.start_time}</div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                                {shifts.filter(shift => shift.date === date.toISOString().split('T')[0]).length > 3 && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        +{shifts.filter(shift => shift.date === date.toISOString().split('T')[0]).length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Shift Type Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        {shiftTypes.map(type => (
                            <div key={type} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border ${getShiftColor(type).split(' ')[0]}`}></div>
                                <span className="text-sm text-gray-600">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Footer */}
                <div className="mt-6 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {filteredEmployees.length} of {employees.length} employees
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                            Total shifts this period: {view === 'week' 
                                ? shifts.filter(s => {
                                    const shiftDate = new Date(s.date);
                                    return shiftDate >= weekDates[0] && shiftDate <= weekDates[6];
                                }).length
                                : shifts.filter(s => {
                                    const shiftDate = new Date(s.date);
                                    return shiftDate.getMonth() === currentDate.getMonth() && 
                                           shiftDate.getFullYear() === currentDate.getFullYear();
                                }).length
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RostersPage;
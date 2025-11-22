// src/pages/Attendance/AttendanceTracking.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaSearch, 
  FaFilter, 
  FaUserCheck, 
  FaUserTimes, 
  FaDownload,
  FaSync,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaDesktop,
  FaExclamationTriangle
} from 'react-icons/fa';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';

const AttendanceTracking = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    employee_id: 'all',
    department: 'all',
    status: 'all',
    search: ''
  });

  // Stats data
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    onTime: 0,
    onLeave: 0
  });

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  }, [filters.start_date, filters.end_date, filters.employee_id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees and departments
      const [employeesResponse, departmentsResponse] = await Promise.all([
        employeeService.getEmployees(),
        employeeService.getDepartments()
      ]);

      // Handle API response structure
      const employeesData = employeesResponse.data?.data || employeesResponse.data || [];
      const departmentsData = departmentsResponse.data?.data || departmentsResponse.data || [];

      setEmployees(employeesData);
      setDepartments(departmentsData);

      // Fetch attendance data
      await fetchAttendanceData();

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setError(null);
      
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        ...(filters.employee_id !== 'all' && { employee_id: filters.employee_id })
      };

      const response = await attendanceService.getAttendance(params);
      
      // Handle different API response structures
      let data = [];
      if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setAttendanceData(data);
      calculateStats(data);

    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data.');
      setAttendanceData([]);
    }
  };

  const calculateStats = (data) => {
    const present = data.filter(emp => 
      emp.status === 'Present' || emp.status === 'present' || emp.status === 'PRESENT'
    ).length;
    
    const absent = data.filter(emp => 
      emp.status === 'Absent' || emp.status === 'absent' || emp.status === 'ABSENT'
    ).length;
    
    const late = data.filter(emp => 
      emp.status === 'Late' || emp.status === 'late' || emp.status === 'LATE' || 
      (emp.late_minutes && emp.late_minutes > 0)
    ).length;
    
    const onTime = data.filter(emp => 
      (emp.status === 'Present' || emp.status === 'present' || emp.status === 'PRESENT') && 
      (!emp.late_minutes || emp.late_minutes === 0)
    ).length;

    const onLeave = data.filter(emp => 
      emp.status === 'On Leave' || emp.status === 'on_leave' || emp.status === 'ON_LEAVE'
    ).length;

    setStats({
      totalEmployees: employees.length,
      present,
      absent,
      late,
      onTime,
      onLeave
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchInitialData();
  };

  const handleExport = async () => {
    try {
      const csvContent = convertToCSV(attendanceData);
      downloadCSV(csvContent, `attendance-${filters.start_date}-to-${filters.end_date}.csv`);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        `"${String(value || '').replace(/"/g, '""')}"`
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
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

  const handleClockIn = async (employeeId) => {
    try {
      await attendanceService.clockIn({
        employee_id: employeeId,
        clock_in_time: new Date().toISOString(),
      });
      await fetchAttendanceData();
      alert('Clock in successful!');
    } catch (err) {
      console.error('Error clocking in:', err);
      alert('Failed to clock in. Please try again.');
    }
  };

  const handleClockOut = async (employeeId) => {
    try {
      await attendanceService.clockOut({
        employee_id: employeeId,
        clock_out_time: new Date().toISOString(),
      });
      await fetchAttendanceData();
      alert('Clock out successful!');
    } catch (err) {
      console.error('Error clocking out:', err);
      alert('Failed to clock out. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Present': 'bg-green-100 text-green-800',
      'present': 'bg-green-100 text-green-800',
      'PRESENT': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'absent': 'bg-red-100 text-red-800',
      'ABSENT': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'late': 'bg-yellow-100 text-yellow-800',
      'LATE': 'bg-yellow-100 text-yellow-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'on_leave': 'bg-blue-100 text-blue-800',
      'ON_LEAVE': 'bg-blue-100 text-blue-800',
      'Half Day': 'bg-orange-100 text-orange-800'
    };
    
    return `px-2 py-1 text-xs font-semibold rounded-full ${
      statusConfig[status] || 'bg-gray-100 text-gray-800'
    }`;
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'biometric': 
      case 'fingerprint':
        return <FaFingerprint className="text-blue-500" />;
      case 'mobile': 
      case 'mobile app':
        return <FaMobileAlt className="text-green-500" />;
      case 'web': 
      case 'web portal':
      case 'desktop':
        return <FaDesktop className="text-purple-500" />;
      default: 
        return <FaClock className="text-gray-500" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Filter data based on current filters
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = !filters.search || 
      record.employee_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.employee_id?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = filters.department === 'all' || 
      record.department === filters.department;
    
    const matchesStatus = filters.status === 'all' || 
      record.status?.toLowerCase() === filters.status.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading && attendanceData.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Tracking</h1>
          <p className="text-gray-600">Monitor and manage employee attendance in real-time</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
            <button 
              onClick={handleRefresh}
              className="ml-auto text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
              </div>
              <FaClock className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
              </div>
              <FaUserCheck className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-800">{stats.absent}</p>
              </div>
              <FaUserTimes className="text-red-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-800">{stats.late}</p>
              </div>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Time</p>
                <p className="text-2xl font-bold text-gray-800">{stats.onTime}</p>
              </div>
              <FaUserCheck className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-800">{stats.onLeave}</p>
              </div>
              <FaCalendarAlt className="text-indigo-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input 
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input 
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select 
              value={filters.employee_id}
              onChange={(e) => handleFilterChange('employee_id', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.employee_name}
                </option>
              ))}
            </select>

            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="on_leave">On Leave</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaSync className={loading ? 'animate-spin' : ''} /> 
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Check In/Out</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location/Device</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employee_name}
                      </div>
                      <div className="text-sm text-gray-500">{record.employee_id}</div>
                      <div className="text-xs text-gray-400">{record.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-green-500" />
                          <span className="font-medium">{formatTime(record.check_in)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FaClock className="text-red-500" />
                          <span className="font-medium">{formatTime(record.check_out)}</span>
                        </div>
                        {record.late_minutes > 0 && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Late by {record.late_minutes} minutes
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.total_hours || '0h 00m'}
                      </div>
                      {record.overtime && record.overtime !== '0h 00m' && (
                        <div className="text-xs text-blue-600">
                          OT: {record.overtime}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.status)}>
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        {getDeviceIcon(record.device)}
                        <div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span>{record.location || 'Unknown'}</span>
                          </div>
                          <div className="text-xs text-gray-500">{record.device || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {!record.check_in && (
                          <button
                            onClick={() => handleClockIn(record.employee_id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Clock In
                          </button>
                        )}
                        {record.check_in && !record.check_out && (
                          <button
                            onClick={() => handleClockOut(record.employee_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Clock Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Summary ({filters.start_date} to {filters.end_date})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Employees Present</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalEmployees > 0 ? Math.round((stats.onTime / stats.totalEmployees) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">On Time Rate</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.totalEmployees > 0 ? Math.round((stats.late / stats.totalEmployees) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Late Arrival Rate</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalEmployees > 0 ? Math.round((stats.absent / stats.totalEmployees) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Absence Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing FaFingerprint icon component
const FaFingerprint = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path d="M12 2a9 9 0 0 0-9 9v6h2v-6a7 7 0 0 1 14 0v6h2v-6a9 9 0 0 0-9-9z"/>
    <path d="M12 6a5 5 0 0 0-5 5v3h2v-3a3 3 0 0 1 6 0v3h2v-3a5 5 0 0 0-5-5z"/>
    <path d="M12 10a1 1 0 0 0-1 1v2h2v-2a1 1 0 0 0-1-1z"/>
  </svg>
);

export default AttendanceTracking;
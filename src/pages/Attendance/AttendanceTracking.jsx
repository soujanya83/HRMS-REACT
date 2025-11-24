import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaSearch, 
  FaUserCheck, 
  FaUserTimes, 
  FaDownload,
  FaSync,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaDesktop,
  FaExclamationTriangle,
  FaFingerprint
} from 'react-icons/fa';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useOrganizations } from '../../contexts/OrganizationContext';

const AttendanceTracking = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { selectedOrganization } = useOrganizations();
  
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    employee_id: 'all',
    department: 'all',
    status: 'all',
    search: ''
  });

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
    if (selectedOrganization) {
      fetchInitialData();
    }
  }, [selectedOrganization]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [employeesResponse, attendanceResponse] = await Promise.all([
        employeeService.getEmployees({ organization_id: selectedOrganization.id }),
        attendanceService.getAttendance({
          start_date: filters.start_date,
          end_date: filters.end_date,
          organization_id: selectedOrganization.id
        })
      ]);

      // Handle API response structure properly
      const employeesData = Array.isArray(employeesResponse.data?.data) 
        ? employeesResponse.data.data 
        : Array.isArray(employeesResponse.data) 
          ? employeesResponse.data 
          : [];

      // Handle attendance data structure properly
      let attendanceData = [];
      if (attendanceResponse.data) {
        if (Array.isArray(attendanceResponse.data.data)) {
          attendanceData = attendanceResponse.data.data;
        } else if (Array.isArray(attendanceResponse.data)) {
          attendanceData = attendanceResponse.data;
        } else if (attendanceResponse.data.data && Array.isArray(attendanceResponse.data.data)) {
          attendanceData = attendanceResponse.data.data;
        }
      }

      console.log('Employees data:', employeesData);
      console.log('Attendance data:', attendanceData);

      setEmployees(employeesData);
      setAttendanceData(attendanceData);
      
      // Extract departments from employees
      const uniqueDepartments = [...new Set(employeesData
        .map(emp => emp.department)
        .filter(Boolean)
      )];
      setDepartments(uniqueDepartments);
      
      calculateStats(attendanceData);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (err.response?.status === 401) {
        return;
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please contact administrator.');
      } else {
        setError('Failed to load data. Please try again.');
      }
      
      // Set empty arrays on error
      setEmployees([]);
      setAttendanceData([]);
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
      if (response.data) {
        if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
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
    // Ensure data is an array
    const attendanceArray = Array.isArray(data) ? data : [];
    
    const present = attendanceArray.filter(emp => 
      emp.status === 'Present' || emp.status === 'present' || emp.status === 'PRESENT'
    ).length;
    
    const absent = attendanceArray.filter(emp => 
      emp.status === 'Absent' || emp.status === 'absent' || emp.status === 'ABSENT'
    ).length;
    
    const late = attendanceArray.filter(emp => 
      emp.status === 'Late' || emp.status === 'late' || emp.status === 'LATE' || 
      (emp.late_minutes && emp.late_minutes > 0)
    ).length;
    
    const onTime = attendanceArray.filter(emp => 
      (emp.status === 'Present' || emp.status === 'present' || emp.status === 'PRESENT') && 
      (!emp.late_minutes || emp.late_minutes === 0)
    ).length;

    const onLeave = attendanceArray.filter(emp => 
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
      // Ensure attendanceData is an array
      const dataToExport = Array.isArray(attendanceData) ? attendanceData : [];
      const csvContent = convertToCSV(dataToExport);
      downloadCSV(csvContent, `attendance-${filters.start_date}-to-${filters.end_date}.csv`);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
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
      'Present': 'bg-green-100 text-green-800 border border-green-200',
      'present': 'bg-green-100 text-green-800 border border-green-200',
      'PRESENT': 'bg-green-100 text-green-800 border border-green-200',
      'Absent': 'bg-red-100 text-red-800 border border-red-200',
      'absent': 'bg-red-100 text-red-800 border border-red-200',
      'ABSENT': 'bg-red-100 text-red-800 border border-red-200',
      'Late': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'late': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'LATE': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'On Leave': 'bg-blue-100 text-blue-800 border border-blue-200',
      'on_leave': 'bg-blue-100 text-blue-800 border border-blue-200',
      'ON_LEAVE': 'bg-blue-100 text-blue-800 border border-blue-200',
    };
    
    return `px-3 py-1 text-xs font-semibold rounded-full ${
      statusConfig[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
    }`;
  };

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'biometric': 
      case 'fingerprint':
        return <FaFingerprint className="text-blue-500 text-sm" />;
      case 'mobile': 
      case 'mobile app':
        return <FaMobileAlt className="text-green-500 text-sm" />;
      case 'web': 
      case 'web portal':
      case 'desktop':
        return <FaDesktop className="text-purple-500 text-sm" />;
      default: 
        return <FaClock className="text-gray-500 text-sm" />;
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

  // Filter data based on current filters - FIXED with array check
  const filteredData = Array.isArray(attendanceData) ? attendanceData.filter(record => {
    const matchesSearch = !filters.search || 
      record.employee_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.employee_id?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = filters.department === 'all' || 
      record.department === filters.department;
    
    const matchesStatus = filters.status === 'all' || 
      record.status?.toLowerCase() === filters.status.toLowerCase();

    return matchesSearch && matchesDepartment && matchesStatus;
  }) : [];

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
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Tracking</h1>
          <p className="text-gray-600">Monitor and manage employee attendance in real-time</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 flex-1">{error}</span>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Employees', value: stats.totalEmployees, icon: FaClock, color: 'blue' },
            { label: 'Present Today', value: stats.present, icon: FaUserCheck, color: 'green' },
            { label: 'Absent', value: stats.absent, icon: FaUserTimes, color: 'red' },
            { label: 'Late Arrivals', value: stats.late, icon: FaClock, color: 'yellow' },
            { label: 'On Time', value: stats.onTime, icon: FaUserCheck, color: 'purple' },
            { label: 'On Leave', value: stats.onLeave, icon: FaCalendarAlt, color: 'indigo' }
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

        {/* Filters and Actions */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <select 
              value={filters.employee_id}
              onChange={(e) => handleFilterChange('employee_id', e.target.value)}
              className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
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
              className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 justify-center"
              >
                <FaSync className={loading ? 'animate-spin' : ''} /> 
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex-1 justify-center"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check In/Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location/Device</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClock className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No attendance records found</p>
                        <p className="text-gray-500">Try adjusting your filters or refresh the data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {record.employee_name}
                          </div>
                          <div className="text-sm text-gray-500">{record.employee_id}</div>
                          <div className="text-xs text-gray-400">{record.department}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-green-500 text-sm" />
                            <span className="font-medium">{formatTime(record.check_in)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FaClock className="text-red-500 text-sm" />
                            <span className="font-medium">{formatTime(record.check_out)}</span>
                          </div>
                          {record.late_minutes > 0 && (
                            <div className="text-xs text-yellow-600 mt-1 font-medium">
                              Late by {record.late_minutes} minutes
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {record.total_hours || '0h 00m'}
                        </div>
                        {record.overtime && record.overtime !== '0h 00m' && (
                          <div className="text-xs text-blue-600 font-medium">
                            OT: {record.overtime}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(record.status)}>
                          {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          {getDeviceIcon(record.device)}
                          <div>
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400 text-sm" />
                              <span className="font-medium">{record.location || 'Unknown'}</span>
                            </div>
                            <div className="text-xs text-gray-500">{record.device || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!record.check_in && (
                            <button
                              onClick={() => handleClockIn(record.employee_id)}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Clock In
                            </button>
                          )}
                          {record.check_in && !record.check_out && (
                            <button
                              onClick={() => handleClockOut(record.employee_id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Clock Out
                            </button>
                          )}
                          {record.check_in && record.check_out && (
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Summary ({filters.start_date} to {filters.end_date})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Employees Present', value: stats.present, color: 'blue' },
              { label: 'On Time Rate', value: stats.totalEmployees > 0 ? Math.round((stats.onTime / stats.totalEmployees) * 100) : 0, color: 'green', suffix: '%' },
              { label: 'Late Arrival Rate', value: stats.totalEmployees > 0 ? Math.round((stats.late / stats.totalEmployees) * 100) : 0, color: 'yellow', suffix: '%' },
              { label: 'Absence Rate', value: stats.totalEmployees > 0 ? Math.round((stats.absent / stats.totalEmployees) * 100) : 0, color: 'red', suffix: '%' }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className={`text-2xl font-bold text-${item.color}-600`}>
                  {item.value}{item.suffix || ''}
                </div>
                <div className="text-sm text-gray-600 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;
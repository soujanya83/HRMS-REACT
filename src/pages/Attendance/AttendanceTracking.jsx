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
  FaDesktop
} from 'react-icons/fa';

// Static data for attendance records
const staticAttendanceData = [
  {
    id: 1,
    employee_id: 'EMP001',
    employee_name: 'John Smith',
    department: 'Engineering',
    date: '2024-03-20',
    check_in: '09:05 AM',
    check_out: '06:15 PM',
    total_hours: '9h 10m',
    status: 'Present',
    late_minutes: 5,
    overtime: '1h 15m',
    location: 'Office',
    device: 'Biometric',
    breaks: '1h 00m'
  },
  {
    id: 2,
    employee_id: 'EMP002',
    employee_name: 'Sarah Johnson',
    department: 'Marketing',
    date: '2024-03-20',
    check_in: '08:55 AM',
    check_out: '05:30 PM',
    total_hours: '8h 35m',
    status: 'Present',
    late_minutes: 0,
    overtime: '0h 00m',
    location: 'Office',
    device: 'Mobile App',
    breaks: '0h 45m'
  },
  {
    id: 3,
    employee_id: 'EMP003',
    employee_name: 'Mike Chen',
    department: 'Sales',
    date: '2024-03-20',
    check_in: '09:25 AM',
    check_out: '06:45 PM',
    total_hours: '9h 20m',
    status: 'Late',
    late_minutes: 25,
    overtime: '1h 45m',
    location: 'Remote',
    device: 'Web Portal',
    breaks: '1h 15m'
  },
  {
    id: 4,
    employee_id: 'EMP004',
    employee_name: 'Emily Davis',
    department: 'HR',
    date: '2024-03-20',
    check_in: '-',
    check_out: '-',
    total_hours: '0h 00m',
    status: 'Absent',
    late_minutes: 0,
    overtime: '0h 00m',
    location: '-',
    device: '-',
    breaks: '0h 00m'
  },
  {
    id: 5,
    employee_id: 'EMP005',
    employee_name: 'Robert Wilson',
    department: 'Engineering',
    date: '2024-03-20',
    check_in: '08:45 AM',
    check_out: '05:15 PM',
    total_hours: '8h 30m',
    status: 'Present',
    late_minutes: 0,
    overtime: '0h 15m',
    location: 'Office',
    device: 'Biometric',
    breaks: '0h 45m'
  },
  {
    id: 6,
    employee_id: 'EMP006',
    employee_name: 'Lisa Brown',
    department: 'Design',
    date: '2024-03-20',
    check_in: '09:15 AM',
    check_out: '06:30 PM',
    total_hours: '9h 15m',
    status: 'Late',
    late_minutes: 15,
    overtime: '1h 30m',
    location: 'Remote',
    device: 'Mobile App',
    breaks: '1h 00m'
  }
];

const AttendanceTracking = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '2024-03-20',
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
    onTime: 0
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAttendanceData(staticAttendanceData);
      calculateStats(staticAttendanceData);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (data) => {
    const present = data.filter(emp => emp.status === 'Present').length;
    const absent = data.filter(emp => emp.status === 'Absent').length;
    const late = data.filter(emp => emp.status === 'Late').length;
    const onTime = data.filter(emp => emp.status === 'Present' && emp.late_minutes === 0).length;

    setStats({
      totalEmployees: data.length,
      present,
      absent,
      late,
      onTime
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleExport = () => {
    alert('Exporting attendance data...');
    // In real implementation, this would generate and download a CSV/Excel file
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Half Day': 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Biometric': return <FaFingerprint className="text-blue-500" />;
      case 'Mobile App': return <FaMobileAlt className="text-green-500" />;
      case 'Web Portal': return <FaDesktop className="text-purple-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) {
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <input 
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Design">Design</option>
            </select>

            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaSync /> Refresh
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Breaks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">{record.employee_id}</div>
                    <div className="text-xs text-gray-400">{record.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-green-500" />
                        <span className="font-medium">{record.check_in}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaClock className="text-red-500" />
                        <span className="font-medium">{record.check_out}</span>
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
                      {record.total_hours}
                    </div>
                    {record.overtime !== '0h 00m' && (
                      <div className="text-xs text-blue-600">
                        OT: {record.overtime}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm">
                      {getDeviceIcon(record.device)}
                      <div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>{record.location}</span>
                        </div>
                        <div className="text-xs text-gray-500">{record.device}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.breaks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Employees Present</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.onTime / stats.totalEmployees) * 100)}%
              </div>
              <div className="text-sm text-gray-600">On Time Rate</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round((stats.late / stats.totalEmployees) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Late Arrival Rate</div>
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
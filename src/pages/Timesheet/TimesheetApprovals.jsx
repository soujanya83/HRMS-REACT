import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaSearch, 
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaDownload,
  FaThumbsUp,
  FaThumbsDown,
  FaSave,
  FaTimes,
  FaSpinner,
  FaUserTie,
  FaChartBar,
  FaFileInvoiceDollar
} from 'react-icons/fa';

const TimesheetApprovals = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    employee: 'all',
    date: '',
    search: ''
  });

  // Mock data
  const employees = [
    { id: 1, name: 'John Smith', department: 'Engineering' },
    { id: 2, name: 'Sarah Johnson', department: 'Marketing' },
    { id: 3, name: 'Mike Chen', department: 'Sales' },
    { id: 4, name: 'Lisa Brown', department: 'Design' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTimesheets([
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Smith',
          employee_department: 'Engineering',
          period: '2024-03-18 to 2024-03-24',
          total_hours: 42.5,
          regular_hours: 40,
          overtime_hours: 2.5,
          status: 'pending',
          submitted_date: '2024-03-25',
          projects: [
            { name: 'Website Redesign', hours: 32, billable: true },
            { name: 'Internal Training', hours: 8, billable: false },
            { name: 'Client Meeting', hours: 2.5, billable: true }
          ],
          notes: 'Completed frontend components and attended client demo'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Sarah Johnson',
          employee_department: 'Marketing',
          period: '2024-03-18 to 2024-03-24',
          total_hours: 38,
          regular_hours: 38,
          overtime_hours: 0,
          status: 'pending',
          submitted_date: '2024-03-25',
          projects: [
            { name: 'Q2 Campaign', hours: 30, billable: true },
            { name: 'Social Media', hours: 8, billable: true }
          ],
          notes: 'Finalized campaign assets and scheduled social posts'
        },
        {
          id: 3,
          employee_id: 3,
          employee_name: 'Mike Chen',
          employee_department: 'Sales',
          period: '2024-03-18 to 2024-03-24',
          total_hours: 45,
          regular_hours: 40,
          overtime_hours: 5,
          status: 'approved',
          submitted_date: '2024-03-24',
          approved_by: 'HR Manager',
          approved_date: '2024-03-25',
          projects: [
            { name: 'Client Proposals', hours: 35, billable: true },
            { name: 'Sales Training', hours: 10, billable: false }
          ],
          notes: 'Prepared proposals for enterprise clients'
        },
        {
          id: 4,
          employee_id: 4,
          employee_name: 'Lisa Brown',
          employee_department: 'Design',
          period: '2024-03-18 to 2024-03-24',
          total_hours: 41,
          regular_hours: 40,
          overtime_hours: 1,
          status: 'rejected',
          submitted_date: '2024-03-24',
          rejected_by: 'HR Manager',
          rejected_date: '2024-03-25',
          rejection_reason: 'Missing project codes',
          projects: [
            { name: 'UI Design System', hours: 35, billable: true },
            { name: 'Logo Redesign', hours: 6, billable: true }
          ],
          notes: 'Created design components and updated brand assets'
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleApprove = (id) => {
    setTimesheets(prev => prev.map(ts => 
      ts.id === id ? { 
        ...ts, 
        status: 'approved',
        approved_by: 'You',
        approved_date: new Date().toISOString().split('T')[0]
      } : ts
    ));
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      setTimesheets(prev => prev.map(ts => 
        ts.id === id ? { 
          ...ts, 
          status: 'rejected',
          rejected_by: 'You',
          rejected_date: new Date().toISOString().split('T')[0],
          rejection_reason: reason
        } : ts
      ));
    }
  };

  const handleViewDetails = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };
    return `px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="mr-1" />;
      case 'rejected': return <FaTimesCircle className="mr-1" />;
      default: return <FaClock className="mr-1" />;
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    if (filters.status !== 'all' && ts.status !== filters.status) return false;
    if (filters.employee !== 'all' && ts.employee_id.toString() !== filters.employee) return false;
    if (filters.search && !ts.employee_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: timesheets.filter(ts => ts.status === 'pending').length,
    approved: timesheets.filter(ts => ts.status === 'approved').length,
    rejected: timesheets.filter(ts => ts.status === 'rejected').length,
    total: timesheets.length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading timesheets data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Timesheet Approvals</h1>
          <p className="text-gray-600">Review and approve employee timesheets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</p>
              </div>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.rejected}</p>
              </div>
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Employee filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select 
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Date
              </label>
              <input 
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Timesheets Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%] min-w-[150px]">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[130px]">
                    Hours Breakdown
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[130px]">
                    Projects
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%] min-w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClock className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No timesheets found</p>
                        <p className="text-gray-500">No timesheets match the current filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                      {/* Employee */}
                      <td className="px-4 py-3 w-[22%] min-w-[180px]">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {timesheet.employee_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {timesheet.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {timesheet.employee_department}
                            </div>
                            <div className="text-xs text-gray-400">
                              Submitted: {formatDate(timesheet.submitted_date)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="px-4 py-3 w-[18%] min-w-[150px]">
                        <div className="text-sm text-gray-900">{timesheet.period}</div>
                      </td>

                      {/* Hours Breakdown */}
                      <td className="px-4 py-3 w-[16%] min-w-[130px]">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 mb-1">
                            {timesheet.total_hours}h total
                          </div>
                          <div className="text-sm text-gray-500">
                            Regular: {timesheet.regular_hours}h
                          </div>
                          {timesheet.overtime_hours > 0 && (
                            <div className="text-sm text-gray-500">
                              Overtime: {timesheet.overtime_hours}h
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Projects */}
                      <td className="px-4 py-3 w-[16%] min-w-[130px]">
                        <div className="space-y-1">
                          {timesheet.projects.slice(0, 2).map((project, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-900 truncate max-w-[80px]">
                                {project.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                project.billable 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {project.hours}h
                              </span>
                            </div>
                          ))}
                          {timesheet.projects.length > 2 && (
                            <div className="text-xs text-blue-600">
                              +{timesheet.projects.length - 2} more projects
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 w-[12%] min-w-[100px]">
                        <div className="flex flex-col space-y-1">
                          <span className={getStatusBadge(timesheet.status)}>
                            {getStatusIcon(timesheet.status)}
                            {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                          </span>
                          {timesheet.approved_by && (
                            <div className="text-xs text-gray-500">
                              Approved by: {timesheet.approved_by}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 w-[16%] min-w-[140px] text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(timesheet)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                            title="View Details"
                          >
                            <FaEye /> Details
                          </button>
                          {timesheet.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(timesheet.id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Approve"
                              >
                                <FaThumbsUp />
                              </button>
                              <button
                                onClick={() => handleReject(timesheet.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Reject"
                              >
                                <FaThumbsDown />
                              </button>
                            </>
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

        {/* Summary Footer */}
        {filteredTimesheets.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredTimesheets.length} of {timesheets.length} timesheets
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Pending approvals:{" "}
                <span className="text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet Detail Modal */}
        {showDetailModal && selectedTimesheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Timesheet Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Employee Information</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-base">
                        {selectedTimesheet.employee_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedTimesheet.employee_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTimesheet.employee_department}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span> {formatDate(selectedTimesheet.submitted_date)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Hours Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-gray-800">{selectedTimesheet.total_hours}h</div>
                        <div className="text-xs text-gray-600">Total Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-green-600">{selectedTimesheet.regular_hours}h</div>
                        <div className="text-xs text-gray-600">Regular Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-orange-600">{selectedTimesheet.overtime_hours}h</div>
                        <div className="text-xs text-gray-600">Overtime Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {selectedTimesheet.projects.filter(p => p.billable).reduce((sum, p) => sum + p.hours, 0)}h
                        </div>
                        <div className="text-xs text-gray-600">Billable Hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Period</h3>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedTimesheet.period}
                  </div>
                </div>

                {/* Projects Breakdown */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Project Breakdown</h3>
                  <div className="space-y-2">
                    {selectedTimesheet.projects.map((project, index) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-gray-500">{project.hours}h • {project.billable ? 'Billable' : 'Non-Billable'}</div>
                        </div>
                        <div className="text-gray-900">
                          {project.billable ? `$${(project.hours * 75).toFixed(0)}` : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedTimesheet.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Employee Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedTimesheet.notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedTimesheet.rejection_reason && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Rejection Reason</h3>
                    <p className="text-sm text-red-700 bg-red-50 p-4 rounded-lg">
                      {selectedTimesheet.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTimesheet.status === 'pending' && (
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleReject(selectedTimesheet.id)}
                      className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTimesheet.id)}
                      className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <FaSave /> Approve Timesheet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetApprovals;
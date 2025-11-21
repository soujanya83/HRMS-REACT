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
  FaSave
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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return `px-1.5 py-0.5 inline-flex items-center text-[10px] font-semibold rounded-full ${styles[status]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500 text-[10px]" />;
      case 'rejected': return <FaTimesCircle className="text-red-500 text-[10px]" />;
      default: return <FaClock className="text-yellow-500 text-[10px]" />;
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

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600 text-lg" />
            Timesheet Approvals
          </h1>
          <p className="text-xs text-gray-600">Review and approve employee timesheets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Submissions</p>
                <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending Review</p>
                <p className="text-lg font-bold text-gray-800">{stats.pending}</p>
              </div>
              <FaClock className="text-yellow-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-gray-800">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-base" />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Rejected</p>
                <p className="text-lg font-bold text-gray-800">{stats.rejected}</p>
              </div>
              <FaTimesCircle className="text-red-500 text-base" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 p-3 bg-white shadow rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 text-xs" />
              <input 
                type="text"
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full border border-gray-300 pl-7 pr-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              value={filters.employee}
              onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <input 
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex gap-1">
              <button className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex-1">
                <FaDownload className="text-xs" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Timesheets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Employee</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Period</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Hours</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Projects</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                          {timesheet.employee_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-[10px]">
                            {timesheet.employee_name}
                          </div>
                          <div className="text-gray-500 text-[10px]">
                            {timesheet.employee_department}
                          </div>
                          <div className="text-gray-400 text-[10px]">
                            Submitted: {new Date(timesheet.submitted_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-gray-900 text-[10px]">{timesheet.period}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-[10px]">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-900">{timesheet.total_hours}h</span>
                          <span className="text-gray-500">total</span>
                        </div>
                        <div className="text-gray-500">
                          Regular: {timesheet.regular_hours}h
                          {timesheet.overtime_hours > 0 && ` • OT: ${timesheet.overtime_hours}h`}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {timesheet.projects.slice(0, 2).map((project, index) => (
                          <span 
                            key={index}
                            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                              project.billable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {project.name} ({project.hours}h)
                          </span>
                        ))}
                        {timesheet.projects.length > 2 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded-full">
                            +{timesheet.projects.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1 mb-1">
                        {getStatusIcon(timesheet.status)}
                        <span className={getStatusBadge(timesheet.status)}>
                          {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                        </span>
                      </div>
                      {timesheet.approved_by && (
                        <div className="text-gray-500 text-[10px]">
                          By: {timesheet.approved_by}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewDetails(timesheet)}
                          className="p-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 transition-colors"
                          title="Details"
                        >
                          <FaEye size={8} />
                        </button>
                        {timesheet.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(timesheet.id)}
                              className="p-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-700 transition-colors"
                              title="Approve"
                            >
                              <FaThumbsUp size={8} />
                            </button>
                            <button
                              onClick={() => handleReject(timesheet.id)}
                              className="p-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 transition-colors"
                              title="Reject"
                            >
                              <FaThumbsDown size={8} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTimesheets.length === 0 && (
              <div className="text-center py-8">
                <FaClock className="mx-auto text-2xl text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-800 mb-1">No Timesheets Found</h3>
                <p className="text-gray-600 text-xs">No timesheets match the current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Timesheet Detail Modal */}
        {showDetailModal && selectedTimesheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Timesheet Details</h2>
                  <p className="text-gray-600 text-xs">{selectedTimesheet.period}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="text-lg" />
                </button>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold text-gray-800 text-xs mb-2">Employee Information</h3>
                  <p className="text-gray-600 text-xs">{selectedTimesheet.employee_name}</p>
                  <p className="text-gray-600 text-xs">{selectedTimesheet.employee_department}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold text-gray-800 text-xs mb-2">Hours Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Total Hours</p>
                      <p className="font-semibold">{selectedTimesheet.total_hours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Regular</p>
                      <p className="font-semibold">{selectedTimesheet.regular_hours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Overtime</p>
                      <p className="font-semibold">{selectedTimesheet.overtime_hours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Billable</p>
                      <p className="font-semibold">
                        {selectedTimesheet.projects.filter(p => p.billable).reduce((sum, p) => sum + p.hours, 0)}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Breakdown */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 text-xs mb-3">Project Breakdown</h3>
                <div className="space-y-2">
                  {selectedTimesheet.projects.map((project, index) => (
                    <div key={index} className="flex justify-between items-center text-xs border-b pb-2">
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
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 text-xs mb-2">Employee Notes</h3>
                  <p className="text-gray-700 text-xs bg-gray-50 p-3 rounded">
                    {selectedTimesheet.notes}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedTimesheet.rejection_reason && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 text-xs mb-2">Rejection Reason</h3>
                  <p className="text-red-700 text-xs bg-red-50 p-3 rounded">
                    {selectedTimesheet.rejection_reason}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedTimesheet.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleReject(selectedTimesheet.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTimesheet.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <FaSave size={12} /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetApprovals;
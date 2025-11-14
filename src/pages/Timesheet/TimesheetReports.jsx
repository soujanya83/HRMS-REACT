import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaDownload, 
  FaFilter, 
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaDollarSign,
  FaClock,
  FaChartLine,
  FaChartPie,
  FaTable
} from 'react-icons/fa';

const TimesheetReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('summary'); // 'summary', 'detailed', 'analytics'
  const [filters, setFilters] = useState({
    period: 'month',
    employee: 'all',
    project: 'all',
    startDate: '2024-03-01',
    endDate: '2024-03-31'
  });

  // Mock data
  const employees = [
    { id: 1, name: 'John Smith', department: 'Engineering' },
    { id: 2, name: 'Sarah Johnson', department: 'Marketing' },
    { id: 3, name: 'Mike Chen', department: 'Sales' },
    { id: 4, name: 'Lisa Brown', department: 'Design' }
  ];

  const projects = [
    'Website Redesign',
    'Mobile App Development',
    'Q2 Marketing Campaign',
    'Client Proposals',
    'Internal Training'
  ];

  useEffect(() => {
    setTimeout(() => {
      setReports([
        {
          id: 1,
          employee_name: 'John Smith',
          department: 'Engineering',
          total_hours: 168,
          billable_hours: 145,
          non_billable_hours: 23,
          overtime_hours: 15,
          projects_count: 3,
          hourly_rate: 75,
          total_cost: 12600,
          billable_amount: 10875,
          utilization_rate: 86.3
        },
        {
          id: 2,
          employee_name: 'Sarah Johnson',
          department: 'Marketing',
          total_hours: 154,
          billable_hours: 130,
          non_billable_hours: 24,
          overtime_hours: 8,
          projects_count: 2,
          hourly_rate: 65,
          total_cost: 10010,
          billable_amount: 8450,
          utilization_rate: 84.4
        },
        {
          id: 3,
          employee_name: 'Mike Chen',
          department: 'Sales',
          total_hours: 160,
          billable_hours: 140,
          non_billable_hours: 20,
          overtime_hours: 12,
          projects_count: 2,
          hourly_rate: 70,
          total_cost: 11200,
          billable_amount: 9800,
          utilization_rate: 87.5
        },
        {
          id: 4,
          employee_name: 'Lisa Brown',
          department: 'Design',
          total_hours: 152,
          billable_hours: 135,
          non_billable_hours: 17,
          overtime_hours: 6,
          projects_count: 3,
          hourly_rate: 68,
          total_cost: 10336,
          billable_amount: 9180,
          utilization_rate: 88.8
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalHours: reports.reduce((sum, report) => sum + report.total_hours, 0),
    billableHours: reports.reduce((sum, report) => sum + report.billable_hours, 0),
    overtimeHours: reports.reduce((sum, report) => sum + report.overtime_hours, 0),
    totalCost: reports.reduce((sum, report) => sum + report.total_cost, 0),
    billableAmount: reports.reduce((sum, report) => sum + report.billable_amount, 0),
    avgUtilization: reports.reduce((sum, report) => sum + report.utilization_rate, 0) / reports.length
  };

  const projectBreakdown = [
    { project: 'Website Redesign', hours: 320, cost: 22400, billable: true },
    { project: 'Mobile App Development', hours: 280, cost: 19600, billable: true },
    { project: 'Q2 Marketing Campaign', hours: 180, cost: 11700, billable: true },
    { project: 'Client Proposals', hours: 120, cost: 8400, billable: true },
    { project: 'Internal Training', hours: 84, cost: 5880, billable: false }
  ];

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Timesheet Reports</h1>
          <p className="text-gray-600">Analytics and insights from timesheet data</p>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-2 p-1 bg-white rounded-lg shadow-sm w-fit">
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded-md transition-colors ${
              view === 'summary' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaChartPie className="inline mr-2" /> Summary
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 rounded-md transition-colors ${
              view === 'detailed' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaTable className="inline mr-2" /> Detailed
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`px-4 py-2 rounded-md transition-colors ${
              view === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaChartLine className="inline mr-2" /> Analytics
          </button>
        </div>

        {/* Report Filters */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              value={filters.period}
              onChange={(e) => setFilters(prev => ({...prev, period: e.target.value}))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <select 
              value={filters.employee}
              onChange={(e) => setFilters(prev => ({...prev, employee: e.target.value}))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            
            <select 
              value={filters.project}
              onChange={(e) => setFilters(prev => ({...prev, project: e.target.value}))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter /> Apply Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FaDownload /> Export Report
            </button>
          </div>
        </div>

        {/* Summary View */}
        {view === 'summary' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalHours}h</p>
                    <p className="text-xs text-gray-500">Billable: {stats.billableHours}h</p>
                  </div>
                  <FaClock className="text-blue-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-800">${stats.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Billable: ${stats.billableAmount.toLocaleString()}</p>
                  </div>
                  <FaDollarSign className="text-green-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overtime</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.overtimeHours}h</p>
                    <p className="text-xs text-gray-500">This period</p>
                  </div>
                  <FaChartBar className="text-orange-500 text-xl" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.avgUtilization.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Average rate</p>
                  </div>
                  <FaChartPie className="text-purple-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Employee Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Utilization</h3>
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.employee_name}</div>
                          <div className="text-xs text-gray-500">{report.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{report.utilization_rate}%</div>
                        <div className="text-xs text-gray-500">{report.billable_hours}/{report.total_hours}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Breakdown</h3>
                <div className="space-y-4">
                  {projectBreakdown.map((project, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBriefcase className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.project}</div>
                          <div className="text-xs text-gray-500">
                            {project.billable ? 'Billable' : 'Non-Billable'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{project.hours}h</div>
                        <div className="text-xs text-gray-500">${project.cost.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detailed View */}
        {view === 'detailed' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Timesheet Report</h3>
              <p className="text-sm text-gray-600">March 1 - March 31, 2024</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Billable Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Overtime</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Utilization</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{report.employee_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">{report.total_hours}h</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.billable_hours}h</div>
                        <div className="text-xs text-gray-500">
                          {((report.billable_hours / report.total_hours) * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-600">{report.overtime_hours}h</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {report.projects_count} projects
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${report.utilization_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{report.utilization_rate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ${report.total_cost.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Billable: ${report.billable_amount.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hours Distribution</h3>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{report.employee_name}</span>
                      <span>{report.total_hours}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(report.total_hours / 200) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Billable: {report.billable_hours}h</span>
                      <span>Non-billable: {report.non_billable_hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Analysis</h3>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{report.employee_name}</span>
                      <span>${report.total_cost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(report.total_cost / 15000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Hourly: ${report.hourly_rate}/h</span>
                      <span>Billable: ${report.billable_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetReports;
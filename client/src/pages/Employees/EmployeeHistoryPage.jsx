import React, { useState, useMemo, useEffect } from 'react';
// THE FIX: Added HiOutlineBriefcase to the import list
import { 
    HiOutlineArchive, HiOutlineFilter, HiOutlineCalendar, HiOutlineUser, 
    HiOutlineArrowUp, HiOutlineSwitchHorizontal, HiOutlineX, HiOutlinePencil, 
    HiOutlineBriefcase 
} from 'react-icons/hi';

// --- Mock Data (Simulates API responses) ---
const mockHistory = [
  { id: 1, employee_name: 'Priya Sharma', employee_id: 1, event_type: 'Promotion', details: 'Promoted to Senior Software Engineer', changed_by: 'Dilnawaz Khan', date: '2025-10-22' },
  { id: 2, employee_name: 'Amit Singh', employee_id: 2, event_type: 'Transfer', details: 'Transferred from Sales to Marketing', changed_by: 'HR Admin', date: '2025-10-20' },
  { id: 3, employee_name: 'John Doe', employee_id: 3, event_type: 'Salary Update', details: 'Annual salary increased by 5%', changed_by: 'HR Admin', date: '2025-10-18' },
  { id: 4, employee_name: 'Priya Sharma', employee_id: 1, event_type: 'Profile Update', details: 'Updated emergency contact information', changed_by: 'Priya Sharma', date: '2025-10-15' },
  { id: 5, employee_name: 'Jane Smith', employee_id: 4, event_type: 'Termination', details: 'Voluntary resignation. Last working day: 2025-10-10', changed_by: 'HR Admin', date: '2025-10-10' },
  { id: 6, employee_name: 'Amit Singh', employee_id: 2, event_type: 'Designation Change', details: 'Role changed to Marketing Manager', changed_by: 'HR Admin', date: '2025-10-20' },
];

const mockEmployees = [
  { id: 1, name: 'Priya Sharma' },
  { id: 2, name: 'Amit Singh' },
  { id: 3, name: 'John Doe' },
  { id: 4, name: 'Jane Smith' },
];

const eventTypes = [
  'Promotion', 'Transfer', 'Salary Update', 'Profile Update', 'Termination', 'Designation Change'
];

// --- Helper Component: Status Badge ---
const EventBadge = ({ type }) => {
  const config = {
    'Promotion': { icon: HiOutlineArrowUp, color: 'bg-green-100 text-green-800' },
    'Transfer': { icon: HiOutlineSwitchHorizontal, color: 'bg-blue-100 text-blue-800' },
    'Salary Update': { icon: HiOutlinePencil, color: 'bg-yellow-100 text-yellow-800' },
    'Termination': { icon: HiOutlineX, color: 'bg-red-100 text-red-800' },
    'Profile Update': { icon: HiOutlineUser, color: 'bg-indigo-100 text-indigo-800' },
    'Designation Change': { icon: HiOutlineBriefcase, color: 'bg-purple-100 text-purple-800' },
  };
  const { icon: Icon, color } = config[type] || { icon: HiOutlineArchive, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-4 w-4" />
      {type}
    </span>
  );
};

// --- Main Page Component ---
const EmployeeHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeId: 'all',
    eventType: 'all',
    startDate: '',
    endDate: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setHistory(mockHistory);
      setEmployees(mockEmployees);
      setLoading(false);
    }, 500);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filtered and Paginated Data
  const filteredHistory = useMemo(() => {
    return history.filter(event => {
      const eventDate = new Date(event.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (filters.employeeId !== 'all' && event.employee_id.toString() !== filters.employeeId) return false;
      if (filters.eventType !== 'all' && event.event_type !== filters.eventType) return false;
      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
      
      return true;
    });
  }, [history, filters]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Employee History</h1>
          <p className="mt-1 text-sm text-gray-500">
            A complete audit log of all employee changes and life-cycle events.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FilterInput
              label="Filter by Employee"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
            >
              <option value="all">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </FilterInput>
            <FilterInput
              label="Filter by Event"
              name="eventType"
              value={filters.eventType}
              onChange={handleFilterChange}
            >
              <option value="all">All Event Types</option>
              {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </FilterInput>
            <FilterInput
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            <FilterInput
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">Loading history...</td></tr>
                ) : paginatedHistory.length > 0 ? (
                  paginatedHistory.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.employee_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EventBadge type={event.event_type} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={event.details}>{event.details}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.changed_by}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No history found for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination would go here */}
        </div>
      </div>
    </div>
  );
};

// --- Helper Filter Component ---
const FilterInput = ({ label, name, type = 'select', children, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    {type === 'select' ? (
      <select
        id={name}
        name={name}
        {...props}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        {...props}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    )}
  </div>
);

export default EmployeeHistoryPage;

import React, { useState, useEffect } from 'react';
import { 
  HiOutlineArchive, HiOutlineFilter, HiOutlineCalendar, HiOutlineUser, 
  HiOutlineArrowUp, HiOutlineSwitchHorizontal, HiOutlineX, HiOutlinePencil, 
  HiOutlineBriefcase, HiOutlinePlus, HiOutlineTrash, HiOutlineEye
} from 'react-icons/hi';
import { 
  getEmploymentHistory, 
  getEmploymentHistoryByEmployee,
  createEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory 
} from '../../services/employmentHistoryService';

// Helper Component: Status Badge
const EventBadge = ({ type }) => {
  const config = {
    'Promotion': { icon: HiOutlineArrowUp, color: 'bg-green-100 text-green-800' },
    'Transfer': { icon: HiOutlineSwitchHorizontal, color: 'bg-blue-100 text-blue-800' },
    'Salary Update': { icon: HiOutlinePencil, color: 'bg-yellow-100 text-yellow-800' },
    'Termination': { icon: HiOutlineX, color: 'bg-red-100 text-red-800' },
    'Profile Update': { icon: HiOutlineUser, color: 'bg-indigo-100 text-indigo-800' },
    'Designation Change': { icon: HiOutlineBriefcase, color: 'bg-purple-100 text-purple-800' },
    'Joining': { icon: HiOutlineUser, color: 'bg-green-100 text-green-800' },
    'Resignation': { icon: HiOutlineX, color: 'bg-red-100 text-red-800' },
  };
  const { icon: Icon, color } = config[type] || { icon: HiOutlineArchive, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-4 w-4" />
      {type}
    </span>
  );
};

// Main Page Component
const EmployeeHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    employeeId: 'all',
    eventType: 'all',
    startDate: '',
    endDate: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    event_type: '',
    event_date: '',
    details: '',
    previous_data: '',
    new_data: '',
    changed_by: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    fetchHistory();
    fetchEmployees(); // You'll need to implement this based on your employee API
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmploymentHistory();
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employment history:', error);
      setError('Failed to load employment history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    // This should call your employee API to get the list of employees
    // For now, using static data
    setEmployees([
      { id: 1, name: 'Priya Sharma' },
      { id: 2, name: 'Amit Singh' },
      { id: 3, name: 'John Doe' },
      { id: 4, name: 'Jane Smith' },
    ]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await updateEmploymentHistory(editingRecord.id, formData);
      } else {
        await createEmploymentHistory(formData);
      }
      setShowForm(false);
      setEditingRecord(null);
      setFormData({
        employee_id: '',
        event_type: '',
        event_date: '',
        details: '',
        previous_data: '',
        new_data: '',
        changed_by: ''
      });
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error('Error saving employment history:', error);
      alert('Failed to save employment history record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      employee_id: record.employee_id,
      event_type: record.event_type,
      event_date: record.event_date,
      details: record.details,
      previous_data: record.previous_data || '',
      new_data: record.new_data || '',
      changed_by: record.changed_by || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await deleteEmploymentHistory(id);
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error('Error deleting employment history:', error);
      alert('Failed to delete employment history record');
    }
  };

  const handleViewEmployeeHistory = async (employeeId) => {
    setLoading(true);
    try {
      const response = await getEmploymentHistoryByEmployee(employeeId);
      setHistory(response.data.data || []);
      setFilters(prev => ({ ...prev, employeeId: employeeId.toString() }));
    } catch (error) {
      console.error('Error fetching employee history:', error);
      setError('Failed to load employee history');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      employeeId: 'all',
      eventType: 'all',
      startDate: '',
      endDate: '',
    });
    fetchHistory();
  };

  // Filtered and Paginated Data
  const filteredHistory = history.filter(record => {
    const eventDate = new Date(record.event_date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (filters.employeeId !== 'all' && record.employee_id.toString() !== filters.employeeId) return false;
    if (filters.eventType !== 'all' && record.event_type !== filters.eventType) return false;
    if (startDate && eventDate < startDate) return false;
    if (endDate && eventDate > endDate) return false;
    
    return true;
  });

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const eventTypes = [
    'Promotion', 'Transfer', 'Salary Update', 'Profile Update', 
    'Termination', 'Designation Change', 'Joining', 'Resignation'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employment History</h1>
            <p className="mt-1 text-sm text-gray-500">
              A complete audit log of all employee changes and life-cycle events.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Add Record
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingRecord ? 'Edit Employment History' : 'Add Employment History'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee_id"
                      value={formData.employee_id}
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
                      Event Type *
                    </label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Event Type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Changed By
                    </label>
                    <input
                      type="text"
                      name="changed_by"
                      value={formData.changed_by}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter name of person who made changes"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details *
                    </label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter detailed description of the event..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Data
                    </label>
                    <textarea
                      name="previous_data"
                      value={formData.previous_data}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Previous data (if applicable)..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Data
                    </label>
                    <textarea
                      name="new_data"
                      value={formData.new_data}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New data (if applicable)..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                      setFormData({
                        employee_id: '',
                        event_type: '',
                        event_date: '',
                        details: '',
                        previous_data: '',
                        new_data: '',
                        changed_by: ''
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
                    {editingRecord ? 'Update Record' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading employment history...</td></tr>
                ) : paginatedHistory.length > 0 ? (
                  paginatedHistory.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.employee_name || `Employee ${record.employee_id}`}
                        </div>
                        <button
                          onClick={() => handleViewEmployeeHistory(record.employee_id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                        >
                          <HiOutlineEye className="h-3 w-3" />
                          View All History
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EventBadge type={record.event_type} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs">{record.details}</p>
                        {record.previous_data && (
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Before:</strong> {record.previous_data}
                          </p>
                        )}
                        {record.new_data && (
                          <p className="text-xs text-gray-500">
                            <strong>After:</strong> {record.new_data}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.changed_by || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.event_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <HiOutlinePencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-6 text-center text-gray-500">No employment history found for the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredHistory.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage * itemsPerPage >= filteredHistory.length}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Filter Component
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
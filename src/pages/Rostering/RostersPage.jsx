// pages/RostersPage.js
import React, { useState, useEffect } from "react";
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
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaRegCalendarPlus,
  FaTimes
} from "react-icons/fa";
import rosterService from "../../services/rosterService"; 
import { useOrganizations } from "../../contexts/OrganizationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RostersPage = () => {
  const { selectedOrganization } = useOrganizations();
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    department: "all",
    shiftType: "all",
    search: "",
    dateRange: "",
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    shift_id: "",
    roster_date: "",
    start_time: "",
    end_time: "",
    notes: ""
  });

  // State for data from API
  const [rosters, setRosters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    totalEmployees: 0,
    scheduledThisWeek: 0,
    differentShifts: 0,
    coverageRate: 0,
  });

  // Get shift color style
  const getShiftColor = (shiftId) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      borderColor: '#d1d5db'
    };

    if (shift.color_code) {
      return {
        backgroundColor: `${shift.color_code}20`,
        color: shift.color_code,
        borderColor: shift.color_code,
        borderWidth: '1px',
        borderStyle: 'solid'
      };
    }

    const defaultColors = {
      "Morning Shift": { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
      "Evening Shift": { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      "Night Shift": { bg: '#f3e8ff', text: '#6b21a8', border: '#c084fc' },
      "Day Shift": { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      "General Shift": { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
      "Mid Shift": { bg: '#fce7f3', text: '#9d174d', border: '#f472b6' },
      "Test": { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' },
    };

    return defaultColors[shift.name] || { 
      backgroundColor: '#f3f4f6', 
      color: '#374151', 
      borderColor: '#d1d5db' 
    };
  };

  // Fetch all data
  // In your fetchData function in RostersPage.jsx
const fetchData = async () => {
  try {
    setLoading(true);
    setRefreshing(true);

    // Check if we have an organization selected
    if (!selectedOrganization?.id) {
      toast.error("Please select an organization first");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Fetch rosters, employees, and shifts in parallel
    const [rostersRes, employeesRes, shiftsRes] = await Promise.all([
      rosterService.getRosters({ organization_id: selectedOrganization.id }),
      rosterService.getEmployees({ organization_id: selectedOrganization.id }),
      rosterService.getShifts({ organization_id: selectedOrganization.id })
    ]);

    // Handle responses
    if (rostersRes.data?.success) {
      setRosters(rostersRes.data.data || []);
    }

    if (employeesRes.data?.success) {
      setEmployees(employeesRes.data.data || []);
    }

    if (shiftsRes.data?.success) {
      setShifts(shiftsRes.data.data || []);
    }

    // Try to fetch departments - FIXED: Using organization ID in URL
    let departmentsRes;
    try {
      departmentsRes = await rosterService.getDepartments(selectedOrganization.id);
      console.log("Departments response:", departmentsRes);
      
      if (departmentsRes.data?.success) {
        setDepartments(departmentsRes.data.data || []);
      } else if (Array.isArray(departmentsRes.data)) {
        setDepartments(departmentsRes.data || []);
      } else if (departmentsRes.data && typeof departmentsRes.data === 'object') {
        // Handle if departments are nested in a data property
        setDepartments(departmentsRes.data.data || departmentsRes.data || []);
      } else {
        setDepartments([]);
      }
    } catch (deptError) {
      console.warn('Could not fetch departments:', deptError);
      // Fallback: Try to get all departments
      try {
        const allDeptsRes = await rosterService.getAllDepartments();
        if (allDeptsRes.data?.success) {
          setDepartments(allDeptsRes.data.data || []);
        } else if (Array.isArray(allDeptsRes.data)) {
          setDepartments(allDeptsRes.data || []);
        } else {
          setDepartments([]);
        }
      } catch (fallbackError) {
        console.warn('Fallback departments fetch failed:', fallbackError);
        setDepartments([]);
      }
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load data. Please try again.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Calculate statistics
  useEffect(() => {
    if (rosters.length > 0 && employees.length > 0) {
      calculateStats();
    }
  }, [rosters, employees, currentDate, view]);

  const calculateStats = () => {
    let periodRosters = [];
    
    if (view === "week") {
      const weekDates = getWeekDates();
      periodRosters = rosters.filter(roster => {
        if (!roster.roster_date) return false;
        const rosterDate = new Date(roster.roster_date);
        return rosterDate >= weekDates[0] && rosterDate <= weekDates[6];
      });
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      periodRosters = rosters.filter(roster => {
        if (!roster.roster_date) return false;
        const rosterDate = new Date(roster.roster_date);
        return rosterDate.getFullYear() === year && rosterDate.getMonth() === month;
      });
    }

    // Get unique shift types
    const uniqueShifts = [...new Set(periodRosters.map(roster => roster.shift_id))];

    // Calculate coverage rate
    const totalShifts = periodRosters.length;
    const expectedShifts = employees.length * (view === "week" ? 5 : 20);
    const coverageRate = expectedShifts > 0 ? Math.round((totalShifts / expectedShifts) * 100) : 0;

    setStats({
      totalEmployees: employees.length,
      scheduledThisWeek: periodRosters.length,
      differentShifts: uniqueShifts.length,
      coverageRate: coverageRate,
    });
  };

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  // Open modal for adding roster
  const handleAddRoster = (date, employeeId, employee) => {
    setModalMode("add");
    setSelectedDate(date);
    setSelectedEmployee(employeeId);
    
    // Format date for form
    const formattedDate = date.toISOString().split('T')[0];
    
    setFormData({
      employee_id: employeeId,
      shift_id: "",
      roster_date: formattedDate,
      start_time: "",
      end_time: "",
      notes: ""
    });
    
    // Pre-fill shift times if we have default shift
    const defaultShift = shifts.find(s => s.id === 1); // Morning shift as default
    if (defaultShift) {
      setFormData(prev => ({
        ...prev,
        shift_id: defaultShift.id,
        start_time: defaultShift.start_time?.slice(0, 5) || "09:00",
        end_time: defaultShift.end_time?.slice(0, 5) || "17:00"
      }));
    }
    
    setShowModal(true);
  };

  // Open modal for editing roster
  const handleEditRoster = (roster) => {
    setModalMode("edit");
    setSelectedRoster(roster);
    
    const shift = shifts.find(s => s.id === roster.shift_id);
    
    setFormData({
      employee_id: roster.employee_id,
      shift_id: roster.shift_id,
      roster_date: roster.roster_date.split('T')[0],
      start_time: shift?.start_time?.slice(0, 5) || "",
      end_time: shift?.end_time?.slice(0, 5) || "",
      notes: roster.notes || ""
    });
    
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If shift is changed, update times from shift data
    if (name === "shift_id" && value) {
      const selectedShift = shifts.find(s => s.id === parseInt(value));
      if (selectedShift) {
        setFormData(prev => ({
          ...prev,
          start_time: selectedShift.start_time?.slice(0, 5) || "",
          end_time: selectedShift.end_time?.slice(0, 5) || ""
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const rosterData = {
        organization_id: selectedOrganization.id,
        employee_id: formData.employee_id,
        shift_id: formData.shift_id,
        roster_date: formData.roster_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        created_by: 4 // Assuming this is the logged in user ID
      };

      if (modalMode === "add") {
        const response = await rosterService.createRoster(rosterData);
        if (response.data?.success) {
          toast.success("Roster created successfully!");
          fetchData();
          setShowModal(false);
        } else {
          toast.error("Failed to create roster");
        }
      } else {
        // Edit mode
        const response = await rosterService.updateRoster(selectedRoster.id, rosterData);
        if (response.data?.success) {
          toast.success("Roster updated successfully!");
          fetchData();
          setShowModal(false);
        } else {
          toast.error("Failed to update roster");
        }
      }
    } catch (error) {
      console.error("Error saving roster:", error);
      toast.error("Failed to save roster");
    }
  };

  // Handle delete roster
  const handleDeleteRoster = async (rosterId) => {
    if (window.confirm("Are you sure you want to delete this roster entry?")) {
      try {
        const response = await rosterService.deleteRoster(rosterId);
        if (response.data?.success) {
          toast.success("Roster deleted successfully");
          fetchData();
        } else {
          toast.error("Failed to delete roster");
        }
      } catch (error) {
        console.error("Error deleting roster:", error);
        toast.error("Failed to delete roster");
      }
    }
  };

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Get Sunday of current week
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

    return dates;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Get rosters for employee and date
  const getRostersForEmployeeAndDate = (employeeId, date) => {
    if (!date) return [];
    const dateString = date.toISOString().split("T")[0];
    
    return rosters.filter(
      (roster) => 
        roster.employee_id === employeeId && 
        roster.roster_date && 
        new Date(roster.roster_date).toISOString().split("T")[0] === dateString
    );
  };

  // Filter employees based on search and department
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment =
      filters.department === "all" ||
      employee.department_id?.toString() === filters.department;
    const matchesSearch =
      filters.search === "" ||
      employee.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employee_code?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    toast.info("Export feature coming soon!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddNewRoster = () => {
    setModalMode("add");
    setFormData({
      employee_id: "",
      shift_id: "",
      roster_date: new Date().toISOString().split('T')[0],
      start_time: "",
      end_time: "",
      notes: ""
    });
    setShowModal(true);
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown Employee";
  };

  // If no organization is selected
  if (!selectedOrganization?.id) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600 mb-4">Please select an organization to view rosters</p>
        </div>
      </div>
    );
  }

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
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Add/Edit Roster Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Add Roster" : "Edit Roster"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {modalMode === "add" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee
                      </label>
                      <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name} ({employee.employee_code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {getEmployeeName(formData.employee_id)}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift
                    </label>
                    <select
                      name="shift_id"
                      value={formData.shift_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Shift</option>
                      {shifts.map(shift => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="roster_date"
                      value={formData.roster_date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === "add" ? "Add Roster" : "Update Roster"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header with Organization Info */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-3 text-blue-600" />
                {view === "week" ? "Weekly Rosters" : "Monthly Rosters"}
              </h1>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Organization:</span> {selectedOrganization.name}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalEmployees}
                </p>
              </div>
              <FaUsers className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{view === "week" ? "Scheduled This Week" : "Scheduled This Month"}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.scheduledThisWeek}
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
                  {stats.differentShifts}
                </p>
              </div>
              <FaExchangeAlt className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coverage Rate</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.coverageRate}%
                </p>
              </div>
              <FaUsers className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* View Toggle and Date Navigation */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Month View
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 hover:bg-gray-100 rounded-full border"
            >
              <FaChevronLeft />
            </button>
            <div className="text-lg font-semibold">
              {view === "week"
                ? `Week of ${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
            </div>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 hover:bg-gray-100 rounded-full border"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload /> Export
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPrint /> Print
            </button>
            <button 
              onClick={handleAddNewRoster}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaPlus /> Add Roster
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
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={filters.shiftType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, shiftType: e.target.value }))
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shift Types</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              <FaFilter /> More Filters
            </button>
          </div>
        </div>

        {/* Weekly Roster View */}
        {view === "week" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-8 border-b">
              <div className="p-4 font-semibold bg-gray-50 sticky left-0 z-10">Employee</div>
              {weekDates.map((day) => (
                <div
                  key={day.toString()}
                  className={`p-4 text-center font-semibold border-l bg-gray-50 ${
                    day.toDateString() === new Date().toDateString() ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="text-sm">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`text-xs ${
                    day.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : 'text-gray-500'
                  }`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div key={employee.id} className="grid grid-cols-8 border-b hover:bg-gray-50">
                    <div className="p-4 border-r bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                      <div className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.employee_code}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {departments.find(d => d.id === employee.department_id)?.name || "N/A"}
                      </div>
                    </div>
                    {weekDates.map((day) => {
                      const dayRosters = getRostersForEmployeeAndDate(employee.id, day);

                      return (
                        <div key={day.toString()} className={`p-2 border-l min-h-20 relative ${
                          day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                        }`}>
                          {dayRosters.map((roster) => {
                            const shift = shifts.find(s => s.id === roster.shift_id);
                            const shiftColor = getShiftColor(roster.shift_id);
                            
                            const startTime = shift?.start_time || "";
                            const endTime = shift?.end_time || "";
                            
                            return (
                              <div
                                key={roster.id}
                                className="p-2 mb-1 rounded text-xs relative group"
                                style={{
                                  backgroundColor: shiftColor.backgroundColor || shiftColor.bg,
                                  color: shiftColor.color || shiftColor.text,
                                  border: `1px solid ${shiftColor.borderColor || shiftColor.border}`
                                }}
                              >
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                                  <button
                                    onClick={() => handleEditRoster(roster)}
                                    className="p-1 bg-white rounded hover:bg-gray-100"
                                    title="Edit"
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRoster(roster.id)}
                                    className="p-1 bg-white rounded hover:bg-gray-100"
                                    title="Delete"
                                  >
                                    <FaTrash className="text-xs text-red-500" />
                                  </button>
                                </div>
                                <div className="font-medium truncate">{shift?.name || "No Shift"}</div>
                                <div className="truncate">
                                  {startTime ? formatTime(startTime) : "N/A"} - {endTime ? formatTime(endTime) : "N/A"}
                                </div>
                                {roster.notes && (
                                  <div className="truncate text-xs opacity-75" title={roster.notes}>
                                    {roster.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {dayRosters.length === 0 && (
                            <button
                              onClick={() => handleAddRoster(day, employee.id, employee)}
                              className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="Add shift"
                            >
                              <FaRegCalendarPlus className="text-lg" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 col-span-8">
                  No employees found. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly Roster View */}
        {view === "month" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-7 border-b">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {/* Add empty cells for days before the first day of month */}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-32 border-r border-b p-2 bg-gray-50"></div>
              ))}
              
              {monthDates.map((date, index) => (
                <div key={index} className={`min-h-32 border-r border-b p-2 ${
                  date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`text-sm font-medium ${
                      date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''
                    }`}>
                      {date.getDate()}
                    </div>
                    <button
                      onClick={() => {
                        setModalMode("add");
                        setSelectedDate(date);
                        setFormData({
                          employee_id: "",
                          shift_id: "",
                          roster_date: date.toISOString().split('T')[0],
                          start_time: "",
                          end_time: "",
                          notes: ""
                        });
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-blue-500"
                      title="Add roster"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-24">
                    {rosters
                      .filter(
                        (roster) =>
                          roster.roster_date && 
                          new Date(roster.roster_date).toISOString().split("T")[0] === date.toISOString().split("T")[0]
                      )
                      .slice(0, 3) // Limit to 3 rosters per day for readability
                      .map((roster) => {
                        const employee = employees.find(
                          (emp) => emp.id === roster.employee_id
                        );
                        const shift = shifts.find(s => s.id === roster.shift_id);
                        const shiftColor = getShiftColor(roster.shift_id);
                        
                        return (
                          <div
                            key={roster.id}
                            className="p-1 rounded text-xs cursor-pointer hover:opacity-90"
                            style={{
                              backgroundColor: shiftColor.backgroundColor || shiftColor.bg,
                              color: shiftColor.color || shiftColor.text,
                              border: `1px solid ${shiftColor.borderColor || shiftColor.border}`
                            }}
                            onClick={() => handleEditRoster(roster)}
                          >
                            <div className="font-medium truncate">
                              {employee?.first_name?.charAt(0)}. {employee?.last_name}
                            </div>
                            <div className="truncate">{shift?.name || "No Shift"}</div>
                            {shift?.start_time && shift?.end_time && (
                              <div className="text-xs opacity-75 truncate">
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {rosters.filter(
                      (roster) =>
                        roster.roster_date && 
                        new Date(roster.roster_date).toISOString().split("T")[0] === date.toISOString().split("T")[0]
                    ).length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +
                        {rosters.filter(
                          (roster) =>
                            roster.roster_date && 
                            new Date(roster.roster_date).toISOString().split("T")[0] === date.toISOString().split("T")[0]
                        ).length - 3}{" "}
                        more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            Shift Type Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            {shifts.map((shift) => {
              const shiftColor = getShiftColor(shift.id);
              
              return (
                <div key={shift.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      backgroundColor: shiftColor.backgroundColor || shiftColor.bg,
                      borderColor: shiftColor.borderColor || shiftColor.border
                    }}
                  ></div>
                  <span className="text-sm text-gray-600">{shift.name}</span>
                  {shift.start_time && shift.end_time && (
                    <span className="text-xs text-gray-400">
                      ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
            <div className="text-sm font-semibold text-gray-800">
              Total rosters this period: {stats.scheduledThisWeek}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RostersPage;
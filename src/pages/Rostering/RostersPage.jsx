// pages/RostersPage.js
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaSearch,
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
  FaTimes,
  FaBuilding,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaCalculator,
  FaDoorOpen
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import rosterService from "../../services/rosterService"; 
import { useOrganizations } from "../../contexts/OrganizationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pastel color options for background
const PASTEL_COLORS = [
  { name: 'Soft Pink', value: '#FFD1DC', textColor: 'text-gray-800' },
  { name: 'Mint Green', value: '#C1E1C1', textColor: 'text-gray-800' },
  { name: 'Peach', value: '#FFDAB9', textColor: 'text-gray-800' },
  { name: 'Baby Blue', value: '#B5D8FF', textColor: 'text-gray-800' },
  { name: 'Soft Yellow', value: '#FFFACD', textColor: 'text-gray-800' },
  { name: 'Cultured White', value: '#FCFCFC', textColor: 'text-gray-800' },
  { name: 'Soft White', value: '#FDFDFE', textColor: 'text-gray-800' },
];

// Color Palette Component
const ColorPalette = ({ isOpen, onClose, onColorSelect }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Choose Pastel Color</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
              aria-label="Close color palette"
            >
              <HiX size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {PASTEL_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-full p-4 rounded-lg transition-all hover:scale-105 hover:shadow-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={{ backgroundColor: color.value }}
                aria-label={`Select ${color.name} background`}
              >
                <span className={`font-medium ${color.textColor}`}>{color.name}</span>
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm" 
                  style={{ backgroundColor: color.value }} 
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          
          {/* Reset to default button */}
          <button
            onClick={() => {
              onColorSelect('#f9fafb');
              onClose();
            }}
            className="w-full mt-6 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Reset to default background"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
};

const RostersPage = () => {
  const { selectedOrganization } = useOrganizations();
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f9fafb');
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "all",
    shiftType: "all",
    search: "",
  });

  // Hourly rate state
  const [hourlyRate, setHourlyRate] = useState(25.00);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    shift_id: "",
    roster_date: "",
    notes: ""
  });

  // State for data from API
  const [rosters, setRosters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Weekly totals state
  const [weeklyTotals, setWeeklyTotals] = useState({
    totalHours: 0,
    totalAmount: 0,
    byEmployee: {},
    byDepartment: {}
  });

  // Calculate net working hours
  const calculateNetWorkingHours = (shift) => {
    if (!shift || !shift.start_time || !shift.end_time) return 0;
    
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    
    let totalDuration = (end - start) / (1000 * 60 * 60);
    if (totalDuration < 0) totalDuration += 24;
    
    if (shift.break_duration) {
      totalDuration -= (shift.break_duration / 60);
    }
    
    return parseFloat(totalDuration.toFixed(2));
  };

  // Calculate amount for a shift
  const calculateShiftAmount = (shift) => {
    const hours = calculateNetWorkingHours(shift);
    return hours * hourlyRate;
  };

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
      };
    }

    return { 
      backgroundColor: '#f3f4f6', 
      color: '#374151', 
      borderColor: '#d1d5db' 
    };
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      if (!selectedOrganization?.id) {
        toast.error("Please select an organization first");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("Fetching data for organization:", selectedOrganization.id);

      // Helper function to extract data from API response
      const extractData = (response) => {
        if (response && response.data) {
          if (response.data.success && response.data.data) {
            return response.data.data;
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
        }
        return [];
      };

      // Fetch all data
      let rostersData = [];
      let employeesData = [];
      let shiftsData = [];
      let departmentsData = [];

      // Fetch rosters
      try {
        const rostersRes = await rosterService.getRosters({ organization_id: selectedOrganization.id });
        rostersData = extractData(rostersRes);
        console.log("Rosters loaded:", rostersData.length);
      } catch (error) {
        console.error("Error loading rosters:", error);
      }

      // Fetch employees
      try {
        const employeesRes = await rosterService.getEmployees({ organization_id: selectedOrganization.id });
        employeesData = extractData(employeesRes);
        console.log("Employees loaded:", employeesData.length);
      } catch (error) {
        console.error("Error loading employees:", error);
      }

      // Fetch shifts
      try {
        const shiftsRes = await rosterService.getShifts({ organization_id: selectedOrganization.id });
        shiftsData = extractData(shiftsRes);
        console.log("Shifts loaded:", shiftsData.length);
      } catch (error) {
        console.error("Error loading shifts:", error);
      }

      // Fetch departments
      try {
        const deptsRes = await rosterService.getDepartments(selectedOrganization.id);
        departmentsData = extractData(deptsRes);
        console.log("Departments loaded:", departmentsData.length);
      } catch (error) {
        console.error("Error loading departments:", error);
      }

      // Update all states
      setRosters(rostersData);
      setEmployees(employeesData);
      setShifts(shiftsData);
      setDepartments(departmentsData);

      // Show success message if we have data
      if (rostersData.length > 0) {
        toast.success(`Loaded ${rostersData.length} rosters`);
      }

    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update weekly totals when data changes
  useEffect(() => {
    if (rosters.length > 0 && employees.length > 0 && shifts.length > 0) {
      const weekDates = getWeekDates();
      calculateWeeklyTotals(rosters, employees, shifts, weekDates);
    }
  }, [rosters, employees, shifts, departments, hourlyRate, currentDate]);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    
    // Adjust to get Monday as first day
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
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

  const getRostersForEmployeeAndDate = (employeeId, date) => {
    if (!date || !employeeId) return [];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`;
    
    return rosters.filter((roster) => {
      if (roster.employee_id !== employeeId || !roster.roster_date) return false;
      
      let rosterDateStr = '';
      if (typeof roster.roster_date === 'string') {
        rosterDateStr = roster.roster_date.split('T')[0];
      } else if (roster.roster_date instanceof Date) {
        const d = roster.roster_date;
        rosterDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      
      return rosterDateStr === targetDateStr;
    });
  };

  // Calculate weekly totals
  const calculateWeeklyTotals = (rostersList, employeesList, shiftsList, weekDates) => {
    const weekStart = weekDates[0].toISOString().split('T')[0];
    const weekEnd = weekDates[6].toISOString().split('T')[0];
    
    const weekRosters = rostersList.filter(roster => {
      if (!roster.roster_date) return false;
      const rosterDate = typeof roster.roster_date === 'string' 
        ? roster.roster_date.split('T')[0]
        : new Date(roster.roster_date).toISOString().split('T')[0];
      return rosterDate >= weekStart && rosterDate <= weekEnd;
    });

    console.log("Week rosters:", weekRosters.length);

    let totalHours = 0;
    let totalAmount = 0;
    const byEmployee = {};
    const byDepartment = {};

    weekRosters.forEach(roster => {
      const shift = shiftsList.find(s => s.id === roster.shift_id);
      if (!shift) return;

      const hours = calculateNetWorkingHours(shift);
      const amount = hours * hourlyRate;

      totalHours += hours;
      totalAmount += amount;

      // Calculate by employee
      const employee = employeesList.find(e => e.id === roster.employee_id);
      if (employee) {
        if (!byEmployee[employee.id]) {
          byEmployee[employee.id] = {
            name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown',
            hours: 0,
            amount: 0,
            department: employee.department_id
          };
        }
        byEmployee[employee.id].hours += hours;
        byEmployee[employee.id].amount += amount;

        // Calculate by department
        const deptId = employee.department_id;
        if (deptId) {
          if (!byDepartment[deptId]) {
            const dept = departments.find(d => d.id === deptId);
            byDepartment[deptId] = {
              name: dept?.name || 'Unknown Department',
              hours: 0,
              amount: 0
            };
          }
          byDepartment[deptId].hours += hours;
          byDepartment[deptId].amount += amount;
        }
      }
    });

    setWeeklyTotals({
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      byEmployee,
      byDepartment
    });
  };

  // Filter employees based on search and department
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment = filters.department === "all" || 
      employee.department_id?.toString() === filters.department;
    
    const matchesSearch = filters.search === "" ||
      (employee.first_name && employee.first_name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (employee.last_name && employee.last_name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (employee.employee_code && employee.employee_code.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesDepartment && matchesSearch;
  });

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    const weekDates = getWeekDates();
    const weekRange = `${weekDates[0].toLocaleDateString()} - ${weekDates[6].toLocaleDateString()}`;
    
    const csvContent = [
      [`Weekly Roster Report - ${weekRange}`],
      [`Hourly Rate: ${formatCurrency(hourlyRate)}`],
      [],
      ["Employee", "Department", "Shift", "Date", "Hours", "Amount"],
      ...rosters
        .filter(roster => {
          if (!roster.roster_date) return false;
          const rosterDate = typeof roster.roster_date === 'string' 
            ? roster.roster_date.split('T')[0]
            : new Date(roster.roster_date).toISOString().split('T')[0];
          const weekStart = weekDates[0].toISOString().split('T')[0];
          const weekEnd = weekDates[6].toISOString().split('T')[0];
          return rosterDate >= weekStart && rosterDate <= weekEnd;
        })
        .map((roster) => {
          const employee = employees.find(e => e.id === roster.employee_id);
          const shift = shifts.find(s => s.id === roster.shift_id);
          const hours = calculateNetWorkingHours(shift);
          const amount = hours * hourlyRate;
          
          const dept = departments.find(d => d.id === employee?.department_id);
          
          return [
            employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : "Unknown",
            dept?.name || "N/A",
            shift?.name || "N/A",
            new Date(roster.roster_date).toLocaleDateString(),
            hours.toFixed(2),
            amount.toFixed(2)
          ];
        }),
      [],
      ["WEEKLY TOTALS"],
      ["Total Hours", weeklyTotals.totalHours.toFixed(2)],
      ["Total Amount", formatCurrency(weeklyTotals.totalAmount)],
      [],
      ["TOTALS BY DEPARTMENT"],
      ["Department", "Hours", "Amount"],
      ...Object.entries(weeklyTotals.byDepartment).map(([id, data]) => [
        data.name,
        data.hours.toFixed(2),
        formatCurrency(data.amount)
      ]),
      [],
      ["TOTALS BY EMPLOYEE"],
      ["Employee", "Hours", "Amount", "Department"],
      ...Object.entries(weeklyTotals.byEmployee).map(([id, data]) => {
        const dept = departments.find(d => d.id === data.department);
        return [
          data.name,
          data.hours.toFixed(2),
          formatCurrency(data.amount),
          dept?.name || "N/A"
        ];
      })
    ]
      .map(row => Array.isArray(row) ? row.join(",") : row)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roster_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddRoster = (date, employeeId, employee) => {
    setModalMode("add");
    setSelectedDate(date);
    setSelectedEmployee(employeeId);
    
    const formattedDate = date.toISOString().split('T')[0];
    
    setFormData({
      employee_id: employeeId,
      shift_id: "",
      roster_date: formattedDate,
      notes: ""
    });
    
    setShowModal(true);
  };

  const handleEditRoster = (roster) => {
    setModalMode("edit");
    setSelectedRoster(roster);
    
    setFormData({
      employee_id: roster.employee_id,
      shift_id: roster.shift_id,
      roster_date: typeof roster.roster_date === 'string' 
        ? roster.roster_date.split('T')[0]
        : new Date(roster.roster_date).toISOString().split('T')[0],
      notes: roster.notes || ""
    });
    
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const selectedShift = shifts.find(s => s.id === parseInt(formData.shift_id));
      if (!selectedShift) {
        toast.error("Please select a valid shift");
        return;
      }

      const rosterData = {
        organization_id: selectedOrganization.id,
        employee_id: parseInt(formData.employee_id),
        shift_id: parseInt(formData.shift_id),
        roster_date: formData.roster_date,
        notes: formData.notes || "",
        created_by: 4
      };

      console.log("Submitting roster data:", rosterData);

      let response;
      if (modalMode === "add") {
        response = await rosterService.createRoster(rosterData);
      } else {
        response = await rosterService.updateRoster(selectedRoster.id, rosterData);
      }

      if (response.data?.success) {
        toast.success(`Roster ${modalMode === "add" ? "created" : "updated"} successfully!`);
        fetchData();
        setShowModal(false);
        
        setFormData({
          employee_id: "",
          shift_id: "",
          roster_date: "",
          notes: ""
        });
      } else {
        toast.error(`Failed to ${modalMode} roster`);
      }
    } catch (error) {
      console.error("Error saving roster:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data?.message || `Failed to ${modalMode} roster`);
      } else {
        toast.error("Failed to save roster");
      }
    }
  };

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

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : "Unknown Employee";
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

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  return (
    <>
      {/* Color Palette Toggle Button */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white p-2 rounded-l-lg shadow-lg hover:shadow-xl transition-all z-50 group"
        style={{ writingMode: 'vertical-rl' }}
        aria-label="Open color palette"
      >
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-xs font-medium">Colors</span>
        </div>
      </button>

      {/* Color Palette Component */}
      <ColorPalette 
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onColorSelect={setBackgroundColor}
      />

      <div 
        className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
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
                          {filteredEmployees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.first_name || ''} {employee.last_name || ''} 
                              {employee.employee_code ? ` (${employee.employee_code})` : ''}
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
                            {shift.break_start && shift.break_end && ` • Break: ${formatTime(shift.break_start)}-${formatTime(shift.break_end)}`}
                          </option>
                        ))}
                      </select>
                      {formData.shift_id && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Selected shift: {shifts.find(s => s.id === parseInt(formData.shift_id))?.name}</p>
                        </div>
                      )}
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

                    {formData.shift_id && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Estimated Amount:</span>
                          </div>
                          <span className="text-lg font-bold text-green-700">
                            {formatCurrency(calculateShiftAmount(shifts.find(s => s.id === parseInt(formData.shift_id))))}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {formatCurrency(hourlyRate)}/hr rate
                        </p>
                      </div>
                    )}
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
          {/* Header */}
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                  <label className="text-sm font-medium text-gray-700">Hourly Rate:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">AUD</span>
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">{view === "week" ? "Hours This Week" : "Hours This Month"}</p>
                  <p className="text-2xl font-bold text-gray-800">{weeklyTotals.totalHours}</p>
                </div>
                <FaClock className="text-green-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(weeklyTotals.totalAmount)}</p>
                </div>
                <FaMoneyBillWave className="text-purple-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Different Shifts</p>
                  <p className="text-2xl font-bold text-gray-800">{shifts.length}</p>
                </div>
                <FaExchangeAlt className="text-orange-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Hours/Employee</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {(weeklyTotals.totalHours / Math.max(Object.keys(weeklyTotals.byEmployee).length, 1)).toFixed(1)}
                  </p>
                </div>
                <FaHourglassHalf className="text-indigo-500 text-xl" />
              </div>
            </div>
          </div>

          {/* View Toggle and Navigation */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === "week" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Week View (Mon-Sun)
              </button>
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === "month" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Month View
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigateDate("prev")} className="p-2 hover:bg-gray-100 rounded-full border">
                <FaChevronLeft />
              </button>
              <div className="text-lg font-semibold">
                {view === "week"
                  ? `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <button onClick={() => navigateDate("next")} className="p-2 hover:bg-gray-100 rounded-full border">
                <FaChevronRight />
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <FaDownload /> Export
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaPrint /> Print
              </button>
              <button 
                onClick={() => {
                  setModalMode("add");
                  setFormData({
                    employee_id: "",
                    shift_id: "",
                    roster_date: new Date().toISOString().split('T')[0],
                    notes: ""
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaPlus /> Add Roster
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>

              <select
                value={filters.shiftType}
                onChange={(e) => setFilters(prev => ({ ...prev, shiftType: e.target.value }))}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Shifts</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly View */}
          {view === "week" && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 font-semibold bg-gray-50 sticky left-0">Employee</div>
                {weekDates.map((day, index) => (
                  <div key={day.toString()} className={`p-4 text-center font-semibold border-l bg-gray-50 ${
                    day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                  }`}>
                    <div className="text-sm">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</div>
                    <div className="text-xs text-gray-500">{day.getDate()}/{day.getMonth() + 1}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-y-auto max-h-[600px]">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => {
                    const employeeTotal = weeklyTotals.byEmployee[employee.id] || { hours: 0, amount: 0 };
                    
                    return (
                      <div key={employee.id} className="grid grid-cols-8 border-b hover:bg-gray-50">
                        <div className="p-4 border-r bg-gray-50 sticky left-0 min-w-[200px]">
                          <div className="font-medium">
                            {employee.first_name || ''} {employee.last_name || ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.employee_code || ''}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {departments.find(d => d.id === employee.department_id)?.name || ""}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs font-semibold text-green-600">
                              Week Total: {employeeTotal.hours.toFixed(1)}h
                            </div>
                            <div className="text-xs font-bold text-purple-600">
                              {formatCurrency(employeeTotal.amount)}
                            </div>
                          </div>
                        </div>
                        {weekDates.map(day => {
                          const dayRosters = getRostersForEmployeeAndDate(employee.id, day);
                          return (
                            <div key={day.toString()} className={`p-2 border-l min-h-32 relative ${
                              day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                            }`}>
                              {dayRosters.map(roster => {
                                const shift = shifts.find(s => s.id === roster.shift_id);
                                const shiftColor = getShiftColor(roster.shift_id);
                                const hours = calculateNetWorkingHours(shift);
                                const amount = hours * hourlyRate;
                                
                                return (
                                  <div
                                    key={roster.id}
                                    className="p-2 mb-1 rounded text-xs relative group cursor-pointer"
                                    style={{
                                      backgroundColor: shiftColor.backgroundColor,
                                      color: shiftColor.color,
                                      border: `1px solid ${shiftColor.borderColor}`
                                    }}
                                    onClick={() => handleEditRoster(roster)}
                                  >
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
                                      <button onClick={(e) => { e.stopPropagation(); handleEditRoster(roster); }} 
                                        className="p-1 bg-white rounded hover:bg-gray-100 shadow">
                                        <FaEdit className="text-xs" />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteRoster(roster.id); }} 
                                        className="p-1 bg-white rounded hover:bg-gray-100 shadow">
                                        <FaTrash className="text-xs text-red-500" />
                                      </button>
                                    </div>
                                    <div className="font-medium truncate">{shift?.name || "No Shift"}</div>
                                    <div className="truncate text-[10px]">
                                      {shift?.start_time ? formatTime(shift.start_time) : "N/A"} - {shift?.end_time ? formatTime(shift.end_time) : "N/A"}
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px]">
                                      <span>{hours.toFixed(1)}h</span>
                                      <span className="font-bold">{formatCurrency(amount)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              {dayRosters.length === 0 && (
                                <button
                                  onClick={() => handleAddRoster(day, employee.id, employee)}
                                  className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded min-h-[80px]"
                                >
                                  <FaRegCalendarPlus className="text-lg" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500 col-span-8">
                    No employees found. Try adjusting your filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monthly View */}
          {view === "month" && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-7 border-b">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <div key={day} className="p-4 text-center font-semibold bg-gray-50">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-32 border-r border-b p-2 bg-gray-50"></div>
                ))}
                
                {monthDates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayRosters = rosters.filter(r => {
                    if (!r.roster_date) return false;
                    const rosterDate = typeof r.roster_date === 'string' 
                      ? r.roster_date.split('T')[0]
                      : new Date(r.roster_date).toISOString().split('T')[0];
                    return rosterDate === dateStr;
                  });
                  
                  const dayTotalHours = dayRosters.reduce((total, roster) => {
                    const shift = shifts.find(s => s.id === roster.shift_id);
                    return total + calculateNetWorkingHours(shift);
                  }, 0);
                  const dayTotalAmount = dayTotalHours * hourlyRate;
                  
                  return (
                    <div key={dateStr} className={`min-h-32 border-r border-b p-2 ${
                      date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${
                          date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''
                        }`}>
                          {date.getDate()}
                        </span>
                        <button
                          onClick={() => {
                            setModalMode("add");
                            setSelectedDate(date);
                            setFormData({
                              employee_id: "",
                              shift_id: "",
                              roster_date: dateStr,
                              notes: ""
                            });
                            setShowModal(true);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                      
                      {dayRosters.length > 0 && (
                        <div className="mb-2 p-1 bg-green-50 rounded text-[10px]">
                          <div className="font-semibold text-green-700">{dayTotalHours.toFixed(1)}h</div>
                          <div className="font-bold text-purple-700">{formatCurrency(dayTotalAmount)}</div>
                        </div>
                      )}
                      
                      <div className="space-y-1 overflow-y-auto max-h-24">
                        {dayRosters.slice(0, 3).map(roster => {
                          const employee = employees.find(e => e.id === roster.employee_id);
                          const shift = shifts.find(s => s.id === roster.shift_id);
                          const shiftColor = getShiftColor(roster.shift_id);
                          
                          return (
                            <div
                              key={roster.id}
                              className="p-1 rounded text-xs cursor-pointer hover:opacity-90"
                              style={{
                                backgroundColor: shiftColor.backgroundColor,
                                color: shiftColor.color,
                                border: `1px solid ${shiftColor.borderColor}`
                              }}
                              onClick={() => handleEditRoster(roster)}
                            >
                              <div className="font-medium truncate">
                                {employee?.first_name?.charAt(0) || ''}. {employee?.last_name || ''}
                              </div>
                              <div className="truncate">{shift?.name || "No Shift"}</div>
                            </div>
                          );
                        })}
                        {dayRosters.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            + {dayRosters.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Totals Summary */}
          {view === "week" && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Summary */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaCalculator className="text-blue-500" />
                  Weekly Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Hours:</span>
                    <span className="text-lg font-bold text-blue-600">{weeklyTotals.totalHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(weeklyTotals.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Average Rate:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(weeklyTotals.totalHours > 0 ? weeklyTotals.totalAmount / weeklyTotals.totalHours : 0)}/hr
                    </span>
                  </div>
                </div>
              </div>

              {/* By Department Summary */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBuilding className="text-orange-500" />
                  Totals by Department
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(weeklyTotals.byDepartment).map(([id, data]) => (
                    <div key={id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{data.name}:</span>
                      <div className="text-right">
                        <span className="font-medium text-blue-600">{data.hours.toFixed(1)}h</span>
                        <span className="mx-1 text-gray-400">|</span>
                        <span className="font-medium text-green-600">{formatCurrency(data.amount)}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(weeklyTotals.byDepartment).length === 0 && (
                    <p className="text-sm text-gray-400 text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Shift Type Legend</h3>
            <div className="flex flex-wrap gap-4">
              {shifts.map(shift => {
                const shiftColor = getShiftColor(shift.id);
                return (
                  <div key={shift.id} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{
                      backgroundColor: shiftColor.backgroundColor,
                      borderColor: shiftColor.borderColor
                    }}></div>
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
                Total this period: {weeklyTotals.totalHours}h ({formatCurrency(weeklyTotals.totalAmount)})
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RostersPage;
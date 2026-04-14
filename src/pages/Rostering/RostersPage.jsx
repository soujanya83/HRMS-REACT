// pages/RostersPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FaDoorOpen,
  FaDollarSign
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import rosterService from "../../services/rosterService"; 
import employeeService from "../../services/employeeService"; // Import employee service
import { useOrganizations } from "../../contexts/OrganizationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
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
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "all",
    shiftType: "all",
    search: "",
  });

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

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

  // State for rate calculations
  const [employeeRates, setEmployeeRates] = useState({});
  const [selectedShift, setSelectedShift] = useState(null);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Weekly totals state - will be updated dynamically
  const [weeklyTotals, setWeeklyTotals] = useState({
    totalHours: 0,
    totalAmount: 0,
    byEmployee: {},
    byDepartment: {},
    averageRate: 0,
    lastUpdated: null
  });

  // Calculate net working hours
  const calculateNetWorkingHours = useCallback((shift) => {
    if (!shift || !shift.start_time || !shift.end_time) return 0;
    
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    
    let totalDuration = (end - start) / (1000 * 60 * 60);
    if (totalDuration < 0) totalDuration += 24;
    
    if (shift.total_break_minutes) {
      totalDuration -= (parseInt(shift.total_break_minutes) / 60);
    } else if (shift.break_duration) {
      totalDuration -= (shift.break_duration / 60);
    }
    
    return parseFloat(totalDuration.toFixed(2));
  }, []);

  // Get employee hourly rate from employee data
  const getEmployeeRate = useCallback((employee) => {
    if (!employee) return 25; // Default fallback rate
    
    // Try different possible rate fields
    return employee.hourly_wage || 
           employee.pay_rate || 
           employee.rate || 
           employee.hourly_rate || 
           25; // Default fallback
  }, []);

  // Calculate amount for a roster
  const calculateRosterAmount = useCallback((roster) => {
    if (!roster) return 0;
    
    const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
    if (!shift) return 0;
    
    const hours = calculateNetWorkingHours(shift);
    
    // Get rate from employee data
    let rate = 25; // Default
    if (roster.employee) {
      rate = getEmployeeRate(roster.employee);
    } else {
      const employee = employees.find(e => e.id === roster.employee_id);
      rate = getEmployeeRate(employee);
    }
    
    return hours * rate;
  }, [shifts, employees, getEmployeeRate, calculateNetWorkingHours]);

  // Get shift color style
  const getShiftColor = useCallback((shiftId) => {
    const shift = shifts.find(s => s.id === shiftId) || 
                  rosters.find(r => r.shift?.id === shiftId)?.shift;
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
  }, [shifts, rosters]);

  // Fetch employee rates separately
  const fetchEmployeeRates = async () => {
    if (!selectedOrganization?.id) return;
    
    setRatesLoading(true);
    try {
      const response = await employeeService.getEmployees({ organization_id: selectedOrganization.id });
      
      // Extract employees data from response
      let employeesData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        }
      }
      
      // Build rates object
      const rates = {};
      employeesData.forEach(emp => {
        rates[emp.id] = getEmployeeRate(emp);
      });
      
      setEmployeeRates(rates);
      console.log("💰 Employee rates loaded:", rates);
    } catch (error) {
      console.error("Error fetching employee rates:", error);
    } finally {
      setRatesLoading(false);
    }
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

      // Fetch all data in parallel
      const [rostersRes, employeesRes, shiftsRes, departmentsRes] = await Promise.allSettled([
        rosterService.getRosters({ organization_id: selectedOrganization.id }),
        rosterService.getEmployees({ organization_id: selectedOrganization.id }),
        rosterService.getShifts({ organization_id: selectedOrganization.id }),
        rosterService.getDepartments(selectedOrganization.id)
      ]);

      // Process rosters
      let rostersData = [];
      if (rostersRes.status === "fulfilled") {
        rostersData = extractData(rostersRes.value);
        console.log("Rosters loaded:", rostersData.length);
      }

      // Process employees and their rates
      let employeesData = [];
      if (employeesRes.status === "fulfilled") {
        employeesData = extractData(employeesRes.value);
        console.log("Employees loaded:", employeesData.length);
        
        // Extract and store employee rates
        const rates = {};
        employeesData.forEach(emp => {
          rates[emp.id] = getEmployeeRate(emp);
        });
        setEmployeeRates(rates);
      }

      // Process shifts
      let shiftsData = [];
      if (shiftsRes.status === "fulfilled") {
        shiftsData = extractData(shiftsRes.value);
        console.log("Shifts loaded:", shiftsData.length);
      }

      // Process departments
      let departmentsData = [];
      if (departmentsRes.status === "fulfilled") {
        departmentsData = extractData(departmentsRes.value);
        console.log("Departments loaded:", departmentsData.length);
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

  // Calculate weekly totals - This will run whenever rosters, employees, shifts, or currentDate changes
  const calculateWeeklyTotals = useCallback(() => {
    if (!rosters.length || !employees.length || !shifts.length) {
      setWeeklyTotals({
        totalHours: 0,
        totalAmount: 0,
        byEmployee: {},
        byDepartment: {},
        averageRate: 0,
        lastUpdated: new Date()
      });
      return;
    }

    const weekDates = getWeekDates();
    const weekStart = weekDates[0].toISOString().split('T')[0];
    const weekEnd = weekDates[6].toISOString().split('T')[0];
    
    // Filter rosters for current week
    const weekRosters = rosters.filter(roster => {
      if (!roster.roster_date) return false;
      const rosterDate = typeof roster.roster_date === 'string' 
        ? roster.roster_date.split('T')[0]
        : new Date(roster.roster_date).toISOString().split('T')[0];
      return rosterDate >= weekStart && rosterDate <= weekEnd;
    });

    console.log("📊 Calculating weekly totals for", weekRosters.length, "rosters");

    let totalHours = 0;
    let totalAmount = 0;
    const byEmployee = {};
    const byDepartment = {};

    weekRosters.forEach(roster => {
      const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
      if (!shift) return;

      const hours = calculateNetWorkingHours(shift);
      const amount = calculateRosterAmount(roster);

      totalHours += hours;
      totalAmount += amount;

      // Calculate by employee
      const employee = roster.employee || employees.find(e => e.id === roster.employee_id);
      if (employee) {
        const employeeId = employee.id;
        if (!byEmployee[employeeId]) {
          byEmployee[employeeId] = {
            id: employeeId,
            name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown',
            hours: 0,
            amount: 0,
            department: employee.department_id,
            rate: getEmployeeRate(employee)
          };
        }
        byEmployee[employeeId].hours += hours;
        byEmployee[employeeId].amount += amount;

        // Calculate by department
        const deptId = employee.department_id;
        if (deptId) {
          if (!byDepartment[deptId]) {
            const dept = departments.find(d => d.id === deptId);
            byDepartment[deptId] = {
              id: deptId,
              name: dept?.name || 'Unknown Department',
              hours: 0,
              amount: 0,
              employeeCount: new Set()
            };
          }
          byDepartment[deptId].hours += hours;
          byDepartment[deptId].amount += amount;
          byDepartment[deptId].employeeCount.add(employeeId);
        }
      }
    });

    // Calculate average rate
    const averageRate = totalHours > 0 ? totalAmount / totalHours : 0;

    // Convert employeeCount Set to count for departments
    Object.keys(byDepartment).forEach(deptId => {
      byDepartment[deptId].employeeCount = byDepartment[deptId].employeeCount.size;
    });

    const newTotals = {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      byEmployee,
      byDepartment,
      averageRate: parseFloat(averageRate.toFixed(2)),
      lastUpdated: new Date(),
      rosterCount: weekRosters.length,
      uniqueEmployees: Object.keys(byEmployee).length
    };

    console.log("✅ Weekly totals updated:", newTotals);
    setWeeklyTotals(newTotals);

  }, [rosters, employees, shifts, departments, currentDate, calculateNetWorkingHours, calculateRosterAmount, getEmployeeRate]);

  // Update weekly totals when data changes
  useEffect(() => {
    if (rosters.length > 0 && employees.length > 0 && shifts.length > 0) {
      calculateWeeklyTotals();
    }
  }, [rosters, employees, shifts, departments, currentDate, calculateWeeklyTotals]);

  // Calculate estimated amount when shift is selected in form
  useEffect(() => {
    if (formData.shift_id && formData.employee_id) {
      const shift = shifts.find(s => s.id === parseInt(formData.shift_id));
      setSelectedShift(shift);
      
      const employee = employees.find(e => e.id === parseInt(formData.employee_id));
      const rate = employee ? getEmployeeRate(employee) : 25;
      const hours = calculateNetWorkingHours(shift);
      const amount = hours * rate;
      
      setEstimatedAmount(amount);
    } else {
      setEstimatedAmount(0);
      setSelectedShift(null);
    }
  }, [formData.shift_id, formData.employee_id, shifts, employees, getEmployeeRate, calculateNetWorkingHours]);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  const getWeekDates = useCallback(() => {
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
  }, [currentDate]);

  const getMonthDates = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
  }, [currentDate]);

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getRostersForEmployeeAndDate = useCallback((employeeId, date) => {
    if (!date || !employeeId) return [];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`;
    
    return rosters.filter((roster) => {
      if (roster.employee_id !== employeeId && roster.employee?.id !== employeeId) return false;
      
      let rosterDateStr = '';
      if (typeof roster.roster_date === 'string') {
        rosterDateStr = roster.roster_date.split('T')[0];
      } else if (roster.roster_date instanceof Date) {
        const d = roster.roster_date;
        rosterDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      
      return rosterDateStr === targetDateStr;
    });
  }, [rosters]);

  // Filter employees based on search and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesDepartment = filters.department === "all" || 
        employee.department_id?.toString() === filters.department;
      
      const matchesSearch = filters.search === "" ||
        (employee.first_name && employee.first_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (employee.last_name && employee.last_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (employee.employee_code && employee.employee_code.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesDepartment && matchesSearch;
    });
  }, [employees, filters]);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    const weekDates = getWeekDates();
    const weekRange = `${weekDates[0].toLocaleDateString()} - ${weekDates[6].toLocaleDateString()}`;
    
    const csvContent = [
      [`Weekly Roster Report - ${weekRange}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Total Hours: ${weeklyTotals.totalHours}`],
      [`Total Amount: ${formatCurrency(weeklyTotals.totalAmount)}`],
      [`Average Rate: ${formatCurrency(weeklyTotals.averageRate)}/hr`],
      [],
      ["Employee", "Department", "Shift", "Date", "Hours", "Rate", "Amount"],
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
          const employee = roster.employee || employees.find(e => e.id === roster.employee_id);
          const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
          const hours = calculateNetWorkingHours(shift);
          const rate = employee ? getEmployeeRate(employee) : 25;
          const amount = hours * rate;
          
          const dept = departments.find(d => d.id === employee?.department_id);
          
          return [
            employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : "Unknown",
            dept?.name || "N/A",
            shift?.name || "N/A",
            new Date(roster.roster_date).toLocaleDateString(),
            hours.toFixed(2),
            formatCurrency(rate),
            formatCurrency(amount)
          ];
        }),
      [],
      ["WEEKLY TOTALS"],
      ["Total Hours", weeklyTotals.totalHours.toFixed(2)],
      ["Total Amount", formatCurrency(weeklyTotals.totalAmount)],
      ["Average Rate", formatCurrency(weeklyTotals.averageRate)],
      ["Unique Employees", weeklyTotals.uniqueEmployees || 0],
      [],
      ["TOTALS BY DEPARTMENT"],
      ["Department", "Hours", "Amount", "Employees"],
      ...Object.entries(weeklyTotals.byDepartment).map(([id, data]) => [
        data.name,
        data.hours.toFixed(2),
        formatCurrency(data.amount),
        data.employeeCount || 0
      ]),
      [],
      ["TOTALS BY EMPLOYEE"],
      ["Employee", "Hours", "Amount", "Rate", "Department"],
      ...Object.entries(weeklyTotals.byEmployee).map(([id, data]) => {
        const dept = departments.find(d => d.id === data.department);
        return [
          data.name,
          data.hours.toFixed(2),
          formatCurrency(data.amount),
          formatCurrency(data.rate || 25),
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
      employee_id: roster.employee_id || roster.employee?.id,
      shift_id: roster.shift_id || roster.shift?.id,
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

  const getEmployeeName = useCallback((employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId) || 
                     rosters.find(r => r.employee?.id === employeeId)?.employee;
    return employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : "Unknown Employee";
  }, [employees, rosters]);

  // If no organization is selected
  if (!selectedOrganization?.id) {
    return (
      <div 
        className="p-6 min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
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
      <div 
        className="p-6 min-h-screen transition-colors duration-300"
        style={{ backgroundColor }}
      >
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
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div 
        className="p-4 md:p-6 lg:p-8 min-h-screen font-sans transition-colors duration-300"
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
                              {' - '}{formatCurrency(getEmployeeRate(employee))}/hr
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
                          <div className="text-xs text-green-600 mt-1">
                            Rate: {formatCurrency(getEmployeeRate(employees.find(e => e.id === parseInt(formData.employee_id))))}/hr
                          </div>
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
                        {shifts.map(shift => {
                          const hours = calculateNetWorkingHours(shift);
                          return (
                            <option key={shift.id} value={shift.id}>
                              {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)}) • {hours}h
                              {shift.break_start && shift.break_end && ` • Break: ${formatTime(shift.break_start)}-${formatTime(shift.break_end)}`}
                            </option>
                          );
                        })}
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

                    {/* Show estimated amount */}
                    {estimatedAmount > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Estimated Amount:</span>
                          </div>
                          <span className="text-lg font-bold text-green-700">
                            {formatCurrency(estimatedAmount)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on employee's hourly rate and shift duration
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
                    {(weeklyTotals.totalHours / Math.max(weeklyTotals.uniqueEmployees || 1, 1)).toFixed(1)}
                  </p>
                </div>
                <FaHourglassHalf className="text-indigo-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rate</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(weeklyTotals.averageRate)}/hr</p>
                </div>
                <FaDollarSign className="text-pink-500 text-xl" />
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
                    const employeeRate = getEmployeeRate(employee);
                    
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
                              Rate: {formatCurrency(employeeRate)}/hr
                            </div>
                            <div className="text-xs font-semibold text-blue-600 mt-1">
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
                                const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
                                const shiftColor = getShiftColor(roster.shift_id);
                                const hours = calculateNetWorkingHours(shift);
                                const amount = calculateRosterAmount(roster);
                                
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
                    const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
                    return total + calculateNetWorkingHours(shift);
                  }, 0);
                  const dayTotalAmount = dayRosters.reduce((total, roster) => {
                    return total + calculateRosterAmount(roster);
                  }, 0);
                  
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
                          const employee = roster.employee || employees.find(e => e.id === roster.employee_id);
                          const shift = roster.shift || shifts.find(s => s.id === roster.shift_id);
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

          {/* Weekly Totals Summary - Now Dynamic */}
          {view === "week" && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Summary */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaCalculator className="text-blue-500" />
                  Weekly Summary
                  {weeklyTotals.lastUpdated && (
                    <span className="text-xs text-gray-400 ml-2">
                      Updated: {weeklyTotals.lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Rosters:</span>
                    <span className="text-sm font-medium text-gray-900">{weeklyTotals.rosterCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unique Employees:</span>
                    <span className="text-sm font-medium text-gray-900">{weeklyTotals.uniqueEmployees || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Total Hours:</span>
                    <span className="text-lg font-bold text-blue-600">{weeklyTotals.totalHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(weeklyTotals.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Average Rate:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {formatCurrency(weeklyTotals.averageRate)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Based on {weeklyTotals.rosterCount || 0} rosters</span>
                    <span>Auto-calculated</span>
                  </div>
                </div>
              </div>

              {/* By Department Summary */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBuilding className="text-orange-500" />
                  Totals by Department
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(weeklyTotals.byDepartment).length > 0 ? (
                    Object.entries(weeklyTotals.byDepartment).map(([id, data]) => (
                      <div key={id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <span className="text-gray-600">{data.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            ({data.employeeCount || 0} employees)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-blue-600">{data.hours.toFixed(1)}h</span>
                          <span className="mx-1 text-gray-400">|</span>
                          <span className="font-medium text-green-600">{formatCurrency(data.amount)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No department data available</p>
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
                {weeklyTotals.averageRate > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    Avg {formatCurrency(weeklyTotals.averageRate)}/hr
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RostersPage;
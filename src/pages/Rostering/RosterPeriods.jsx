import React, { useState, useEffect, useCallback, useMemo } from "react";
import usePermissions from "../../hooks/usePermissions";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSync,
  FaCalendarCheck,
  FaCalendarDay,
  FaCalendarWeek,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDownload,
  FaUsers,
  FaList,
  FaChevronDown,
  FaClock,
  FaUserCheck,
  FaUserClock,
  FaCalendarMinus,
  FaDollarSign,
  FaMoneyBillWave
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import { rosterPeriodService } from "../../services/rosterPeriodService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import axios from "axios";
import axiosClient from "../../axiosClient";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white" />
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
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
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
              className={`p-3 rounded-xl text-sm font-medium border ${currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
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

const RosterPeriods = () => {
  // State declarations
  const [rosterPeriods, setRosterPeriods] = useState([]);
  const [payPeriods, setPayPeriods] = useState([]);
  const [fortnightCalendars, setFortnightCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payPeriodsLoading, setPayPeriodsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showRostersModal, setShowRostersModal] = useState(false);

  // UI states
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rosters, setRosters] = useState([]);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  // State for rate calculations
  const [selectedShift, setSelectedShift] = useState(null);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [selectedEmployeesData, setSelectedEmployeesData] = useState([]);

  // Color palette state
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Form state
  const [formData, setFormData] = useState({
    type: "fortnightly",
    start_date: "",
    created_by: 4
  });

  // Bulk assign form state
  const [bulkAssignForm, setBulkAssignForm] = useState({
    roster_period_id: "",
    employee_ids: [],
    shift_id: "",
    created_by: 4
  });

  const { selectedOrganization } = useOrganizations();
  const { canAdd, canEdit, canDelete } = usePermissions('rostering.roster_periods');

  // Memoized values
  const statusColors = useMemo(() => ({
    draft: 'bg-blue-100 text-blue-800 border border-blue-200',
    locked: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    published: 'bg-green-100 text-green-800 border border-green-200',
  }), []);

  const statusIcons = useMemo(() => ({
    draft: <FaEdit className="text-blue-500" aria-hidden="true" />,
    locked: <FaLock className="text-yellow-500" aria-hidden="true" />,
    published: <FaCheckCircle className="text-green-500" aria-hidden="true" />,
  }), []);

  // Helper functions
  const getStatusColor = useCallback((status) => {
    return statusColors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }, [statusColors]);

  const getStatusIcon = useCallback((status) => {
    return statusIcons[status] || <FaInfoCircle className="text-gray-500" aria-hidden="true" />;
  }, [statusIcons]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const dateOnly = dateString.split('T')[0];
      const date = new Date(dateOnly);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      type: "fortnightly",
      start_date: "",
      created_by: 4
    });
  }, []);

  const resetBulkAssignForm = useCallback(() => {
    setBulkAssignForm({
      roster_period_id: "",
      employee_ids: [],
      shift_id: "",
      created_by: 4
    });
    setSelectedShift(null);
    setEstimatedAmount(0);
    setSelectedEmployeesData([]);
  }, []);

  // API calls with error handling
  const fetchRosterPeriods = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await rosterPeriodService.getRosterPeriods({
        organization_id: selectedOrganization.id
      });

      if (response.data) {
        let periodsList = [];
        const resData = response.data.data || response.data;

        if (Array.isArray(resData)) {
          periodsList = resData;
        } else if (resData && typeof resData === 'object') {
          if (Array.isArray(resData.data)) {
            periodsList = resData.data;
          } else if (Array.isArray(resData)) {
            periodsList = resData;
          } else {
            const foundArray = Object.values(resData).find(val => Array.isArray(val));
            if (foundArray) periodsList = foundArray;
          }
        }

        const fortnightPeriods = periodsList.filter(period =>
          period.type === "fortnightly"
        );
        setRosterPeriods(fortnightPeriods || []);
      } else {
        setRosterPeriods([]);
      }
    } catch (err) {
      console.error("[RosterPeriods] Error fetching roster periods:", err);
      setError(err.response?.data?.message || "Failed to load roster periods");
      setRosterPeriods([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization]);

  const fetchPayPeriods = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setPayPeriods([]);
      setFortnightCalendars([]);
      return;
    }

    try {
      setPayPeriodsLoading(true);
      setError(null);

      const response = await rosterPeriodService.getPayPeriods({
        organization_id: selectedOrganization.id
      });

      if (response.data?.status === true) {
        const periods = response.data.data || [];
        setPayPeriods(periods);

        // Extract unique fortnightly calendars
        const fortnightCalendars = periods.reduce((acc, period) => {
          if (period.calendar_type === "FORTNIGHTLY" &&
            !acc.find(c => c.calendar_id === period.calendar_id)) {
            acc.push({
              calendar_id: period.calendar_id,
              calendar_name: period.calendar_name,
              calendar_type: period.calendar_type,
              number_of_days: period.number_of_days
            });
          }
          return acc;
        }, []);

        setFortnightCalendars(fortnightCalendars);
      } else {
        setPayPeriods([]);
        setFortnightCalendars([]);
      }
    } catch (err) {
      console.error("[RosterPeriods] Error fetching pay periods:", err);
      setPayPeriods([]);
      setFortnightCalendars([]);
    } finally {
      setPayPeriodsLoading(false);
    }
  }, [selectedOrganization]);

  const fetchAvailableEmployees = useCallback(async (page = 1, shouldAppend = false) => {
    if (!selectedOrganization?.id) {
      setAvailableEmployees([]);
      setHasMoreEmployees(false);
      return;
    }

    try {
      if (shouldAppend) {
        setIsFetchingMore(true);
      } else {
        setEmployeesLoading(true);
        setEmployeesPage(1);
      }

      const response = await axiosClient.get('/employees', {
        params: {
          organization_id: selectedOrganization.id,
          page: page,
          per_page: 50 // Fetch more at once to reduce requests
        },
        timeout: 10000
      });

      if (response.data) {
        // Handle multiple response shapes: flat array, paginated, or nested
        let employeesList = [];
        let lastPage = 1;
        const resData = response.data.data || response.data;

        if (Array.isArray(resData)) {
          employeesList = resData;
          setHasMoreEmployees(false);
        } else if (resData && typeof resData === 'object') {
          // If paginated response
          if (Array.isArray(resData.data)) {
            employeesList = resData.data;
            lastPage = resData.last_page || 1;
            setHasMoreEmployees(page < lastPage);
          } else if (Array.isArray(resData)) {
            employeesList = resData;
            setHasMoreEmployees(false);
          } else {
            // Try to find any array value in the response
            const foundArray = Object.values(resData).find(val => Array.isArray(val));
            if (foundArray) {
              employeesList = foundArray;
              setHasMoreEmployees(false);
            }
          }
        }

        // Filter for active employees (case-insensitive), but if none match, show all
        const activeEmployees = employeesList.filter(emp =>
          (emp.status || '').toString().toLowerCase() === 'active'
        );
        const filteredList = activeEmployees.length > 0 ? activeEmployees : employeesList;

        if (shouldAppend) {
          setAvailableEmployees(prev => [...prev, ...filteredList]);
        } else {
          setAvailableEmployees(filteredList);
        }
      } else {
        if (!shouldAppend) setAvailableEmployees([]);
        setHasMoreEmployees(false);
      }
    } catch (err) {
      console.error("[RosterPeriods] Error fetching employees:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your connection.");
      } else {
        setError("Failed to load employees. Please try again.");
      }
      if (!shouldAppend) setAvailableEmployees([]);
      setHasMoreEmployees(false);
    } finally {
      setEmployeesLoading(false);
      setIsFetchingMore(false);
    }
  }, [selectedOrganization]);

  const handleLoadMoreEmployees = useCallback(() => {
    if (hasMoreEmployees && !isFetchingMore) {
      const nextPage = employeesPage + 1;
      setEmployeesPage(nextPage);
      fetchAvailableEmployees(nextPage, true);
    }
  }, [hasMoreEmployees, isFetchingMore, employeesPage, fetchAvailableEmployees]);

  const fetchAvailableShifts = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setAvailableShifts([]);
      return;
    }

    try {
      setShiftsLoading(true);
      const response = await axiosClient.get('/shifts', {
        params: {
          organization_id: selectedOrganization.id
        },
        timeout: 10000
      });

      if (response.data) {
        let shiftsList = [];
        const resData = response.data.data || response.data;

        if (Array.isArray(resData)) {
          shiftsList = resData;
        } else if (resData && typeof resData === 'object') {
          if (Array.isArray(resData.data)) {
            shiftsList = resData.data;
          } else if (Array.isArray(resData)) {
            shiftsList = resData;
          } else {
            const foundArray = Object.values(resData).find(val => Array.isArray(val));
            if (foundArray) shiftsList = foundArray;
          }
        }
        setAvailableShifts(shiftsList || []);
      } else {
        setAvailableShifts([]);
      }
    } catch (err) {
      console.error("[RosterPeriods] Error fetching shifts:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your connection.");
      } else {
        setError("Failed to load shifts. Please try again.");
      }
      setAvailableShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  }, [selectedOrganization]);

  const fetchRostersByPeriod = useCallback(async (periodId) => {
    if (!periodId) return;

    try {
      const response = await rosterPeriodService.getRostersByPeriod(periodId);
      if (response.data?.success === true) {
        setRosters(response.data.data || []);
      } else {
        setRosters([]);
      }
    } catch (err) {
      console.error("[RosterPeriods] Error fetching rosters:", err);
      setRosters([]);
      setError("Failed to load rosters. Please try again.");
    }
  }, []);

  // Calculate estimated amount when shift or employees change
  useEffect(() => {
    if (bulkAssignForm.shift_id && bulkAssignForm.employee_ids.length > 0 && selectedPeriod) {
      const shift = availableShifts.find(s => s.id.toString() === bulkAssignForm.shift_id.toString());
      setSelectedShift(shift);

      const selectedEmps = availableEmployees.filter(emp =>
        bulkAssignForm.employee_ids.includes(emp.id.toString())
      );
      setSelectedEmployeesData(selectedEmps);

      let shiftHours = 8;
      if (shift) {
        if (shift.start_time && shift.end_time) {
          const start = new Date(`2000-01-01T${shift.start_time}`);
          const end = new Date(`2000-01-01T${shift.end_time}`);
          const hours = (end - start) / (1000 * 60 * 60);
          shiftHours = hours > 0 ? hours : 8;
        }
      }

      let totalRate = 0;
      let rateCount = 0;

      selectedEmps.forEach(emp => {
        const rate = emp.hourly_rate || emp.pay_rate || emp.rate || 25;
        totalRate += parseFloat(rate);
        rateCount++;
      });

      const avgRate = rateCount > 0 ? totalRate / rateCount : 25;
      const totalHours = shiftHours * 14 * bulkAssignForm.employee_ids.length;
      const totalAmount = totalHours * avgRate;

      setEstimatedAmount(totalAmount);
    } else {
      setEstimatedAmount(0);
      setSelectedShift(null);
      setSelectedEmployeesData([]);
    }
  }, [bulkAssignForm.shift_id, bulkAssignForm.employee_ids, selectedPeriod, availableShifts, availableEmployees]);

  const getEmployeeRate = useCallback((employee) => {
    return employee.hourly_rate || employee.pay_rate || employee.rate || 25;
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (selectedOrganization) {
      Promise.all([
        fetchRosterPeriods(),
        fetchPayPeriods(),
        fetchAvailableEmployees(),
        fetchAvailableShifts()
      ]).catch(err => {
        console.error("[RosterPeriods] Error in initial data fetch:", err);
      });
    }
  }, [selectedOrganization, fetchRosterPeriods, fetchPayPeriods, fetchAvailableEmployees, fetchAvailableShifts]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPeriodDropdown && !event.target.closest('.period-dropdown')) {
        setShowPeriodDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPeriodDropdown]);

  // Modal handlers
  const openCreateModal = useCallback(async () => {
    if (!selectedOrganization) {
      setError("Please select an organization first");
      return;
    }

    resetForm();

    if (payPeriods.length === 0) {
      await fetchPayPeriods();
    }

    const currentFortnightly = payPeriods.find(p =>
      p.calendar_type === 'FORTNIGHTLY' && p.is_current === true
    );

    if (currentFortnightly?.start_date) {
      setFormData(prev => ({
        ...prev,
        start_date: currentFortnightly.start_date.split('T')[0]
      }));
    } else if (payPeriods.filter(p => p.calendar_type === 'FORTNIGHTLY').length > 0) {
      const firstFortnightly = payPeriods.find(p => p.calendar_type === 'FORTNIGHTLY');
      if (firstFortnightly?.start_date) {
        setFormData(prev => ({
          ...prev,
          start_date: firstFortnightly.start_date.split('T')[0]
        }));
      }
    }

    setShowCreateModal(true);
  }, [selectedOrganization, payPeriods, fetchPayPeriods, resetForm]);

  const handleCreatePeriod = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setError("No organization selected");
      return;
    }

    if (!formData.start_date) {
      setError("Please select a fortnightly pay period");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSend = {
        organization_id: parseInt(selectedOrganization.id, 10),
        type: "fortnightly",
        start_date: formData.start_date,
        created_by: 4
      };

      const response = await rosterPeriodService.createRosterPeriod(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage("Fortnightly roster period created successfully!");
        setShowCreateModal(false);
        resetForm();
        await fetchRosterPeriods();

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data?.message || "Failed to create roster period");
      }
    } catch (err) {
      console.error("[RosterPeriods] Error creating roster period:", err);
      setError(err.response?.data?.message || "Failed to create roster period");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrganization, formData.start_date, resetForm, fetchRosterPeriods]);

  const handleBulkAssign = useCallback(async (e) => {
    e.preventDefault();

    if (!selectedPeriod) {
      setError("No period selected");
      return;
    }

    if (selectedPeriod.status !== 'draft') {
      setError(`Cannot assign to a ${selectedPeriod.status} period. Only draft periods can be modified.`);
      return;
    }

    const employeeIdsArray = bulkAssignForm.employee_ids
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    if (employeeIdsArray.length === 0) {
      setError("Please select at least one employee");
      return;
    }

    if (!bulkAssignForm.shift_id) {
      setError("Please select a shift");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSend = {
        roster_period_id: parseInt(selectedPeriod.id, 10),
        employee_ids: employeeIdsArray,
        shift_id: parseInt(bulkAssignForm.shift_id, 10),
        created_by: 4
      };

      const response = await rosterPeriodService.bulkAssignRoster(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage(`✅ Successfully assigned ${response.data.count} rosters! Estimated total: ${formatCurrency(estimatedAmount)}`);
        setShowBulkAssignModal(false);
        resetBulkAssignForm();
        await fetchRosterPeriods();

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data?.message || "Failed to bulk assign rosters");
      }
    } catch (err) {
      console.error("[RosterPeriods] Error bulk assigning rosters:", err);

      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to bulk assign rosters. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPeriod, bulkAssignForm, resetBulkAssignForm, fetchRosterPeriods, estimatedAmount, formatCurrency]);

  const handlePublishPeriod = useCallback(async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    setError(null);

    try {
      if (selectedPeriod.status === 'published') {
        throw new Error("This period is already published");
      }

      if (selectedPeriod.status === 'locked') {
        throw new Error("Locked periods cannot be published directly. Please unlock first.");
      }

      const response = await rosterPeriodService.publishRosterPeriod(selectedPeriod.id);

      if (response.data?.success === true) {
        setSuccessMessage("Roster period published successfully!");
        await fetchRosterPeriods();
        setShowPublishModal(false);

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data?.message || "Failed to publish roster period");
      }
    } catch (err) {
      console.error("[RosterPeriods] Error publishing roster period:", err);
      setError(err.response?.data?.message || err.message || "Failed to publish roster period");
    } finally {
      setActionLoading(false);
    }
  }, [selectedPeriod, fetchRosterPeriods]);

  const handleLockPeriod = useCallback(async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    setError(null);

    try {
      if (selectedPeriod.status === 'locked') {
        throw new Error("This period is already locked");
      }

      if (selectedPeriod.status !== 'published') {
        throw new Error(`Only published periods can be locked. Current status: ${selectedPeriod.status}`);
      }

      const response = await rosterPeriodService.lockRosterPeriod(selectedPeriod.id);

      if (response.data?.success === true) {
        setSuccessMessage("Roster period locked successfully!");
        await fetchRosterPeriods();
        setShowLockModal(false);

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data?.message || "Failed to lock roster period");
      }
    } catch (err) {
      console.error("[RosterPeriods] Error locking roster period:", err);
      setError(err.response?.data?.message || err.message || "Failed to lock roster period");
    } finally {
      setActionLoading(false);
    }
  }, [selectedPeriod, fetchRosterPeriods]);

  const handleDeletePeriod = useCallback(async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    setError(null);

    try {
      if (selectedPeriod.status !== 'draft') {
        throw new Error(`Cannot delete a ${selectedPeriod.status} period. Only draft periods can be deleted.`);
      }

      const response = await rosterPeriodService.deleteRosterPeriod(selectedPeriod.id);

      if (response.data?.success === true) {
        setSuccessMessage("Roster period deleted successfully!");
        await fetchRosterPeriods();
        setShowDeleteModal(false);

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data?.message || "Failed to delete roster period");
      }
    } catch (err) {
      console.error("[RosterPeriods] Error deleting roster period:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete roster period");
    } finally {
      setActionLoading(false);
    }
  }, [selectedPeriod, fetchRosterPeriods]);

  const togglePeriodDropdown = useCallback((periodId, e) => {
    if (e) e.stopPropagation();
    setShowPeriodDropdown(prev => prev === periodId ? null : periodId);
  }, []);

  const handleEmployeeSelection = useCallback((employeeId, isChecked) => {
    const idInt = parseInt(employeeId, 10);

    setBulkAssignForm(prev => {
      const currentIds = prev.employee_ids.map(id => parseInt(id, 10));

      if (isChecked) {
        if (!currentIds.includes(idInt)) {
          return {
            ...prev,
            employee_ids: [...currentIds, idInt].map(id => id.toString())
          };
        }
      } else {
        return {
          ...prev,
          employee_ids: currentIds.filter(id => id !== idInt).map(id => id.toString())
        };
      }
      return prev;
    });
  }, []);

  const isEmployeeSelected = useCallback((employeeId) => {
    const idInt = parseInt(employeeId, 10);
    return bulkAssignForm.employee_ids
      .map(id => parseInt(id, 10))
      .includes(idInt);
  }, [bulkAssignForm.employee_ids]);

  const handleSelectAllEmployees = useCallback(() => {
    if (bulkAssignForm.employee_ids.length === availableEmployees.length) {
      setBulkAssignForm(prev => ({
        ...prev,
        employee_ids: []
      }));
    } else {
      const allEmployeeIds = availableEmployees.map(emp => emp.id.toString());
      setBulkAssignForm(prev => ({
        ...prev,
        employee_ids: allEmployeeIds
      }));
    }
  }, [availableEmployees, bulkAssignForm.employee_ids.length]);

  const handleRefresh = useCallback(() => {
    Promise.all([
      fetchRosterPeriods(),
      fetchPayPeriods(),
      fetchAvailableEmployees(),
      fetchAvailableShifts()
    ]).catch(err => {
      console.error("[RosterPeriods] Error refreshing data:", err);
    });
  }, [fetchRosterPeriods, fetchPayPeriods, fetchAvailableEmployees, fetchAvailableShifts]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: rosterPeriods.length,
    draft: rosterPeriods.filter(p => p.status === 'draft').length,
    locked: rosterPeriods.filter(p => p.status === 'locked').length,
    published: rosterPeriods.filter(p => p.status === 'published').length
  }), [rosterPeriods]);

  if (loading && rosterPeriods.length === 0) {
    return (
      <div
        className="p-6 min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center" role="status" aria-label="Loading">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading fortnightly roster periods...</p>
        </div>
      </div>
    );
  }

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
          //console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          //console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div
        className="p-6 min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Fortnightly Roster Periods
              </h1>
              <p className="text-gray-600">
                Create and manage fortnightly roster periods for shift scheduling
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Organization:</span> {selectedOrganization?.name || "Not selected"} |
                <span className="font-medium ml-2">Total Fortnightly Periods:</span> {rosterPeriods.length}
              </div>
            </div>

            <div className="flex gap-2">
              {canAdd && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedOrganization}
                  aria-label="Create fortnightly period"
                >
                  <FaPlus className="h-4 w-4" aria-hidden="true" />
                  Create Fortnightly Period
                </button>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fadeIn" role="alert">
              <FaCheckCircle className="text-green-500 flex-shrink-0" aria-hidden="true" />
              <span className="text-green-700 flex-1">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-700 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-100"
                aria-label="Dismiss success message"
              >
                <FaTimesCircle aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-fadeIn" role="alert">
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" aria-hidden="true" />
              <span className="text-red-700 flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-100"
                aria-label="Dismiss error message"
              >
                <FaTimesCircle aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Calendar Info */}
          {fortnightCalendars.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarWeek className="text-blue-500 mr-3" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Available Fortnightly Calendars
                    </p>
                    <p className="text-sm text-blue-700">
                      {fortnightCalendars.length} calendar(s) found
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    Calendar ID: {fortnightCalendars[0]?.calendar_id}
                  </p>
                  <p className="text-xs text-blue-600">
                    {fortnightCalendars[0]?.calendar_name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={loading || payPeriodsLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label="Refresh data"
            >
              <FaSync className={loading || payPeriodsLoading ? "animate-spin" : ""} aria-hidden="true" />
              {loading || payPeriodsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Roster Periods Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Period Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dates (14 Days)
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rosters
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rosterPeriods.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FaCalendarWeek className="text-4xl text-gray-300 mb-3" aria-hidden="true" />
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            No fortnightly roster periods found
                          </p>
                          <p className="text-gray-500">
                            Create your first fortnightly roster period to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rosterPeriods.map((period) => {
                      const StatusIcon = getStatusIcon(period.status);

                      return (
                        <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaCalendarWeek className="h-5 w-5 text-blue-600" aria-hidden="true" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Fortnightly Period #{period.id}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Created: {formatDate(period.created_at)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <FaCalendarDay className="h-4 w-4 text-green-500 mr-2" aria-hidden="true" />
                                <span className="font-medium">Start: </span>
                                <span className="ml-1 text-gray-700">
                                  {formatDate(period.start_date)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <FaCalendarCheck className="h-4 w-4 text-red-500 mr-2" aria-hidden="true" />
                                <span className="font-medium">End: </span>
                                <span className="ml-1 text-gray-700">
                                  {formatDate(period.end_date)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Duration: 14 days (Fortnightly)
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-2">
                                {StatusIcon}
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(period.status)}`}>
                                {period.status?.charAt(0).toUpperCase() + period.status?.slice(1)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {period.status === 'draft' && 'Can be edited and scheduled'}
                              {period.status === 'locked' && 'Read-only, cannot be modified'}
                              {period.status === 'published' && 'Visible to employees'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {period.rosters_count || 0} rosters
                            </div>
                            <div className="text-sm text-gray-500">
                              {period.rosters_count === 0 ? 'No schedules yet' : 'Scheduled'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative period-dropdown">
                              <button
                                onClick={(e) => togglePeriodDropdown(period.id, e)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                aria-label="Period actions"
                                aria-expanded={showPeriodDropdown === period.id}
                              >
                                <span>Actions</span>
                                <FaChevronDown
                                  className={`h-3 w-3 transition-transform ${showPeriodDropdown === period.id ? 'rotate-180' : ''}`}
                                  aria-hidden="true"
                                />
                              </button>

                              {showPeriodDropdown === period.id && (
                                <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                  <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors focus:outline-none focus:bg-gray-100"
                                    onClick={() => {
                                      fetchRostersByPeriod(period.id);
                                      setSelectedPeriod(period);
                                      setShowRostersModal(true);
                                      setShowPeriodDropdown(null);
                                    }}
                                  >
                                    <FaList className="text-blue-500" aria-hidden="true" />
                                    View Rosters
                                  </button>

                                  {period.status === 'draft' && canEdit && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-green-50"
                                      onClick={() => {
                                        setBulkAssignForm(prev => ({
                                          ...prev,
                                          roster_period_id: period.id.toString(),
                                          employee_ids: []
                                        }));
                                        setSelectedPeriod(period);
                                        setShowBulkAssignModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaUsers className="text-green-500" aria-hidden="true" />
                                      Bulk Assign
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>

                                  {period.status === 'draft' && canEdit && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-green-50"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowPublishModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaCheckCircle className="text-green-500" aria-hidden="true" />
                                      Publish Period
                                    </button>
                                  )}

                                  {period.status === 'published' && canEdit && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-yellow-50"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowLockModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaLock className="text-yellow-500" aria-hidden="true" />
                                      Lock Period
                                    </button>
                                  )}

                                  {period.status === 'draft' && (
                                    <div className="border-t border-gray-100 my-1"></div>
                                  )}

                                  {period.status === 'draft' && canDelete && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-red-50"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowDeleteModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaTrash className="text-red-500" aria-hidden="true" />
                                      Delete Period
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-purple-50"
                                    onClick={() => {
                                      //console.log("Export period:", period.id);
                                      setShowPeriodDropdown(null);
                                    }}
                                  >
                                    <FaDownload className="text-purple-500" aria-hidden="true" />
                                    Export Data
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" aria-hidden="true" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">About Fortnightly Roster Periods</h4>
                <p className="text-sm text-blue-700">
                  • <strong>Draft</strong> periods can be edited and scheduled<br />
                  • <strong>Published</strong> periods are visible to employees<br />
                  • <strong>Locked</strong> periods are read-only and cannot be modified<br />
                  • Workflow: Draft → Publish → Lock<br />
                  • All periods are <strong>14 days (fortnightly)</strong><br />
                  • Based on system calendar: {fortnightCalendars[0]?.calendar_name || 'Fortnightly Calendar'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fortnightly Periods</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <FaCalendarWeek className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.draft}
                  </p>
                </div>
                <FaEdit className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Locked</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.locked}
                  </p>
                </div>
                <FaLock className="text-yellow-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.published}
                  </p>
                </div>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" />
              Quick Guide - Fortnightly Rosters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <h5 className="font-medium text-gray-900">Create Fortnightly Period</h5>
                </div>
                <p className="text-sm text-gray-600">
                  1. Click "Create Fortnightly Period"<br />
                  2. Select a fortnightly pay period<br />
                  3. Review period details<br />
                  4. Click "Create Fortnightly Period"
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUsers className="h-4 w-4 text-green-600" />
                  </div>
                  <h5 className="font-medium text-gray-900">Bulk Assign</h5>
                </div>
                <p className="text-sm text-gray-600">
                  1. Select a draft fortnight period<br />
                  2. Choose employees (checkboxes)<br />
                  3. Select a shift<br />
                  4. Click "Assign Rosters" (14 days per employee)
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <h5 className="font-medium text-gray-900">Publish & Lock</h5>
                </div>
                <p className="text-sm text-gray-600">
                  1. Ensure all schedules are set for 14 days<br />
                  2. Review period details<br />
                  3. Click "Publish" to make it visible<br />
                  4. Lock published periods for read-only
                </p>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Note: Only fortnightly (14-day) roster periods are supported. All periods are based on system calendars.<br />
              Current Organization: <span className="font-medium">{selectedOrganization?.name || "None selected"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Create Roster Period Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                      Create Fortnightly Roster Period
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedOrganization?.name || "No organization selected"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                    aria-label="Close modal"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a fortnightly pay period to create a roster period.
                  </p>

                  {payPeriodsLoading ? (
                    <div className="text-center py-8">
                      <FaSpinner className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600">Loading fortnightly periods...</p>
                    </div>
                  ) : payPeriods.filter(p => p.calendar_type === 'FORTNIGHTLY').length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Fortnightly Periods Found</h3>
                      <p className="text-gray-600">
                        No fortnightly pay periods available for this organization.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Fortnightly Pay Period
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {payPeriods
                          .filter(p => p.calendar_type === 'FORTNIGHTLY')
                          .map((period) => (
                            <div
                              key={period.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${formData.start_date === period.start_date?.split('T')[0]
                                ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              onClick={() => {
                                if (period.start_date) {
                                  setFormData(prev => ({
                                    ...prev,
                                    start_date: period.start_date.split('T')[0]
                                  }));
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && period.start_date) {
                                  setFormData(prev => ({
                                    ...prev,
                                    start_date: period.start_date.split('T')[0]
                                  }));
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 flex items-center gap-2">
                                    {period.calendar_name}
                                    {period.is_current && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        • Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-medium text-gray-700">{period.number_of_days} days</div>
                                  {formData.start_date === period.start_date?.split('T')[0] && (
                                    <div className="text-xs text-blue-600 font-medium mt-1">✓ Selected</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {formData.start_date && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Period Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Start Date</div>
                        <div className="text-sm font-medium">{formatDate(formData.start_date)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">End Date</div>
                        <div className="text-sm font-medium">
                          {(() => {
                            if (!formData.start_date) return "-";
                            const start = new Date(formData.start_date);
                            const end = new Date(start);
                            end.setDate(start.getDate() + 13);
                            return formatDate(end.toISOString());
                          })()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="text-sm font-medium">14 days (Fortnightly)</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Initial Status</div>
                        <div className="text-sm font-medium text-blue-600">Draft</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Type
                  </label>
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center gap-4">
                    <FaCalendarWeek className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-blue-700">Fortnightly</div>
                      <div className="text-sm text-blue-600">14 days period</div>
                    </div>
                  </div>
                </div>

                {fortnightCalendars.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Calendar Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-blue-700">Calendar Name</p>
                        <p className="text-sm font-medium text-blue-900">{fortnightCalendars[0]?.calendar_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Calendar ID</p>
                        <p className="text-sm font-medium text-blue-900 truncate">{fortnightCalendars[0]?.calendar_id}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-blue-700">Type</p>
                        <p className="text-sm font-medium text-blue-900">{fortnightCalendars[0]?.calendar_type} ({fortnightCalendars[0]?.number_of_days} days)</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-700">
                        <strong>Note:</strong> Roster periods are 14 days (fortnightly) based on the selected pay period's start date.
                        After creation, you can assign shifts to employees using the Bulk Assign feature.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePeriod}
                    disabled={isSubmitting || !selectedOrganization || !formData.start_date}
                    className={`px-5 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedOrganization && formData.start_date && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaCalendarWeek />
                        Create Fortnightly Period
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && selectedPeriod && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="bulk-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900" id="bulk-modal-title">
                      Bulk Assign Rosters
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Assign shifts to employees for Fortnightly Period #{selectedPeriod.id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBulkAssignModal(false);
                      resetBulkAssignForm();
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                    aria-label="Close modal"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleBulkAssign}>
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg border ${selectedPeriod.status === 'draft'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-red-50 border-red-200'
                      }`}>
                      <h4 className="font-medium text-gray-900 mb-3">Selected Period Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Period ID</p>
                          <p className="text-sm font-medium text-gray-900">#{selectedPeriod.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Period Type</p>
                          <p className="text-sm font-medium text-gray-900">Fortnightly</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedPeriod.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedPeriod.end_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`text-sm font-medium ${selectedPeriod.status === 'draft' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {selectedPeriod.status?.charAt(0).toUpperCase() + selectedPeriod.status?.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Existing Rosters</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPeriod.rosters_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-sm font-medium text-gray-900">14 days</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Organization</p>
                          <p className="text-sm font-medium text-gray-900">ID: {selectedPeriod.organization_id}</p>
                        </div>
                      </div>
                      {selectedPeriod.status !== 'draft' && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-600">
                          ⚠️ Only draft periods can be modified. This period is {selectedPeriod.status}.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Employees *
                        </label>
                        <div className="text-sm text-gray-500">
                          {bulkAssignForm.employee_ids.length} selected
                        </div>
                      </div>

                      {employeesLoading ? (
                        <div className="border border-gray-300 rounded-lg p-8 text-center">
                          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-gray-600">Loading employees...</p>
                        </div>
                      ) : availableEmployees.length > 0 ? (
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="select-all-employees"
                                  checked={bulkAssignForm.employee_ids.length === availableEmployees.length && availableEmployees.length > 0}
                                  onChange={handleSelectAllEmployees}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                  aria-label="Select all employees"
                                />
                                <label htmlFor="select-all-employees" className="ml-3 text-sm font-medium text-gray-700">
                                  Select All Employees ({availableEmployees.length})
                                </label>
                              </div>
                              <div className="text-sm text-gray-500">
                                Avg Rate: {formatCurrency(
                                  availableEmployees.reduce((sum, emp) => sum + (getEmployeeRate(emp)), 0) / availableEmployees.length
                                )}
                              </div>
                            </div>
                          </div>

                          <div 
                            className="max-h-60 overflow-y-auto p-2 custom-scrollbar"
                            onScroll={(e) => {
                              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                              if (scrollHeight - scrollTop <= clientHeight + 10) {
                                handleLoadMoreEmployees();
                              }
                            }}
                          >
                            <div className="space-y-1">
                              {availableEmployees.map((employee) => {
                                const rate = getEmployeeRate(employee);
                                return (
                                  <div key={employee.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                    <input
                                      type="checkbox"
                                      id={`employee-${employee.id}`}
                                      checked={isEmployeeSelected(employee.id.toString())}
                                      onChange={(e) => handleEmployeeSelection(employee.id.toString(), e.target.checked)}
                                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                      aria-label={`Select ${employee.first_name} ${employee.last_name}`}
                                    />
                                    <label htmlFor={`employee-${employee.id}`} className="ml-3 flex-1 cursor-pointer">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                          {employee.status === "Active" ? (
                                            <FaUserCheck className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <FaUserClock className="h-5 w-5 text-yellow-600" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || `Employee #${employee.id}`}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                ID: {employee.id} | Code: {employee.employee_code}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {employee.status}
                                              </span>
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                                                <FaDollarSign className="text-xs" />
                                                {formatCurrency(rate)}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Department: {employee.department?.name || "N/A"}
                                            {employee.designation && ` | ${employee.designation.title}`}
                                          </div>
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                            {isFetchingMore && (
                              <div className="py-2 text-center">
                                <FaSpinner className="h-5 w-5 text-blue-600 animate-spin mx-auto" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-8 text-center">
                          <FaUsers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No employees found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Make sure you have active employees in your organization
                          </p>
                        </div>
                      )}

                      <p className="mt-2 text-sm text-gray-500">
                        Select employees to assign rosters for the entire fortnight period
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Shift *
                      </label>

                      {shiftsLoading ? (
                        <div className="border border-gray-300 rounded-lg p-8 text-center">
                          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
                          <p className="text-gray-600">Loading shifts...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                          {availableShifts.map((shift) => (
                            <div key={shift.id} className="relative">
                              <input
                                type="radio"
                                id={`shift-${shift.id}`}
                                name="shift_id"
                                value={shift.id.toString()}
                                checked={bulkAssignForm.shift_id === shift.id.toString()}
                                onChange={(e) => setBulkAssignForm(prev => ({ ...prev, shift_id: e.target.value }))}
                                className="sr-only"
                                aria-label={`Select shift ${shift.name || shift.id}`}
                              />
                              <label
                                htmlFor={`shift-${shift.id}`}
                                className={`block p-4 border rounded-lg cursor-pointer transition-all ${bulkAssignForm.shift_id === shift.id.toString()
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-start">
                                  <div 
                                    className="h-10 w-10 rounded-lg mr-3 flex items-center justify-center mt-1"
                                    style={{ backgroundColor: shift.color_code || '#3B82F6' }}
                                  >
                                    <FaClock className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {shift.name || `Shift ${shift.id}`} (ID: {shift.id})
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {shift.start_time || '00:00'} - {shift.end_time || '00:00'}
                                    </div>
                                    {shift.hourly_rate && (
                                      <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                        <FaDollarSign />
                                        Rate: {formatCurrency(shift.hourly_rate)}/hr
                                      </div>
                                    )}
                                    {shift.description && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {shift.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rate and Amount Summary */}
                    {(bulkAssignForm.shift_id || bulkAssignForm.employee_ids.length > 0) && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FaMoneyBillWave className="text-blue-500" />
                          Rate & Amount Summary
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Rate Information</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-sm text-gray-600">Number of Employees:</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {bulkAssignForm.employee_ids.length}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-sm text-gray-600">Average Rate:</span>
                                <span className="text-sm font-medium text-green-600">
                                  {selectedEmployeesData.length > 0
                                    ? formatCurrency(selectedEmployeesData.reduce((sum, emp) => sum + getEmployeeRate(emp), 0) / selectedEmployeesData.length)
                                    : formatCurrency(25)}
                                </span>
                              </div>
                              {selectedShift && (
                                <div className="flex justify-between items-center p-2 bg-white rounded">
                                  <span className="text-sm text-gray-600">Shift Duration:</span>
                                  <span className="text-sm font-medium text-purple-600">
                                    {(() => {
                                      if (selectedShift.start_time && selectedShift.end_time) {
                                        const start = new Date(`2000-01-01T${selectedShift.start_time}`);
                                        const end = new Date(`2000-01-01T${selectedShift.end_time}`);
                                        const hours = (end - start) / (1000 * 60 * 60);
                                        return hours > 0 ? `${hours.toFixed(1)} hrs/day` : '8 hrs/day';
                                      }
                                      return '8 hrs/day';
                                    })()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Estimated Amount</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-sm text-gray-600">Period Days:</span>
                                <span className="text-sm font-medium">14 days</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="text-sm text-gray-600">Total Hours:</span>
                                <span className="text-sm font-medium">
                                  {(() => {
                                    const hoursPerDay = selectedShift?.start_time && selectedShift?.end_time
                                      ? (new Date(`2000-01-01T${selectedShift.end_time}`) - new Date(`2000-01-01T${selectedShift.start_time}`)) / (1000 * 60 * 60)
                                      : 8;
                                    const totalHours = hoursPerDay * 14 * bulkAssignForm.employee_ids.length;
                                    return totalHours.toFixed(1);
                                  })()} hrs
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-sm font-bold text-gray-700">Total Estimated:</span>
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(estimatedAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          * Estimated amount is calculated as: (Shift Hours × 14 days × Number of Employees × Average Rate)
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Assignment Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Selected Period:</span>
                          <span className="text-sm font-medium text-gray-900">
                            Fortnightly Period #{selectedPeriod.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Period Status:</span>
                          <span className={`text-sm font-medium ${selectedPeriod.status === 'draft' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {selectedPeriod.status?.charAt(0).toUpperCase() + selectedPeriod.status?.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Selected Employees:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {bulkAssignForm.employee_ids.length} employee(s)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Selected Shift:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {bulkAssignForm.shift_id ? (selectedShift?.name || `Shift ID: ${bulkAssignForm.shift_id}`) : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                          <span className="text-sm text-gray-600">Total Rosters to Create:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {selectedPeriod && bulkAssignForm.employee_ids.length > 0
                              ? 14 * bulkAssignForm.employee_ids.length
                              : 0} roster entries
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Estimated Amount:</span>
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(estimatedAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-700">
                            <strong>Important:</strong> This will create roster entries for each day in the fortnight
                            period for all selected employees with the chosen shift. This action cannot be undone.
                          </p>
                          <p className="text-sm text-yellow-700 mt-2">
                            <strong>Note:</strong> Only employees with "Active" status can be assigned rosters.
                            Estimated amount is calculated dynamically based on employee rates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkAssignModal(false);
                        resetBulkAssignForm();
                      }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || bulkAssignForm.employee_ids.length === 0 || !bulkAssignForm.shift_id || selectedPeriod.status !== 'draft'}
                      className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <FaUsers />
                          Assign Rosters ({formatCurrency(estimatedAmount)})
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Rosters Modal */}
      {showRostersModal && selectedPeriod && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="rosters-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900" id="rosters-modal-title">
                      Rosters for Fortnightly Period #{selectedPeriod.id}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {formatDate(selectedPeriod.start_date)} to {formatDate(selectedPeriod.end_date)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRostersModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Close modal"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Employee
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Roster Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Shift
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rosters.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <FaList className="text-3xl text-gray-300 mb-3" />
                              <p className="text-lg font-medium text-gray-900 mb-1">
                                No rosters found for this period
                              </p>
                              <p className="text-gray-500">
                                Use Bulk Assign to add rosters
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rosters.map((roster) => (
                          <tr key={roster.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <FaUsers className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    Employee ID: {roster.employee_id}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Roster ID: {roster.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(roster.roster_date)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                Shift ID: {roster.shift_id}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created: {formatDate(roster.created_at)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {rosters.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Rosters</p>
                        <p className="text-lg font-bold text-gray-900">{rosters.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unique Employees</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Set(rosters.map(r => r.employee_id)).size}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Period Days</p>
                        <p className="text-lg font-bold text-gray-900">
                          14 (Fortnightly)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowRostersModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && selectedPeriod && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="publish-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2" id="publish-modal-title">
                  Publish Fortnightly Roster Period
                </h3>

                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to publish this fortnightly roster period?<br />
                  <span className="font-medium">Fortnightly Period #{selectedPeriod.id}</span>
                </p>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> Published periods become visible to all employees and cannot be reverted to draft.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishPeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Yes, Publish
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock Confirmation Modal */}
      {showLockModal && selectedPeriod && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="lock-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaLock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2" id="lock-modal-title">
                  Lock Fortnightly Roster Period
                </h3>

                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to lock this fortnightly roster period?<br />
                  <span className="font-medium">Fortnightly Period #{selectedPeriod.id}</span>
                </p>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> Locked periods become read-only and cannot be edited.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLockModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLockPeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Locking...
                      </>
                    ) : (
                      <>
                        <FaLock />
                        Yes, Lock
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPeriod && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2" id="delete-modal-title">
                  Delete Fortnightly Roster Period
                </h3>

                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this fortnightly roster period?<br />
                  <span className="font-medium">Fortnightly Period #{selectedPeriod.id}</span>
                </p>

                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">
                        <strong>Warning:</strong> This action cannot be undone. All roster data associated with this period will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Yes, Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default RosterPeriods;
import React, { useState, useEffect } from "react";
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
  FaCalendarMinus
} from "react-icons/fa";
import { rosterPeriodService } from "../../services/rosterPeriodService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import axios from "axios";

const RosterPeriods = () => {
  const [rosterPeriods, setRosterPeriods] = useState([]);
  const [payPeriods, setPayPeriods] = useState([]);
  const [fortnightCalendars, setFortnightCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payPeriodsLoading, setPayPeriodsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showRostersModal, setShowRostersModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rosters, setRosters] = useState([]);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);

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

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'locked': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'published': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FaEdit className="text-blue-500" />;
      case 'locked': return <FaLock className="text-yellow-500" />;
      case 'published': return <FaCheckCircle className="text-green-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const dateOnly = dateString.split('T')[0];
      const date = new Date(dateOnly);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "fortnightly",
      start_date: "",
      created_by: 4
    });
  };

  // Fetch roster periods from /periods endpoint
  const fetchRosterPeriods = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedOrganization?.id) {
        throw new Error("No organization selected");
      }

      const response = await rosterPeriodService.getRosterPeriods({
        organization_id: selectedOrganization.id
      });

      console.log("Roster periods response:", response.data);

      if (response.data?.success === true) {
        const fortnightPeriods = response.data.data.filter(period => 
          period.type === "fortnightly"
        );
        setRosterPeriods(fortnightPeriods || []);
      } else {
        setRosterPeriods([]);
      }
    } catch (err) {
      console.error("Error fetching roster periods:", err);
      setError(err.response?.data?.message || "Failed to load roster periods");
      setRosterPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pay periods (for calendar data)
  const fetchPayPeriods = async () => {
    try {
      setPayPeriodsLoading(true);
      setError(null);

      if (!selectedOrganization?.id) {
        setPayPeriods([]);
        setFortnightCalendars([]);
        return;
      }

      const response = await rosterPeriodService.getPayPeriods({
        organization_id: selectedOrganization.id
      });

      console.log("Pay periods response:", response.data);

      if (response.data?.status === true) {
        setPayPeriods(response.data.data || []);
        
        // Extract unique fortnightly calendars
        const fortnightCalendars = response.data.data.reduce((acc, period) => {
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
        console.log("Fortnight calendars extracted:", fortnightCalendars);
      } else {
        setPayPeriods([]);
        setFortnightCalendars([]);
      }
    } catch (err) {
      console.error("Error fetching pay periods:", err);
      setPayPeriods([]);
      setFortnightCalendars([]);
    } finally {
      setPayPeriodsLoading(false);
    }
  };

  // Fetch available employees
  const fetchAvailableEmployees = async () => {
    try {
      setEmployeesLoading(true);

      if (!selectedOrganization?.id) {
        setAvailableEmployees([]);
        return;
      }

      const token = localStorage.getItem('ACCESS_TOKEN');
      const response = await axios.get('https://api.chrispp.com/api/v1/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          organization_id: selectedOrganization.id
        }
      });

      if (response.data?.success === true) {
        const activeEmployees = response.data.data.filter(emp => 
          emp.status === "Active" || emp.status === "active"
        );
        setAvailableEmployees(activeEmployees || []);
      } else {
        setAvailableEmployees([]);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setAvailableEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch available shifts
  const fetchAvailableShifts = async () => {
    try {
      setShiftsLoading(true);

      if (!selectedOrganization?.id) {
        setAvailableShifts([]);
        return;
      }

      const token = localStorage.getItem('ACCESS_TOKEN');
      const response = await axios.get('https://api.chrispp.com/api/v1/shifts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          organization_id: selectedOrganization.id
        }
      });

      if (response.data?.success === true) {
        setAvailableShifts(response.data.data || []);
      } else {
        setAvailableShifts([]);
      }
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setAvailableShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  };

  // Fetch rosters for a period
  const fetchRostersByPeriod = async (periodId) => {
    try {
      const response = await rosterPeriodService.getRostersByPeriod(periodId);
      if (response.data?.success === true) {
        setRosters(response.data.data || []);
      } else {
        setRosters([]);
      }
    } catch (err) {
      console.error("Error fetching rosters:", err);
      setRosters([]);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (selectedOrganization) {
      fetchRosterPeriods();
      fetchPayPeriods();
      fetchAvailableEmployees();
      fetchAvailableShifts();
    }
  }, [selectedOrganization]);

  // Open create modal with fortnightly periods like timesheet
  const openCreateModal = async () => {
    if (!selectedOrganization) {
      alert("Please select an organization first");
      return;
    }
    
    resetForm();
    
    // Fetch pay periods if not already loaded
    if (payPeriods.length === 0) {
      await fetchPayPeriods();
    }
    
    // Set default selection to current fortnightly period
    const currentFortnightly = payPeriods.find(p => 
      p.calendar_type === 'FORTNIGHTLY' && p.is_current === true
    );
    
    if (currentFortnightly && currentFortnightly.start_date) {
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
  };

  // Handle create roster period
  const handleCreatePeriod = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!selectedOrganization?.id) {
      setError("No organization selected");
      setIsSubmitting(false);
      return;
    }

    if (!formData.start_date) {
      setError("Please select a fortnightly pay period");
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        organization_id: parseInt(selectedOrganization.id, 10),
        type: "fortnightly",
        start_date: formData.start_date,
        created_by: 4
      };

      console.log("Creating fortnightly roster period with data:", dataToSend);

      const response = await rosterPeriodService.createRosterPeriod(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage("Fortnightly roster period created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchRosterPeriods();
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to create roster period");
      }
    } catch (err) {
      console.error("Error creating roster period:", err);
      setError(err.response?.data?.message || "Failed to create roster period");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk assign
  const handleBulkAssign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let rosterPeriodId;
      
      if (selectedPeriod?.id) {
        rosterPeriodId = selectedPeriod.id;
      } else if (bulkAssignForm.roster_period_id) {
        rosterPeriodId = bulkAssignForm.roster_period_id;
      } else {
        throw new Error("Please select a roster period first");
      }

      if (selectedPeriod && selectedPeriod.status !== 'draft') {
        throw new Error(`Cannot assign to a ${selectedPeriod.status} period. Only draft periods can be modified.`);
      }

      let employeeIdsArray = [];
      
      if (Array.isArray(bulkAssignForm.employee_ids)) {
        employeeIdsArray = bulkAssignForm.employee_ids.map(id => {
          const numId = parseInt(id, 10);
          if (isNaN(numId)) {
            throw new Error(`Invalid employee ID: ${id}`);
          }
          return numId;
        });
      }
      
      if (employeeIdsArray.length === 0) {
        throw new Error("Please select at least one employee");
      }

      if (!bulkAssignForm.shift_id) {
        throw new Error("Please select a shift");
      }

      const dataToSend = {
        roster_period_id: parseInt(rosterPeriodId, 10),
        employee_ids: employeeIdsArray,
        shift_id: parseInt(bulkAssignForm.shift_id, 10),
        created_by: 4
      };

      const response = await rosterPeriodService.bulkAssignRoster(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage(`✅ Successfully assigned ${response.data.count} rosters!`);
        setShowBulkAssignModal(false);
        setBulkAssignForm({
          roster_period_id: "",
          employee_ids: [],
          shift_id: "",
          created_by: 4
        });
        
        fetchRosterPeriods();
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to bulk assign rosters");
      }
    } catch (err) {
      console.error("❌ Error bulk assigning rosters:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to bulk assign rosters. Please check the data and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle publish period
  const handlePublishPeriod = async () => {
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
        fetchRosterPeriods();
        setShowPublishModal(false);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to publish roster period");
      }
    } catch (err) {
      console.error("Error publishing roster period:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to publish roster period. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle lock period
  const handleLockPeriod = async () => {
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
        fetchRosterPeriods();
        setShowLockModal(false);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to lock roster period");
      }
    } catch (err) {
      console.error("Error locking roster period:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to lock roster period. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete period
  const handleDeletePeriod = async () => {
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
        fetchRosterPeriods();
        setShowDeleteModal(false);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to delete roster period");
      }
    } catch (err) {
      console.error("Error deleting roster period:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete roster period");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle period dropdown
  const togglePeriodDropdown = (periodId, e) => {
    if (e) e.stopPropagation();
    if (showPeriodDropdown === periodId) {
      setShowPeriodDropdown(null);
    } else {
      setShowPeriodDropdown(periodId);
    }
  };

  // Handle employee selection with checkboxes
  const handleEmployeeSelection = (employeeId, isChecked) => {
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
  };

  // Check if employee is selected
  const isEmployeeSelected = (employeeId) => {
    const idInt = parseInt(employeeId, 10);
    return bulkAssignForm.employee_ids
      .map(id => parseInt(id, 10))
      .includes(idInt);
  };

  // Handle select all employees
  const handleSelectAllEmployees = () => {
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
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPeriodDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading && rosterPeriods.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading fortnightly roster periods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
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
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus className="h-4 w-4" />
              Create Fortnightly Period
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <span className="text-green-700 flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-700 hover:text-green-900"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* Calendar Info */}
        {fortnightCalendars.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaCalendarWeek className="text-blue-500 mr-3" />
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
            onClick={() => {
              fetchRosterPeriods();
              fetchPayPeriods();
              fetchAvailableEmployees();
              fetchAvailableShifts();
            }}
            disabled={loading || payPeriodsLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync className={loading || payPeriodsLoading ? "animate-spin" : ""} />
            {loading || payPeriodsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Roster Periods Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dates (14 Days)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rosters
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rosterPeriods.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaCalendarWeek className="text-4xl text-gray-300 mb-3" />
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
                              <FaCalendarWeek className="h-5 w-5 text-blue-600" />
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
                              <FaCalendarDay className="h-4 w-4 text-green-500 mr-2" />
                              <span className="font-medium">Start: </span>
                              <span className="ml-1 text-gray-700">
                                {formatDate(period.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FaCalendarCheck className="h-4 w-4 text-red-500 mr-2" />
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
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePeriodDropdown(period.id, e);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                            >
                              <span>Actions</span>
                              <FaChevronDown className={`h-3 w-3 transition-transform ${showPeriodDropdown === period.id ? 'rotate-180' : ''}`} />
                            </button>

                            {showPeriodDropdown === period.id && (
                              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10" onClick={(e) => e.stopPropagation()}>
                                <div className="py-1">
                                  <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                      fetchRostersByPeriod(period.id);
                                      setSelectedPeriod(period);
                                      setShowRostersModal(true);
                                      setShowPeriodDropdown(null);
                                    }}
                                  >
                                    <FaList className="text-blue-500" />
                                    View Rosters
                                  </button>

                                  {period.status === 'draft' && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
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
                                      <FaUsers className="text-green-500" />
                                      Bulk Assign
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>

                                  {period.status === 'draft' && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowPublishModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaCheckCircle className="text-green-500" />
                                      Publish Period
                                    </button>
                                  )}

                                  {period.status === 'draft' && (
                                    <div className="border-t border-gray-100 my-1"></div>
                                  )}

                                  {period.status === 'draft' && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowDeleteModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaTrash className="text-red-500" />
                                      Delete Period
                                    </button>
                                  )}

                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                                    onClick={() => {
                                      console.log("Export period:", period.id);
                                      setShowPeriodDropdown(null);
                                    }}
                                  >
                                    <FaDownload className="text-purple-500" />
                                    Export Data
                                  </button>
                                </div>
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
            <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
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
      </div>

      {/* Create Roster Period Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      Create Fortnightly Roster Period
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedOrganization?.name || "No organization selected"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    disabled={isSubmitting}
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
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {payPeriods
                          .filter(p => p.calendar_type === 'FORTNIGHTLY')
                          .map((period) => (
                          <div
                            key={period.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                              formData.start_date === period.start_date?.split('T')[0]
                                ? 'border-blue-300 bg-blue-50'
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
                                  <div className="text-xs text-blue-600 font-medium mt-1">• Selected</div>
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
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePeriod}
                    disabled={isSubmitting || !selectedOrganization || !formData.start_date}
                    className={`px-5 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                      selectedOrganization && formData.start_date && !isSubmitting
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      Bulk Assign Rosters
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Assign shifts to employees for Fortnightly Period #{selectedPeriod.id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBulkAssignModal(false);
                      setBulkAssignForm({
                        roster_period_id: "",
                        employee_ids: [],
                        shift_id: "",
                        created_by: 4
                      });
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleBulkAssign}>
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg border ${
                      selectedPeriod.status === 'draft' 
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
                          <p className={`text-sm font-medium ${
                            selectedPeriod.status === 'draft' ? 'text-green-600' : 'text-red-600'
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
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="select-all-employees"
                                checked={bulkAssignForm.employee_ids.length === availableEmployees.length && availableEmployees.length > 0}
                                onChange={handleSelectAllEmployees}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="select-all-employees" className="ml-3 text-sm font-medium text-gray-700">
                                Select All Employees ({availableEmployees.length})
                              </label>
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto p-2">
                            <div className="space-y-1">
                              {availableEmployees.map((employee) => (
                                <div key={employee.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                  <input
                                    type="checkbox"
                                    id={`employee-${employee.id}`}
                                    checked={isEmployeeSelected(employee.id.toString())}
                                    onChange={(e) => handleEmployeeSelection(employee.id.toString(), e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
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
                                              {employee.first_name} {employee.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ID: {employee.id} | Code: {employee.employee_code}
                                            </div>
                                          </div>
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            employee.status === "Active" 
                                              ? "bg-green-100 text-green-800" 
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}>
                                            {employee.status}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Department: {employee.department?.name || "N/A"}
                                          {employee.designation && ` | ${employee.designation.title}`}
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                              />
                              <label
                                htmlFor={`shift-${shift.id}`}
                                className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                                  bulkAssignForm.shift_id === shift.id.toString()
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className="h-10 w-10 rounded-lg bg-blue-500 mr-3 flex items-center justify-center mt-1">
                                    <FaClock className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {shift.name || `Shift ${shift.id}`} (ID: {shift.id})
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {shift.start_time || '00:00'} - {shift.end_time || '00:00'}
                                    </div>
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
                          <span className={`text-sm font-medium ${
                            selectedPeriod.status === 'draft' ? 'text-green-600' : 'text-red-600'
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
                            {bulkAssignForm.shift_id ? `Shift ID: ${bulkAssignForm.shift_id}` : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Rosters to Create:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {selectedPeriod && bulkAssignForm.employee_ids.length > 0 
                              ? 14 * bulkAssignForm.employee_ids.length
                              : 0} roster entries
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
                        setBulkAssignForm({
                          roster_period_id: "",
                          employee_ids: [],
                          shift_id: "",
                          created_by: 4
                        });
                      }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || bulkAssignForm.employee_ids.length === 0 || !bulkAssignForm.shift_id || selectedPeriod.status !== 'draft'}
                      className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <FaUsers />
                          Assign Rosters
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      Rosters for Fortnightly Period #{selectedPeriod.id}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {formatDate(selectedPeriod.start_date)} to {formatDate(selectedPeriod.end_date)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRostersModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Roster Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Shift
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                    <div className="flex justify-between items-center">
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
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
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
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishPeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
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
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLockPeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
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
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePeriod}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fortnightly Periods</p>
              <p className="text-2xl font-bold text-gray-800">{rosterPeriods.length}</p>
            </div>
            <FaCalendarWeek className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-blue-600">
                {rosterPeriods.filter(p => p.status === 'draft').length}
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
                {rosterPeriods.filter(p => p.status === 'locked').length}
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
                {rosterPeriods.filter(p => p.status === 'published').length}
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
  );
};

export default RosterPeriods;
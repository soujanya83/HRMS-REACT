import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSync,
  FaCalendarCheck,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPrint,
  FaDownload,
  FaFilter,
  FaSearch,
  FaUsers,
  FaUserPlus,
  FaList,
  FaChevronDown
} from "react-icons/fa";
import { rosterPeriodService } from "../../services/rosterPeriodService";
import { useOrganizations } from "../../contexts/OrganizationContext";

const RosterPeriods = () => {
  const [rosterPeriods, setRosterPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Form state
  const [formData, setFormData] = useState({
    type: "weekly",
    start_date: "",
  });

  // Bulk assign form state
  const [bulkAssignForm, setBulkAssignForm] = useState({
    roster_period_id: "",
    employee_ids: [],
    shift_id: "",
    created_by: 4
  });

  const { selectedOrganization } = useOrganizations();

  // Roster period types
  const periodTypes = [
    { value: "weekly", label: "Weekly", icon: FaCalendarDay },
    { value: "fortnightly", label: "Fortnightly", icon: FaCalendarWeek },
    { value: "monthly", label: "Monthly", icon: FaCalendar }
  ];

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

  // Fetch roster periods
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
        setRosterPeriods(response.data.data || []);
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
      setError("Failed to load roster details");
      setRosters([]);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (selectedOrganization) {
      fetchRosterPeriods();
      setFormData(prev => ({
        ...prev,
        start_date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [selectedOrganization]);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bulk assign form changes
  const handleBulkAssignChange = (e) => {
    const { name, value } = e.target;
    setBulkAssignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create roster period
  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedOrganization?.id) {
      setError("No organization selected");
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        organization_id: parseInt(selectedOrganization.id, 10),
        type: formData.type,
        start_date: formData.start_date,
        created_by: 4
      };

      console.log("Creating roster period with data:", dataToSend);

      const response = await rosterPeriodService.createRosterPeriod(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage("Roster period created successfully!");
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

  const handleBulkAssign = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const employeeIdsArray = bulkAssignForm.employee_ids
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
        .map(id => parseInt(id, 10));

      const dataToSend = {
        ...bulkAssignForm,
        employee_ids: employeeIdsArray,
        created_by: 4
      };

      console.log("Bulk assigning roster:", dataToSend);

      const response = await rosterPeriodService.bulkAssignRoster(dataToSend);

      if (response.data?.success === true) {
        setSuccessMessage(`Successfully assigned ${response.data.count} rosters!`);
        setShowBulkAssignModal(false);
        setBulkAssignForm({
          roster_period_id: "",
          employee_ids: [],
          shift_id: "",
          created_by: 4
        });
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.data?.message || "Failed to bulk assign rosters");
      }
    } catch (err) {
      console.error("Error bulk assigning rosters:", err);
      setError(err.response?.data?.message || "Failed to bulk assign rosters");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle publish period
  const handlePublishPeriod = async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    try {
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
      setError(err.response?.data?.message || "Failed to publish roster period");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle lock period
  const handleLockPeriod = async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    try {
      console.log("Attempting to lock period ID:", selectedPeriod.id);
      
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
      setError(err.response?.data?.message || "Failed to lock roster period");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete period
  const handleDeletePeriod = async () => {
    if (!selectedPeriod) return;

    setActionLoading(true);
    try {
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
      setError(err.response?.data?.message || "Failed to delete roster period");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "weekly",
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate end date based on type and start date
  const calculateEndDate = (startDate, type) => {
    if (!startDate) return "-";
    
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (type) {
      case 'weekly':
        end.setDate(start.getDate() + 6);
        break;
      case 'fortnightly':
        end.setDate(start.getDate() + 13);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        end.setDate(start.getDate() - 1);
        break;
      default:
        return "-";
    }
    
    return formatDate(end);
  };

  // Get period type icon
  const getPeriodTypeIcon = (type) => {
    const typeObj = periodTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FaCalendarAlt;
  };

  // Get period type label
  const getPeriodTypeLabel = (type) => {
    const typeObj = periodTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  // Toggle period dropdown
  const togglePeriodDropdown = (periodId) => {
    if (showPeriodDropdown === periodId) {
      setShowPeriodDropdown(null);
    } else {
      setShowPeriodDropdown(periodId);
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
          <p className="text-gray-600">Loading roster periods...</p>
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
              Roster Periods
            </h1>
            <p className="text-gray-600">
              Create and manage roster periods for shift scheduling
            </p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Organization:</span> {selectedOrganization?.name || "Not selected"} | 
              <span className="font-medium ml-2">Total Periods:</span> {rosterPeriods.length}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaUserPlus className="h-4 w-4" />
              Bulk Assign
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus className="h-4 w-4" />
              Create Period
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

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchRosterPeriods}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
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
                    Type & Dates
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
                        <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          No roster periods found
                        </p>
                        <p className="text-gray-500">
                          Create your first roster period to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rosterPeriods.map((period) => {
                    const PeriodTypeIcon = getPeriodTypeIcon(period.type);
                    const StatusIcon = getStatusIcon(period.status);
                    
                    return (
                      <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <PeriodTypeIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getPeriodTypeLabel(period.type)} Period #{period.id}
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
                              Duration: {period.type === 'weekly' ? '7 days' : 
                                       period.type === 'fortnightly' ? '14 days' : '1 month'}
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
                            {period.status === 'published' && 'Finalized and visible to employees'}
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
                            {/* Action Dropdown Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePeriodDropdown(period.id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                            >
                              <span>Actions</span>
                              <FaChevronDown className={`h-3 w-3 transition-transform ${showPeriodDropdown === period.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showPeriodDropdown === period.id && (
                              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  {/* View Rosters */}
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

                                  {/* Bulk Assign - only for draft */}
                                  {period.status === 'draft' && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                      onClick={() => {
                                        setBulkAssignForm(prev => ({ ...prev, roster_period_id: period.id }));
                                        setSelectedPeriod(period);
                                        setShowBulkAssignModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaUsers className="text-green-500" />
                                      Bulk Assign
                                    </button>
                                  )}

                                  {/* Divider */}
                                  <div className="border-t border-gray-100 my-1"></div>

                                  {/* Publish - only for draft */}
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

                                  {/* Lock - only for draft */}
                                  {period.status === 'draft' && (
                                    <button
                                      className="w-full text-left px-4 py-2.5 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                      onClick={() => {
                                        setSelectedPeriod(period);
                                        setShowLockModal(true);
                                        setShowPeriodDropdown(null);
                                      }}
                                    >
                                      <FaLock className="text-yellow-500" />
                                      Lock Period
                                    </button>
                                  )}

                                  {/* Divider for delete */}
                                  {period.status === 'draft' && (
                                    <div className="border-t border-gray-100 my-1"></div>
                                  )}

                                  {/* Delete - only for draft */}
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

                                  {/* Export */}
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
              <h4 className="font-medium text-blue-900 mb-1">About Roster Periods</h4>
              <p className="text-sm text-blue-700">
                • <strong>Draft</strong> periods can be edited and scheduled<br />
                • <strong>Locked</strong> periods are read-only and cannot be modified<br />
                • <strong>Published</strong> periods are finalized and visible to employees<br />
                • Create periods based on your scheduling needs: Weekly, Fortnightly, or Monthly
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
                      Create Roster Period
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedOrganization?.name || "No organization selected"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePeriod}>
                  <div className="space-y-4">
                    {/* Period Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Period Type *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {periodTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = formData.type === type.value;
                          return (
                            <button
                              type="button"
                              key={type.value}
                              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className="h-6 w-6 mb-2" />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleFormChange}
                          required
                          className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Roster will {formData.type === 'weekly' ? 'end 6 days after start date' : 
                                   formData.type === 'fortnightly' ? 'end 13 days after start date' : 
                                   'end on the last day of the month'}
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Period Preview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-medium text-gray-900">{formatDate(formData.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-medium text-gray-900">{calculateEndDate(formData.start_date, formData.type)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-gray-900">
                            {formData.type === 'weekly' ? '7 days (1 week)' : 
                             formData.type === 'fortnightly' ? '14 days (2 weeks)' : 
                             'Approx. 1 month'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
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
                      type="submit"
                      disabled={isSubmitting || !selectedOrganization}
                      className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaCalendarAlt />
                          Create Period
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

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
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
                      Bulk Assign Rosters
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Assign shifts to multiple employees for a period
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkAssignModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FaTimesCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleBulkAssign}>
                  <div className="space-y-4">
                    {/* Period ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roster Period ID *
                      </label>
                      <input
                        type="number"
                        name="roster_period_id"
                        value={bulkAssignForm.roster_period_id}
                        onChange={handleBulkAssignChange}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter roster period ID"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Current period: {selectedPeriod?.id ? `Period #${selectedPeriod.id}` : 'Select from table'}
                      </p>
                    </div>

                    {/* Employee IDs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee IDs *
                      </label>
                      <input
                        type="text"
                        name="employee_ids"
                        value={bulkAssignForm.employee_ids}
                        onChange={handleBulkAssignChange}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter employee IDs separated by commas (e.g., 1,2,3)"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Separate multiple employee IDs with commas
                      </p>
                    </div>

                    {/* Shift ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift ID *
                      </label>
                      <input
                        type="number"
                        name="shift_id"
                        value={bulkAssignForm.shift_id}
                        onChange={handleBulkAssignChange}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter shift ID"
                      />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
                      <p className="text-sm text-blue-700">
                        • Creates roster entries for each day in the period<br />
                        • Assigns the same shift to all specified employees<br />
                        • Cannot be undone - use with caution
                      </p>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBulkAssignModal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
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
                          Bulk Assign
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
                      Rosters for {getPeriodTypeLabel(selectedPeriod.type)} Period #{selectedPeriod.id}
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
                                    {roster.employee?.first_name} {roster.employee?.last_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {roster.employee?.employee_code}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(roster.roster_date)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                Shift ID: {roster.shift_id || 'Not assigned'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {roster.start_time || 'No time'} - {roster.end_time || 'No time'}
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

                {/* Summary */}
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
                          {selectedPeriod.type === 'weekly' ? '7' : 
                           selectedPeriod.type === 'fortnightly' ? '14' : '30'}
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
                  Publish Roster Period
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to publish this roster period?<br />
                  <span className="font-medium">{getPeriodTypeLabel(selectedPeriod.type)} Period #{selectedPeriod.id}</span>
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
                  Lock Roster Period
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to lock this roster period?<br />
                  <span className="font-medium">{getPeriodTypeLabel(selectedPeriod.type)} Period #{selectedPeriod.id}</span>
                </p>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> Locked periods become read-only and cannot be edited. You can still publish them later.
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
                  Delete Roster Period
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this roster period?<br />
                  <span className="font-medium">{getPeriodTypeLabel(selectedPeriod.type)} Period #{selectedPeriod.id}</span>
                  <br />
                  <span className="text-sm">{formatDate(selectedPeriod.start_date)} to {formatDate(selectedPeriod.end_date)}</span>
                </p>

                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">
                        <strong>Warning:</strong> This action cannot be undone. All associated data will be permanently deleted.
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
    </div>
  );
};

export default RosterPeriods;
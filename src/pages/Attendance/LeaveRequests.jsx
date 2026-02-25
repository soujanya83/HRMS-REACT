import React, { useState, useEffect } from "react";
import {
  FaSync,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaSpinner,
  FaInfoCircle,
  FaFileAlt,
  FaUser,
  FaBriefcase,
  FaRedoAlt,
} from "react-icons/fa";
import axiosClient from "../../axiosClient";

// Xero Leave Management Component
const XeroLeaveManagement = () => {
  // Hardcoded constants (to be replaced with context/props later)
  const ORGANIZATION_ID = "15";
  const EMPLOYEE_ID = "101";

  // State for leave types
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // State for leave history
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // State for leave application form
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch leave history on component mount
  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Fetch leave history from API using axiosClient
  const fetchLeaveHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);

    try {
      console.log("Fetching leave history...");
      const response = await axiosClient.get('/xero/leaves', {
        params: {
          organization_id: ORGANIZATION_ID,
          employee_id: EMPLOYEE_ID,
        }
      });

      console.log("Leave history response:", response.data);

      let historyData = [];

      if (response.data?.status === true && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      } else if (Array.isArray(response.data)) {
        historyData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      }

      setLeaveHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch leave history:", error);
      setHistoryError(
        error.response?.data?.message ||
        error.message ||
        "Failed to load leave history"
      );
      showToast("Failed to load leave history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Sync leave types from Xero using axiosClient
  const syncLeaveTypes = async () => {
    setLoadingSync(true);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      console.log("Syncing leave types from Xero...");
      
      const response = await axiosClient.post('/xero/leaves/sync-types', {
        organization_id: ORGANIZATION_ID,
      });

      console.log("Sync types response:", response.data);

      if (response.data?.status === true && Array.isArray(response.data.data)) {
        setLeaveTypes(response.data.data);
        setSyncSuccess(`Successfully synced ${response.data.data.length} leave types from Xero`);
        showToast(`Synced ${response.data.data.length} leave types`, "success");
        
        // Set default leave type if available
        if (response.data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            leave_type_id: response.data.data[0].id || response.data.data[0].xero_leave_type_id,
          }));
        }
      } else {
        throw new Error(response.data?.message || "Failed to sync leave types");
      }
    } catch (error) {
      console.error("Sync error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to sync leave types from Xero";
      setSyncError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoadingSync(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.leave_type_id) {
      errors.leave_type_id = "Please select a leave type";
    }
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      errors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        errors.end_date = "End date cannot be before start date";
      }
    }
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    return errors;
  };

  // Calculate number of days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Handle form submission using axiosClient
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      console.log("Submitting leave request...");
      
      // Find selected leave type to get its ID
      const selectedLeaveType = leaveTypes.find(
        type => (type.id === formData.leave_type_id || type.xero_leave_type_id === formData.leave_type_id)
      );
      
      const leaveTypeId = selectedLeaveType?.xero_leave_type_id || selectedLeaveType?.id || formData.leave_type_id;

      const response = await axiosClient.post('/xero/leaves/apply', {
        organization_id: ORGANIZATION_ID,
        employee_id: EMPLOYEE_ID,
        leave_type_id: leaveTypeId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description.trim(),
      });

      console.log("Submit response:", response.data);

      if (response.data?.status === true) {
        setSubmitSuccess(response.data.message || "Leave request submitted successfully");
        showToast("Leave request submitted successfully!", "success");
        
        // Reset form
        setFormData({
          leave_type_id: leaveTypes.length > 0 ? (leaveTypes[0].id || leaveTypes[0].xero_leave_type_id) : "",
          start_date: "",
          end_date: "",
          description: "",
        });
        setFormErrors({});
        
        // Refresh leave history
        await fetchLeaveHistory();
      } else {
        throw new Error(response.data?.message || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit leave request";
      setSubmitError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle className="text-green-500" /> },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock className="text-yellow-500" /> },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimesCircle className="text-red-500" /> },
    };

    const normalizedStatus = status?.toLowerCase() || 'pending';
    const style = statusMap[normalizedStatus] || statusMap.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status || 'Pending'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Calculate total days for display
  const totalDays = calculateDays(formData.start_date, formData.end_date);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] ${
            toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            {toast.type === 'success' ? (
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
            ) : (
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0" />
            )}
            <p className={`text-sm font-medium flex-1 ${
              toast.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <FaTimesCircle className="text-gray-400 text-sm" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Xero Leave Management
              </h1>
              <p className="text-gray-600">
                Sync leave types, apply for leaves, and track your leave history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <FaUser className="text-gray-400" />
                <span className="text-sm text-gray-600">Employee ID:</span>
                <span className="font-semibold text-gray-900">{EMPLOYEE_ID}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <FaBriefcase className="text-gray-400" />
                <span className="text-sm text-gray-600">Org ID:</span>
                <span className="font-semibold text-gray-900">{ORGANIZATION_ID}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaSync className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">
                    Sync Xero Leave Types
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Fetch the latest leave types from your Xero account
                  </p>
                </div>
              </div>
              <button
                onClick={syncLeaveTypes}
                disabled={loadingSync}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loadingSync ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaSync />
                    Sync Leave Types
                  </>
                )}
              </button>
            </div>

            {/* Sync Status */}
            {syncSuccess && (
              <div className="mt-4 bg-green-500/20 text-green-100 p-3 rounded-lg flex items-center gap-2">
                <FaCheckCircle />
                <span className="text-sm">{syncSuccess}</span>
              </div>
            )}
            {syncError && (
              <div className="mt-4 bg-red-500/20 text-red-100 p-3 rounded-lg flex items-center gap-2">
                <FaTimesCircle />
                <span className="text-sm">{syncError}</span>
              </div>
            )}

            {/* Leave Types Summary */}
            {leaveTypes.length > 0 && (
              <div className="mt-4 bg-white/10 p-4 rounded-lg">
                <p className="text-white text-sm mb-2">
                  {leaveTypes.length} leave types available:
                </p>
                <div className="flex flex-wrap gap-2">
                  {leaveTypes.slice(0, 5).map((type, index) => (
                    <span
                      key={type.id || index}
                      className="px-3 py-1 bg-white/20 text-white text-xs rounded-full"
                    >
                      {type.name || type.leave_type || 'Leave Type'}
                    </span>
                  ))}
                  {leaveTypes.length > 5 && (
                    <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                      +{leaveTypes.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Apply Leave Form - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaPaperPlane />
                  Apply for Leave
                </h2>
                <p className="text-blue-100 text-xs mt-1">
                  Submit a new leave request to Xero
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Leave Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="leave_type_id"
                      value={formData.leave_type_id}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.leave_type_id ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    >
                      <option value="">Select a leave type</option>
                      {leaveTypes.length > 0 ? (
                        leaveTypes.map((type) => (
                          <option key={type.id || type.xero_leave_type_id} value={type.id || type.xero_leave_type_id}>
                            {type.name || type.leave_type || 'Leave Type'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Please sync leave types first
                        </option>
                      )}
                    </select>
                    {formErrors.leave_type_id && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <FaInfoCircle />
                        {formErrors.leave_type_id}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full border ${
                          formErrors.start_date ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      />
                    </div>
                    {formErrors.start_date && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <FaInfoCircle />
                        {formErrors.start_date}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className={`w-full border ${
                          formErrors.end_date ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      />
                    </div>
                    {formErrors.end_date && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <FaInfoCircle />
                        {formErrors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Duration Summary */}
                  {formData.start_date && formData.end_date && totalDays > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Total duration: <span className="font-bold">{totalDays}</span> day{totalDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description/Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Please provide a detailed reason for your leave request..."
                      className={`w-full border ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <FaInfoCircle />
                        {formErrors.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Status */}
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700">{submitSuccess}</p>
                    </div>
                  )}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <FaTimesCircle className="text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || leaveTypes.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Apply Leave
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    * Required fields. Your request will be sent to Xero for approval.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Leave History Table - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaFileAlt />
                      Leave History
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {leaveHistory.length} leave request{leaveHistory.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <button
                    onClick={fetchLeaveHistory}
                    disabled={loadingHistory}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <FaRedoAlt className={loadingHistory ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {loadingHistory ? (
                  <div className="flex justify-center items-center py-16">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading leave history...</span>
                  </div>
                ) : historyError ? (
                  <div className="text-center py-12">
                    <div className="bg-red-50 inline-flex p-4 rounded-full mb-4">
                      <FaTimesCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Failed to Load History
                    </h3>
                    <p className="text-gray-500 mb-4">{historyError}</p>
                    <button
                      onClick={fetchLeaveHistory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : leaveHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                      <FaFileAlt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Leave History
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You haven't applied for any leaves yet.
                    </p>
                    <button
                      onClick={() => {
                        document.querySelector('input[name="start_date"]')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply for Leave
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Synced Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveHistory.map((leave, index) => {
                        const startDate = formatDate(leave.start_date);
                        const endDate = formatDate(leave.end_date);
                        const days = calculateDays(leave.start_date, leave.end_date);

                        return (
                          <tr key={leave.id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {leave.description || leave.title || 'Leave Request'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {leave.leave_type || 'Leave'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{startDate}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">{endDate}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-900">
                                {days} day{days !== 1 ? 's' : ''}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(leave.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-500">
                                {formatDate(leave.created_at || leave.synced_date)}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XeroLeaveManagement;
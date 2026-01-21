import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaChartBar,
  FaSave,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
  FaCheck,
  FaUsers,
  FaFolderOpen,
  FaList,
  FaThumbsUp,
  FaUserCheck,
} from "react-icons/fa";
import performanceService from "../../services/performanceService";
import employeeService from "../../services/employeeService";

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return ("Invalid Date", error);
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return ("Invalid Date", error);
  }
};

const getEmployeeName = (employee) => {
  if (!employee) return "N/A";
  return (
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
    employee.employee_code ||
    employee.name ||
    "Unnamed Employee"
  );
};

const getStatusBadge = (status) => {
  if (!status) return null;

  const statusLower = status.toLowerCase();

  const statusConfig = {
    Draft: {
      color: "bg-gray-100 text-gray-800",
      label: "Draft",
      icon: FaClock,
      bgColor: "bg-gray-50",
    },
    planned: {
      color: "bg-blue-100 text-blue-800",
      label: "Planned",
      icon: FaCalendarAlt,
      bgColor: "bg-blue-50",
    },
    active: {
      color: "bg-green-100 text-green-800",
      label: "Active",
      icon: FaCheckCircle,
      bgColor: "bg-green-50",
    },
    in_progress: {
      color: "bg-yellow-100 text-yellow-800",
      label: "In Progress",
      icon: FaEdit,
      bgColor: "bg-yellow-50",
    },

    reviewed: {
      color: "bg-purple-100 text-purple-800",
      label: "Reviewed",
      icon: FaCheck,
      bgColor: "bg-purple-50",
    },
    acknowledged: {
      color: "bg-indigo-100 text-indigo-800",
      label: "acknowledged",
      icon: FaUserCheck,
      bgColor: "bg-indigo-50",
    },
  };

  const config = statusConfig[statusLower] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
    icon: FaClock,
    bgColor: "bg-gray-50",
  };
  const IconComponent = config.icon;

  return (
    <span
      className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${config.color}`}
    >
      <IconComponent className="mr-1" size={10} />
      {config.label}
    </span>
  );
};

const getRatingDisplay = (rating) => {
  if (rating === null || rating === undefined || rating === "" || rating === 0)
    return "Not Rated";

  const numRating = parseFloat(rating);
  if (isNaN(numRating)) return "Invalid";

  // Handle numeric ratings (1-5 scale)
  if (numRating >= 1 && numRating <= 5) {
    let color = "text-gray-600";
    let stars = "";
    let label = "";

    if (numRating >= 4.5) {
      color = "text-green-600";
      stars = "★★★★★";
      label = "Outstanding";
    } else if (numRating >= 4) {
      color = "text-green-500";
      stars = "★★★★☆";
      label = "Exceeds Expectations";
    } else if (numRating >= 3.5) {
      color = "text-yellow-500";
      stars = "★★★☆☆";
      label = "Meets Expectations";
    } else if (numRating >= 3) {
      color = "text-yellow-600";
      stars = "★★★☆☆";
      label = "Meets Expectations";
    } else if (numRating >= 2) {
      color = "text-orange-500";
      stars = "★★☆☆☆";
      label = "Needs Improvement";
    } else {
      color = "text-red-500";
      stars = "★☆☆☆☆";
      label = "Unsatisfactory";
    }

    return (
      <div className={`flex flex-col ${color} font-semibold`}>
        <div className="flex items-center">
          <FaStar className="mr-1" />
          <span className="mr-1">{numRating.toFixed(1)}/5.0</span>
          <span className="text-xs">{stars}</span>
        </div>
        <div className="text-xs font-normal mt-1">{label}</div>
      </div>
    );
  }

  // If rating is not 1-5, just display it
  return (
    <div className="flex items-center text-gray-600 font-semibold">
      <FaStar className="mr-1" />
      <span>{numRating.toFixed(1)}</span>
    </div>
  );
};

const isOverdue = (deadline, status) => {
  if (!deadline || ["acknowledged"].includes(status?.toLowerCase())) {
    return false;
  }

  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  } catch (error) {
    error;
    return false;
  }
};

// Helper function to safely convert to array - UPDATED VERSION
const ensureArray = (data) => {
  if (!data) return [];

  // If it's an Axios response object
  if (data && data.data && data.status === 200) {
    return ensureArray(data.data);
  }

  // If it's an object with success and data properties
  if (data && data.success && data.data) {
    return ensureArray(data.data);
  }

  if (Array.isArray(data)) return data;
  if (data && data.data && Array.isArray(data.data)) return data.data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  if (data && data.items && Array.isArray(data.items)) return data.items;
  if (data && typeof data === "object") {
    const values = Object.values(data);
    if (values.length > 0 && Array.isArray(values[0])) {
      return values[0];
    }
    return values;
  }
  return [];
};

// Review Form Modal Component
const ReviewFormModal = ({
  isOpen,
  onClose,
  review,
  reviewCycles,
  employees,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    review_cycle_id: "",
    employee_id: "",
    manager_id: "",
    status: "Draft",
  });
  const [errors, setErrors] = useState({});

  // Safely handle employees and reviewCycles
  const safeEmployees = useMemo(() => {
    const employeesArray = ensureArray(employees);

    console.log("Employees array before deduplication:", employeesArray);

    // Remove duplicates based on id
    const uniqueEmployees = [];
    const seenIds = new Set();

    for (const emp of employeesArray) {
      if (emp && typeof emp === "object") {
        // Check if employee has an id
        if (emp.id) {
          if (!seenIds.has(emp.id)) {
            seenIds.add(emp.id);
            uniqueEmployees.push(emp);
          }
        } else {
          // For employees without ID
          uniqueEmployees.push(emp);
        }
      }
    }

    console.log(
      "Unique employees after deduplication:",
      uniqueEmployees.length,
    );
    return uniqueEmployees;
  }, [employees]);

  const safeReviewCycles = useMemo(
    () => ensureArray(reviewCycles),
    [reviewCycles],
  );

  useEffect(() => {
    if (review) {
      setFormData({
        review_cycle_id:
          review.review_cycle_id || review.review_cycle?.id || "",
        employee_id: review.employee_id || review.employee?.id || "",
        manager_id: review.manager_id || review.manager?.id || "",
        status: review.status || "Draft",
      });
    } else {
      setFormData({
        review_cycle_id: "",
        employee_id: "",
        manager_id: "",
        status: "Draft",
      });
    }
    setErrors({});
  }, [review, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.review_cycle_id) {
      newErrors.review_cycle_id = "Review cycle is required";
    }
    if (!formData.employee_id) {
      newErrors.employee_id = "Employee is required";
    }
    if (!formData.manager_id) {
      newErrors.manager_id = "Manager is required";
    }

    // Validate that IDs are valid numbers
    if (formData.employee_id && isNaN(parseInt(formData.employee_id))) {
      newErrors.employee_id = "Please select a valid employee";
    }
    if (formData.manager_id && isNaN(parseInt(formData.manager_id))) {
      newErrors.manager_id = "Please select a valid manager";
    }
    if (formData.review_cycle_id && isNaN(parseInt(formData.review_cycle_id))) {
      newErrors.review_cycle_id = "Please select a valid review cycle";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            error.message ||
            "Failed to save review. Please try again.",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {review
              ? "Edit Performance Review"
              : "Create New Performance Review"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle />
              {errors.general}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Cycle *
            </label>
            <select
              name="review_cycle_id"
              value={formData.review_cycle_id}
              onChange={handleInputChange}
              required
              disabled={loading || safeReviewCycles.length === 0}
              className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.review_cycle_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">
                {safeReviewCycles.length === 0
                  ? "No review cycles available"
                  : "Select Review Cycle"}
              </option>
              {safeReviewCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} ({formatDate(cycle.start_date)} -{" "}
                  {formatDate(cycle.end_date)})
                </option>
              ))}
            </select>
            {errors.review_cycle_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.review_cycle_id}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              required
              disabled={loading || safeEmployees.length === 0}
              className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employee_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">
                {safeEmployees.length === 0
                  ? "No employees available"
                  : "Select Employee"}
              </option>
              {safeEmployees.map((emp, index) => {
                const uniqueKey = emp.id
                  ? `employee-${emp.id}-${index}`
                  : `employee-no-id-${index}`;
                return (
                  <option key={uniqueKey} value={emp.id}>
                    {getEmployeeName(emp)} (
                    {emp.employee_code || emp.department?.name || "No Dept"})
                  </option>
                );
              })}
            </select>
            {errors.employee_id && (
              <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager/Reviewer *
            </label>
            <select
              name="manager_id"
              value={formData.manager_id}
              onChange={handleInputChange}
              required
              disabled={loading || safeEmployees.length === 0}
              className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.manager_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">
                {safeEmployees.length === 0
                  ? "No managers available"
                  : "Select Manager"}
              </option>
              {safeEmployees.map((emp, index) => {
                const uniqueKey = emp.id
                  ? `manager-${emp.id}-${index}`
                  : `manager-no-id-${index}`;
                return (
                  <option key={uniqueKey} value={emp.id}>
                    {getEmployeeName(emp)} (
                    {emp.employee_code || emp.department?.name || "No Dept"})
                  </option>
                );
              })}
            </select>
            {errors.manager_id && (
              <p className="mt-1 text-xs text-red-600">{errors.manager_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="reviewed">Reviewed</option>

              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                safeReviewCycles.length === 0 ||
                safeEmployees.length === 0
              }
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {review ? "Update Review" : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Review Detail Modal Component
const ReviewDetailModal = ({
  isOpen,
  onClose,
  review,
  onAcknowledge,
  onEdit,
  onDelete,
  loading,
}) => {
  if (!isOpen || !review) return null;

  const employee = review.employee || {};
  const manager = review.manager || {};
  const cycle = review.review_cycle || review.review_cycle_id || {};

  const canAcknowledge =
    review.status?.toLowerCase() === "reviewed" && !review.acknowledged_at;
  const canEdit = !["acknowledged"].includes(review.status?.toLowerCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Performance Review Details
            </h2>
            <p className="text-sm text-gray-600">Review ID: {review.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Review Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Review Cycle:</span>
                  <span className="font-medium">
                    {cycle.name ||
                      `Cycle ${cycle.id || review.review_cycle_id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {formatDate(cycle.start_date)} -{" "}
                    {formatDate(cycle.end_date)}
                  </span>
                </div>
                {cycle.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span
                      className={`font-medium ${isOverdue(cycle.deadline, review.status) ? "text-red-600" : ""}`}
                    >
                      {formatDate(cycle.deadline)}
                      {isOverdue(cycle.deadline, review.status) && " (Overdue)"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span>{getStatusBadge(review.status)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Employee
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <FaUser className="text-gray-400" />
                <div>
                  <p className="font-medium">{getEmployeeName(employee)}</p>
                  <p className="text-sm text-gray-600">
                    {employee.employee_code || "No ID"} •{" "}
                    {employee.department?.name ||
                      employee.role ||
                      "No Department"}
                  </p>
                  {employee.joining_date && (
                    <p className="text-xs text-gray-500">
                      Joined: {formatDate(employee.joining_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Manager/Reviewer
              </h3>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                <FaUser className="text-blue-400" />
                <div>
                  <p className="font-medium">{getEmployeeName(manager)}</p>
                  <p className="text-sm text-gray-600">
                    {manager.employee_code || "No ID"} •{" "}
                    {manager.department?.name ||
                      manager.role ||
                      "No Department"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings and Feedback */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Ratings
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Employee Self-Rating:</span>
                    {getRatingDisplay(review.employee_rating)}
                  </div>
                  {review.employee_submitted_at && (
                    <div className="text-xs text-gray-500">
                      Submitted: {formatDateTime(review.employee_submitted_at)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Manager Rating:</span>
                    {getRatingDisplay(review.manager_rating)}
                  </div>
                  {review.manager_submitted_at && (
                    <div className="text-xs text-gray-500">
                      Submitted: {formatDateTime(review.manager_submitted_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Employee Comments
              </h3>
              <div className="p-3 bg-gray-50 rounded min-h-[80px]">
                {review.employee_comments ? (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.employee_comments}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    No comments provided by employee
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Manager Feedback
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1">
                    Strengths
                  </h4>
                  <div className="p-3 bg-green-50 rounded text-sm">
                    {review.manager_feedback_strengths ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {review.manager_feedback_strengths}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">No strengths noted</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1">
                    Areas for Improvement
                  </h4>
                  <div className="p-3 bg-yellow-50 rounded text-sm">
                    {review.manager_feedback_areas_for_improvement ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {review.manager_feedback_areas_for_improvement}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">
                        No improvement areas noted
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1">
                    Overall Comments
                  </h4>
                  <div className="p-3 bg-blue-50 rounded text-sm">
                    {review.manager_comments ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {review.manager_comments}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">
                        No overall comments
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
          <div className="space-y-2 text-sm">
            {review.created_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {formatDateTime(review.created_at)}
                </span>
              </div>
            )}
            {review.updated_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {formatDateTime(review.updated_at)}
                </span>
              </div>
            )}
            {review.acknowledged_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Acknowledged:</span>
                <span className="font-medium text-green-600">
                  {formatDateTime(review.acknowledged_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t flex justify-between">
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit(review)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaEdit /> Edit Review
              </button>
            )}
            {canAcknowledge && (
              <button
                onClick={() => onAcknowledge(review.id)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheckCircle /> Acknowledge Review
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this review?",
                    )
                  ) {
                    onDelete(review.id);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaTrash /> Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "bg-blue-600",
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 ${confirmColor} text-white rounded text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2`}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewCycles, setReviewCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    cycle: "all",
    search: "",
  });

  const [modalState, setModalState] = useState({
    showForm: false,
    showDetail: false,
    showConfirm: false,
    selectedReview: null,
    selectedCycle: null,
    action: null,
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [reviewsData, cyclesData, employeesData] = await Promise.all([
        performanceService.getPerformanceReviews(),
        performanceService.getReviewCycles(),
        employeeService.getEmployees(),
      ]);

      // Safely set data using ensureArray helper
      const reviewsArray = ensureArray(reviewsData);
      const cyclesArray = ensureArray(cyclesData);
      const employeesArray = ensureArray(employeesData);

      setReviews(reviewsArray);
      setReviewCycles(cyclesArray);
      setEmployees(employeesArray);

      console.log("Fetched data:", {
        reviewsCount: reviewsArray.length,
        cyclesCount: cyclesArray.length,
        employeesCount: employeesArray.length,
        reviewsSample: reviewsArray.slice(0, 2),
        cyclesSample: cyclesArray.slice(0, 2),
        employeesSample: employeesArray.slice(0, 2),
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
      // Set empty arrays on error
      setReviews([]);
      setReviewCycles([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      filters.status === "all" ||
      review.status?.toLowerCase() === filters.status.toLowerCase();

    const matchesCycle =
      filters.cycle === "all" ||
      review.review_cycle_id === parseInt(filters.cycle) ||
      review.review_cycle?.id === parseInt(filters.cycle);

    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      filters.search === "" ||
      (getEmployeeName(review.employee) || "")
        .toLowerCase()
        .includes(searchLower) ||
      (review.employee?.employee_code || "")
        .toLowerCase()
        .includes(searchLower) ||
      (review.review_cycle?.name || "").toLowerCase().includes(searchLower) ||
      (review.id?.toString() || "").includes(searchLower);

    return matchesStatus && matchesCycle && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    Draft: reviews.filter((r) => r.status?.toLowerCase() === "Draft").length,
    in_progress: reviews.filter(
      (r) =>
        r.status?.toLowerCase() === "in_progress" ||
        r.status?.toLowerCase() === "in-progress",
    ).length,
    reviewed: reviews.filter((r) => r.status?.toLowerCase() === "reviewed")
      .length,
    acknowledged: reviews.filter(
      (r) => r.status?.toLowerCase() === "acknowledged",
    ).length,
    overdue: reviews.filter((r) => {
      const cycle = r.review_cycle;
      const deadline = cycle?.deadline;
      return deadline && isOverdue(deadline, r.status);
    }).length,
  };

  const handleCreateReview = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get organization ID - use default from your API
      const organizationId = 15;

      // Validate and convert IDs
      const reviewCycleId = parseInt(formData.review_cycle_id);
      const employeeId = parseInt(formData.employee_id);
      const managerId = parseInt(formData.manager_id);

      if (isNaN(reviewCycleId) || isNaN(employeeId) || isNaN(managerId)) {
        throw new Error("Invalid IDs provided. Please select valid options.");
      }

      // Prepare data
      const reviewData = {
        organization_id: organizationId,
        review_cycle_id: reviewCycleId,
        employee_id: employeeId,
        manager_id: managerId,
        status: formData.status || "Draft",
      };

      console.log("Creating review with data:", reviewData);

      const response =
        await performanceService.createPerformanceReview(reviewData);
      console.log("Create review response:", response);

      // Add the new review to state
      const newReview = {
        id: response.data?.id || Date.now(),
        ...reviewData,
        review_cycle: ensureArray(reviewCycles).find(
          (c) => c.id === reviewCycleId,
        ),
        employee: ensureArray(employees).find((e) => e.id === employeeId),
        manager: ensureArray(employees).find((e) => e.id === managerId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setSuccessMessage("Performance review created successfully!");
    } catch (err) {
      console.error("Error creating review:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create review. Please try again.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReview = async (id, formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const reviewCycleId = parseInt(formData.review_cycle_id);
      const employeeId = parseInt(formData.employee_id);
      const managerId = parseInt(formData.manager_id);

      if (isNaN(reviewCycleId) || isNaN(employeeId) || isNaN(managerId)) {
        throw new Error("Invalid IDs provided. Please select valid options.");
      }

      const response = await performanceService.updatePerformanceReview(
        id,
        formData,
      );
      console.log("Update review response:", response);

      // Update review in state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                ...formData,
                updated_at: new Date().toISOString(),
                review_cycle:
                  ensureArray(reviewCycles).find(
                    (c) => c.id === reviewCycleId,
                  ) || review.review_cycle,
                employee:
                  ensureArray(employees).find((e) => e.id === employeeId) ||
                  review.employee,
                manager:
                  ensureArray(employees).find((e) => e.id === managerId) ||
                  review.manager,
              }
            : review,
        ),
      );

      setSuccessMessage("Performance review updated successfully!");
      setModalState((prev) => ({
        ...prev,
        showForm: false,
        selectedReview: null,
      }));
    } catch (err) {
      console.error("Error updating review:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update review. Please try again.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await performanceService.deletePerformanceReview(id);
      setReviews((prev) => prev.filter((review) => review.id !== id));
      setSuccessMessage("Performance review deleted successfully!");
      setModalState((prev) => ({
        ...prev,
        showConfirm: false,
        selectedReview: null,
      }));
    } catch (err) {
      console.error("Error deleting review:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAcknowledgeReview = async (id) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response =
        await performanceService.acknowledgePerformanceReview(id);
      console.log("Acknowledge review response:", response);

      // Update review in state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                status: "acknowledged",
                acknowledged_at:
                  response.data?.acknowledged_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : review,
        ),
      );

      setSuccessMessage("Review acknowledged successfully!");
      setModalState((prev) => ({
        ...prev,
        showDetail: false,
        selectedReview: null,
      }));
    } catch (err) {
      console.error("Error acknowledging review:", err);
      setError(
        err.response?.data?.message ||
          "Failed to acknowledge review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (review) => {
    setModalState({
      ...modalState,
      showDetail: true,
      selectedReview: review,
    });
  };

  const handleEditReview = (review) => {
    setModalState({
      ...modalState,
      showForm: true,
      selectedReview: review,
    });
  };

  const handleOpenConfirm = (review, action = "delete") => {
    setModalState({
      ...modalState,
      showConfirm: true,
      selectedReview: review,
      action,
    });
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading performance reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <FaCheck className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Performance Reviews
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee performance reviews and evaluations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() =>
                setModalState((prev) => ({ ...prev, showForm: true }))
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> New Review
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaChartBar className="text-blue-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-800">{stats.Draft}</p>
            </div>
            <FaClock className="text-gray-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.in_progress}
              </p>
            </div>
            <FaEdit className="text-yellow-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.reviewed}
              </p>
            </div>
            <FaCheck className="text-purple-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.acknowledged}
              </p>
            </div>
            <FaUserCheck className="text-indigo-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.overdue}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="reviewed">Reviewed</option>
            <option value="acknowledged">Acknowledged</option>
          </select>

          <select
            value={filters.cycle}
            onChange={(e) => handleFilterChange("cycle", e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Review Cycles</option>
            {ensureArray(reviewCycles).map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name || `Cycle ${cycle.id}`}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <FaDownload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ratings & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReviews.map((review) => {
                const employee = review.employee || {};
                const cycle = review.review_cycle || {};
                const isOverdueReview =
                  cycle?.deadline && isOverdue(cycle.deadline, review.status);

                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <FaFolderOpen className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Review #{review.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cycle.name ||
                              `Cycle ${cycle.id || review.review_cycle_id}`}
                          </div>
                          {cycle.start_date && cycle.end_date && (
                            <div className="text-xs text-gray-400">
                              Cycle: {formatDate(cycle.start_date)} -{" "}
                              {formatDate(cycle.end_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getEmployeeName(employee)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employee_code || "No ID"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {employee.department?.name ||
                              employee.role ||
                              "No Department"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {cycle.deadline && (
                          <div className="text-sm">
                            <FaCalendarAlt className="inline mr-1 text-gray-400" />
                            Due: {formatDate(cycle.deadline)}
                          </div>
                        )}
                        {isOverdueReview && (
                          <div className="text-xs text-red-600 font-semibold">
                            Overdue
                          </div>
                        )}
                        {review.created_at && (
                          <div className="text-xs text-gray-400">
                            Created: {formatDate(review.created_at)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-gray-600">
                            Employee: {getRatingDisplay(review.employee_rating)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Manager: {getRatingDisplay(review.manager_rating)}
                          </div>
                        </div>
                        <div>{getStatusBadge(review.status)}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(review)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {!["acknowledged"].includes(
                          review.status?.toLowerCase(),
                        ) && (
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Edit Review"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenConfirm(review, "delete")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Review"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <FaChartBar className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all"
                  ? "No matching performance reviews found"
                  : "No performance reviews yet"}
              </h3>
              <p className="text-gray-500">
                {filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first performance review to get started"}
              </p>
              {!(
                filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all"
              ) && (
                <button
                  onClick={() =>
                    setModalState((prev) => ({ ...prev, showForm: true }))
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredReviews.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </div>
              <div className="text-sm text-gray-700 font-medium">
                {stats.Draft} Draft • {stats.in_progress} in progress •{" "}
                {stats.reviewed} reviewed • {stats.acknowledged} acknowledged
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewFormModal
        isOpen={modalState.showForm}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showForm: false,
            selectedReview: null,
          }))
        }
        review={modalState.selectedReview}
        reviewCycles={reviewCycles}
        employees={employees}
        onSubmit={(formData) => {
          if (modalState.selectedReview) {
            return handleUpdateReview(modalState.selectedReview.id, formData);
          } else {
            return handleCreateReview(formData);
          }
        }}
        loading={saving}
      />

      <ReviewDetailModal
        isOpen={modalState.showDetail}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showDetail: false,
            selectedReview: null,
          }))
        }
        review={modalState.selectedReview}
        onAcknowledge={handleAcknowledgeReview}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
        loading={saving}
      />

      <ConfirmationModal
        isOpen={modalState.showConfirm}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showConfirm: false,
            selectedReview: null,
          }))
        }
        onConfirm={() => {
          if (modalState.action === "delete" && modalState.selectedReview) {
            handleDeleteReview(modalState.selectedReview.id);
          }
        }}
        title="Delete Performance Review"
        message={`Are you sure you want to delete review #${modalState.selectedReview?.id} for ${getEmployeeName(modalState.selectedReview?.employee)}?`}
        confirmText="Delete Review"
        confirmColor="bg-red-600"
        loading={saving}
      />
    </div>
  );
};

export default PerformanceReviews;

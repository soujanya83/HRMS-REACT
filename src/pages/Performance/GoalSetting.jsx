import React, { useState, useEffect } from "react";
import {
  FaBullseye,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCopy,
  FaSave,
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaChartBar,
  FaSpinner,
  FaSync,
  FaTimes,
  FaInfoCircle,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaPercentage,
  FaMoneyBillWave,
  FaListAlt,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import goalService from "../../services/goalService";
import employeeService from "../../services/employeeService";
import performanceService from "../../services/performanceService";

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getEmployeeName = (employee) => {
  if (!employee) return "N/A";
  return (
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
    employee.employee_code ||
    "Unnamed"
  );
};

const getStatusConfig = (status) => {
  const statusLower = status?.toLowerCase() || "Draft";

  const configs = {
    Draft: {
      color: "bg-gray-100 text-gray-800",
      icon: FaClock,
      label: "Draft",
      progressColor: "bg-gray-400",
    },
    not_started: {
      color: "bg-gray-100 text-gray-800",
      icon: FaClock,
      label: "Not Started",
      progressColor: "bg-gray-400",
    },
    planned: {
      color: "bg-blue-100 text-blue-800",
      icon: FaClock,
      label: "Planned",
      progressColor: "bg-blue-400",
    },
    in_progress: {
      color: "bg-yellow-100 text-yellow-800",
      icon: FaChartLine,
      label: "In Progress",
      progressColor: "bg-yellow-500",
    },
    on_track: {
      color: "bg-green-100 text-green-800",
      icon: FaCheckCircle,
      label: "On Track",
      progressColor: "bg-green-500",
    },
    at_risk: {
      color: "bg-orange-100 text-orange-800",
      icon: FaExclamationTriangle,
      label: "At Risk",
      progressColor: "bg-orange-500",
    },
    completed: {
      color: "bg-green-100 text-green-800",
      icon: FaCheckCircle,
      label: "Completed",
      progressColor: "bg-green-600",
    },
    overdue: {
      color: "bg-red-100 text-red-800",
      icon: FaExclamationTriangle,
      label: "Overdue",
      progressColor: "bg-red-500",
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: FaTimes,
      label: "Cancelled",
      progressColor: "bg-red-400",
    },
  };

  return configs[statusLower] || configs.Draft;
};

const getPriorityConfig = (priority) => {
  const priorityLower = priority?.toLowerCase() || "medium";
console.log()
  const configs = {
    low: { color: "bg-green-100 text-green-800", label: "Low" },
    medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
    high: { color: "bg-orange-100 text-orange-800", label: "High" },
    critical: { color: "bg-red-100 text-red-800", label: "Critical" },
  };

  return configs[priorityLower] || configs.medium;
};

const formatValue = (value, type = "Quantitative") => {
  if (value === null || value === undefined) return "0";

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "Invalid";

  if (type === "Percentage") {
    return `${numValue.toFixed(1)}%`;
  }

  if (type === "Currency") {
    if (numValue >= 10000000) {
      return `₹${(numValue / 10000000).toFixed(1)} Cr`;
    }
    if (numValue >= 100000) {
      return `₹${(numValue / 100000).toFixed(1)} L`;
    }
    if (numValue >= 1000) {
      return `₹${(numValue / 1000).toFixed(1)}K`;
    }
    return `₹${numValue}`;
  }

  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  }
  if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  }

  return numValue.toString();
};

// Goal Form Modal Component
const GoalFormModal = ({
  isOpen,
  onClose,
  goal,
  reviewCycles,
  employees,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    review_cycle_id: "",
    employee_id: "",
    manager_id: "",
    start_date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "Draft",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        review_cycle_id: goal.review_cycle_id || "",
        employee_id: goal.employee_id || "",
        manager_id: goal.manager_id || "",
        start_date: goal.start_date
          ? goal.start_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        due_date: goal.due_date ? goal.due_date.split("T")[0] : "",
        status: goal.status || "Draft",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        review_cycle_id: "",
        employee_id: "",
        manager_id: "",
        start_date: new Date().toISOString().split("T")[0],
        due_date: "",
        status: "Draft",
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Goal title is required";
    }
    if (!formData.review_cycle_id) {
      newErrors.review_cycle_id = "Review cycle is required";
    }
    if (!formData.employee_id) {
      newErrors.employee_id = "Employee is required";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    } else {
      const startDate = new Date(formData.start_date);
      const dueDate = new Date(formData.due_date);
      if (dueDate < startDate) {
        newErrors.due_date = "Due date must be after start date";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Get organization ID
      const orgData = await performanceService.getOrganization();
      const organizationId = orgData.id || 15;

      const goalData = {
        ...formData,
        organization_id: organizationId,
        review_cycle_id: parseInt(formData.review_cycle_id),
        employee_id: parseInt(formData.employee_id),
        manager_id:
          parseInt(formData.manager_id) || parseInt(formData.employee_id),
      };

      await onSubmit(goalData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "Failed to save goal. Please try again.",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {goal ? "Edit Performance Goal" : "Create New Performance Goal"}
            </h2>
            <p className="text-sm text-gray-600">
              Define performance goals and key results
            </p>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Increase Sales Conversion Rate"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Cycle *
              </label>
              <select
                name="review_cycle_id"
                value={formData.review_cycle_id}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.review_cycle_id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Review Cycle</option>
                {reviewCycles.map((cycle) => (
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the goal and expected outcomes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.employee_id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeName(emp)} ({emp.employee_code || "No ID"})
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.employee_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager/Reviewer
              </label>
              <select
                name="manager_id"
                value={formData.manager_id}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeName(emp)} ({emp.employee_code || "No ID"})
                  </option>
                ))}
              </select>
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
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.due_date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.due_date && (
                <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Key Results</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Key Results can be added after creating this goal. They define
                  specific, measurable outcomes to track goal progress.
                </p>
              </div>
            </div>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {goal ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Key Result Form Modal
const KeyResultFormModal = ({
  isOpen,
  onClose,
  keyResult,
  goal,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    performance_goal_id: "",
    description: "",
    type: "Quantitative",
    start_value: "",
    target_value: "",
    current_value: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (keyResult) {
      setFormData({
        performance_goal_id: keyResult.performance_goal_id,
        description: keyResult.description || "",
        type: keyResult.type || "Quantitative",
        start_value: keyResult.start_value || "",
        target_value: keyResult.target_value || "",
        current_value: keyResult.current_value || "",
        notes: keyResult.notes || "",
      });
    } else if (goal) {
      setFormData((prev) => ({
        ...prev,
        performance_goal_id: goal.id,
      }));
    }
    setErrors({});
  }, [keyResult, goal, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.target_value || isNaN(parseFloat(formData.target_value))) {
      newErrors.target_value = "Valid target value is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const keyResultData = {
        ...formData,
        performance_goal_id: parseInt(formData.performance_goal_id),
        start_value: parseFloat(formData.start_value) || 0,
        target_value: parseFloat(formData.target_value),
        current_value:
          parseFloat(formData.current_value) ||
          parseFloat(formData.start_value) ||
          0,
      };

      await onSubmit(keyResultData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "Failed to save key result. Please try again.",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {keyResult ? "Edit Key Result" : "Add Key Result"}
            </h2>
            <p className="text-sm text-gray-600">
              {goal && `For: ${goal.title}`}
            </p>
          </div>
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
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              rows={2}
              className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Increase monthly customer satisfaction score"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Quantitative">Quantitative</option>
                <option value="Percentage">Percentage</option>
                <option value="Currency">Currency</option>
                <option value="Boolean">Boolean (Yes/No)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="number"
                name="current_value"
                value={formData.current_value}
                onChange={handleInputChange}
                disabled={loading}
                step="0.01"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Current value"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Value
              </label>
              <input
                type="number"
                name="start_value"
                value={formData.start_value}
                onChange={handleInputChange}
                disabled={loading}
                step="0.01"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Starting value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleInputChange}
                disabled={loading}
                step="0.01"
                className={`w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.target_value ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Target value"
              />
              {errors.target_value && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.target_value}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
              rows={2}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or tracking details..."
            />
          </div>

          {/* Preview */}
          {formData.start_value && formData.target_value && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Progress Preview
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">
                    {formatValue(formData.start_value, formData.type)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-medium">
                    {formatValue(
                      formData.current_value || formData.start_value,
                      formData.type,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">
                    {formatValue(formData.target_value, formData.type)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${goalService.calculateProgress(
                          parseFloat(formData.start_value),
                          parseFloat(formData.target_value),
                          parseFloat(
                            formData.current_value || formData.start_value,
                          ),
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {keyResult ? "Update Key Result" : "Add Key Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Goal Detail Modal with Key Results
const GoalDetailModal = ({
  isOpen,
  onClose,
  goal,
  keyResults,
  onAddKeyResult,
  onEditKeyResult,
  onDeleteKeyResult,
  onUpdateKeyResult,
  loading,
}) => {
  const [expandedKeyResults, setExpandedKeyResults] = useState([]);
console.log(loading)
  if (!isOpen || !goal) return null;

  const employee = goal.employee || {};
  const manager = goal.manager || {};
  const cycle = goal.review_cycle || {};

  const toggleKeyResult = (id) => {
    setExpandedKeyResults((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const calculateOverallProgress = () => {
    if (!keyResults || keyResults.length === 0) return 0;

    const totalProgress = keyResults.reduce((sum, kr) => {
      const progress = goalService.calculateProgress(
        parseFloat(kr.start_value),
        parseFloat(kr.target_value),
        parseFloat(kr.current_value),
      );
      return sum + progress;
    }, 0);

    return Math.round(totalProgress / keyResults.length);
  };

  const overallProgress = calculateOverallProgress();
  const statusConfig = getStatusConfig(goal.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{goal.title}</h2>
            <p className="text-sm text-gray-600">Performance Goal Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Goal Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Goal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <p className="text-gray-800">
                    {goal.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Review Cycle
                    </div>
                    <div className="font-medium">{cycle.name || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${statusConfig.color}`}
                      >
                        <statusConfig.icon className="mr-1" size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start Date</div>
                    <div className="font-medium">
                      {formatDate(goal.start_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Due Date</div>
                    <div
                      className={`font-medium ${getDaysLeft(goal.due_date) < 0 ? "text-red-600" : ""}`}
                    >
                      {formatDate(goal.due_date)}
                      {getDaysLeft(goal.due_date) < 0 && " (Overdue)"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Overall Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-semibold">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${statusConfig.progressColor}`}
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  Based on {keyResults?.length || 0} key results
                </div>
              </div>
            </div>

            {/* People */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                People
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <FaUser className="text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {getEmployeeName(employee)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {employee.employee_code} •{" "}
                      {employee.department?.name || "No Department"}
                    </div>
                  </div>
                </div>

                {manager && manager.id !== employee.id && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                    <FaUser className="text-blue-400" />
                    <div>
                      <div className="font-medium">
                        {getEmployeeName(manager)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {manager.employee_code} • Manager/Reviewer
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Key Results */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Key Results
              </h3>
              <button
                onClick={() => onAddKeyResult(goal)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                <FaPlus /> Add Key Result
              </button>
            </div>

            {!keyResults || keyResults.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <FaBullseye className="mx-auto text-3xl text-gray-300 mb-2" />
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  No Key Results
                </h4>
                <p className="text-xs text-gray-500">
                  Add key results to track specific outcomes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {keyResults.map((kr) => {
                  const progress = goalService.calculateProgress(
                    parseFloat(kr.start_value),
                    parseFloat(kr.target_value),
                    parseFloat(kr.current_value),
                  );
                  const isExpanded = expandedKeyResults.includes(kr.id);

                  return (
                    <div
                      key={kr.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => toggleKeyResult(kr.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 text-sm">
                              {kr.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {kr.type}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                {formatValue(kr.current_value, kr.type)}
                              </div>
                              <div className="text-xs text-gray-500">
                                of {formatValue(kr.target_value, kr.type)}
                              </div>
                            </div>
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{formatValue(kr.start_value, kr.type)}</span>
                            <span>{Math.round(progress)}%</span>
                            <span>{formatValue(kr.target_value, kr.type)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-xs text-gray-500">
                                  Start Value
                                </div>
                                <div className="font-medium">
                                  {formatValue(kr.start_value, kr.type)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">
                                  Current Value
                                </div>
                                <div className="font-medium">
                                  <input
                                    type="number"
                                    value={kr.current_value}
                                    onChange={(e) =>
                                      onUpdateKeyResult(
                                        kr.id,
                                        "current_value",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">
                                  Target Value
                                </div>
                                <div className="font-medium">
                                  {formatValue(kr.target_value, kr.type)}
                                </div>
                              </div>
                            </div>

                            {kr.notes && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Notes
                                </div>
                                <p className="text-sm text-gray-800">
                                  {kr.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                Updated: {formatDate(kr.updated_at)}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onEditKeyResult(kr)}
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="Edit"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm("Delete this key result?")
                                    ) {
                                      onDeleteKeyResult(kr.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [reviewCycles, setReviewCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    cycle: "all",
    employee: "all",
    search: "",
  });

  const [modalState, setModalState] = useState({
    showGoalForm: false,
    showKeyResultForm: false,
    showGoalDetail: false,
    selectedGoal: null,
    selectedKeyResult: null,
    selectedGoalForKeyResult: null,
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
      const [goalsData, keyResultsData, cyclesData, employeesData] =
        await Promise.all([
          goalService.getPerformanceGoals(),
          goalService.getKeyResults(),
          performanceService.getReviewCycles(),
          employeeService.getAllEmployees(),
        ]);

      setGoals(goalsData.data || []);
      setKeyResults(keyResultsData.data || []);
      setReviewCycles(cyclesData.data || []);
      setEmployees(employeesData.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesStatus =
      filters.status === "all" ||
      goal.status?.toLowerCase() === filters.status.toLowerCase();
    const matchesCycle =
      filters.cycle === "all" ||
      goal.review_cycle_id === parseInt(filters.cycle);
    const matchesEmployee =
      filters.employee === "all" ||
      goal.employee_id === parseInt(filters.employee);

    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      filters.search === "" ||
      (goal.title || "").toLowerCase().includes(searchLower) ||
      (goal.description || "").toLowerCase().includes(searchLower) ||
      (goal.employee?.first_name || "").toLowerCase().includes(searchLower) ||
      (goal.employee?.last_name || "").toLowerCase().includes(searchLower);

    return matchesStatus && matchesCycle && matchesEmployee && matchesSearch;
  });

  const stats = {
    total: goals.length,
    Draft: goals.filter((g) => g.status?.toLowerCase() === "Draft").length,
    in_progress: goals.filter((g) => g.status?.toLowerCase() === "in_progress")
      .length,
    on_track: goals.filter((g) => g.status?.toLowerCase() === "on_track")
      .length,
    completed: goals.filter((g) => g.status?.toLowerCase() === "completed")
      .length,
    overdue: goals.filter((g) => {
      const daysLeft = getDaysLeft(g.due_date);
      return (
        daysLeft !== null &&
        daysLeft < 0 &&
        g.status?.toLowerCase() !== "completed"
      );
    }).length,
  };

  const handleCreateGoal = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await goalService.createPerformanceGoal(formData);

      // Add the new goal to state
      const newGoal = {
        ...response.data,
        employee: employees.find(
          (e) => e.id === parseInt(formData.employee_id),
        ),
        manager: employees.find((e) => e.id === parseInt(formData.manager_id)),
        review_cycle: reviewCycles.find(
          (c) => c.id === parseInt(formData.review_cycle_id),
        ),
      };

      setGoals((prev) => [newGoal, ...prev]);
      setSuccessMessage("Performance goal created successfully!");
      setModalState((prev) => ({ ...prev, showGoalForm: false }));
    } catch (err) {
      console.error("Error creating goal:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create goal. Please try again.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoal = async (id, formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await goalService.updatePerformanceGoal(id, formData);

      // Update goal in state
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                ...response.data,
                employee:
                  employees.find(
                    (e) => e.id === parseInt(formData.employee_id),
                  ) || goal.employee,
                manager:
                  employees.find(
                    (e) => e.id === parseInt(formData.manager_id),
                  ) || goal.manager,
                review_cycle:
                  reviewCycles.find(
                    (c) => c.id === parseInt(formData.review_cycle_id),
                  ) || goal.review_cycle,
              }
            : goal,
        ),
      );

      setSuccessMessage("Performance goal updated successfully!");
      setModalState((prev) => ({
        ...prev,
        showGoalForm: false,
        selectedGoal: null,
      }));
    } catch (err) {
      console.error("Error updating goal:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update goal. Please try again.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await goalService.deletePerformanceGoal(id);

      // Remove goal from state
      setGoals((prev) => prev.filter((goal) => goal.id !== id));

      // Also remove associated key results
      setKeyResults((prev) =>
        prev.filter((kr) => kr.performance_goal_id !== id),
      );

      setSuccessMessage("Performance goal deleted successfully!");
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete goal. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKeyResult = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await goalService.createKeyResult(formData);

      // Add the new key result to state
      const newKeyResult = {
        ...response.data,
        performance_goal: goals.find(
          (g) => g.id === parseInt(formData.performance_goal_id),
        ),
      };

      setKeyResults((prev) => [newKeyResult, ...prev]);
      setSuccessMessage("Key result added successfully!");
      setModalState((prev) => ({
        ...prev,
        showKeyResultForm: false,
        selectedGoalForKeyResult: null,
      }));
    } catch (err) {
      console.error("Error creating key result:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add key result. Please try again.",
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateKeyResult = async (id, field, value) => {
    setSaving(true);
    setError(null);

    try {
      const keyResult = keyResults.find((kr) => kr.id === id);
      if (!keyResult) return;

      const updateData = {
        ...keyResult,
        [field]: field === "current_value" ? parseFloat(value) : value,
      };

      const response = await goalService.updateKeyResult(id, updateData);

      // Update key result in state
      setKeyResults((prev) =>
        prev.map((kr) => (kr.id === id ? { ...kr, ...response.data } : kr)),
      );
    } catch (err) {
      console.error("Error updating key result:", err);
      setError("Failed to update key result. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyResult = async (id) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await goalService.deleteKeyResult(id);

      // Remove key result from state
      setKeyResults((prev) => prev.filter((kr) => kr.id !== id));

      setSuccessMessage("Key result deleted successfully!");
    } catch (err) {
      console.error("Error deleting key result:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete key result. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewGoalDetails = (goal) => {
    const goalKeyResults = keyResults.filter(
      (kr) => kr.performance_goal_id === goal.id,
    );
    setModalState({
      ...modalState,
      showGoalDetail: true,
      selectedGoal: goal,
      keyResults: goalKeyResults,
    });
  };

  const handleAddKeyResult = (goal) => {
    setModalState({
      ...modalState,
      showKeyResultForm: true,
      selectedGoalForKeyResult: goal,
    });
  };

  const handleEditKeyResult = (keyResult) => {
    setModalState({
      ...modalState,
      showKeyResultForm: true,
      selectedKeyResult: keyResult,
      selectedGoalForKeyResult: goals.find(
        (g) => g.id === keyResult.performance_goal_id,
      ),
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
          <p className="text-gray-600">Loading performance goals...</p>
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
              <FaCheckCircle className="h-5 w-5 text-green-600" />
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
              <FaBullseye className="text-blue-600" />
              Performance Goals & Key Results
            </h1>
            <p className="text-gray-600 mt-1">
              Set, track, and measure performance goals with key results
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
                setModalState((prev) => ({ ...prev, showGoalForm: true }))
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> New Goal
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaBullseye className="text-blue-500 text-xl" />
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
            <FaChartLine className="text-yellow-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.on_track}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.completed}
              </p>
            </div>
            <FaCheckCircle className="text-green-600 text-xl" />
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search goals..."
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
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="on_track">On Track</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filters.cycle}
            onChange={(e) => handleFilterChange("cycle", e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Review Cycles</option>
            {reviewCycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>

          <select
            value={filters.employee}
            onChange={(e) => handleFilterChange("employee", e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {getEmployeeName(emp)}
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

      {/* Goals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee & Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Results & Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGoals.map((goal) => {
                const employee = goal.employee || {};
                const cycle = goal.review_cycle || {};
                const goalKeyResults = keyResults.filter(
                  (kr) => kr.performance_goal_id === goal.id,
                );
                const daysLeft = getDaysLeft(goal.due_date);
                const statusConfig = getStatusConfig(goal.status);

                // Calculate average progress from key results
                const avgProgress =
                  goalKeyResults.length > 0
                    ? Math.round(
                        goalKeyResults.reduce((sum, kr) => {
                          const progress = goalService.calculateProgress(
                            parseFloat(kr.start_value),
                            parseFloat(kr.target_value),
                            parseFloat(kr.current_value),
                          );
                          return sum + progress;
                        }, 0) / goalKeyResults.length,
                      )
                    : 0;

                return (
                  <tr key={goal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <FaBullseye className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {goal.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {goal.description
                              ? goal.description.length > 80
                                ? `${goal.description.substring(0, 80)}...`
                                : goal.description
                              : "No description"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" size={14} />
                          <span className="text-sm font-medium">
                            {getEmployeeName(employee)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">
                            {cycle.name || "No Cycle"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="text-gray-600">
                            Start: {formatDate(goal.start_date)}
                          </div>
                          <div
                            className={`font-medium ${daysLeft !== null && daysLeft < 0 ? "text-red-600" : ""}`}
                          >
                            Due: {formatDate(goal.due_date)}
                            {daysLeft !== null && daysLeft < 0 && " (Overdue)"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysLeft !== null && daysLeft > 0
                            ? `${daysLeft} days left`
                            : ""}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">
                              {goalKeyResults.length} Key Results
                            </span>
                            <span className="text-sm font-semibold">
                              {avgProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${statusConfig.progressColor}`}
                              style={{ width: `${avgProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {goalKeyResults.slice(0, 2).map((kr) => (
                          <div
                            key={kr.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600 truncate max-w-[120px]">
                              {kr.description.length > 20
                                ? `${kr.description.substring(0, 20)}...`
                                : kr.description}
                            </span>
                            <span className="font-medium">
                              {formatValue(kr.current_value, kr.type)}/
                              {formatValue(kr.target_value, kr.type)}
                            </span>
                          </div>
                        ))}

                        {goalKeyResults.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{goalKeyResults.length - 2} more key results
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewGoalDetails(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <FaSearch />
                        </button>
                        <button
                          onClick={() =>
                            setModalState((prev) => ({
                              ...prev,
                              showGoalForm: true,
                              selectedGoal: goal,
                            }))
                          }
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                          title="Edit Goal"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete this goal and all its key results?",
                              )
                            ) {
                              handleDeleteGoal(goal.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Goal"
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

          {filteredGoals.length === 0 && (
            <div className="text-center py-12">
              <FaBullseye className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all" ||
                filters.employee !== "all"
                  ? "No matching performance goals found"
                  : "No performance goals yet"}
              </h3>
              <p className="text-gray-500">
                {filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all" ||
                filters.employee !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first performance goal to get started"}
              </p>
              {!(
                filters.search ||
                filters.status !== "all" ||
                filters.cycle !== "all" ||
                filters.employee !== "all"
              ) && (
                <button
                  onClick={() =>
                    setModalState((prev) => ({ ...prev, showGoalForm: true }))
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Goal
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredGoals.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing {filteredGoals.length} of {goals.length} goals
              </div>
              <div className="text-sm text-gray-700 font-medium">
                {keyResults.length} total key results • {stats.Draft} Draft •{" "}
                {stats.in_progress} in progress • {stats.completed} completed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalFormModal
        isOpen={modalState.showGoalForm}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showGoalForm: false,
            selectedGoal: null,
          }))
        }
        goal={modalState.selectedGoal}
        reviewCycles={reviewCycles}
        employees={employees}
        onSubmit={(formData) => {
          if (modalState.selectedGoal) {
            return handleUpdateGoal(modalState.selectedGoal.id, formData);
          } else {
            return handleCreateGoal(formData);
          }
        }}
        loading={saving}
      />

      <KeyResultFormModal
        isOpen={modalState.showKeyResultForm}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showKeyResultForm: false,
            selectedKeyResult: null,
            selectedGoalForKeyResult: null,
          }))
        }
        keyResult={modalState.selectedKeyResult}
        goal={modalState.selectedGoalForKeyResult}
        onSubmit={(formData) => {
          if (modalState.selectedKeyResult) {
            return goalService
              .updateKeyResult(modalState.selectedKeyResult.id, formData)
              .then((response) => {
                // Update key result in state
                setKeyResults((prev) =>
                  prev.map((kr) =>
                    kr.id === modalState.selectedKeyResult.id
                      ? response.data
                      : kr,
                  ),
                );
                setSuccessMessage("Key result updated successfully!");
              });
          } else {
            return handleCreateKeyResult(formData);
          }
        }}
        loading={saving}
      />

      <GoalDetailModal
        isOpen={modalState.showGoalDetail}
        onClose={() =>
          setModalState((prev) => ({
            ...prev,
            showGoalDetail: false,
            selectedGoal: null,
          }))
        }
        goal={modalState.selectedGoal}
        keyResults={keyResults.filter(
          (kr) => kr.performance_goal_id === modalState.selectedGoal?.id,
        )}
        onAddKeyResult={handleAddKeyResult}
        onEditKeyResult={handleEditKeyResult}
        onDeleteKeyResult={handleDeleteKeyResult}
        onUpdateKeyResult={handleUpdateKeyResult}
        loading={saving}
      />
    </div>
  );
};

export default GoalSetting;

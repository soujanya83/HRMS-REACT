import React, { useState, useEffect } from "react";
import {
  FaHistory,
  FaFilter,
  FaCalendar,
  FaUser,
  FaArrowUp,
  FaExchangeAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaBriefcase,
  FaBuilding,
  FaTimes,
  FaRedoAlt,
  FaDownload,
} from "react-icons/fa";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getEmploymentHistory,
  createEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory,
  getEmployeesList,
} from "../../services/employmentHistoryService";

// History Event Component
const HistoryEvent = ({ event, onEdit, onDelete, onView }) => {
  const getEventType = (eventData) => {
    if (!eventData.reason_for_change) return "Change";

    const reason = eventData.reason_for_change.toLowerCase();
    if (reason.includes("promotion")) return "Promotion";
    if (reason.includes("transfer")) return "Transfer";
    if (reason.includes("salary")) return "Salary Update";
    if (reason.includes("terminat")) return "Termination";
    if (reason.includes("join")) return "Joining";
    if (reason.includes("designation")) return "Designation Change";
    return "Change";
  };

  const eventType = getEventType(event);

  const getEventIcon = (type) => {
    switch (type) {
      case "Promotion":
        return <FaArrowUp className="h-5 w-5 text-green-600" />;
      case "Transfer":
        return <FaExchangeAlt className="h-5 w-5 text-blue-600" />;
      case "Salary Update":
        return <FaEdit className="h-5 w-5 text-yellow-600" />;
      case "Termination":
        return <FaUserTimes className="h-5 w-5 text-red-600" />;
      case "Joining":
        return <FaUserCheck className="h-5 w-5 text-green-600" />;
      case "Designation Change":
        return <FaBriefcase className="h-5 w-5 text-purple-600" />;
      default:
        return <FaHistory className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "Promotion":
        return "bg-green-100 text-green-800 border-green-200";
      case "Transfer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Salary Update":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Termination":
        return "bg-red-100 text-red-800 border-red-200";
      case "Joining":
        return "bg-green-100 text-green-800 border-green-200";
      case "Designation Change":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEmployeeName = () => {
    if (event.employee?.first_name && event.employee?.last_name) {
      return `${event.employee.first_name} ${event.employee.last_name}`;
    }
    if (event.employee_name) {
      return event.employee_name;
    }
    return `Employee ${event.employee_id || "Unknown"}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            {getEventIcon(eventType)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-800">{eventType}</h4>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${getEventColor(
                  eventType
                )}`}
              >
                {eventType}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaCalendar className="h-3.5 w-3.5" />
                {formatDate(event.start_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <FaUser className="h-3.5 w-3.5" />
                {getEmployeeName()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 self-start sm:self-center">
          <button
            onClick={() => onView(event)}
            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>Reason:</strong>{" "}
          {event.reason_for_change || "No reason provided"}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {event.department_id && (
            <span>
              <strong>Department ID:</strong> {event.department_id}
            </span>
          )}
          {event.designation_id && (
            <span>
              <strong>Designation ID:</strong> {event.designation_id}
            </span>
          )}
          {event.employment_type && (
            <span>
              <strong>Type:</strong> {event.employment_type}
            </span>
          )}
          {event.location && (
            <span>
              <strong>Location:</strong> {event.location}
            </span>
          )}
          {event.end_date && (
            <span>
              <strong>End Date:</strong> {formatDate(event.end_date)}
            </span>
          )}
          {event.salary && (
            <span>
              <strong>Salary:</strong> $
              {parseFloat(event.salary).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ isOpen, onClose, onSubmit, event, employees }) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    department_id: "",
    designation_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    reason_for_change: "",
    job_title: "",
    employment_type: "",
    salary: "",
    location: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        employee_id: event.employee_id || "",
        department_id: event.department_id || "",
        designation_id: event.designation_id || "",
        start_date: event.start_date
          ? event.start_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        end_date: event.end_date ? event.end_date.split("T")[0] : "",
        reason_for_change: event.reason_for_change || "",
        job_title: event.job_title || "",
        employment_type: event.employment_type || "",
        salary: event.salary || "",
        location: event.location || "",
        notes: event.notes || "",
      });
    } else {
      setFormData({
        employee_id: "",
        department_id: "",
        designation_id: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        reason_for_change: "",
        job_title: "",
        employment_type: "",
        salary: "",
        location: "",
        notes: "",
      });
    }
    setErrors({});
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = {};
    if (!formData.employee_id)
      validationErrors.employee_id = "Employee is required";
    if (!formData.start_date)
      validationErrors.start_date = "Start date is required";
    if (!formData.reason_for_change)
      validationErrors.reason_for_change = "Reason for change is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const apiData = {
      employee_id: parseInt(formData.employee_id),
      department_id: formData.department_id
        ? parseInt(formData.department_id)
        : null,
      designation_id: formData.designation_id
        ? parseInt(formData.designation_id)
        : null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      reason_for_change: formData.reason_for_change,
      job_title: formData.job_title || null,
      employment_type: formData.employment_type || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      location: formData.location || null,
      notes: formData.notes || null,
    };

    onSubmit(apiData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Freelance",
    "Probation",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {event ? "Edit Employment History" : "Add New Employment History"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {event
                ? "Update employee employment history"
                : "Add a new employment record"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">
                Please fix the following errors:
              </p>
              <ul className="mt-1 text-red-600 text-sm">
                {Object.entries(errors).map(
                  ([field, error]) => error && <li key={field}>• {error}</li>
                )}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employee_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} (
                    {emp.employee_code || emp.id})
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.employee_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department ID
              </label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                placeholder="Enter Department ID"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter department ID (if available)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation ID
              </label>
              <input
                type="number"
                name="designation_id"
                value={formData.designation_id}
                onChange={handleChange}
                placeholder="Enter Designation ID"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter designation ID (if available)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., 50000"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Sydney Office"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change *
            </label>
            <textarea
              name="reason_for_change"
              value={formData.reason_for_change}
              onChange={handleChange}
              required
              rows="3"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason_for_change ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the reason for this employment change..."
            />
            {errors.reason_for_change && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reason_for_change}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or comments..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {event ? "Update History" : "Add History"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, label, value, color = "blue", description }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};

// Main Employment History Component
const EmploymentHistory = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [employees, setEmployees] = useState([]);
  const [apiError, setApiError] = useState("");
  const [organizationInfo, setOrganizationInfo] = useState("");

  const { selectedOrganization, organizations, isLoading: orgLoading } = useOrganizations();

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      setOrganizationInfo(`Organization: ${selectedOrganization.name}`);
    }
  }, [selectedOrganization]);

  const fetchData = async () => {
    setLoading(true);
    setApiError("");

    try {
      console.log("🔄 Fetching employment history data...");

      // 1. Fetch employment history
      const historyResponse = await getEmploymentHistory();
      console.log("Employment History response:", historyResponse);

      let historyData = [];
      if (historyResponse.data?.data) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse.data)) {
        historyData = historyResponse.data;
      }

      console.log(`✅ Loaded ${historyData.length} employment records`);
      setEvents(historyData);
      setFilteredEvents(historyData);

      // 2. Fetch employees
      const employeesResponse = await getEmployeesList();
      let employeesData = [];
      if (employeesResponse.data?.data) {
        employeesData = employeesResponse.data.data;
      } else if (Array.isArray(employeesResponse.data)) {
        employeesData = employeesResponse.data;
      }

      console.log(`✅ Loaded ${employeesData.length} employees`);
      setEmployees(employeesData);

    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setApiError(
        `Failed to load data: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );

      // Initialize empty arrays
      setEvents([]);
      setFilteredEvents([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((event) => {
        const employeeName = event.employee
          ? `${event.employee.first_name || ""} ${
              event.employee.last_name || ""
            }`.toLowerCase()
          : "";

        return (
          event.reason_for_change?.toLowerCase().includes(searchLower) ||
          employeeName.includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.job_title?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((event) => {
        const reason = (event.reason_for_change || "").toLowerCase();
        switch (eventTypeFilter) {
          case "Promotion":
            return reason.includes("promotion");
          case "Transfer":
            return reason.includes("transfer");
          case "Termination":
            return reason.includes("terminat");
          case "Joining":
            return reason.includes("join") || reason.includes("hired");
          case "Designation Change":
            return reason.includes("designation");
          default:
            return true;
        }
      });
    }

    if (dateRange.start) {
      filtered = filtered.filter((event) => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        const startDate = new Date(dateRange.start);
        return eventDate >= startDate;
      });
    }

    if (dateRange.end) {
      filtered = filtered.filter((event) => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        const endDate = new Date(dateRange.end);
        return eventDate <= endDate;
      });
    }

    setFilteredEvents(filtered);
  }, [searchTerm, eventTypeFilter, dateRange, events]);

  const handleSubmit = async (formData) => {
    try {
      console.log("📝 Submitting form data:", formData);

      // Add organization_id if available
      const submitData = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        department_id: formData.department_id
          ? parseInt(formData.department_id)
          : null,
        designation_id: formData.designation_id
          ? parseInt(formData.designation_id)
          : null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        ...(selectedOrganization?.id && { organization_id: selectedOrganization.id }),
      };

      if (selectedEvent) {
        await updateEmploymentHistory(selectedEvent.id, submitData);
        alert("✅ Employment history updated successfully!");
      } else {
        await createEmploymentHistory(submitData);
        alert("✅ Employment history created successfully!");
      }

      setShowForm(false);
      setSelectedEvent(null);
      fetchData();
    } catch (error) {
      console.error("❌ Error saving employment history:", error);

      let errorMessage = "Failed to save employment history.";
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        errorMessage = `Failed to save: ${errorMessages}`;
      } else if (error.response?.data?.message) {
        errorMessage = `Failed to save: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (event) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this employment record?\n\nEmployee: ${
          event.employee?.first_name || "Unknown"
        } ${event.employee?.last_name || ""}\nReason: ${
          event.reason_for_change
        }`
      )
    )
      return;

    try {
      await deleteEmploymentHistory(event.id);
      alert("✅ Employment record deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      alert(
        "Failed to delete employment record: " +
          (error.response?.data?.message || error.message || "Unknown error")
      );
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleView = (event) => {
    const modalContent = `
      📋 Employment History Details:
      
      👤 Employee: ${event.employee?.first_name || "Unknown"} ${
      event.employee?.last_name || ""
    }
      📅 Start Date: ${event.start_date || "Not specified"}
      ${event.end_date ? `📅 End Date: ${event.end_date}` : "⏳ Ongoing"}
      
      🏢 Department ID: ${event.department_id || "N/A"}
      📋 Designation ID: ${event.designation_id || "N/A"}
      📝 Employment Type: ${event.employment_type || "N/A"}
      📍 Location: ${event.location || "N/A"}
      ${
        event.salary
          ? `💰 Salary: $${parseFloat(event.salary).toLocaleString()}`
          : "💰 Salary: N/A"
      }
      
      📝 Reason for Change: ${event.reason_for_change || "Not specified"}
      
      📝 Notes: ${event.notes || "No additional notes"}
    `;
    alert(modalContent);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("all");
    setDateRange({ start: "", end: "" });
  };

  const eventTypes = [
    "Promotion",
    "Transfer",
    "Termination",
    "Joining",
    "Designation Change",
  ];

  // Calculate statistics
  const stats = {
    total: events.length,
    recent: events.filter((e) => {
      if (!e.start_date) return false;
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      try {
        return new Date(e.start_date) > monthAgo;
      } catch {
        return false;
      }
    }).length,
    promotions: events.filter((e) =>
      e.reason_for_change?.toLowerCase().includes("promotion")
    ).length,
    terminations: events.filter((e) =>
      e.reason_for_change?.toLowerCase().includes("terminat")
    ).length,
  };

  if (orgLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <EventFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmit}
        event={selectedEvent}
        employees={employees}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employment History
            </h1>
            <p className="text-gray-600 mt-2">
              Track all employee employment history and organizational changes
              {organizationInfo && ` • ${organizationInfo}`}
            </p>
            {organizations.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <FaBuilding className="h-4 w-4" />
                <select
                  value={selectedOrganization?.id || ""}
                  onChange={(e) => {
                    const newOrgId = parseInt(e.target.value);
                    if (newOrgId) {
                      localStorage.setItem('selectedOrgId', newOrgId);
                      window.location.reload();
                    }
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Add New Record
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <FaRedoAlt className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <FaTimes className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{apiError}</p>
            </div>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaHistory className="h-6 w-6" />}
            label="Total Records"
            value={stats.total}
            color="blue"
            description="All recorded history"
          />
          <StatCard
            icon={<FaCalendar className="h-6 w-6" />}
            label="Recent Records"
            value={stats.recent}
            color="green"
            description="Last 30 days"
          />
          <StatCard
            icon={<FaArrowUp className="h-6 w-6" />}
            label="Promotions"
            value={stats.promotions}
            color="purple"
            description="Career advancements"
          />
          <StatCard
            icon={<FaUserTimes className="h-6 w-6" />}
            label="Terminations"
            value={stats.terminations}
            color="red"
            description="Employment endings"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Employment Records
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredEvents.length} of {events.length} records shown
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee, reason, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              placeholder="Start Date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              placeholder="End Date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">
                Loading employment history...
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6">
                <div className="relative">
                  <FaHistory className="h-20 w-20 text-gray-200 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaSearch className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm ||
                eventTypeFilter !== "all" ||
                dateRange.start ||
                dateRange.end
                  ? "No matching records found"
                  : "No employment history recorded yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm ||
                eventTypeFilter !== "all" ||
                dateRange.start ||
                dateRange.end
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start tracking employee employment history by adding your first record."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <FaPlus className="inline mr-2" />
                  Add First Record
                </button>
                {(searchTerm ||
                  eventTypeFilter !== "all" ||
                  dateRange.start ||
                  dateRange.end) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <HistoryEvent
                  key={event.id || index}
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event)}
                  onView={() => handleView(event)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">{filteredEvents.length}</span>{" "}
                of <span className="font-semibold">{events.length}</span>{" "}
                records
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    // Export functionality
                    const exportData = filteredEvents.map((event) => ({
                      Employee: `${event.employee?.first_name || ""} ${
                        event.employee?.last_name || ""
                      }`,
                      "Employee ID": event.employee_id,
                      "Start Date": event.start_date,
                      "End Date": event.end_date || "Ongoing",
                      Reason: event.reason_for_change,
                      "Department ID": event.department_id || "",
                      "Designation ID": event.designation_id || "",
                      "Job Title": event.job_title || "",
                      "Employment Type": event.employment_type || "",
                      Location: event.location || "",
                      Salary: event.salary || "",
                      Notes: event.notes || "",
                    }));

                    const csvContent = [
                      Object.keys(exportData[0]).join(","),
                      ...exportData.map((row) =>
                        Object.values(row)
                          .map(
                            (value) => `"${String(value).replace(/"/g, '""')}"`
                          )
                          .join(",")
                      ),
                    ].join("\n");

                    const blob = new Blob([csvContent], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `employment-history-${
                      new Date().toISOString().split("T")[0]
                    }.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    alert("✅ Data exported to CSV successfully!");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaDownload className="h-4 w-4" />
                  Export CSV
                </button>
                <div className="text-sm text-gray-500">
                  Updated:{" "}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      {filteredEvents.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FaPlus className="inline mr-2" />
            Add Another Record
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <FaRedoAlt className="inline mr-2" />
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default EmploymentHistory;
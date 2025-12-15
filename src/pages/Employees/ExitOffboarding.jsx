/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { getEmployees, updateEmployeeStatus } from "../../services/employeeService";
import {
  createEmployeeExit,
  getEmployeeExits,
  deleteEmployeeExit,
  createOffboardingTask,
  getOffboardingTasks,
  deleteOffboardingTask,
  completeOffboardingTask,
  getOffboardingTemplates,
  getTemplateTasksByTemplate
} from "../../services/exitOffboardingService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  FaUserTimes,
  FaSignOutAlt,
  FaSearch,
  FaCalendarAlt,
  FaFileExport,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
  FaList,
  FaTasks,
  FaUserCheck,
  FaBuilding,
  FaHistory,
  FaClipboardCheck,
  FaArrowRight,
  FaSync,
  FaDownload,
  FaEye,
  FaUsers,
  FaCalendarPlus
} from "react-icons/fa";

// Exit Form Modal Component
const ExitFormModal = ({ isOpen, onClose, onSubmit, employee, templates }) => {
  const [formData, setFormData] = useState({
    resignation_date: "",
    last_working_day: "",
    reason_for_leaving: "",
    exit_interview_feedback: "",
    is_eligible_for_rehire: true,
    selected_template: ""
  });

  const [errors, setErrors] = useState({});
  const [selectedTemplateTasks, setSelectedTemplateTasks] = useState([]);

  useEffect(() => {
    if (employee && isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        resignation_date: today,
        last_working_day: "",
        reason_for_leaving: "",
        exit_interview_feedback: "",
        is_eligible_for_rehire: true,
        selected_template: ""
      });
    }
  }, [employee, isOpen]);

  useEffect(() => {
    if (formData.selected_template) {
      loadTemplateTasks(formData.selected_template);
    } else {
      setSelectedTemplateTasks([]);
    }
  }, [formData.selected_template]);

  const loadTemplateTasks = async (templateId) => {
    try {
      const response = await getTemplateTasksByTemplate(templateId);
      if (response.data?.data) {
        setSelectedTemplateTasks(response.data.data);
      }
    } catch (error) {
      console.error("Error loading template tasks:", error);
      setSelectedTemplateTasks([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = {};
    if (!formData.resignation_date) validationErrors.resignation_date = "Resignation date is required";
    if (!formData.last_working_day) validationErrors.last_working_day = "Last working day is required";
    if (!formData.reason_for_leaving) validationErrors.reason_for_leaving = "Reason for leaving is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const exitData = {
      employee_id: employee.id,
      resignation_date: formData.resignation_date,
      last_working_day: formData.last_working_day,
      reason_for_leaving: formData.reason_for_leaving,
      exit_interview_feedback: formData.exit_interview_feedback,
      is_eligible_for_rehire: formData.is_eligible_for_rehire,
      selected_template: formData.selected_template,
      template_tasks: selectedTemplateTasks
    };

    onSubmit(exitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Initiate Exit Process</h2>
            <p className="text-sm text-gray-500 mt-1">
              {employee ? `${employee.first_name} ${employee.last_name} (${employee.employee_code})` : ""}
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
              <p className="text-red-700 font-medium">Please fix the following errors:</p>
              <ul className="mt-1 text-red-600 text-sm">
                {Object.entries(errors).map(([field, error]) => (
                  error && <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <input
                type="text"
                value={employee ? `${employee.first_name} ${employee.last_name} (${employee.employee_code})` : ""}
                disabled
                className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offboarding Template
              </label>
              <select
                name="selected_template"
                value={formData.selected_template}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Template (Optional)</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resignation Date *
              </label>
              <input
                type="date"
                name="resignation_date"
                value={formData.resignation_date}
                onChange={handleChange}
                required
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.resignation_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.resignation_date && (
                <p className="mt-1 text-sm text-red-600">{errors.resignation_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Working Day *
              </label>
              <input
                type="date"
                name="last_working_day"
                value={formData.last_working_day}
                onChange={handleChange}
                required
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.last_working_day ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.last_working_day && (
                <p className="mt-1 text-sm text-red-600">{errors.last_working_day}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leaving *
              </label>
              <select
                name="reason_for_leaving"
                value={formData.reason_for_leaving}
                onChange={handleChange}
                required
                className={`w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason_for_leaving ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Reason</option>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="End of Contract">End of Contract</option>
                <option value="Retirement">Retirement</option>
                <option value="Medical Reasons">Medical Reasons</option>
                <option value="Relocation">Relocation</option>
                <option value="Career Change">Career Change</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason_for_leaving && (
                <p className="mt-1 text-sm text-red-600">{errors.reason_for_leaving}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_eligible_for_rehire"
                  name="is_eligible_for_rehire"
                  checked={formData.is_eligible_for_rehire}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_eligible_for_rehire" className="ml-2 text-sm text-gray-700">
                  Eligible for Rehire
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exit Interview Feedback
              </label>
              <textarea
                name="exit_interview_feedback"
                value={formData.exit_interview_feedback}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter exit interview feedback..."
              />
            </div>
          </div>

          {/* Template Tasks Preview */}
          {selectedTemplateTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaTasks className="mr-2 text-blue-500" />
                Template Tasks ({selectedTemplateTasks.length})
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  {selectedTemplateTasks.map((task, index) => (
                    <div key={task.id || index} className="flex items-center p-3 bg-white rounded border">
                      <FaClipboardCheck className="h-4 w-4 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{task.task_name}</p>
                        <p className="text-xs text-gray-500">{task.description}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.due_before_days} days before exit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Initiate Exit Process
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Component
const TaskItem = ({ task, onComplete, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start">
          <div className="p-2 bg-gray-50 rounded mr-3">
            <FaClipboardCheck className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">{task.task_name}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          {task.status !== 'Completed' && (
            <button
              onClick={() => onComplete(task)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Mark Complete"
            >
              <FaCheckCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Assigned to: {task.assigned_to_name || 'Not assigned'}</p>
      </div>
    </div>
  );
};

// Exit Detail Modal Component
const ExitDetailModal = ({ exit, isOpen, onClose, onTaskComplete, onTaskDelete }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (exit && isOpen) {
      fetchTasks();
    }
  }, [exit, isOpen]);

  const fetchTasks = async () => {
    try {
      const response = await getOffboardingTasks({ employee_exit_id: exit.id });
      setTasks(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  if (!isOpen || !exit) return null;

  const handleTaskComplete = async (task) => {
    try {
      await completeOffboardingTask(task.id);
      fetchTasks();
      if (onTaskComplete) onTaskComplete();
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    }
  };

  const handleTaskDelete = async (task) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteOffboardingTask(task.id);
      fetchTasks();
      if (onTaskDelete) onTaskDelete();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Exit Process Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              {exit.employee?.first_name} {exit.employee?.last_name}
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

        <div className="p-6">
          {/* Exit Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserTimes className="mr-2 text-red-500" />
              Exit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Resignation Date</p>
                <p className="font-medium">
                  {exit.resignation_date ? new Date(exit.resignation_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Working Day</p>
                <p className="font-medium">
                  {exit.last_working_day ? new Date(exit.last_working_day).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Reason for Leaving</p>
                <p className="font-medium">{exit.reason_for_leaving || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Eligible for Rehire</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${exit.is_eligible_for_rehire ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {exit.is_eligible_for_rehire ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Task Stats */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <FaTasks className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
                  </div>
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                  </div>
                  <FaClock className="text-yellow-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.overdue}</p>
                  </div>
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaClipboardCheck className="mr-2 text-blue-500" />
                Offboarding Tasks
              </h3>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <FaPlus className="mr-1.5" /> Add Task
              </button>
            </div>

            {loadingTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading tasks...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaTasks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">Add tasks to track the offboarding process</p>
              </div>
            )}
          </div>

          {/* Exit Interview Feedback */}
          {exit.exit_interview_feedback && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaHistory className="mr-2 text-purple-500" />
                Exit Interview Feedback
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{exit.exit_interview_feedback}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ExitOffboarding() {
  const [activeTab, setActiveTab] = useState("activeEmployees");
  const [employees, setEmployees] = useState([]);
  const [exits, setExits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExitForm, setShowExitForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showExitDetail, setShowExitDetail] = useState(false);
  const [selectedExit, setSelectedExit] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  const { selectedOrganization } = useOrganizations();

  const fetchData = useCallback(async () => {
    if (!selectedOrganization) {
      setLoading(false);
      setEmployees([]);
      setExits([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch employees
      const params = {
        search: searchTerm,
        organization_id: selectedOrganization.id,
      };

      const [employeesRes, exitsRes, templatesRes] = await Promise.all([
        getEmployees(params),
        getEmployeeExits({ organization_id: selectedOrganization.id }),
        getOffboardingTemplates({ organization_id: selectedOrganization.id })
      ]);

      // Filter active employees
      const activeEmployees = employeesRes.data?.data?.filter(
        emp => emp.status !== "Terminated"
      ) || [];

      setEmployees(activeEmployees);
      setExits(exitsRes.data?.data || []);
      setTemplates(templatesRes.data?.data || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      setEmployees([]);
      setExits([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "activeEmployees") {
        fetchData();
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchData, activeTab]);

  useEffect(() => {
    if (activeTab === "exits") {
      fetchExits();
    }
  }, [activeTab]);

  const fetchExits = async () => {
    try {
      const response = await getEmployeeExits({ organization_id: selectedOrganization?.id });
      setExits(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching exits:", error);
      setExits([]);
    }
  };

  const handleInitiateExit = (employee) => {
    setSelectedEmployee(employee);
    setShowExitForm(true);
  };

  const handleSubmitExit = async (exitData) => {
    try {
      // 1. First create the exit record
      const exitResponse = await createEmployeeExit({
        employee_id: exitData.employee_id,
        resignation_date: exitData.resignation_date,
        last_working_day: exitData.last_working_day,
        reason_for_leaving: exitData.reason_for_leaving,
        exit_interview_feedback: exitData.exit_interview_feedback,
        is_eligible_for_rehire: exitData.is_eligible_for_rehire
      });

      const exitId = exitResponse.data.data.id;

      // 2. Update employee status to Terminated
      await updateEmployeeStatus(exitData.employee_id, "Terminated");

      // 3. Create tasks from template if selected
      if (exitData.selected_template && exitData.template_tasks && exitData.template_tasks.length > 0) {
        const taskPromises = exitData.template_tasks.map(task => {
          const dueDate = new Date(exitData.last_working_day);
          dueDate.setDate(dueDate.getDate() - (task.due_before_days || 0));
          
          return createOffboardingTask({
            employee_exit_id: exitId,
            task_name: task.task_name,
            description: task.description,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'Pending',
            assigned_to: null // You might want to assign based on default_assigned_role
          });
        });

        await Promise.all(taskPromises);
      }

      alert("Exit process initiated successfully!");
      setShowExitForm(false);
      setSelectedEmployee(null);
      fetchData();
      
    } catch (error) {
      console.error("Failed to initiate exit:", error);
      const errorMsg = error.response?.data?.message || "Failed to initiate exit process";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleViewExitDetails = (exit) => {
    setSelectedExit(exit);
    setShowExitDetail(true);
  };

  const handleDeleteExit = async (exit) => {
    if (!window.confirm("Are you sure you want to delete this exit record?")) return;
    
    try {
      await deleteEmployeeExit(exit.id);
      // Update employee status back to Active
      await updateEmployeeStatus(exit.employee_id, "Active");
      alert("Exit record deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting exit:", error);
      alert("Failed to delete exit record");
    }
  };

  // Statistics
  const stats = {
    activeEmployees: employees.length,
    totalExits: exits.length,
    pendingTasks: exits.reduce((total, exit) => total + (exit.offboarding_tasks?.filter(t => t.status === 'Pending').length || 0), 0),
    completedThisMonth: exits.filter(e => {
      const exitDate = new Date(e.created_at);
      const now = new Date();
      return exitDate.getMonth() === now.getMonth() && exitDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Modals */}
      <ExitFormModal
        isOpen={showExitForm}
        onClose={() => {
          setShowExitForm(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleSubmitExit}
        employee={selectedEmployee}
        templates={templates}
      />

      <ExitDetailModal
        exit={selectedExit}
        isOpen={showExitDetail}
        onClose={() => {
          setShowExitDetail(false);
          setSelectedExit(null);
        }}
        onTaskComplete={fetchExits}
        onTaskDelete={fetchExits}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Exit & Offboarding</h1>
            <p className="text-gray-600 mt-2">
              Manage employee exits and offboarding processes
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("exits")}
              className={`px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center ${
                activeTab === "exits" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaHistory className="mr-2" />
              View All Exits
            </button>
            <button
              onClick={() => setActiveTab("activeEmployees")}
              className={`px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center ${
                activeTab === "activeEmployees" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaUsers className="mr-2" />
              Active Employees
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeEmployees}</p>
              </div>
              <FaUsers className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exits</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalExits}</p>
              </div>
              <FaSignOutAlt className="text-orange-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</p>
              </div>
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed This Month</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedThisMonth}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 p-5 bg-white shadow-lg rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, employee code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => fetchData()}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center">
              <FaFileExport className="mr-2" /> Export Reports
            </button>
            <button className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center">
              <FaCalendarPlus className="mr-2" /> Schedule Bulk
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "activeEmployees" ? (
        /* Active Employees Table */
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              Active Employees ({employees.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select an employee to initiate exit process
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading employees...</p>
            </div>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="font-semibold text-blue-600">
                              {emp.first_name?.[0]}
                              {emp.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {emp.employee_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {emp.department?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {emp.designation?.title || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {emp.joining_date
                            ? new Date(emp.joining_date).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            emp.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : emp.status === "On Probation"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleInitiateExit(emp)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Initiate Exit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <FaUsers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active employees found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try a different search term" : "All employees have been terminated"}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* All Exits Table */
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaHistory className="mr-2 text-blue-500" />
              All Exit Records ({exits.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all employee exit records
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading exit records...</p>
            </div>
          ) : exits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Exit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Rehire Eligible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exits.map((exit) => {
                    const employee = exit.employee;
                    const taskStats = {
                      total: exit.offboarding_tasks?.length || 0,
                      completed: exit.offboarding_tasks?.filter(t => t.status === 'Completed').length || 0
                    };
                    
                    return (
                      <tr key={exit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <span className="font-semibold text-gray-600">
                                {employee?.first_name?.[0]}
                                {employee?.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employee?.first_name} {employee?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee?.employee_code || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {exit.last_working_day
                              ? new Date(exit.last_working_day).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {exit.reason_for_leaving || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              exit.is_eligible_for_rehire
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {exit.is_eligible_for_rehire ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {taskStats.completed}/{taskStats.total}
                            </span>
                            <span className="text-gray-500 ml-1">
                              completed
                            </span>
                          </div>
                          {taskStats.total > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{
                                  width: `${(taskStats.completed / taskStats.total) * 100}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewExitDetails(exit)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExit(exit)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <FaHistory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No exit records found</p>
              <p className="text-sm text-gray-400 mt-1">
                Initiate exit process for employees to see records here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Exits Section */}
      <div className="mt-8 bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-purple-500" />
          Recent Exits (Last 30 Days)
        </h3>
        
        {exits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exit Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exits.slice(0, 5).map((exit) => {
                  const employee = exit.employee;
                  const taskStats = {
                    total: exit.offboarding_tasks?.length || 0,
                    completed: exit.offboarding_tasks?.filter(t => t.status === 'Completed').length || 0
                  };
                  
                  return (
                    <tr key={exit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {employee?.first_name} {employee?.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {exit.last_working_day
                            ? new Date(exit.last_working_day).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {exit.reason_for_leaving || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: taskStats.total > 0 
                                  ? `${(taskStats.completed / taskStats.total) * 100}%`
                                  : '0%'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {taskStats.completed}/{taskStats.total}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FaHistory className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent exits in the last 30 days.</p>
          </div>
        )}
      </div>

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="mt-8 bg-white shadow-lg rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaBuilding className="mr-2 text-indigo-500" />
              Available Offboarding Templates ({templates.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description || "No description provided"}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaTasks className="h-3 w-3 mr-1" />
                  <span>{template.tasks_count || 0} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
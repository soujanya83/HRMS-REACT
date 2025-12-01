import React, { useState, useEffect, useCallback } from "react";
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiX } from "react-icons/hi";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getOnboardingTemplates,
  createOnboardingTemplate,
  deleteOnboardingTemplate,
  getOnboardingTemplateTasksByTemplate,
  createOnboardingTemplateTask,
  getOnboardingTasksByApplicant,
  updateOnboardingTask,
  completeOnboardingTask,
  getHiredApplicants,
  createOnboardingTask, // Add this import
} from "../../services/onboardingService";

// Main Page Component
const OnboardingPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              New Hire Onboarding
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage onboarding checklists and track new employee progress.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Onboarding Dashboard
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Template Management
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "dashboard" && <OnboardingDashboard />}
          {activeTab === "templates" && <TemplateManager />}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component with API Integration
const OnboardingDashboard = () => {
  const [newHires, setNewHires] = useState([]);
  const [selectedHire, setSelectedHire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedApplicantForTask, setSelectedApplicantForTask] =
    useState(null);

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const fetchNewHires = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get hired applicants
      const hiredApplicantsRes = await getHiredApplicants(organizationId);
      const hiredApplicants = hiredApplicantsRes.data?.data || [];

      // For each hired applicant, fetch their onboarding tasks
      const hiresWithTasks = await Promise.all(
        hiredApplicants.map(async (applicant) => {
          try {
            const tasksRes = await getOnboardingTasksByApplicant(applicant.id);
            const tasks = tasksRes.data?.data || [];

            return {
              id: applicant.id,
              applicant: {
                first_name: applicant.first_name,
                last_name: applicant.last_name,
                job_opening: applicant.job_opening || {
                  title: "Not specified",
                },
              },
              start_date:
                applicant.start_date || new Date().toISOString().split("T")[0],
              tasks: tasks.map((task) => ({
                id: task.id,
                task_name: task.task_name,
                description: task.description,
                due_date: task.due_date,
                status: task.status || "pending",
                completed_at: task.completed_at,
              })),
            };
          } catch (error) {
            console.error(
              `Error fetching tasks for applicant ${applicant.id}:`,
              error
            );
            return {
              id: applicant.id,
              applicant: {
                first_name: applicant.first_name,
                last_name: applicant.last_name,
                job_opening: applicant.job_opening || {
                  title: "Not specified",
                },
              },
              start_date:
                applicant.start_date || new Date().toISOString().split("T")[0],
              tasks: [],
            };
          }
        })
      );

      setNewHires(hiresWithTasks);
    } catch (err) {
      console.error("Error fetching new hires:", err);
      setError("Failed to load onboarding data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchNewHires();
  }, [fetchNewHires]);

  const handleAddTask = (applicant) => {
    setSelectedApplicantForTask(applicant);
    setAddTaskModalOpen(true);
  };

  const handleCreateNewTask = async (taskData) => {
    try {
      if (!selectedApplicantForTask) return;

      // Format due date properly
      const formattedDueDate = taskData.due_date
        ? new Date(taskData.due_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const payload = {
        applicant_id: selectedApplicantForTask.id,
        task_name: taskData.task_name,
        description: taskData.description || "",
        due_date: formattedDueDate,
        status: "pending",
      };

      console.log("Creating task with payload:", payload);

      const response = await createOnboardingTask(payload);
      console.log("Task created successfully:", response.data);

      // Refresh the data
      await fetchNewHires();
      setAddTaskModalOpen(false);
      setSelectedApplicantForTask(null);

      alert("Task added successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        alert(`Validation errors: ${JSON.stringify(validationErrors)}`);
      } else {
        alert("Failed to create task. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchNewHires}
          className="bg-brand-blue text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newHires.map((hire) => (
          <NewHireCard
            key={hire.id}
            hire={hire}
            onSelect={() => setSelectedHire(hire)}
            onAddTask={() => handleAddTask(hire)}
          />
        ))}
      </div>

      {newHires.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <HiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No new hires
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no employees with "Hired" status for onboarding.
          </p>
        </div>
      )}

      {selectedHire && (
        <NewHireChecklistSlideOver
          hire={selectedHire}
          isOpen={!!selectedHire}
          onClose={() => setSelectedHire(null)}
          onTaskUpdate={fetchNewHires}
          onAddTask={() => handleAddTask(selectedHire)}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && selectedApplicantForTask && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setAddTaskModalOpen(false);
            setSelectedApplicantForTask(null);
          }}
          onSubmit={handleCreateNewTask}
          applicant={selectedApplicantForTask}
        />
      )}
    </div>
  );
};

// Updated New Hire Card Component with Add Task button
const NewHireCard = ({ hire, onSelect, onAddTask }) => {
  const progress = React.useMemo(() => {
    const totalTasks = hire.tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = hire.tasks.filter(
      (t) => t.status === "completed"
    ).length;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [hire.tasks]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg text-gray-900">
            {hire.applicant.first_name} {hire.applicant.last_name}
          </p>
          <p className="text-sm text-gray-600">
            {hire.applicant.job_opening.title}
          </p>
        </div>
        <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-indigo-800 font-bold text-lg">
            {hire.applicant.first_name[0]}
            {hire.applicant.last_name[0]}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Start Date: {new Date(hire.start_date).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {hire.tasks.length} task{hire.tasks.length !== 1 ? "s" : ""} total
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 py-2 px-4 bg-brand-blue text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
        >
          View Tasks
        </button>
        <button
          onClick={onAddTask}
          className="flex-1 py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <HiPlus className="inline mr-1" /> Add Task
        </button>
      </div>
    </div>
  );
};

// Template Manager Component with API Integration
const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const templatesRes = await getOnboardingTemplates({
        organization_id: organizationId,
      });
      const templatesData = templatesRes.data?.data || [];

      // Fetch tasks for each template
      const templatesWithTasks = await Promise.all(
        templatesData.map(async (template) => {
          try {
            const tasksRes = await getOnboardingTemplateTasksByTemplate(
              template.id
            );
            return {
              ...template,
              tasks: tasksRes.data?.data || [],
            };
          } catch (error) {
            console.error(
              `Error fetching tasks for template ${template.id}:`,
              error
            );
            return {
              ...template,
              tasks: [],
            };
          }
        })
      );

      setTemplates(templatesWithTasks);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = async (templateData) => {
    try {
      await createOnboardingTemplate({
        ...templateData,
        organization_id: organizationId,
      });
      await fetchTemplates();
      setTemplateModalOpen(false);
    } catch (err) {
      console.error("Error creating template:", err);
      alert("Failed to create template. Please try again.");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteOnboardingTemplate(templateId);
        await fetchTemplates();
      } catch (err) {
        console.error("Error deleting template:", err);
        alert("Failed to delete template. Please try again.");
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createOnboardingTemplateTask({
        ...taskData,
        onboarding_template_id: selectedTemplate.id,
      });
      await fetchTemplates();
      setTaskModalOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchTemplates}
          className="bg-brand-blue text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Onboarding Templates</h2>
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            <HiPlus /> Create Template
          </button>
        </div>

        {templates.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {template.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        {template.tasks.length} task
                        {template.tasks.length !== 1 ? "s" : ""}
                      </span>
                      {template.tasks.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTaskModalOpen(true);
                          }}
                          className="ml-4 text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Tasks
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTaskModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <HiPencil />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No templates found. Create your first template to get started.
          </div>
        )}
      </div>

      {/* Template Creation Modal */}
      {isTemplateModalOpen && (
        <TemplateFormModal
          isOpen={isTemplateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          onSubmit={handleCreateTemplate}
        />
      )}

      {/* Task Management Modal */}
      {isTaskModalOpen && selectedTemplate && (
        <TaskManagementModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
};

// Template Form Modal Component
const TemplateFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create Template</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="e.g., New Developer Checklist"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Describe the purpose of this template..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Management Modal Component
const TaskManagementModal = ({ isOpen, onClose, template, onSubmit }) => {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    default_due_days: 1,
    default_assigned_role: "HR",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "default_due_days" ? parseInt(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Add Task to {template.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="e.g., Sign Employment Contract"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Task description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due In (Days)
              </label>
              <input
                type="number"
                name="default_due_days"
                value={formData.default_due_days}
                onChange={handleChange}
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Role
              </label>
              <select
                name="default_assigned_role"
                value={formData.default_assigned_role}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              >
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="IT Support">IT Support</option>
                <option value="New Hire">New Hire</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Task Modal Component for Dashboard
const AddTaskModal = ({ isOpen, onClose, onSubmit, applicant }) => {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Add Task for {applicant.applicant.first_name}{" "}
            {applicant.applicant.last_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Applicant:</strong> {applicant.applicant.first_name}{" "}
              {applicant.applicant.last_name}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Position:</strong> {applicant.applicant.job_opening.title}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="e.g., Complete Documentation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Task details and instructions..."
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
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Updated New Hire Checklist SlideOver with API Integration and Add Task button
const NewHireChecklistSlideOver = ({
  hire,
  isOpen,
  onClose,
  onTaskUpdate,
  onAddTask,
}) => {
  const [tasks, setTasks] = useState(hire.tasks);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      setIsLoading(true);

      if (newStatus === "completed") {
        await completeOnboardingTask(taskId);
      } else {
        // For uncompleting, we need to update the task status
        await updateOnboardingTask(taskId, { status: "pending" });
      }

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                completed_at:
                  newStatus === "completed" ? new Date().toISOString() : null,
              }
            : task
        )
      );

      // Notify parent to refresh data
      onTaskUpdate();
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 overflow-hidden z-30 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="p-6 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {hire.applicant.first_name}'s Onboarding
                    </h2>
                    <p className="text-sm text-gray-500">
                      Due by {new Date(hire.start_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {hire.applicant.job_opening.title}
                    </p>
                  </div>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                      disabled={isLoading}
                    >
                      <HiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="mb-4">
                  <button
                    onClick={onAddTask}
                    className="w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <HiPlus className="mr-2" /> Add New Task
                  </button>
                </div>

                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`task-${task.id}`}
                        checked={task.status === "completed"}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        disabled={isLoading}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`ml-3 text-sm ${
                          task.status === "completed"
                            ? "text-gray-500 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        <div className="font-medium">{task.task_name}</div>
                        {task.description && (
                          <div className="text-gray-500 text-xs mt-1">
                            {task.description}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="text-gray-400 text-xs mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No onboarding tasks assigned yet.
                    <button
                      onClick={onAddTask}
                      className="mt-4 py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <HiPlus className="inline mr-1" /> Add Your First Task
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OnboardingPage;

import React, { useState, useEffect, useCallback } from "react";
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiCheckCircle, 
  HiX, 
  HiTemplate,
  HiOutlineClock,
  HiCheck,
  HiOutlineEye 
} from "react-icons/hi";
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
  createOnboardingTask,
  generateTasksFromTemplate,
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

// Helper function to calculate days left
const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Dashboard Component
const OnboardingDashboard = () => {
  const [newHires, setNewHires] = useState([]);
  const [selectedHire, setSelectedHire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isApplyTemplateModalOpen, setApplyTemplateModalOpen] = useState(false);
  const [selectedApplicantForTask, setSelectedApplicantForTask] = useState(null);
  const [templates, setTemplates] = useState([]);

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
      const allApplicantsRes = await getHiredApplicants(organizationId);
      const allApplicants = allApplicantsRes.data?.data || [];
      
      const hiredApplicants = allApplicants.filter(applicant => {
        const status = applicant.status?.toLowerCase();
        return status === 'hired';
      });

      const hiresWithTasks = await Promise.all(
        hiredApplicants.map(async (applicant) => {
          try {
            const tasksRes = await getOnboardingTasksByApplicant(applicant.id);
            const tasks = tasksRes.data?.data || [];

            const tasksWithDaysLeft = tasks.map((task) => ({
              id: task.id,
              task_name: task.task_name,
              description: task.description,
              due_date: task.due_date,
              status: task.status || "pending",
              completed_at: task.completed_at,
              days_left: calculateDaysLeft(task.due_date)
            }));

            // Calculate completed tasks count
            const completedTasks = tasksWithDaysLeft.filter(t => t.status === "completed").length;

            return {
              id: applicant.id,
              applicant: {
                first_name: applicant.first_name,
                last_name: applicant.last_name,
                job_opening: applicant.job_opening || {
                  title: "Not specified",
                },
                status: applicant.status,
              },
              start_date:
                applicant.start_date || new Date().toISOString().split("T")[0],
              tasks: tasksWithDaysLeft,
              completedTasks: completedTasks,
              totalTasks: tasksWithDaysLeft.length
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
                status: applicant.status,
              },
              start_date:
                applicant.start_date || new Date().toISOString().split("T")[0],
              tasks: [],
              completedTasks: 0,
              totalTasks: 0
            };
          }
        })
      );

      setNewHires(hiresWithTasks);
      
    } catch (err) {
      console.error("❌ Error fetching new hires:", err);
      setError("Failed to load onboarding data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) return;

    try {
      const templatesRes = await getOnboardingTemplates({
        organization_id: organizationId,
      });
      setTemplates(templatesRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchNewHires();
    fetchTemplates();
  }, [fetchNewHires, fetchTemplates]);

  const handleAddTask = (applicant) => {
    setSelectedApplicantForTask(applicant);
    setAddTaskModalOpen(true);
  };

  const handleApplyTemplate = (applicant) => {
    setSelectedApplicantForTask(applicant);
    setApplyTemplateModalOpen(true);
  };

  const handleCreateNewTask = async (taskData) => {
    try {
      if (!selectedApplicantForTask) {
        alert("No applicant selected");
        return;
      }

      const applicantStatus = selectedApplicantForTask.applicant?.status?.toLowerCase();
      
      if (applicantStatus !== 'hired') {
        alert(`Cannot create task: Applicant status is "${selectedApplicantForTask.applicant?.status}" but must be "Hired"`);
        return;
      }

      const formattedDueDate = taskData.due_date
        ? new Date(taskData.due_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const payload = {
        applicant_id: parseInt(selectedApplicantForTask.id),
        task_name: taskData.task_name,
        description: taskData.description || "",
        due_date: formattedDueDate,
        status: "pending",
        organization_id: parseInt(organizationId),
      };

      console.log("📤 Creating onboarding task with payload:", JSON.stringify(payload, null, 2));

      const response = await createOnboardingTask(payload);
      console.log("✅ Task created successfully:", response.data);

      await fetchNewHires();
      setAddTaskModalOpen(false);
      setSelectedApplicantForTask(null);
      alert("Task added successfully!");
      
    } catch (err) {
      console.error("❌ Error creating task:", err);
      
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        alert(`Error: ${errorData.message}\nCurrent status: ${errorData.current_status}`);
      } else {
        alert("Failed to create task. Please try again.");
      }
    }
  };

  const handleApplyTemplateToApplicant = async (templateId) => {
    try {
      if (!selectedApplicantForTask) {
        alert("No applicant selected");
        return;
      }

      const applicantStatus = selectedApplicantForTask.applicant?.status?.toLowerCase();
      
      if (applicantStatus !== 'hired') {
        alert(`Cannot apply template: Applicant status is "${selectedApplicantForTask.applicant?.status}" but must be "Hired"`);
        return;
      }

      console.log("🔄 Applying template to applicant:", {
        applicantId: selectedApplicantForTask.id,
        templateId: templateId
      });

      const response = await generateTasksFromTemplate(selectedApplicantForTask.id, templateId);
      console.log("✅ Template applied successfully:", response.data);

      await fetchNewHires();
      setApplyTemplateModalOpen(false);
      setSelectedApplicantForTask(null);
      alert("Template applied successfully!");
      
    } catch (err) {
      console.error("❌ Error applying template:", err);
      alert("Failed to apply template. Please try again.");
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
            onApplyTemplate={() => handleApplyTemplate(hire)}
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
          onApplyTemplate={() => handleApplyTemplate(selectedHire)}
        />
      )}

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

      {isApplyTemplateModalOpen && selectedApplicantForTask && (
        <ApplyTemplateModal
          isOpen={isApplyTemplateModalOpen}
          onClose={() => {
            setApplyTemplateModalOpen(false);
            setSelectedApplicantForTask(null);
          }}
          onSubmit={handleApplyTemplateToApplicant}
          applicant={selectedApplicantForTask}
          templates={templates}
        />
      )}
    </div>
  );
};

const NewHireCard = ({ hire, onSelect, onAddTask, onApplyTemplate }) => {
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
      <div className="mt-4 flex flex-col gap-2">
        {/* Updated View Tasks button with task count */}
        <button
          onClick={onSelect}
          className="w-full py-2 px-4 bg-brand-blue text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
        >
          <span>View Tasks</span>
          {hire.totalTasks > 0 && (
            <span className="bg-white text-brand-blue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {hire.completedTasks}/{hire.totalTasks}
            </span>
          )}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onAddTask}
            className="flex-1 py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <HiPlus className="mr-1" /> Add Task
          </button>
          <button
            onClick={onApplyTemplate}
            className="flex-1 py-2 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <HiTemplate className="mr-1" />Add Template
          </button>
        </div>
      </div>
    </div>
  );
};

// FIXED Template Manager Component
const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [validRoles, setValidRoles] = useState(["hr", "manager", "it_support", "new_hire", "finance"]);
  const [expandedTemplates, setExpandedTemplates] = useState({});

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

  const toggleTemplateTasks = (templateId) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      const payload = {
        ...templateData,
        organization_id: organizationId,
      };
      
      const response = await createOnboardingTemplate(payload);
      
      await fetchTemplates();
      setTemplateModalOpen(false);
      alert('Template created successfully!');
    } catch (err) {
      console.error("❌ Error creating template:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert("Failed to create template. Please try again.");
      }
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

  const discoverValidRoles = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first");
      return;
    }

    const roleOptions = [
      "hr", "HR", "Hr", "human_resources", "Human Resources", "human resources",
      "manager", "Manager", "MANAGER", "supervisor", "Supervisor",
      "it", "IT", "it_support", "IT Support", "it support",
      "finance", "Finance", "FINANCE", "accounting", "Accounting",
      "admin", "Admin", "ADMIN", "administrator", "Administrator",
      "new_hire", "New Hire", "new hire", "employee", "Employee",
      "recruiter", "Recruiter", "recruitment", "Recruitment"
    ];

    const discoveredRoles = [];

    for (const role of roleOptions) {
      const payload = {
        onboarding_template_id: selectedTemplate.id,
        task_name: "Test Role Discovery",
        description: "Testing role: " + role,
        default_due_days: 1,
        default_assigned_role: role,
        sequence: 1,
        is_required: true,
        organization_id: organizationId
      };

      try {
        const response = await createOnboardingTemplateTask(payload);
        console.log(`✅ Valid role found: "${role}"`);
        discoveredRoles.push(role);
        
      } catch (err) {
        console.log(`❌ Invalid role: "${role}",`, err);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (discoveredRoles.length > 0) {
      setValidRoles(discoveredRoles);
      alert(`Found ${discoveredRoles.length} valid roles: ${discoveredRoles.join(', ')}`);
      return discoveredRoles;
    } else {
      alert("No valid roles discovered. Using default lowercase roles.");
      return null;
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log("🔄 Creating template task...");
      
      const role = taskData.default_assigned_role.toLowerCase();
      
      const payload = {
        onboarding_template_id: parseInt(selectedTemplate.id),
        task_name: taskData.task_name,
        description: taskData.description || "",
        default_due_days: parseInt(taskData.default_due_days) || 1,
        default_assigned_role: role,
        sequence: parseInt(taskData.sequence) || 1,
        is_required: taskData.is_required !== false,
        organization_id: organizationId
      };

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

      const response = await createOnboardingTemplateTask(payload);
      console.log("✅ Task created successfully:", response.data);

      await fetchTemplates();
      setTaskModalOpen(false);
      setSelectedTemplate(null);
      
      alert('Task added to template successfully!');
      
    } catch (err) {
      console.error("❌ Error creating task:", err);
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Validation failed:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
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
          <div className="flex gap-2">
            {selectedTemplate && (
              <button
                onClick={discoverValidRoles}
                className="flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
                title="Discover valid roles"
              >
                Discover Roles
              </button>
            )}
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition"
            >
              <HiPlus /> Create Template
            </button>
          </div>
        </div>

        {templates.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {template.name}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {template.tasks.length} tasks
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* View Tasks button */}
                    <button
                      onClick={() => toggleTemplateTasks(template.id)}
                      className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-full"
                      title="View Tasks"
                    >
                      <HiOutlineEye />
                    </button>
                    
                    {/* Add Task button */}
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTaskModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:bg-green-100 hover:text-green-600 rounded-full"
                      title="Add Task"
                    >
                      <HiPlus />
                    </button>
                    
                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTaskModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      title="Edit Template"
                    >
                      <HiPencil />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                      title="Delete Template"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
                
                {/* Expandable tasks section */}
                {expandedTemplates[template.id] && template.tasks.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Template Tasks:</h4>
                    <ul className="space-y-2">
                      {template.tasks.map((task, index) => (
                        <li key={task.id || index} className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{task.task_name}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {task.default_assigned_role}
                            </span>
                          </div>
                          {task.description && (
                            <p className="mt-1 text-gray-500">{task.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs">
                            <span>Due: {task.default_due_days} days</span>
                            <span>Sequence: {task.sequence}</span>
                            <span>Required: {task.is_required ? 'Yes' : 'No'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {expandedTemplates[template.id] && template.tasks.length === 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-500 italic">No tasks in this template yet.</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No templates found. Create your first template to get started.
          </div>
        )}
      </div>

      {isTemplateModalOpen && (
        <TemplateFormModal
          isOpen={isTemplateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          onSubmit={handleCreateTemplate}
        />
      )}

      {isTaskModalOpen && selectedTemplate && (
        <TaskManagementModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSubmit={handleCreateTask}
          validRoles={validRoles}
        />
      )}
    </div>
  );
};

// Task Management Modal
const TaskManagementModal = ({ isOpen, onClose, template, onSubmit, validRoles }) => {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    default_due_days: 1,
    default_assigned_role: "hr",
    sequence: 1,
    is_required: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === "default_due_days" || name === "sequence") {
      processedValue = parseInt(value) || 0;
    }
    
    if (name === "is_required") {
      processedValue = value === "true" || value === true;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Add Task to {template.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Template ID: {template.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Tip:</strong> Use lowercase roles (e.g., "hr", "manager", "it_support")
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
                Due In (Days) *
              </label>
              <input
                type="number"
                name="default_due_days"
                value={formData.default_due_days}
                onChange={handleChange}
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence *
              </label>
              <input
                type="number"
                name="sequence"
                value={formData.sequence}
                onChange={handleChange}
                min="1"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Role *
              </label>
              <select
                name="default_assigned_role"
                value={formData.default_assigned_role}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              >
                {validRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Try: hr, manager, it_support, finance, new_hire
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required? *
              </label>
              <select
                name="is_required"
                value={formData.is_required}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
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
        await updateOnboardingTask(taskId, { status: "pending" });
      }

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
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Tasks: {hire.completedTasks || 0}/{hire.totalTasks || 0}
                      </span>
                    </div>
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
                    <div key={task.id} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        disabled={isLoading}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.status === "completed" ? (
                          <HiCheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </button>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${
                            task.status === "completed"
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}>
                            {task.task_name}
                          </span>
                          {task.status === "completed" ? (
                            <HiCheck className="h-4 w-4 text-green-500" />
                          ) : task.days_left !== null && task.days_left < 3 && task.days_left >= 0 ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {task.days_left === 0 ? 'Today' : `${task.days_left}d left`}
                            </span>
                          ) : null}
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2">
                          {task.due_date && task.status !== "completed" && (
                            <div className="flex items-center text-xs text-gray-500">
                              <HiOutlineClock className="h-3 w-3 mr-1" />
                              <span>
                                {task.days_left !== null ? (
                                  task.days_left < 0 ? (
                                    <span className="text-red-600">Overdue by {-task.days_left} days</span>
                                  ) : task.days_left === 0 ? (
                                    <span className="text-orange-600">Due today</span>
                                  ) : (
                                    <span>{task.days_left} days left</span>
                                  )
                                ) : (
                                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                )}
                              </span>
                            </div>
                          )}
                          
                          {task.status === "completed" && task.completed_at && (
                            <div className="text-xs text-green-600">
                              Completed on {new Date(task.completed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
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

const ApplyTemplateModal = ({ isOpen, onClose, onSubmit, applicant, templates }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }
    onSubmit(selectedTemplateId);
  };

  const handleChange = (e) => {
    setSelectedTemplateId(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Apply Template to {applicant.applicant.first_name}{" "}
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
              Select Template *
            </label>
            <select
              name="template_id"
              value={selectedTemplateId}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.tasks.length} tasks)
                </option>
              ))}
            </select>
          </div>

          {selectedTemplateId && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Selected Template:</strong>{" "}
                {templates.find(t => t.id == selectedTemplateId)?.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This will create {templates.find(t => t.id == selectedTemplateId)?.tasks.length} tasks for the applicant.
              </p>
            </div>
          )}

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
              className="py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
            >
              <HiTemplate className="inline mr-1" /> Apply Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
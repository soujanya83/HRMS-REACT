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
  HiOutlineEye,
  HiOutlineExclamationCircle,
  HiUserRemove,
  HiDocumentText,
  HiCalendar,
  HiArrowRight,
  HiArrowLeft,
} from "react-icons/hi";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employeeService";
import {
  getEmployeeExits,
  createEmployeeExit,
  deleteEmployeeExit,
  getOffboardingTasks,
  createOffboardingTask,
  updateOffboardingTask,
  deleteOffboardingTask,
  completeOffboardingTask,
  getOffboardingTemplates,
  getTemplateTasksByTemplate,
  createOffboardingTemplate,
  deleteOffboardingTemplate,
  createOffboardingTemplateTask,
  deleteOffboardingTemplateTask,
} from "../../services/exitOffboardingService";

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

// Main Page Component
const OffboardingPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Offboarding
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage employee exit processes and track offboarding progress.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Offboarding Dashboard
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Offboarding Templates
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {/* Exit Reports */}
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "dashboard" && <OffboardingDashboard />}
          {activeTab === "templates" && <OffboardingTemplateManager />}
          {activeTab === "reports" && <ExitReports />}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const OffboardingDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [exits, setExits] = useState([]);
  const [selectedExit, setSelectedExit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isApplyTemplateModalOpen, setApplyTemplateModalOpen] = useState(false);
  const [isInitiateExitModalOpen, setInitiateExitModalOpen] = useState(false);
  const [selectedEmployeeForExit, setSelectedEmployeeForExit] = useState(null);
  const [selectedExitForTask, setSelectedExitForTask] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templateError, setTemplateError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const fetchEmployees = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        organization_id: organizationId,
        search: searchTerm,
      };

      const employeesRes = await getEmployees(params);
      const employeesData = employeesRes.data?.data || [];

      // Filter only active employees (not terminated)
      const activeEmployees = employeesData.filter(
        (emp) => emp.status?.toLowerCase() !== "terminated"
      );

      setEmployees(activeEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, searchTerm]);

  const fetchExits = useCallback(async () => {
    if (!organizationId) return;

    try {
      const exitsRes = await getEmployeeExits({
        organization_id: organizationId,
      });
      const exitsData = exitsRes.data?.data || [];

      const exitsWithTasks = await Promise.all(
        exitsData.map(async (exit) => {
          try {
            const tasksRes = await getOffboardingTasks({
              employee_exit_id: exit.id,
            });
            const tasks = tasksRes.data?.data || [];

            // Normalize all task statuses to lowercase for consistent comparison
            const tasksWithDaysLeft = tasks.map((task) => ({
              id: task.id,
              task_name: task.task_name,
              description: task.description,
              due_date: task.due_date,
              status: task.status?.toLowerCase() || "pending",
              completed_at: task.completed_at,
              days_left: calculateDaysLeft(task.due_date),
              assigned_to: task.assigned_to,
            }));

            // Count completed tasks
            const CompletedTasks = tasksWithDaysLeft.filter(
              (t) => t.status === "completed"
            ).length;

            return {
              ...exit,
              employee: exit.employee || {},
              tasks: tasksWithDaysLeft,
              CompletedTasks: CompletedTasks,
              totalTasks: tasksWithDaysLeft.length,
              progress:
                tasksWithDaysLeft.length > 0
                  ? Math.round(
                      (CompletedTasks / tasksWithDaysLeft.length) * 100
                    )
                  : 0,
            };
          } catch (error) {
            console.error(`Error fetching tasks for exit ${exit.id}:`, error);
            return {
              ...exit,
              employee: exit.employee || {},
              tasks: [],
              CompletedTasks: 0,
              totalTasks: 0,
              progress: 0,
            };
          }
        })
      );

      setExits(exitsWithTasks);
    } catch (err) {
      console.error("Error fetching exits:", err);
      setExits([]);
    }
  }, [organizationId]);

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) return;

    try {
      const templatesRes = await getOffboardingTemplates({
        organization_id: organizationId,
      });
      const templatesData = templatesRes.data?.data || [];

      const templatesWithTasks = await Promise.all(
        templatesData.map(async (template) => {
          try {
            const tasksRes = await getTemplateTasksByTemplate(template.id);
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
      setTemplateError(null);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplateError("Failed to load templates. They may not be available.");
    }
  }, [organizationId]);

  useEffect(() => {
    fetchEmployees();
    fetchExits();
    fetchTemplates();
  }, [fetchEmployees, fetchExits, fetchTemplates]);

  const handleInitiateExit = (employee) => {
    setSelectedEmployeeForExit(employee);
    setInitiateExitModalOpen(true);
  };

  const handleSubmitExit = async (exitData) => {
    try {
      // 1. Create employee exit record
      const exitResponse = await createEmployeeExit({
        employee_id: exitData.employee_id,
        resignation_date: exitData.resignation_date,
        last_working_day: exitData.last_working_day,
        reason_for_leaving: exitData.reason_for_leaving,
        exit_interview_feedback: exitData.exit_interview_feedback,
        is_eligible_for_rehire: exitData.is_eligible_for_rehire,
      });

      const exitId = exitResponse.data.data.id;

      // 2. Update employee status to Terminated
      await updateEmployeeStatus(exitData.employee_id, "Terminated");

      // 3. Create tasks from template if selected
      if (
        exitData.selected_template &&
        exitData.template_tasks &&
        exitData.template_tasks.length > 0
      ) {
        const taskPromises = exitData.template_tasks.map((templateTask) => {
          // Calculate due date relative to last working day
          const dueDate = new Date(exitData.last_working_day);
          dueDate.setDate(
            dueDate.getDate() - (templateTask.due_before_days || 0)
          );

          return createOffboardingTask({
            employee_exit_id: exitId,
            task_name: templateTask.task_name,
            description: templateTask.description || "",
            due_date: dueDate.toISOString().split("T")[0],
            status: "pending",
            assigned_to: exitData.handover_to || null,
          });
        });

        await Promise.all(taskPromises);
      }

      alert("Exit process initiated successfully!");
      setInitiateExitModalOpen(false);
      setSelectedEmployeeForExit(null);

      // Refresh data
      fetchEmployees();
      fetchExits();
    } catch (error) {
      console.error("Failed to initiate exit:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to initiate exit process";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleAddTask = (exit) => {
    setSelectedExitForTask(exit);
    setAddTaskModalOpen(true);
  };

  const handleApplyTemplate = (exit) => {
    setSelectedExitForTask(exit);
    setApplyTemplateModalOpen(true);
  };

  const handleCreateNewTask = async (taskData) => {
    try {
      if (!selectedExitForTask) {
        alert("No exit selected");
        return;
      }

      const formattedDueDate = taskData.due_date
        ? new Date(taskData.due_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const payload = {
        employee_exit_id: parseInt(selectedExitForTask.id),
        task_name: taskData.task_name,
        description: taskData.description || "",
        due_date: formattedDueDate,
        status: "pending",
        assigned_to: taskData.assigned_to || null,
      };

      await createOffboardingTask(payload);
      await fetchExits();
      setAddTaskModalOpen(false);
      setSelectedExitForTask(null);
      alert("Task added successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleApplyTemplateToExit = async (templateId) => {
    try {
      if (!selectedExitForTask) {
        alert("No exit selected");
        return;
      }

      const selectedTemplate = templates.find((t) => t.id == templateId);
      if (!selectedTemplate) {
        alert("Template not found");
        return;
      }

      const templateTasks = selectedTemplate.tasks || [];

      if (templateTasks.length === 0) {
        alert("Selected template has no tasks");
        return;
      }

      // Create tasks from template
      const taskPromises = templateTasks.map((templateTask) => {
        // Calculate due date relative to last working day
        const dueDate = new Date(selectedExitForTask.last_working_day);
        dueDate.setDate(
          dueDate.getDate() - (templateTask.due_before_days || 0)
        );

        return createOffboardingTask({
          employee_exit_id: parseInt(selectedExitForTask.id),
          task_name: templateTask.task_name,
          description: templateTask.description || "",
          due_date: dueDate.toISOString().split("T")[0],
          status: "pending",
          assigned_to: templateTask.default_assigned_to || null,
        });
      });

      await Promise.all(taskPromises);
      await fetchExits();
      setApplyTemplateModalOpen(false);
      setSelectedExitForTask(null);

      alert(
        `Successfully applied template with ${templateTasks.length} tasks!`
      );
    } catch (err) {
      console.error("Error applying template:", err);
      alert("Failed to apply template. Please try again.");
    }
  };

  const handleDeleteExit = async (exit) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this exit record? The employee status will be reverted to Active."
      )
    )
      return;

    try {
      await deleteEmployeeExit(exit.id);

      // Update employee status back to Active
      if (exit.employee_id) {
        await updateEmployeeStatus(exit.employee_id, "Active");
      }

      alert("Exit record deleted successfully!");
      fetchEmployees();
      fetchExits();
    } catch (error) {
      console.error("Error deleting exit:", error);
      alert("Failed to delete exit record");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchEmployees}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiDocumentText className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees by name, employee code, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Employees
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {employees.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HiUserRemove className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Available for offboarding
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing Exits</p>
              <p className="text-2xl font-bold text-gray-800">{exits.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <HiOutlineClock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Currently processing</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-800">
                {exits.reduce(
                  (total, exit) =>
                    total +
                    exit.tasks.filter((t) => t.status !== "completed").length,
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <HiCheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Across all exits</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Employees Column */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Active Employees
            </h2>
            <span className="text-sm text-gray-500">
              {employees.length} employees
            </span>
          </div>

          {employees.length > 0 ? (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="font-semibold text-blue-600">
                        {employee.first_name?.[0]}
                        {employee.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee.employee_code} •{" "}
                        {employee.department?.name || "No Department"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInitiateExit(employee)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <HiUserRemove className="mr-1" /> Initiate Exit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No active employees found.</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm
                  ? "Try a different search term"
                  : "All employees are in exit process"}
              </p>
            </div>
          )}
        </div>

        {/* Active Exits Column */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Active Exits
            </h2>
            <span className="text-sm text-gray-500">{exits.length} exits</span>
          </div>

          {exits.length > 0 ? (
            <div className="space-y-4">
              {exits.map((exit) => (
                <div
                  key={exit.id}
                  className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-semibold text-gray-600">
                            {exit.employee?.first_name?.[0]}
                            {exit.employee?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {exit.employee?.first_name}{" "}
                            {exit.employee?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Exit Date:{" "}
                            {exit.last_working_day
                              ? new Date(
                                  exit.last_working_day
                                ).toLocaleDateString()
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          exit.is_eligible_for_rehire
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {exit.is_eligible_for_rehire
                          ? "Rehire Eligible"
                          : "Not Rehirable"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {exit.CompletedTasks}/{exit.totalTasks} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${exit.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setSelectedExit(exit)}
                        className="flex-1 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <HiOutlineEye className="mr-1" /> View Details
                      </button>
                      <button
                        onClick={() => handleAddTask(exit)}
                        className="flex-1 py-2 px-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <HiPlus className="mr-1" /> Add Task
                      </button>
                      <button
                        onClick={() => handleApplyTemplate(exit)}
                        className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <HiTemplate className="mr-1" /> Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No active exits found.</p>
              <p className="text-sm text-gray-400 mt-1">
                Initiate an exit process for an employee to see it here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isInitiateExitModalOpen && selectedEmployeeForExit && (
        <InitiateExitModal
          isOpen={isInitiateExitModalOpen}
          onClose={() => {
            setInitiateExitModalOpen(false);
            setSelectedEmployeeForExit(null);
          }}
          onSubmit={handleSubmitExit}
          employee={selectedEmployeeForExit}
          templates={templates}
        />
      )}

      {isAddTaskModalOpen && selectedExitForTask && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setAddTaskModalOpen(false);
            setSelectedExitForTask(null);
          }}
          onSubmit={handleCreateNewTask}
          exit={selectedExitForTask}
        />
      )}

      {isApplyTemplateModalOpen && selectedExitForTask && (
        <ApplyTemplateModal
          isOpen={isApplyTemplateModalOpen}
          onClose={() => {
            setApplyTemplateModalOpen(false);
            setSelectedExitForTask(null);
          }}
          onSubmit={handleApplyTemplateToExit}
          exit={selectedExitForTask}
          templates={templates}
          templateError={templateError}
        />
      )}

      {selectedExit && (
        <ExitDetailModal
          exit={selectedExit}
          isOpen={!!selectedExit}
          onClose={() => setSelectedExit(null)}
          onTaskUpdate={fetchExits}
          onDeleteExit={handleDeleteExit}
        />
      )}
    </>
  );
};

// Exit Detail Modal Component
const ExitDetailModal = ({
  exit,
  isOpen,
  onClose,
  onTaskUpdate,
  onDeleteExit,
}) => {
  const [tasks, setTasks] = useState(exit.tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(null);

  useEffect(() => {
    setTasks(exit.tasks);
  }, [exit.tasks]);

  const handleToggleTask = async (taskId, currentStatus) => {
    const normalizedCurrentStatus = currentStatus?.toLowerCase() || "pending";
    const newStatus =
      normalizedCurrentStatus === "completed" ? "pending" : "completed";

    try {
      setIsCompletingTask(taskId);

      if (newStatus === "completed") {
        await completeOffboardingTask(taskId);
      } else {
        await updateOffboardingTask(taskId, { status: "pending" });
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
      setIsCompletingTask(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteOffboardingTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      onTaskUpdate();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Exit Process Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {exit.employee?.first_name} {exit.employee?.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <HiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Exit Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <HiDocumentText className="mr-2 text-red-500" />
              Exit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Employee</p>
                <p className="font-medium">
                  {exit.employee?.first_name} {exit.employee?.last_name}
                  {exit.employee?.employee_code &&
                    ` (${exit.employee.employee_code})`}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Resignation Date</p>
                <p className="font-medium">
                  {exit.resignation_date
                    ? new Date(exit.resignation_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Working Day</p>
                <p className="font-medium">
                  {exit.last_working_day
                    ? new Date(exit.last_working_day).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Reason for Leaving</p>
                <p className="font-medium">
                  {exit.reason_for_leaving || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Eligible for Rehire</p>
                <p className="font-medium">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      exit.is_eligible_for_rehire
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {exit.is_eligible_for_rehire ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              {exit.exit_interview_feedback && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Exit Interview Feedback
                  </p>
                  <p className="font-medium">{exit.exit_interview_feedback}</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Progress
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {tasks.length}
                    </p>
                  </div>
                  <HiDocumentText className="text-blue-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {tasks.filter((t) => t.status === "completed").length}
                    </p>
                  </div>
                  <HiCheckCircle className="text-green-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {tasks.filter((t) => t.status !== "completed").length}
                    </p>
                  </div>
                  <HiOutlineClock className="text-yellow-500 text-xl" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        tasks.filter((t) => {
                          if (t.status === "completed" || !t.due_date)
                            return false;
                          const daysLeft = calculateDaysLeft(t.due_date);
                          return daysLeft !== null && daysLeft < 0;
                        }).length
                      }
                    </p>
                  </div>
                  <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <HiCheckCircle className="mr-2 text-blue-500" />
                Offboarding Tasks ({tasks.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading tasks...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id, task.status)}
                      disabled={isCompletingTask === task.id}
                      className="mt-1 flex-shrink-0 focus:outline-none"
                      aria-label={
                        task.status === "completed"
                          ? "Mark task as pending"
                          : "Mark task as completed"
                      }
                    >
                      {task.status === "completed" ? (
                        <HiCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div
                          className={`h-5 w-5 border-2 ${
                            isCompletingTask === task.id
                              ? "border-gray-400"
                              : "border-gray-300"
                          } rounded-full`}
                        />
                      )}
                    </button>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-medium ${
                            task.status === "completed"
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {task.task_name}
                          {isCompletingTask === task.id && (
                            <span className="ml-2 text-xs text-gray-500">
                              Updating...
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.status === "completed" ? (
                            <div className="flex items-center">
                              <HiCheck className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-xs text-green-600">
                                Completed
                              </span>
                            </div>
                          ) : task.days_left !== null &&
                            task.days_left < 3 &&
                            task.days_left >= 0 ? (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                task.days_left === 0
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {task.days_left === 0
                                ? "Today"
                                : `${task.days_left}d left`}
                            </span>
                          ) : null}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete task"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
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
                                  <span className="text-red-600">
                                    Overdue by {-task.days_left} days
                                  </span>
                                ) : task.days_left === 0 ? (
                                  <span className="text-orange-600">
                                    Due today
                                  </span>
                                ) : (
                                  <span>{task.days_left} days left</span>
                                )
                              ) : (
                                <span>
                                  Due:{" "}
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {task.status === "completed" && task.completed_at && (
                          <div className="text-xs text-green-600">
                            Completed on{" "}
                            {new Date(task.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <HiOutlineExclamationCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add tasks to track the offboarding process
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => onDeleteExit(exit)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Exit Record
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Manager Component
const OffboardingTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [validRoles] = useState([
    "hr",
    "manager",
    "it_support",
    "finance",
    "employee",
  ]);
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
      const templatesRes = await getOffboardingTemplates({
        organization_id: organizationId,
      });
      const templatesData = templatesRes.data?.data || [];

      const templatesWithTasks = await Promise.all(
        templatesData.map(async (template) => {
          try {
            const tasksRes = await getTemplateTasksByTemplate(template.id);
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
    setExpandedTemplates((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      const payload = {
        ...templateData,
        organization_id: parseInt(organizationId),
      };

      await createOffboardingTemplate(payload);
      await fetchTemplates();
      setTemplateModalOpen(false);
      alert("Template created successfully!");
    } catch (err) {
      console.error("Error creating template:", err);

      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to create template. Please try again.");
      }
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    try {
      await deleteOffboardingTemplate(templateId);
      await fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Failed to delete template. Please try again.");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (!selectedTemplate) {
        alert("No template selected");
        return;
      }

      const role = taskData.default_assigned_role.toLowerCase();

      const payload = {
        offboarding_template_id: parseInt(selectedTemplate.id),
        task_name: taskData.task_name,
        description: taskData.description || "",
        due_before_days: parseInt(taskData.due_before_days) || 1,
        default_assigned_role: role,
      };

      await createOffboardingTemplateTask(payload);
      await fetchTemplates();
      setTaskModalOpen(false);
      setSelectedTemplate(null);

      alert("Task added to template successfully!");
    } catch (err) {
      console.error("Error creating task:", err);

      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to create task. Please try again.");
      }
    }
  };

  const handleDeleteTask = async (templateId, taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteOffboardingTemplateTask(taskId);
      await fetchTemplates();
      alert("Task deleted successfully!");
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchTemplates}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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
          <h2 className="text-xl font-semibold">Offboarding Templates</h2>
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors"
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
                    <button
                      onClick={() => toggleTemplateTasks(template.id)}
                      className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"
                      title="View Tasks"
                      aria-label="View template tasks"
                    >
                      <HiOutlineEye />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTaskModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:bg-green-100 hover:text-green-600 rounded-full transition-colors"
                      title="Add Task"
                      aria-label="Add task to template"
                    >
                      <HiPlus />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                      title="Delete Template"
                      aria-label="Delete template"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>

                {expandedTemplates[template.id] &&
                  template.tasks.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Template Tasks:
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTaskModalOpen(true);
                          }}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <HiPlus className="h-3 w-3" /> Add Task
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {template.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="text-sm text-gray-600 bg-gray-50 p-3 rounded"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {task.task_name}
                              </span>
                              <div className="flex gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {task.default_assigned_role}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteTask(template.id, task.id)
                                  }
                                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="mt-1 text-gray-500">
                                {task.description}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs">
                              <span>
                                Due: {task.due_before_days} days before exit
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {expandedTemplates[template.id] &&
                  template.tasks.length === 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 italic">
                          No tasks in this template yet.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTaskModalOpen(true);
                          }}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <HiPlus className="h-3 w-3" /> Add First Task
                        </button>
                      </div>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HiOutlineExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="mb-4">
              No templates found. Create your first template to get started.
            </p>
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <HiPlus /> Create Template
            </button>
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
const TaskManagementModal = ({
  isOpen,
  onClose,
  template,
  onSubmit,
  validRoles,
}) => {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    due_before_days: 1,
    default_assigned_role: "hr",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "due_before_days") {
      processedValue = parseInt(value) || 0;
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
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> These tasks will be due BEFORE the
              employee's last working day
            </p>
          </div>

          <div>
            <label
              htmlFor="task_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Name *
            </label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Return Company Laptop"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Task description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="due_before_days"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Before Exit (Days) *
              </label>
              <input
                type="number"
                id="due_before_days"
                name="due_before_days"
                value={formData.due_before_days}
                onChange={handleChange}
                min="0"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label
                htmlFor="default_assigned_role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assigned Role *
              </label>
              <select
                id="default_assigned_role"
                name="default_assigned_role"
                value={formData.default_assigned_role}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                {validRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Initiate Exit Modal
const InitiateExitModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  templates,
}) => {
  const [formData, setFormData] = useState({
    resignation_date: new Date().toISOString().split("T")[0],
    last_working_day: "",
    reason_for_leaving: "",
    exit_interview_feedback: "",
    is_eligible_for_rehire: true,
    selected_template: "",
    handover_to: "",
  });
  const [selectedTemplateTasks, setSelectedTemplateTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee && isOpen) {
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      setFormData({
        employee_id: employee.id,
        resignation_date: today,
        last_working_day: nextWeek.toISOString().split("T")[0],
        reason_for_leaving: "",
        exit_interview_feedback: "",
        is_eligible_for_rehire: true,
        selected_template: "",
        handover_to: "",
      });
      setSelectedTemplateTasks([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!formData.resignation_date)
      validationErrors.resignation_date = "Resignation date is required";
    if (!formData.last_working_day)
      validationErrors.last_working_day = "Last working day is required";
    if (!formData.reason_for_leaving)
      validationErrors.reason_for_leaving = "Reason for leaving is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const exitData = {
        employee_id: employee.id,
        resignation_date: formData.resignation_date,
        last_working_day: formData.last_working_day,
        reason_for_leaving: formData.reason_for_leaving,
        exit_interview_feedback: formData.exit_interview_feedback,
        is_eligible_for_rehire: formData.is_eligible_for_rehire,
        selected_template: formData.selected_template,
        handover_to: formData.handover_to,
        template_tasks: selectedTemplateTasks,
      };

      await onSubmit(exitData);
    } catch (err) {
      console.error("Error in form submission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Initiate Exit Process for {employee.first_name} {employee.last_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Employee:</strong> {employee.first_name}{" "}
              {employee.last_name} ({employee.employee_code})
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Department:</strong>{" "}
              {employee.department?.name || "No Department"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="resignation_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Resignation Date *
              </label>
              <input
                type="date"
                id="resignation_date"
                name="resignation_date"
                value={formData.resignation_date}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 ${
                  errors.resignation_date ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="last_working_day"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Working Day *
              </label>
              <input
                type="date"
                id="last_working_day"
                name="last_working_day"
                value={formData.last_working_day}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 ${
                  errors.last_working_day ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="reason_for_leaving"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for Leaving *
              </label>
              <select
                id="reason_for_leaving"
                name="reason_for_leaving"
                value={formData.reason_for_leaving}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 ${
                  errors.reason_for_leaving
                    ? "border-red-500"
                    : "border-gray-300"
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
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="selected_template"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Offboarding Template (Optional)
              </label>
              <select
                id="selected_template"
                name="selected_template"
                value={formData.selected_template}
                onChange={handleChange}
                disabled={isSubmitting}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="">No Template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.tasks.length} tasks)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="exit_interview_feedback"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Exit Interview Feedback
              </label>
              <textarea
                id="exit_interview_feedback"
                name="exit_interview_feedback"
                value={formData.exit_interview_feedback}
                onChange={handleChange}
                rows="3"
                disabled={isSubmitting}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Enter feedback from exit interview..."
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="handover_to"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Handover To (Optional)
              </label>
              <input
                type="text"
                id="handover_to"
                name="handover_to"
                value={formData.handover_to}
                onChange={handleChange}
                disabled={isSubmitting}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Person or department to handover responsibilities to"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_eligible_for_rehire"
                  name="is_eligible_for_rehire"
                  checked={formData.is_eligible_for_rehire}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                />
                <label
                  htmlFor="is_eligible_for_rehire"
                  className="ml-2 text-sm text-gray-700"
                >
                  Employee is eligible for rehire
                </label>
              </div>
            </div>
          </div>

          {selectedTemplateTasks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Template Tasks ({selectedTemplateTasks.length})
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  {selectedTemplateTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="flex items-center p-3 bg-white rounded border"
                    >
                      <HiCheckCircle className="h-4 w-4 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {task.task_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.description}
                        </p>
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

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initiating...
                </>
              ) : (
                <>
                  <HiUserRemove className="mr-2" /> Initiate Exit Process
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Task Modal
const AddTaskModal = ({ isOpen, onClose, onSubmit, exit }) => {
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    due_date: "",
    assigned_to: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exit && isOpen) {
      // Set default due date to last working day
      const defaultDueDate = exit.last_working_day
        ? exit.last_working_day
        : new Date().toISOString().split("T")[0];
      setFormData({
        task_name: "",
        description: "",
        due_date: defaultDueDate,
        assigned_to: "",
      });
    }
  }, [exit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.task_name.trim()) {
      alert("Task name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error in form submission:", err);
    } finally {
      setIsSubmitting(false);
    }
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
            Add Task for {exit.employee?.first_name}'s Exit
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Employee:</strong> {exit.employee?.first_name}{" "}
              {exit.employee?.last_name}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Last Working Day:</strong>{" "}
              {exit.last_working_day
                ? new Date(exit.last_working_day).toLocaleDateString()
                : "Not set"}
            </p>
          </div>

          <div>
            <label
              htmlFor="task_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Name *
            </label>
            <input
              type="text"
              id="task_name"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Return Company Laptop"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Task details and instructions..."
            />
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="assigned_to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assigned To (Optional)
            </label>
            <input
              type="text"
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Person or department responsible"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Apply Template Modal
const ApplyTemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  exit,
  templates,
  templateError,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      alert("Please select a template");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedTemplateId);
    } catch (err) {
      console.error("Error in form submission:", err);
    } finally {
      setIsSubmitting(false);
    }
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
            Apply Template to {exit.employee?.first_name}'s Exit
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Employee:</strong> {exit.employee?.first_name}{" "}
              {exit.employee?.last_name}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Last Working Day:</strong>{" "}
              {exit.last_working_day
                ? new Date(exit.last_working_day).toLocaleDateString()
                : "Not set"}
            </p>
          </div>

          {templateError && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <HiOutlineExclamationCircle className="inline mr-1" />
                <strong>Note:</strong> {templateError}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="template-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Template *
            </label>
            <select
              id="template-select"
              name="template_id"
              value={selectedTemplateId}
              onChange={handleChange}
              required
              disabled={isSubmitting || templates.length === 0}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.tasks.length} tasks)
                </option>
              ))}
            </select>
            {templates.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No templates available. Please create a template first.
              </p>
            )}
          </div>

          {selectedTemplateId && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Selected Template:</strong>{" "}
                {templates.find((t) => t.id == selectedTemplateId)?.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This will create{" "}
                {
                  templates.find((t) => t.id == selectedTemplateId)?.tasks
                    .length
                }{" "}
                tasks for this exit process.
              </p>
              <div className="mt-2 p-2 bg-red-50 rounded">
                <p className="text-xs text-red-800">
                  <HiOutlineExclamationCircle className="inline mr-1" />
                  Tasks will be scheduled relative to the last working day.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !selectedTemplateId || templates.length === 0
              }
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </>
              ) : (
                <>
                  <HiTemplate className="mr-1" /> Apply Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Template Form Modal (reuse with red theme)
const TemplateFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Template name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error in form submission:", err);
    } finally {
      setIsSubmitting(false);
    }
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
            Create Offboarding Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> Templates help you quickly apply
              pre-defined offboarding task lists.
            </p>
          </div>

          <div>
            <label
              htmlFor="template-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Template Name *
            </label>
            <input
              type="text"
              id="template-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Standard Exit Checklist"
            />
          </div>
          <div>
            <label
              htmlFor="template-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="template-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Describe the purpose of this template..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exit Reports Component
const ExitReports = () => {
  const [exits, setExits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedOrganization } = useOrganizations();

  const fetchExits = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const exitsRes = await getEmployeeExits({
        organization_id: selectedOrganization.id,
      });
      setExits(exitsRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching exits:", err);
      setExits([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchExits();
  }, [fetchExits]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalExits: exits.length,
    eligibleForRehire: exits.filter((e) => e.is_eligible_for_rehire).length,
    notEligibleForRehire: exits.filter((e) => !e.is_eligible_for_rehire).length,
    completedThisMonth: exits.filter((e) => {
      const exitDate = new Date(e.created_at);
      const now = new Date();
      return (
        exitDate.getMonth() === now.getMonth() &&
        exitDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  // Group by reason
  const exitsByReason = exits.reduce((acc, exit) => {
    const reason = exit.reason_for_leaving || "Unknown";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exits</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalExits}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HiUserRemove className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Eligible for Rehire
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.eligibleForRehire}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not Rehirable</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.notEligibleForRehire}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <HiX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.completedThisMonth}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <HiCalendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exit Reasons Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Exit Reasons
          </h3>
          <div className="space-y-4">
            {Object.entries(exitsByReason).map(([reason, count]) => {
              const percentage = (count / stats.totalExits) * 100;
              return (
                <div key={reason} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{reason}</span>
                    <span className="text-gray-500">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Exits Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Exits
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
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
                    Rehire
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exits.slice(0, 5).map((exit) => (
                  <tr key={exit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {exit.employee?.first_name} {exit.employee?.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {exit.last_working_day
                        ? new Date(exit.last_working_day).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {exit.reason_for_leaving || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          exit.is_eligible_for_rehire
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {exit.is_eligible_for_rehire ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {exits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No exit records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffboardingPage;

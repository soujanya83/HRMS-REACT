import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaUndo,
  FaTrashAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaHistory,
  FaFileAlt,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaUser,
  FaArrowLeft,
  FaChartBar,
  FaRedoAlt,
  FaFileDownload,
} from "react-icons/fa";
import {
  HiOutlineArchive,
  HiOutlineUserGroup,
  HiOutlineDocumentReport,
} from "react-icons/hi";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getEmployees,
  getTrashedEmployees,
  deleteEmployee,
  restoreEmployee,
  forceDeleteEmployee,
  updateEmployeeStatus,
} from "../../services/employeeService";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "delete",
}) => {
  if (!isOpen) return null;

  const buttonColors = {
    delete: "bg-red-600 hover:bg-red-700",
    restore: "bg-green-600 hover:bg-green-700",
    archive: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full ${
              type === "delete"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {type === "delete" ? (
              <FaTrash className="h-6 w-6" />
            ) : (
              <FaUndo className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 pl-1">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-lg transition-colors font-medium ${buttonColors[type]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <FaUserCheck className="h-3 w-3" />,
    },
    Inactive: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <FaUserTimes className="h-3 w-3" />,
    },
    "On Leave": {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <HiOutlineArchive className="h-3 w-3" />,
    },
    Terminated: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <FaUserTimes className="h-3 w-3" />,
    },
    "On Probation": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <FaUser className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      {status}
    </span>
  );
};

// Quick Stats Card Component
const StatsCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      {trend && (
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

// Quick Action Button Component
const QuickActionButton = ({
  icon,
  label,
  onClick,
  color = "bg-blue-600 hover:bg-blue-700",
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-all transform hover:-translate-y-0.5 ${color} font-medium`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function EmployeeList() {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizations();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [view, setView] = useState("active");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    departments: {},
  });

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    type: "delete",
    employeeId: null,
    employeeName: "",
  });

  const quickActions = [
    {
      label: "Add Employee",
      icon: <FaPlus className="h-5 w-5" />,
      action: () => navigate("/dashboard/employees/new"),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Import",
      icon: <FaUpload className="h-5 w-5" />,
      action: () => alert("Import feature coming soon!"),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Export",
      icon: <FaFileDownload className="h-5 w-5" />,
      action: () => exportEmployeeList(),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Reports",
      icon: <FaChartBar className="h-5 w-5" />,
      action: () => navigate("/dashboard/employees/reports"),
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
  ];

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        organization_id: selectedOrganization.id,
        search: searchTerm,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        department_id:
          selectedDepartment !== "all" ? selectedDepartment : undefined,
      };

      const response =
        view === "active"
          ? await getEmployees(params)
          : await getTrashedEmployees(params);

      const employeesData = response.data?.data || [];
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);

      // Calculate statistics
      const activeCount = employeesData.filter(
        (emp) => emp.status === "Active"
      ).length;
      const inactiveCount = employeesData.filter(
        (emp) => emp.status === "Inactive"
      ).length;
      const onLeaveCount = employeesData.filter(
        (emp) => emp.status === "On Leave"
      ).length;

      // Calculate department distribution
      const departmentStats = {};
      employeesData.forEach((emp) => {
        const deptName = emp.department?.name || "No Department";
        departmentStats[deptName] = (departmentStats[deptName] || 0) + 1;
      });

      setStats({
        total: employeesData.length,
        active: activeCount,
        inactive: inactiveCount,
        onLeave: onLeaveCount,
        departments: departmentStats,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedOrganization,
    view,
    searchTerm,
    selectedStatus,
    selectedDepartment,
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filter employees based on search
  useEffect(() => {
    const filtered = employees.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.first_name?.toLowerCase().includes(searchLower) ||
        employee.last_name?.toLowerCase().includes(searchLower) ||
        employee.personal_email?.toLowerCase().includes(searchLower) ||
        employee.employee_code?.toLowerCase().includes(searchLower) ||
        employee.phone_number?.includes(searchTerm) ||
        employee.designation?.title?.toLowerCase().includes(searchLower) ||
        employee.department?.name?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Open modal for confirmation
  const openModal = (
    action,
    title,
    message,
    type = "delete",
    employeeId = null,
    employeeName = ""
  ) => {
    setModalState({
      isOpen: true,
      action,
      title,
      message,
      type,
      employeeId,
      employeeName,
    });
  };

  // Close modal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      action: null,
      title: "",
      message: "",
      type: "delete",
      employeeId: null,
      employeeName: "",
    });
  };

  // Handle modal confirmation
  const handleConfirm = async () => {
    if (modalState.action) {
      try {
        await modalState.action();
        fetchEmployees(); // Refresh list
        alert(
          `${
            modalState.type === "delete"
              ? "Employee deleted"
              : "Employee restored"
          } successfully!`
        );
      } catch (error) {
        console.error("Error performing action:", error);
        alert("Failed to perform action. Please try again.");
      }
    }
    closeModal();
  };

  // Handle delete employee
  const handleDelete = (employee) => {
    openModal(
      () => deleteEmployee(employee.id),
      "Move to Trash",
      `Are you sure you want to move "${employee.first_name} ${employee.last_name}" to trash? They will be moved to the trash section and can be restored later.`,
      "delete",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  // Handle restore employee
  const handleRestore = (employee) => {
    openModal(
      () => restoreEmployee(employee.id),
      "Restore Employee",
      `Are you sure you want to restore "${employee.first_name} ${employee.last_name}"? They will be moved back to the active employees list.`,
      "restore",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  // Handle permanent delete
  const handleForceDelete = (employee) => {
    openModal(
      () => forceDeleteEmployee(employee.id),
      "Permanently Delete",
      `WARNING: This will permanently delete "${employee.first_name} ${employee.last_name}" and all associated data. This action cannot be undone.`,
      "delete",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  // Handle status change
  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await updateEmployeeStatus(employeeId, newStatus);
      fetchEmployees();
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Export employee list
  const exportEmployeeList = () => {
    const csvContent = [
      [
        "Name",
        "Employee Code",
        "Email",
        "Phone",
        "Department",
        "Designation",
        "Status",
        "Joining Date",
      ],
      ...filteredEmployees.map((emp) => [
        `${emp.first_name} ${emp.last_name}`,
        emp.employee_code || "N/A",
        emp.personal_email || "N/A",
        emp.phone_number || "N/A",
        emp.department?.name || "N/A",
        emp.designation?.title || "N/A",
        emp.status || "N/A",
        emp.joining_date || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert("Export started! Check your downloads folder.");
  };

  // Get unique departments for filter
  const departments = [
    ...new Set(employees.map((emp) => emp.department?.name).filter(Boolean)),
  ];
  const statuses = [
    "Active",
    "Inactive",
    "On Leave",
    "Terminated",
    "On Probation",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your workforce, track employment details, and handle
              employee lifecycle.
              {selectedOrganization && (
                <span className="font-medium text-blue-600 ml-2">
                  {selectedOrganization.name}
                </span>
              )}
            </p>
          </div>
<div className="flex flex-wrap gap-3 mr-8 mt-10">
  <button
    onClick={() => navigate("/dashboard/employees/new")}
    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    <FaPlus className="h-4 w-4" /> Add New Employee
  </button>
</div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Employees"
            value={stats.total}
            icon={<FaUser className="h-6 w-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatsCard
            title="Active Employees"
            value={stats.active}
            icon={<FaUserCheck className="h-6 w-6 text-green-600" />}
            color="bg-green-50"
            trend={
              stats.total > 0
                ? Math.round((stats.active / stats.total) * 100)
                : 0
            }
          />
          <StatsCard
            title="On Leave"
            value={stats.onLeave}
            icon={<HiOutlineArchive className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatsCard
            title="Inactive"
            value={stats.inactive}
            icon={<FaUserTimes className="h-6 w-6 text-red-600" />}
            color="bg-red-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.action}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView("active")}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === "active"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Active Employees
              </button>
              <button
                onClick={() => setView("trashed")}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  view === "trashed"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaTrash className="h-3 w-3" />
                Trash ({employees.filter((e) => e.deleted_at).length})
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-grow min-w-[250px]">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[160px]"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading employees...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <FaUser className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {view === "trashed"
                        ? "No employees in trash"
                        : "No employees found"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ||
                      selectedStatus !== "all" ||
                      selectedDepartment !== "all"
                        ? "Try adjusting your search or filters"
                        : view === "trashed"
                        ? "Trash is empty"
                        : "Add your first employee to get started"}
                    </p>
                    {view === "active" && !searchTerm && (
                      <button
                        onClick={() => navigate("/dashboard/employees/new")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        <FaPlus className="inline mr-2" />
                        Add First Employee
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Employee Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {employee.first_name?.[0]}
                          {employee.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employee_code || "No Code"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-2 mb-1">
                        <FaEnvelope className="text-gray-400 h-4 w-4" />
                        {employee.personal_email || "No email"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FaPhone className="text-gray-400 h-4 w-4" />
                        {employee.phone_number || "No phone"}
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-2 mb-1">
                        <FaBriefcase className="text-gray-400 h-4 w-4" />
                        {employee.designation?.title || "No designation"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FaBuilding className="text-gray-400 h-4 w-4" />
                        {employee.department?.name || "No department"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={employee.status} />
                        {view === "active" &&
                          employee.status !== "Terminated" && (
                            <select
                              value={employee.status}
                              onChange={(e) =>
                                handleStatusChange(employee.id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="On Leave">On Leave</option>
                              <option value="On Probation">On Probation</option>
                            </select>
                          )}
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.joining_date
                          ? new Date(employee.joining_date).toLocaleDateString()
                          : "Not set"}
                      </div>
                      {employee.joining_date && (
                        <div className="text-xs text-gray-400">
                          {Math.floor(
                            (new Date() - new Date(employee.joining_date)) /
                              (1000 * 60 * 60 * 24 * 365)
                          )}{" "}
                          years
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {view === "active" ? (
                          <>
                            <Link
                              to={`/dashboard/employees/${employee.id}`}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/dashboard/employees/edit/${employee.id}`}
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/dashboard/employees/${employee.id}/documents`}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Documents"
                            >
                              <FaFileAlt className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(employee)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Move to Trash"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(employee)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restore"
                            >
                              <FaUndo className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleForceDelete(employee)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Permanently"
                            >
                              <FaTrashAlt className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredEmployees.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {filteredEmployees.length}
                </span>{" "}
                of <span className="font-semibold">{employees.length}</span>{" "}
                employees
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchEmployees}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <FaRedoAlt className="h-4 w-4" />
                  Refresh
                </button>
                <div className="text-sm text-gray-500">
                  Last updated:{" "}
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

      {/* Department Distribution Chart */}
      {Object.keys(stats.departments).length > 0 && view === "active" && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Department Distribution
            </h3>
            <span className="text-sm text-gray-500">
              {stats.total} total employees
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.departments).map(([dept, count]) => (
              <div
                key={dept}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 truncate">
                    {dept}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((count / stats.total) * 100)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

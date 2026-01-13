import React, { useState, useEffect } from "react";
import {
  FaKey,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSave,
  FaTimes,
  FaCopy,
  FaCheck,
  FaUsers,
  FaUserShield,
  FaShieldAlt,
  FaUserCog,
  FaUserTie,
  FaUserMd,
  FaChartBar,
  FaCog,
  FaMoneyBill,
  FaCalendar,
  FaFileAlt,
  FaHistory,
  FaBuilding,
  FaClipboardList,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegUser,
  FaRegBuilding,
  FaRegMoneyBillAlt,
  FaRegFileAlt,
  FaRegCalendarCheck,
  FaRegClipboard,
  FaLink,
  FaUnlink,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaUpload,
  FaSync,
} from "react-icons/fa";
// Add these to your imports in the PermissionManagementPage.jsx file:
import { FaInfoCircle, FaChevronRight } from "react-icons/fa";

// Permission Categories with Icons and Descriptions
const permissionCategories = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <FaChartBar className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600",
    description: "Dashboard access and reporting",
    permissions: [
      {
        id: "view_dashboard",
        name: "View Dashboard",
        description: "Access to main dashboard with analytics",
        category: "Dashboard",
        type: "read",
        default: true,
        roles: ["super_admin", "admin", "hr_manager", "department_head", "employee"],
      },
      {
        id: "export_reports",
        name: "Export Reports",
        description: "Export dashboard reports to PDF/Excel",
        category: "Dashboard",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "employees",
    name: "Employees",
    icon: <FaUsers className="h-5 w-5" />,
    color: "bg-green-100 text-green-600",
    description: "Employee management and records",
    permissions: [
      {
        id: "view_employees",
        name: "View Employees",
        description: "View employee list and profiles",
        category: "Employees",
        type: "read",
        default: true,
        roles: ["super_admin", "admin", "hr_manager", "department_head", "employee"],
      },
      {
        id: "add_employees",
        name: "Add Employees",
        description: "Create new employee records",
        category: "Employees",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "edit_employees",
        name: "Edit Employees",
        description: "Modify existing employee information",
        category: "Employees",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager", "department_head"],
      },
      {
        id: "delete_employees",
        name: "Delete Employees",
        description: "Remove employee records",
        category: "Employees",
        type: "delete",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "view_salaries",
        name: "View Salaries",
        description: "Access to salary information",
        category: "Employees",
        type: "read",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "manage_documents",
        name: "Manage Documents",
        description: "Upload and manage employee documents",
        category: "Employees",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: <FaUserTie className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-600",
    description: "Recruitment and hiring process",
    permissions: [
      {
        id: "view_jobs",
        name: "View Job Openings",
        description: "View available job positions",
        category: "Recruitment",
        type: "read",
        default: true,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "post_jobs",
        name: "Post Jobs",
        description: "Create new job postings",
        category: "Recruitment",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "review_applicants",
        name: "Review Applicants",
        description: "Review and process job applications",
        category: "Recruitment",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "schedule_interviews",
        name: "Schedule Interviews",
        description: "Schedule and manage interviews",
        category: "Recruitment",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "make_offers",
        name: "Make Offers",
        description: "Send job offers to candidates",
        category: "Recruitment",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: <FaCalendar className="h-5 w-5" />,
    color: "bg-yellow-100 text-yellow-600",
    description: "Attendance and leave management",
    permissions: [
      {
        id: "view_attendance",
        name: "View Attendance",
        description: "View attendance records",
        category: "Attendance",
        type: "read",
        default: true,
        roles: ["super_admin", "admin", "hr_manager", "department_head", "employee"],
      },
      {
        id: "mark_attendance",
        name: "Mark Attendance",
        description: "Record attendance for employees",
        category: "Attendance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "approve_leave",
        name: "Approve Leave",
        description: "Approve or reject leave requests",
        category: "Attendance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager", "department_head"],
      },
      {
        id: "manage_holidays",
        name: "Manage Holidays",
        description: "Add and manage holiday calendar",
        category: "Attendance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "view_reports",
        name: "View Reports",
        description: "Access attendance reports",
        category: "Attendance",
        type: "read",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "payroll",
    name: "Payroll",
    icon: <FaMoneyBill className="h-5 w-5" />,
    color: "bg-red-100 text-red-600",
    description: "Payroll processing and management",
    permissions: [
      {
        id: "process_payroll",
        name: "Process Payroll",
        description: "Run payroll calculations",
        category: "Payroll",
        type: "write",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "view_salary",
        name: "View Salary",
        description: "View salary information",
        category: "Payroll",
        type: "read",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "manage_deductions",
        name: "Manage Deductions",
        description: "Set up and manage deductions",
        category: "Payroll",
        type: "write",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "generate_payslips",
        name: "Generate Payslips",
        description: "Create and distribute payslips",
        category: "Payroll",
        type: "write",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "approve_bonus",
        name: "Approve Bonus",
        description: "Approve bonus payments",
        category: "Payroll",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "performance",
    name: "Performance",
    icon: <FaChartBar className="h-5 w-5" />,
    color: "bg-indigo-100 text-indigo-600",
    description: "Performance management and reviews",
    permissions: [
      {
        id: "set_goals",
        name: "Set Goals",
        description: "Set performance goals for employees",
        category: "Performance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager", "department_head"],
      },
      {
        id: "conduct_reviews",
        name: "Conduct Reviews",
        description: "Conduct performance reviews",
        category: "Performance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager", "department_head"],
      },
      {
        id: "view_performance",
        name: "View Performance",
        description: "View performance data",
        category: "Performance",
        type: "read",
        default: true,
        roles: ["super_admin", "admin", "hr_manager", "department_head", "employee"],
      },
      {
        id: "manage_appraisals",
        name: "Manage Appraisals",
        description: "Manage appraisal cycles",
        category: "Performance",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    icon: <FaCog className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-600",
    description: "System configuration and settings",
    permissions: [
      {
        id: "manage_roles",
        name: "Manage Roles",
        description: "Create and manage user roles",
        category: "Settings",
        type: "write",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "manage_permissions",
        name: "Manage Permissions",
        description: "Configure system permissions",
        category: "Settings",
        type: "write",
        default: false,
        roles: ["super_admin", "admin"],
      },
      {
        id: "configure_system",
        name: "Configure System",
        description: "Change system settings",
        category: "Settings",
        type: "write",
        default: false,
        roles: ["super_admin"],
      },
      {
        id: "view_audit_logs",
        name: "View Audit Logs",
        description: "Access system audit logs",
        category: "Settings",
        type: "read",
        default: false,
        roles: ["super_admin", "admin"],
      },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    icon: <FaFileAlt className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-600",
    description: "Reporting and analytics",
    permissions: [
      {
        id: "view_all_reports",
        name: "View All Reports",
        description: "Access all system reports",
        category: "Reports",
        type: "read",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "generate_reports",
        name: "Generate Reports",
        description: "Create custom reports",
        category: "Reports",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "export_data",
        name: "Export Data",
        description: "Export data to external formats",
        category: "Reports",
        type: "write",
        default: false,
        roles: ["super_admin", "admin", "hr_manager"],
      },
      {
        id: "view_analytics",
        name: "View Analytics",
        description: "Access advanced analytics",
        category: "Reports",
        type: "read",
        default: false,
        roles: ["super_admin", "admin"],
      },
    ],
  },
];

// Role mapping for display
const roleMapping = {
  super_admin: { name: "Super Admin", color: "bg-purple-100 text-purple-800" },
  admin: { name: "Administrator", color: "bg-blue-100 text-blue-800" },
  hr_manager: { name: "HR Manager", color: "bg-green-100 text-green-800" },
  department_head: { name: "Department Head", color: "bg-orange-100 text-orange-800" },
  employee: { name: "Employee", color: "bg-gray-100 text-gray-800" },
};

// Permission Type Badge
const PermissionTypeBadge = ({ type }) => {
  const typeConfig = {
    read: { color: "bg-blue-100 text-blue-800", icon: <FaEye className="h-3 w-3" /> },
    write: { color: "bg-green-100 text-green-800", icon: <FaEdit className="h-3 w-3" /> },
    delete: { color: "bg-red-100 text-red-800", icon: <FaTrash className="h-3 w-3" /> },
  };

  const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800", icon: <FaLock className="h-3 w-3" /> };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Permission Card Component
const PermissionCard = ({ permission, onEdit, onDelete, onClone }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${permissionCategory?.color || 'bg-gray-100'}`}>
            <FaLock className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{permission.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionTypeBadge type={permission.type} />
          {permission.default && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Assigned Roles</span>
          <span className="text-xs text-gray-500">
            {permission.roles.length} of {Object.keys(roleMapping).length} roles
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {permission.roles.map(roleId => {
            const role = roleMapping[roleId];
            if (!role) return null;
            return (
              <span key={roleId} className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                {role.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Category: <span className="font-medium text-gray-700">{permission.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(permission)}
            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
            title="Edit Permission"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onClone(permission)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
            title="Clone Permission"
          >
            <FaCopy className="h-4 w-4" />
          </button>
          {!permission.default && (
            <button
              onClick={() => onDelete(permission)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Permission"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Permission Form Modal
const PermissionFormModal = ({ isOpen, onClose, permission, categories, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "read",
    default: false,
    roles: [],
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        category: permission.category,
        type: permission.type,
        default: permission.default,
        roles: [...permission.roles],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: categories[0]?.id || "",
        type: "read",
        default: false,
        roles: [],
      });
    }
  }, [permission, categories, isOpen]);

  const handleRoleToggle = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  const handleSelectAllRoles = () => {
    const allRoles = Object.keys(roleMapping);
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.length === allRoles.length ? [] : allRoles,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaKey className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {permission ? `Edit ${permission.name}` : "Create New Permission"}
                </h2>
                <p className="text-sm text-gray-500">
                  Define permission details and role assignments
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., View Employees"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this permission allows"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="default"
                    checked={formData.default}
                    onChange={(e) => setFormData(prev => ({ ...prev, default: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="default" className="text-sm text-gray-700">
                    Set as default permission (automatically assigned to all roles)
                  </label>
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Role Assignment</h3>
                <button
                  type="button"
                  onClick={handleSelectAllRoles}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {formData.roles.length === Object.keys(roleMapping).length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(roleMapping).map(([roleId, role]) => (
                  <div
                    key={roleId}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.roles.includes(roleId)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleRoleToggle(roleId)}
                  >
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                      formData.roles.includes(roleId)
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {formData.roles.includes(roleId) ? (
                        <FaCheck className="h-3 w-3" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{role.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FaInfoCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-800">Permission Summary</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    This permission will be assigned to {formData.roles.length} roles
                    {formData.default && " and set as default for all new roles"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {permission ? "Update Permission" : "Create Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onClick, isExpanded }) => {
  const totalPermissions = category.permissions.length;
  const defaultPermissions = category.permissions.filter(p => p.default).length;

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md ${
        isExpanded ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {totalPermissions} permissions
          </span>
          <FaChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.permissions.map(permission => (
              <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{permission.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PermissionTypeBadge type={permission.type} />
                  {permission.default && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Permission Management Component
export default function PermissionManagementPage() {
  const [view, setView] = useState("categories"); // "categories" or "permissions"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [permissions, setPermissions] = useState(
    permissionCategories.flatMap(cat => cat.permissions.map(p => ({
      ...p,
      categoryId: cat.id,
      category: cat.name,
    })))
  );
  const [modalState, setModalState] = useState({
    form: false,
    confirm: false,
    permission: null,
    type: "delete",
  });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // Filter permissions based on search and category
  useEffect(() => {
    let filtered = [...permissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && view === "permissions") {
      filtered = filtered.filter(permission => permission.categoryId === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredPermissions(filtered);
  }, [searchTerm, selectedCategory, view, permissions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleOpenForm = (permission = null) => {
    setModalState(prev => ({ ...prev, form: true, permission }));
  };

  const handleCloseForm = () => {
    setModalState(prev => ({ ...prev, form: false, permission: null }));
  };

  const handleOpenConfirm = (permission, type = "delete") => {
    setModalState(prev => ({ ...prev, confirm: true, permission, type }));
  };

  const handleCloseConfirm = () => {
    setModalState(prev => ({ ...prev, confirm: false, permission: null, type: "delete" }));
  };

  const handleSavePermission = (formData) => {
    if (modalState.permission) {
      // Update existing permission
      setPermissions(prev => prev.map(p =>
        p.id === modalState.permission.id
          ? { ...p, ...formData, categoryId: formData.category }
          : p
      ));
    } else {
      // Create new permission
      const newPermission = {
        id: `perm_${Date.now()}`,
        ...formData,
        categoryId: formData.category,
        category: permissionCategories.find(c => c.id === formData.category)?.name || formData.category,
      };
      setPermissions(prev => [...prev, newPermission]);
    }
  };

  const handleDeletePermission = () => {
    if (modalState.permission) {
      setPermissions(prev => prev.filter(p => p.id !== modalState.permission.id));
      handleCloseConfirm();
    }
  };

  const handleClonePermission = (permission) => {
    const clonedPermission = {
      ...permission,
      id: `${permission.id}_clone_${Date.now()}`,
      name: `${permission.name} (Copy)`,
    };
    setPermissions(prev => [...prev, clonedPermission]);
    handleCloseConfirm();
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="h-3 w-3 text-gray-400" />;
    return sortConfig.direction === "asc" 
      ? <FaSortUp className="h-3 w-3 text-blue-600" />
      : <FaSortDown className="h-3 w-3 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Permission Management</h1>
            <p className="text-gray-600 mt-2">
              Manage system permissions, assign roles, and control access levels
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Create Permission
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              <FaDownload className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <FaKey className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">{permissions.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Permissions</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-50">
                <FaLock className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {permissions.filter(p => p.default).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Default Permissions</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {Object.keys(roleMapping).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-50">
                <FaShieldAlt className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {permissionCategories.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setView("categories");
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === "categories"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Categories View
              </button>
              <button
                onClick={() => {
                  setView("permissions");
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === "permissions"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Permissions View
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-grow min-w-[250px]">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    view === "categories" 
                      ? "Search categories..." 
                      : "Search permissions..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {view === "permissions" && (
                <div className="flex gap-2">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
                  >
                    <option value="">All Categories</option>
                    {permissionCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]">
                    <option value="all">All Types</option>
                    <option value="read">Read Only</option>
                    <option value="write">Write</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === "categories" ? (
            /* Categories View */
            <div className="space-y-6">
              {permissionCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => {
                    setView("permissions");
                    setSelectedCategory(category.id);
                  }}
                  isExpanded={selectedCategory === category.id && view === "permissions"}
                />
              ))}
            </div>
          ) : (
            /* Permissions View */
            <>
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Permission
                          {getSortIcon("name")}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center gap-1">
                          Category
                          {getSortIcon("category")}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {getSortIcon("type")}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPermissions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-4">
                            <FaKey className="h-12 w-12 mx-auto" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">No permissions found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm || selectedCategory ? "Try adjusting your search or filters" : "Create your first permission"}
                          </p>
                          {!searchTerm && !selectedCategory && (
                            <button
                              onClick={() => handleOpenForm()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                              <FaPlus className="inline mr-2" />
                              Create First Permission
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredPermissions.map(permission => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{permission.name}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {permissionCategories.find(c => c.id === permission.categoryId)?.icon}
                              <span className="text-sm text-gray-900">{permission.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <PermissionTypeBadge type={permission.type} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {permission.roles.slice(0, 3).map(roleId => {
                                const role = roleMapping[roleId];
                                if (!role) return null;
                                return (
                                  <span key={roleId} className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                                    {role.name}
                                  </span>
                                );
                              })}
                              {permission.roles.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{permission.roles.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {permission.default ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Default
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                Custom
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenForm(permission)}
                                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title="Edit"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleClonePermission(permission)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Clone"
                              >
                                <FaCopy className="h-4 w-4" />
                              </button>
                              {!permission.default && (
                                <button
                                  onClick={() => handleOpenConfirm(permission, "delete")}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {view === "permissions" && filteredPermissions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredPermissions.length}</span> of{" "}
                <span className="font-semibold">{permissions.length}</span> permissions
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  <FaSync className="h-4 w-4" />
                  Refresh
                </button>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PermissionFormModal
        isOpen={modalState.form}
        onClose={handleCloseForm}
        permission={modalState.permission}
        categories={permissionCategories}
        onSave={handleSavePermission}
      />

      {/* Confirmation Modal */}
      {modalState.confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                modalState.type === "delete" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}>
                {modalState.type === "delete" ? (
                  <FaTrash className="h-6 w-6" />
                ) : (
                  <FaCopy className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modalState.type === "delete" ? "Delete Permission" : "Clone Permission"}
                </h2>
                <p className="text-sm text-gray-500">
                  {modalState.type === "delete" 
                    ? "This action cannot be undone" 
                    : "Create a copy of this permission"}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 pl-1">
              {modalState.type === "delete"
                ? `Are you sure you want to delete "${modalState.permission?.name}"?`
                : `Create a copy of "${modalState.permission?.name}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseConfirm}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={modalState.type === "delete" ? handleDeletePermission : () => handleClonePermission(modalState.permission)}
                className={`px-5 py-2.5 text-white rounded-lg font-medium ${
                  modalState.type === "delete" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {modalState.type === "delete" ? "Delete" : "Clone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
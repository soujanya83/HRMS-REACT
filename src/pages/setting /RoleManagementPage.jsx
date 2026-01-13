import React, { useState, useEffect, useCallback } from "react";
import {
  FaUsers,
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCopy,
  FaEye,
  FaLock,
  FaUnlock,
  FaCheck,
  FaTimes,
  FaSave,
  FaArrowLeft,
  FaUserCheck,
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
  FaShieldAlt,
  FaKey,
  FaRegClock,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegUser,
  FaRegBuilding,
  FaRegMoneyBillAlt,
  FaRegFileAlt,
  FaRegCalendarCheck,
  FaRegClipboard,
} from "react-icons/fa";

// Permission Categories with Icons
const permissionCategories = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <FaChartBar className="h-4 w-4" />,
    permissions: ["view_dashboard", "export_reports"],
  },
  {
    id: "employees",
    name: "Employees",
    icon: <FaUsers className="h-4 w-4" />,
    permissions: [
      "view_employees",
      "add_employees",
      "edit_employees",
      "delete_employees",
      "view_salaries",
      "manage_documents",
    ],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: <FaUserTie className="h-4 w-4" />,
    permissions: [
      "view_jobs",
      "post_jobs",
      "review_applicants",
      "schedule_interviews",
      "make_offers",
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: <FaRegCalendarCheck className="h-4 w-4" />,
    permissions: [
      "view_attendance",
      "mark_attendance",
      "approve_leave",
      "manage_holidays",
      "view_reports",
    ],
  },
  {
    id: "payroll",
    name: "Payroll",
    icon: <FaMoneyBill className="h-4 w-4" />,
    permissions: [
      "process_payroll",
      "view_salary",
      "manage_deductions",
      "generate_payslips",
      "approve_bonus",
    ],
  },
  {
    id: "performance",
    name: "Performance",
    icon: <FaRegChartBar className="h-4 w-4" />,
    permissions: [
      "set_goals",
      "conduct_reviews",
      "view_performance",
      "manage_appraisals",
    ],
  },
  {
    id: "settings",
    name: "Settings",
    icon: <FaCog className="h-4 w-4" />,
    permissions: [
      "manage_roles",
      "manage_permissions",
      "configure_system",
      "view_audit_logs",
    ],
  },
  {
    id: "reports",
    name: "Reports",
    icon: <FaRegFileAlt className="h-4 w-4" />,
    permissions: [
      "view_all_reports",
      "generate_reports",
      "export_data",
      "view_analytics",
    ],
  },
];

// Predefined roles with icons
const predefinedRoles = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access with all permissions",
    icon: <FaUserShield className="h-5 w-5 text-purple-600" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    permissions: ["all"],
    userCount: 3,
    canEdit: false,
    canDelete: false,
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Full access except system configuration",
    icon: <FaUserCog className="h-5 w-5 text-blue-600" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    permissions: [
      "view_dashboard",
      "view_employees",
      "add_employees",
      "edit_employees",
      "delete_employees",
      "view_salaries",
      "manage_documents",
      "view_jobs",
      "post_jobs",
      "review_applicants",
      "schedule_interviews",
      "make_offers",
      "view_attendance",
      "mark_attendance",
      "approve_leave",
      "manage_holidays",
      "view_reports",
      "process_payroll",
      "view_salary",
      "manage_deductions",
      "generate_payslips",
      "approve_bonus",
      "set_goals",
      "conduct_reviews",
      "view_performance",
      "manage_appraisals",
      "view_all_reports",
      "generate_reports",
      "export_data",
      "view_analytics",
    ],
    userCount: 5,
    canEdit: true,
    canDelete: false,
  },
  {
    id: "hr_manager",
    name: "HR Manager",
    description: "Human resources management and employee records",
    icon: <FaUserTie className="h-5 w-5 text-green-600" />,
    color: "bg-green-100 text-green-800 border-green-200",
    permissions: [
      "view_dashboard",
      "view_employees",
      "add_employees",
      "edit_employees",
      "view_salaries",
      "manage_documents",
      "view_jobs",
      "post_jobs",
      "review_applicants",
      "schedule_interviews",
      "make_offers",
      "view_attendance",
      "approve_leave",
      "view_reports",
      "view_salary",
      "set_goals",
      "conduct_reviews",
      "view_performance",
      "manage_appraisals",
      "view_all_reports",
    ],
    userCount: 8,
    canEdit: true,
    canDelete: true,
  },
  {
    id: "department_head",
    name: "Department Head",
    description: "Department-specific employee management",
    icon: <FaBuilding className="h-5 w-5 text-orange-600" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    permissions: [
      "view_dashboard",
      "view_employees",
      "edit_employees",
      "view_attendance",
      "approve_leave",
      "view_reports",
      "view_salary",
      "set_goals",
      "conduct_reviews",
      "view_performance",
    ],
    userCount: 12,
    canEdit: true,
    canDelete: true,
  },
  {
    id: "employee",
    name: "Employee",
    description: "Basic employee access to personal information",
    icon: <FaRegUser className="h-5 w-5 text-gray-600" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    permissions: [
      "view_dashboard",
      "view_employees",
      "view_attendance",
      "view_salary",
      "view_performance",
    ],
    userCount: 150,
    canEdit: false,
    canDelete: false,
  },
];

// Role Card Component
const RoleCard = ({ role, onEdit, onDelete, onView, onClone }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${role.color.split(' ')[0]}`}>
            {role.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{role.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${role.color}`}>
            {role.userCount} users
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Permissions</span>
          <span className="text-xs text-gray-500">
            {role.permissions.length === permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0) || role.permissions[0] === 'all'
              ? 'All permissions'
              : `${role.permissions.length} permissions`}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {role.permissions[0] === 'all' ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Full Access
            </span>
          ) : (
            permissionCategories.slice(0, 3).map(cat => (
              <span 
                key={cat.id}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {cat.name}
              </span>
            ))
          )}
          {role.permissions.length > 3 && role.permissions[0] !== 'all' && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{role.permissions.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(role)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          {role.canEdit && (
            <button
              onClick={() => onEdit(role)}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
              title="Edit Role"
            >
              <FaEdit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onClone(role)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
            title="Duplicate Role"
          >
            <FaCopy className="h-4 w-4" />
          </button>
        </div>
        <div>
          {role.canDelete ? (
            <button
              onClick={() => onDelete(role)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Role"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-gray-400 px-2">System Role</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Role Form Modal
const RoleFormModal = ({ isOpen, onClose, role, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("dashboard");

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions[0] === 'all' 
          ? permissionCategories.flatMap(cat => cat.permissions)
          : [...role.permissions],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        permissions: [],
      });
    }
  }, [role, isOpen]);

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    const category = permissionCategories.find(cat => cat.id === categoryId);
    const allCategoryPermissionsSelected = category.permissions.every(p => 
      formData.permissions.includes(p)
    );

    setFormData(prev => ({
      ...prev,
      permissions: allCategoryPermissionsSelected
        ? prev.permissions.filter(p => !category.permissions.includes(p))
        : [...prev.permissions, ...category.permissions.filter(p => !prev.permissions.includes(p))],
    }));
  };

  const handleSelectAll = () => {
    const allPermissions = permissionCategories.flatMap(cat => cat.permissions);
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.length === allPermissions.length ? [] : allPermissions,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaUserShield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {role ? `Edit ${role.name}` : "Create New Role"}
                </h2>
                <p className="text-sm text-gray-500">
                  Define role permissions and access levels
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

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., HR Manager"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the role's purpose"
                  />
                </div>
              </div>
            </div>

            {/* Permission Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Permissions
                </h3>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {formData.permissions.length === permissionCategories.flatMap(cat => cat.permissions).length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex overflow-x-auto gap-1 mb-6 pb-2">
                {permissionCategories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Selected Category Permissions */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {permissionCategories.find(c => c.id === selectedCategory)?.icon}
                    <h4 className="font-semibold text-gray-800">
                      {permissionCategories.find(c => c.id === selectedCategory)?.name} Permissions
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(selectedCategory)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {permissionCategories.find(c => c.id === selectedCategory)?.permissions.every(p => 
                      formData.permissions.includes(p)
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissionCategories
                    .find(c => c.id === selectedCategory)
                    ?.permissions.map(permission => (
                      <div
                        key={permission}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.permissions.includes(permission)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePermissionToggle(permission)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                            formData.permissions.includes(permission)
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {formData.permissions.includes(permission) ? (
                              <FaCheck className="h-3 w-3" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-gray-300" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">
                              {permission.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Allows {permission.split('_').join(' ')} functionality
                            </p>
                          </div>
                        </div>
                        <FaLock className={`h-4 w-4 ${
                          formData.permissions.includes(permission)
                            ? "text-blue-600"
                            : "text-gray-300"
                        }`} />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Selected Permissions Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaCheck className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Permissions Summary</h4>
              </div>
              <p className="text-green-700 text-sm">
                {formData.permissions.length} permissions selected across {
                  new Set(
                    permissionCategories.filter(cat => 
                      cat.permissions.some(p => formData.permissions.includes(p))
                    ).map(cat => cat.name)
                  ).size
                } categories
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
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
                {role ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Details Modal
const RoleDetailsModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${role.color.split(' ')[0]}`}>
                {role.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{role.name}</h2>
                <p className="text-sm text-gray-500">{role.description}</p>
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

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Role Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Users</div>
              <div className="text-2xl font-bold text-gray-800">{role.userCount}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Permissions</div>
              <div className="text-2xl font-bold text-gray-800">
                {role.permissions[0] === 'all' 
                  ? 'All' 
                  : role.permissions.length}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-1">Categories</div>
              <div className="text-2xl font-bold text-gray-800">
                {new Set(
                  permissionCategories.filter(cat => 
                    role.permissions[0] === 'all' || 
                    cat.permissions.some(p => role.permissions.includes(p))
                  ).map(cat => cat.name)
                ).size}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium mb-1">Status</div>
              <div className="text-2xl font-bold text-gray-800">
                {role.canDelete ? 'Custom' : 'System'}
              </div>
            </div>
          </div>

          {/* Permissions by Category */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Permissions Breakdown
            </h3>
            <div className="space-y-4">
              {permissionCategories.map(category => {
                const categoryPermissions = role.permissions[0] === 'all'
                  ? category.permissions
                  : category.permissions.filter(p => role.permissions.includes(p));
                
                if (categoryPermissions.length === 0) return null;

                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          {categoryPermissions.length} of {category.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPermissions.map(permission => (
                        <div key={permission} className="flex items-center gap-2">
                          <FaCheck className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {permission.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
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
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "delete" }) => {
  if (!isOpen) return null;

  const buttonColors = {
    delete: "bg-red-600 hover:bg-red-700",
    clone: "bg-blue-600 hover:blue-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${
            type === "delete" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            {type === "delete" ? (
              <FaTrash className="h-6 w-6" />
            ) : (
              <FaCopy className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-lg font-medium ${buttonColors[type]}`}
          >
            {type === "delete" ? "Delete" : "Duplicate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Role Management Component
export default function RoleManagementPage() {
  const [roles, setRoles] = useState(predefinedRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState(roles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalState, setModalState] = useState({
    form: false,
    details: false,
    confirm: false,
    type: "delete",
    role: null,
  });

  // Filter roles based on search
  useEffect(() => {
    const filtered = roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  const handleOpenForm = (role = null) => {
    setSelectedRole(role);
    setModalState(prev => ({ ...prev, form: true }));
  };

  const handleCloseForm = () => {
    setSelectedRole(null);
    setModalState(prev => ({ ...prev, form: false }));
  };

  const handleOpenDetails = (role) => {
    setSelectedRole(role);
    setModalState(prev => ({ ...prev, details: true }));
  };

  const handleCloseDetails = () => {
    setSelectedRole(null);
    setModalState(prev => ({ ...prev, details: false }));
  };

  const handleOpenConfirm = (role, type = "delete") => {
    setSelectedRole(role);
    setModalState(prev => ({ ...prev, confirm: true, type }));
  };

  const handleCloseConfirm = () => {
    setSelectedRole(null);
    setModalState(prev => ({ ...prev, confirm: false, type: "delete" }));
  };

  const handleSaveRole = (formData) => {
    if (selectedRole) {
      // Update existing role
      setRoles(prev => prev.map(role =>
        role.id === selectedRole.id
          ? { ...role, ...formData, userCount: role.userCount }
          : role
      ));
    } else {
      // Create new role
      const newRole = {
        id: `custom_${Date.now()}`,
        ...formData,
        icon: <FaUserShield className="h-5 w-5 text-indigo-600" />,
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        userCount: 0,
        canEdit: true,
        canDelete: true,
      };
      setRoles(prev => [...prev, newRole]);
    }
  };

  const handleDeleteRole = () => {
    if (selectedRole) {
      setRoles(prev => prev.filter(role => role.id !== selectedRole.id));
      handleCloseConfirm();
    }
  };

  const handleCloneRole = (role) => {
    const clonedRole = {
      ...role,
      id: `${role.id}_clone_${Date.now()}`,
      name: `${role.name} (Copy)`,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      userCount: 0,
      canEdit: true,
      canDelete: true,
    };
    setRoles(prev => [...prev, clonedRole]);
    handleCloseConfirm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
            <p className="text-gray-600 mt-2">
              Manage user roles, permissions, and access levels across the system
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FaPlus className="h-4 w-4" /> Create New Role
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">{roles.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-50">
                <FaUserShield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {roles.filter(r => !r.canDelete).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">System Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50">
                <FaUserCog className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {roles.filter(r => r.canDelete).length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Custom Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-50">
                <FaUserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {roles.reduce((acc, role) => acc + role.userCount, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-grow min-w-[250px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]">
                <option value="all">All Types</option>
                <option value="system">System Roles</option>
                <option value="custom">Custom Roles</option>
              </select>
              <select className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]">
                <option value="all">Sort by: Name</option>
                <option value="users">Most Users</option>
                <option value="permissions">Most Permissions</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="p-6">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaUserShield className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No roles found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Try adjusting your search" : "Create your first role to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenForm()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <FaPlus className="inline mr-2" />
                  Create First Role
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => handleOpenForm(role)}
                  onDelete={() => handleOpenConfirm(role, "delete")}
                  onView={() => handleOpenDetails(role)}
                  onClone={() => handleOpenConfirm(role, "clone")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredRoles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredRoles.length}</span> of{" "}
                <span className="font-semibold">{roles.length}</span> roles
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={modalState.form}
        onClose={handleCloseForm}
        role={selectedRole}
        onSave={handleSaveRole}
      />

      <RoleDetailsModal
        isOpen={modalState.details}
        onClose={handleCloseDetails}
        role={selectedRole}
      />

      <ConfirmationModal
        isOpen={modalState.confirm}
        onClose={handleCloseConfirm}
        onConfirm={modalState.type === "delete" ? handleDeleteRole : () => handleCloneRole(selectedRole)}
        title={modalState.type === "delete" ? "Delete Role" : "Duplicate Role"}
        message={
          modalState.type === "delete"
            ? `Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`
            : `Create a copy of "${selectedRole?.name}"? You can modify the duplicate.`
        }
        type={modalState.type}
      />
    </div>
  );
}
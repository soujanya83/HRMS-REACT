import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSave,
  FaTimes,
  FaCopy,
  FaCheck,
  FaEye,
  FaLock,
  FaUnlock,
  FaUserCheck,
  FaUserCog,
  FaUserTie,
  FaChartBar,
  FaCog,
  FaMoneyBill,
  FaCalendar,
  FaFileAlt,
  FaBuilding,
  FaClipboardList,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChevronRight,
  FaLink,
  FaUnlink,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import roleService from "../../services/roleService";
import permissionService from "../../services/permissionService";
import { useOrganizations } from "../../contexts/OrganizationContext";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// Permission Categories
const permissionCategories = [
  {
    id: "employees",
    name: "Employees",
    icon: <FaUsers className="h-5 w-5" />,
    color: "bg-green-100 text-green-600",
    description: "Employee management and records",
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: <FaUserTie className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-600",
    description: "Recruitment and hiring process",
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: <FaCalendar className="h-5 w-5" />,
    color: "bg-yellow-100 text-yellow-600",
    description: "Attendance and leave management",
  },
  {
    id: "payroll",
    name: "Payroll",
    icon: <FaMoneyBill className="h-5 w-5" />,
    color: "bg-red-100 text-red-600",
    description: "Payroll processing and management",
  },
  {
    id: "timesheet",
    name: "Timesheet",
    icon: <FaFileAlt className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600",
    description: "Timesheet management",
  },
  {
    id: "roster",
    name: "Roster",
    icon: <FaClipboardList className="h-5 w-5" />,
    color: "bg-indigo-100 text-indigo-600",
    description: "Roster management",
  },
  {
    id: "performance",
    name: "Performance",
    icon: <FaChartBar className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-600",
    description: "Performance management",
  },
];

// Role Card Component
const RoleCard = ({ role, onEdit, onDelete, onView, onClone, loading, userCount }) => {
  const isSystemRole = role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('super');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50">
            <FaUserShield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{role.name}</h3>
            <p className="text-sm text-gray-500">Guard: {role.guard_name || 'web'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {userCount || 0} users
          </span>
          {isSystemRole && (
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              System
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600">
          Created: {new Date(role.created_at).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-600">
          Updated: {new Date(role.updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(role)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye className="h-4 w-4" />
          </button>
          {!isSystemRole && (
            <button
              onClick={() => onEdit(role)}
              disabled={loading}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Edit Role"
            >
              <FaEdit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onClone(role)}
            disabled={loading}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
            title="Duplicate Role"
          >
            <FaCopy className="h-4 w-4" />
          </button>
        </div>
        <div>
          {!isSystemRole ? (
            <button
              onClick={() => onDelete(role)}
              disabled={loading}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
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
const RoleFormModal = ({ isOpen, onClose, role, permissions, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
    permission_ids: [],
  });

  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("employees");

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        guard_name: role.guard_name || "web",
        permission_ids: role.permission_ids || [],
      });
    } else {
      setFormData({
        name: "",
        guard_name: "web",
        permission_ids: [],
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    const categoryPermissions = permissions.filter(p => 
      p.name.startsWith(`${categoryId}.`)
    ).map(p => p.id);

    const allCategoryPermissionsSelected = categoryPermissions.every(id => 
      formData.permission_ids.includes(id)
    );

    setFormData(prev => ({
      ...prev,
      permission_ids: allCategoryPermissionsSelected
        ? prev.permission_ids.filter(id => !categoryPermissions.includes(id))
        : [...prev.permission_ids, ...categoryPermissions.filter(id => !prev.permission_ids.includes(id))],
    }));
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.length === permissions.length 
        ? [] 
        : permissions.map(p => p.id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || "Failed to save role" });
      }
    }
  };

  if (!isOpen) return null;

  const getCategoryPermissions = (categoryId) => {
    return permissions.filter(p => p.name.startsWith(`${categoryId}.`));
  };

  const parsedCategory = permissionCategories.find(c => c.id === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., HR Manager"
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {formData.permission_ids.length === permissions.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto gap-1 mb-6 pb-2">
                  {permissionCategories.map(category => {
                    const categoryPerms = getCategoryPermissions(category.id);
                    if (categoryPerms.length === 0) return null;
                    
                    return (
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
                        <span className="text-xs">({categoryPerms.length})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Category Permissions */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {parsedCategory?.icon}
                      <h4 className="font-semibold text-gray-800">
                        {parsedCategory?.name} Permissions
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(selectedCategory)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {getCategoryPermissions(selectedCategory).every(p => 
                        formData.permission_ids.includes(p.id)
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getCategoryPermissions(selectedCategory).map(permission => {
                      const [category, action] = permission.name.split('.');
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.permission_ids.includes(permission.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePermissionToggle(permission.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                              formData.permission_ids.includes(permission.id)
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              {formData.permission_ids.includes(permission.id) ? (
                                <FaCheck className="h-3 w-3" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {permission.name}
                              </p>
                            </div>
                          </div>
                          <FaLock className={`h-4 w-4 ${
                            formData.permission_ids.includes(permission.id)
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`} />
                        </div>
                      );
                    })}
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
                  {formData.permission_ids.length} permissions selected across {
                    new Set(
                      permissions.filter(p => 
                        formData.permission_ids.includes(p.id)
                      ).map(p => p.name.split('.')[0])
                    ).size
                  } categories
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
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
const RoleDetailsModal = ({ isOpen, onClose, role, permissions, userCount }) => {
  if (!isOpen || !role) return null;

  const rolePermissions = permissions;

  const getPermissionCountByCategory = () => {
    const counts = {};
    permissionCategories.forEach(category => {
      const categoryPerms = rolePermissions.filter(p => 
        p.name.startsWith(`${category.id}.`)
      );
      if (categoryPerms.length > 0) {
        counts[category.name] = categoryPerms.length;
      }
    });
    return counts;
  };

  const permissionCounts = getPermissionCountByCategory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaUserShield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{role.name}</h2>
                <p className="text-sm text-gray-500">Role Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Users</div>
              <div className="text-2xl font-bold text-gray-800">{userCount || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Permissions</div>
              <div className="text-2xl font-bold text-gray-800">
                {rolePermissions.length}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-1">Categories</div>
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(permissionCounts).length}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Permissions Breakdown
            </h3>
            <div className="space-y-4">
              {permissionCategories.map(category => {
                const categoryPermissions = rolePermissions.filter(p => 
                  p.name.startsWith(`${category.id}.`)
                );
                
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
                          {categoryPermissions.length} permissions
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPermissions.map(permission => {
                        const [_, action] = permission.name.split('.');
                        return (
                          <div key={permission.id} className="flex items-center gap-2">
                            <FaCheck className="h-3 w-3 text-green-500" />
                            <span className="text-sm text-gray-700">
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </div>
                        );
                      })}
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
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "delete", loading }) => {
  if (!isOpen) return null;

  const buttonColors = {
    delete: "bg-red-600 hover:bg-red-700",
    clone: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
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
            disabled={loading}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors ${buttonColors[type]}`}
          >
            {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
            {type === "delete" ? "Delete" : "Duplicate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Role Management Component
export default function RoleManagementPage() {
  const { selectedOrganization } = useOrganizations();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Color palette state
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  
  const [modalState, setModalState] = useState({
    form: false,
    details: false,
    confirm: false,
    type: "delete",
    role: null,
  });

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Fetch data on component mount
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  // Update the fetchData function in RoleManagementPage.jsx

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const [rolesData, permissionsData] = await Promise.all([
      roleService.getRoles(),
      roleService.getAllPermissions()
    ]);
    
    // Check if rolesData is valid
    let rolesArray = [];
    if (rolesData && rolesData.data && Array.isArray(rolesData.data)) {
      rolesArray = rolesData.data;
    } else if (rolesData && Array.isArray(rolesData)) {
      rolesArray = rolesData;
    } else if (rolesData && rolesData.success && rolesData.data && Array.isArray(rolesData.data)) {
      rolesArray = rolesData.data;
    }
    
    // Check if permissionsData is valid
    let permissionsArray = [];
    if (permissionsData && permissionsData.data && Array.isArray(permissionsData.data)) {
      permissionsArray = permissionsData.data;
    } else if (permissionsData && Array.isArray(permissionsData)) {
      permissionsArray = permissionsData;
    } else if (permissionsData && permissionsData.success && permissionsData.data && Array.isArray(permissionsData.data)) {
      permissionsArray = permissionsData.data;
    }
    
    setRoles(rolesArray);
    setPermissions(permissionsArray);
    
  } catch (err) {
    console.error('Failed to fetch data:', err);
    
    // Check if it's a 500 error
    if (err.response?.status === 500) {
      setError('Server error (500). The API endpoint may be temporarily unavailable. Please try again later or contact support.');
    } else {
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
    }
    
    // Set empty arrays to prevent further errors
    setRoles([]);
    setPermissions([]);
  } finally {
    setLoading(false);
  }
};
  // Filter roles based on search - EXCLUDE superadmin
  const filteredRoles = roles.filter(role => {
    // Exclude superadmin role
    if (role.name?.toLowerCase() === 'superadmin') return false;
    return role.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate stats excluding superadmin
  const totalRoles = roles.filter(r => r.name?.toLowerCase() !== 'superadmin').length;
  const adminRoles = roles.filter(r => 
    r.name?.toLowerCase().includes('admin') && 
    r.name?.toLowerCase() !== 'superadmin'
  ).length;
  const customRoles = roles.filter(r => 
    !r.name?.toLowerCase().includes('admin') && 
    r.name?.toLowerCase() !== 'superadmin'
  ).length;

  const handleOpenForm = (role = null) => {
    setModalState(prev => ({ ...prev, form: true, role }));
  };

  const handleCloseForm = () => {
    setModalState(prev => ({ ...prev, form: false, role: null }));
  };

  const handleOpenDetails = (role) => {
    setModalState(prev => ({ ...prev, details: true, role }));
  };

  const handleCloseDetails = () => {
    setModalState(prev => ({ ...prev, details: false, role: null }));
  };

  const handleOpenConfirm = (role, type = "delete") => {
    setModalState(prev => ({ ...prev, confirm: true, role, type }));
  };

  const handleCloseConfirm = () => {
    setModalState(prev => ({ ...prev, confirm: false, role: null, type: "delete" }));
  };

  const handleSaveRole = async (formData) => {
  setSaving(true);
  setError(null);
  setSuccessMessage(null);

  try {
    let savedRole;
    
    if (modalState.role) {
      // Update existing role
      savedRole = await roleService.updateRole(modalState.role.id, {
        name: formData.name,
        guard_name: formData.guard_name
      });
      
      // Sync permissions if any selected - DO THIS SEPARATELY
      if (formData.permission_ids && formData.permission_ids.length > 0) {
        try {
          await roleService.syncRolePermissions(savedRole.id, formData.permission_ids);
          console.log('Permissions synced successfully');
        } catch (permError) {
          console.error('Error syncing permissions:', permError);
          // Don't throw here, just log the error
        }
      }
      
      setRoles(prev => prev.map(role => 
        role.id === modalState.role.id ? savedRole : role
      ));
      setSuccessMessage(`Role "${savedRole.name}" updated successfully!`);
    } else {
      // Create new role
      savedRole = await roleService.createRole({
        name: formData.name,
        guard_name: formData.guard_name
      });
      
      // Assign permissions if any selected
      if (formData.permission_ids && formData.permission_ids.length > 0 && savedRole.id) {
        try {
          await roleService.syncRolePermissions(savedRole.id, formData.permission_ids);
          console.log('Permissions assigned successfully');
        } catch (permError) {
          console.error('Error assigning permissions:', permError);
          // Don't throw here, just log the error
        }
      }
      
      setRoles(prev => [...prev, savedRole]);
      setSuccessMessage(`Role "${savedRole.name}" created successfully!`);
    }
    
    setTimeout(() => setSuccessMessage(null), 3000);
    
  } catch (err) {
    console.error('Error saving role:', err);
    console.error('Error response:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to save role. Please try again.');
    throw err;
  } finally {
    setSaving(false);
  }
};

  const handleDeleteRole = async () => {
    if (!modalState.role) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await roleService.deleteRole(modalState.role.id);
      setRoles(prev => prev.filter(role => role.id !== modalState.role.id));
      setSuccessMessage(`Role "${modalState.role.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Failed to delete role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloneRole = async (role) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newRoleData = {
        name: `${role.name} (Copy)`,
        guard_name: role.guard_name
      };
      
      const savedRole = await roleService.createRole(newRoleData);
      
      try {
        const rolePerms = await roleService.getRolePermissions(role.id);
        if (rolePerms.permissions && rolePerms.permissions.length > 0) {
          const permissionIds = rolePerms.permissions.map(p => p.id);
          await roleService.syncRolePermissions(savedRole.id, permissionIds);
        }
      } catch (permErr) {
        console.error('Error cloning permissions:', permErr);
      }
      
      setRoles(prev => [...prev, savedRole]);
      setSuccessMessage(`Role "${savedRole.name}" cloned successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
    } catch (err) {
      console.error('Error cloning role:', err);
      setError('Failed to clone role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // No organization selected
  if (!selectedOrganization?.id) {
    return (
      <div 
        className="min-h-screen p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaUserShield className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization to manage roles and permissions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading roles...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {selectedOrganization.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div 
        className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300"
        style={{ backgroundColor }}
      >
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Role Management</h1>
              <p className="text-gray-600 mt-2">
                Manage user roles, assign permissions, and control system access
              </p>
              {selectedOrganization && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                  <FaBuilding className="mr-2 text-xs" />
                  {selectedOrganization.name}
                </div>
              )}
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Create New Role
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Stats - Updated to exclude superadmin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <FaUserShield className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-lg font-bold text-gray-800">{totalRoles}</span>
              </div>
              <p className="text-sm text-gray-600">Total Roles</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <FaUsers className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {permissions.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Permissions</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-purple-50">
                  <FaUserCog className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {adminRoles}
                </span>
              </div>
              <p className="text-sm text-gray-600">Admin Roles</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-orange-50">
                  <FaUserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {customRoles}
                </span>
              </div>
              <p className="text-sm text-gray-600">Custom Roles</p>
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
                  placeholder="Search roles by name..."
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
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  <FaSync className="h-4 w-4" /> Refresh
                </button>
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
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchTerm ? "No roles found" : "No roles available"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search" : "Create your first role to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => handleOpenForm()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
                    loading={saving}
                    userCount={0}
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
                  <span className="font-semibold">{totalRoles}</span> roles
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
          role={modalState.role}
          permissions={permissions}
          onSave={handleSaveRole}
          loading={saving}
        />

        <RoleDetailsModal
          isOpen={modalState.details}
          onClose={handleCloseDetails}
          role={modalState.role}
          permissions={permissions}
          userCount={0}
        />

        <ConfirmationModal
          isOpen={modalState.confirm}
          onClose={handleCloseConfirm}
          onConfirm={modalState.type === "delete" ? handleDeleteRole : () => handleCloneRole(modalState.role)}
          title={modalState.type === "delete" ? "Delete Role" : "Clone Role"}
          message={
            modalState.type === "delete"
              ? `Are you sure you want to delete "${modalState.role?.name}"? This action cannot be undone.`
              : `Create a copy of "${modalState.role?.name}"? You can modify the duplicate.`
          }
          type={modalState.type}
          loading={saving}
        />
      </div>
    </>
  );
}
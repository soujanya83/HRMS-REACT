import React, { useState, useEffect } from "react";
import {
  FaKey,
  FaLock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaCopy,
  FaCheck,
  FaUsers,
  FaUserShield,
  FaShieldAlt,
  FaChartBar,
  FaCog,
  FaMoneyBill,
  FaCalendar,
  FaFileAlt,
  FaClipboardList,
  FaRegClock,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaInfoCircle,
  FaChevronRight,
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import permissionService from "../../services/permissionService";
import roleService from "../../services/roleService";

// Permission Categories configuration
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
    icon: <FaUsers className="h-5 w-5" />,
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
    icon: <FaRegClock className="h-5 w-5" />,
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

// Parse permission name to get category and action
const parsePermissionName = (name) => {
  const parts = name.split('.');
  if (parts.length === 2) {
    return {
      category: parts[0],
      action: parts[1],
      displayName: `${parts[0]} ${parts[1]}`.replace(/\b\w/g, l => l.toUpperCase()),
    };
  }
  return {
    category: 'other',
    action: name,
    displayName: name.replace(/\b\w/g, l => l.toUpperCase()),
  };
};

// Get category details by ID
const getCategoryDetails = (categoryId) => {
  return permissionCategories.find(cat => cat.id === categoryId) || {
    id: categoryId,
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
    icon: <FaKey className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-600",
    description: `${categoryId} permissions`,
  };
};

// Permission Type Badge
const PermissionTypeBadge = ({ action }) => {
  const typeConfig = {
    view: { color: "bg-blue-100 text-blue-800", icon: <FaEye className="h-3 w-3" />, label: "View" },
    create: { color: "bg-green-100 text-green-800", icon: <FaPlus className="h-3 w-3" />, label: "Create" },
    add: { color: "bg-green-100 text-green-800", icon: <FaPlus className="h-3 w-3" />, label: "Add" },
    edit: { color: "bg-yellow-100 text-yellow-800", icon: <FaEdit className="h-3 w-3" />, label: "Edit" },
    delete: { color: "bg-red-100 text-red-800", icon: <FaTrash className="h-3 w-3" />, label: "Delete" },
    manage: { color: "bg-purple-100 text-purple-800", icon: <FaCog className="h-3 w-3" />, label: "Manage" },
    run: { color: "bg-indigo-100 text-indigo-800", icon: <FaSync className="h-3 w-3" />, label: "Run" },
  };

  const config = typeConfig[action] || { 
    color: "bg-gray-100 text-gray-800", 
    icon: <FaLock className="h-3 w-3" />,
    label: action.charAt(0).toUpperCase() + action.slice(1)
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// Permission Card Component
const PermissionCard = ({ permission, onEdit, onDelete, onClone, loading }) => {
  const parsed = parsePermissionName(permission.name);
  const category = getCategoryDetails(parsed.category);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{parsed.displayName}</h3>
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {permission.name}
              </code>
              <span className="text-xs text-gray-500">ID: {permission.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionTypeBadge action={parsed.action} />
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {permission.guard_name}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-800">
              {new Date(permission.created_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-2 text-gray-800">
              {new Date(permission.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Category: <span className="font-medium text-gray-700">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(permission)}
            disabled={loading}
            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50"
            title="Edit Permission"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onClone(permission)}
            disabled={loading}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
            title="Clone Permission"
          >
            <FaCopy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(permission)}
            disabled={loading}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            title="Delete Permission"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Permission Form Modal
const PermissionFormModal = ({ isOpen, onClose, permission, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        guard_name: permission.guard_name || "web",
      });
    } else {
      setFormData({
        name: "",
        guard_name: "web",
      });
    }
    setErrors({});
  }, [permission, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Permission name is required";
    } else if (!formData.name.includes('.')) {
      newErrors.name = "Permission name must follow format: category.action (e.g., employees.view)";
    } else if (formData.name.split('.').length !== 2) {
      newErrors.name = "Permission name must have exactly one dot (.) separating category and action";
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || "Failed to save permission. Please try again." 
        });
      }
    }
  };

  if (!isOpen) return null;

  const parsed = parsePermissionName(formData.name);
  const category = getCategoryDetails(parsed.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaKey className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {permission ? `Edit Permission` : "Create New Permission"}
                </h2>
                <p className="text-sm text-gray-500">
                  Define permission name and guard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="h-4 w-4" />
                {errors.general}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., employees.view"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: category.action (e.g., employees.view, recruitment.manage)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guard Name
              </label>
              <select
                value={formData.guard_name}
                onChange={(e) => setFormData(prev => ({ ...prev, guard_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="web">Web</option>
                <option value="sanctum">Sanctum</option>
                <option value="api">API</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Authentication guard for this permission
              </p>
            </div>

            {/* Preview Section */}
            {formData.name && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${category.color}`}>
                        {category.icon}
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Action:</span>
                    <PermissionTypeBadge action={parsed.action} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Display Name:</span>
                    <span className="font-medium">{parsed.displayName}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
              {permission ? "Update Permission" : "Create Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, permissions, onClick, isExpanded }) => {
  const categoryPermissions = permissions.filter(p => 
    parsePermissionName(p.name).category === category.id
  );

  if (categoryPermissions.length === 0) return null;

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
            {categoryPermissions.length} permissions
          </span>
          <FaChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryPermissions.map(permission => {
              const parsed = parsePermissionName(permission.name);
              return (
                <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-800">{parsed.displayName}</span>
                    <p className="text-xs text-gray-500 mt-1">{permission.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PermissionTypeBadge action={parsed.action} />
                    <span className="text-xs text-gray-500">
                      ID: {permission.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Permission Management Component
export default function PermissionManagementPage() {
  const [view, setView] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({
    form: false,
    confirm: false,
    permission: null,
    type: "delete",
  });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});

  // Fetch permissions and roles on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [permissionsData, rolesData] = await Promise.all([
        permissionService.getPermissions(),
        roleService.getRoles()
      ]);
      
      setPermissions(permissionsData);
      setRoles(rolesData);
      
      // Fetch permissions for each role
      const rolePerms = {};
      for (const role of rolesData) {
        try {
          const rolePermData = await roleService.getRolePermissions(role.id);
          rolePerms[role.id] = rolePermData.permissions;
        } catch (err) {
          console.error(`Error fetching permissions for role ${role.id}:`, err);
          rolePerms[role.id] = [];
        }
      }
      setRolePermissions(rolePerms);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter permissions based on search and category
  const filteredPermissions = React.useMemo(() => {
    let filtered = [...permissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parsePermissionName(permission.name).displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory && view === "permissions") {
      filtered = filtered.filter(permission => 
        parsePermissionName(permission.name).category === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "category":
          aValue = parsePermissionName(a.name).category;
          bValue = parsePermissionName(b.name).category;
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedCategory, view, permissions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="h-3 w-3 text-gray-400" />;
    return sortConfig.direction === "asc" 
      ? <FaSortUp className="h-3 w-3 text-blue-600" />
      : <FaSortDown className="h-3 w-3 text-blue-600" />;
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

  const handleSavePermission = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let savedPermission;
      
      if (modalState.permission) {
        // Update existing permission
        savedPermission = await permissionService.updatePermission(
          modalState.permission.id, 
          formData
        );
        setPermissions(prev => prev.map(p => 
          p.id === modalState.permission.id ? savedPermission : p
        ));
        setSuccessMessage(`Permission "${savedPermission.name}" updated successfully!`);
      } else {
        // Create new permission
        savedPermission = await permissionService.createPermission(formData);
        setPermissions(prev => [...prev, savedPermission]);
        setSuccessMessage(`Permission "${savedPermission.name}" created successfully!`);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error saving permission:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!modalState.permission) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await permissionService.deletePermission(modalState.permission.id);
      setPermissions(prev => prev.filter(p => p.id !== modalState.permission.id));
      setSuccessMessage(`Permission "${modalState.permission.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
    } catch (err) {
      console.error('Error deleting permission:', err);
      setError('Failed to delete permission. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClonePermission = async (permission) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create a new permission based on the existing one
      const newPermissionData = {
        name: `${permission.name}.copy`,
        guard_name: permission.guard_name
      };
      
      const savedPermission = await permissionService.createPermission(newPermissionData);
      setPermissions(prev => [...prev, savedPermission]);
      setSuccessMessage(`Permission "${savedPermission.name}" cloned successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
    } catch (err) {
      console.error('Error cloning permission:', err);
      setError('Failed to clone permission. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get which roles have this permission
  const getRolesWithPermission = (permissionId) => {
    const rolesWithPerm = [];
    Object.entries(rolePermissions).forEach(([roleId, perms]) => {
      if (perms.some(p => p.id === permissionId)) {
        const role = roles.find(r => r.id === parseInt(roleId));
        if (role) rolesWithPerm.push(role);
      }
    });
    return rolesWithPerm;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
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
            <h1 className="text-3xl font-bold text-gray-800">Permission Management</h1>
            <p className="text-gray-600 mt-2">
              Manage system permissions, assign to roles, and control access levels
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Create Permission
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <FaSync className="h-4 w-4" /> Refresh
            </button>
          </div>
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
              <span className="text-lg font-bold text-gray-800">{roles.length}</span>
            </div>
            <p className="text-sm text-gray-600">Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50">
                <FaUserShield className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {permissionCategories.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-50">
                <FaShieldAlt className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {Object.values(rolePermissions).flat().length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Role Assignments</p>
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

            {/* Search */}
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
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === "categories" ? (
            /* Categories View */
            <div className="space-y-6">
              {permissionCategories.map(category => {
                const categoryPermissions = permissions.filter(p => 
                  parsePermissionName(p.name).category === category.id
                );
                
                if (categoryPermissions.length === 0) return null;
                
                return (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    permissions={categoryPermissions}
                    onClick={() => {
                      setView("permissions");
                      setSelectedCategory(category.id);
                    }}
                    isExpanded={selectedCategory === category.id && view === "permissions"}
                  />
                );
              })}
            </div>
          ) : (
            /* Permissions View - Grid Layout */
            <>
              {filteredPermissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FaKey className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {searchTerm ? "No permissions found" : "No permissions available"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "Try adjusting your search" : "Create your first permission to get started"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => handleOpenForm()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <FaPlus className="inline mr-2" />
                      Create First Permission
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPermissions.map(permission => (
                    <PermissionCard
                      key={permission.id}
                      permission={permission}
                      onEdit={() => handleOpenForm(permission)}
                      onDelete={() => handleOpenConfirm(permission, "delete")}
                      onClone={() => handleOpenConfirm(permission, "clone")}
                      loading={saving}
                    />
                  ))}
                </div>
              )}
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
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
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
        onSave={handleSavePermission}
        loading={saving}
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
                disabled={saving}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={modalState.type === "delete" ? handleDeletePermission : () => handleClonePermission(modalState.permission)}
                disabled={saving}
                className={`px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 ${
                  modalState.type === "delete" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving && <FaSpinner className="h-4 w-4 animate-spin" />}
                {modalState.type === "delete" ? "Delete" : "Clone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
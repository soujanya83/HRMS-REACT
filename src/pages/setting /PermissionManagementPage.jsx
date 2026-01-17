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
  FaSpinner,
  FaInfoCircle,
  FaChevronRight,
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaFolder,
  FaFolderPlus,
  FaFolderOpen,
  FaList,
  FaThLarge,
  FaChevronDown,
  FaBuilding,
  FaUserTie,
  FaChartLine,
  FaBell,
  FaCreditCard,
  FaWrench,
  FaDatabase,
  FaCloud,
  FaNetworkWired,
  FaMobileAlt,
  FaDesktop,
  FaServer,
  FaShieldVirus,
  FaUserSecret,
  FaUserTag,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaUserGraduate,
  FaUserNinja,
  FaUserAstronaut,
  FaUserMd,
  FaUserNurse,
  FaUserInjured,
  FaUserFriends,
  FaUserCog,
  FaUserEdit,
  FaUserMinus,
  FaUserPlus,
  FaDownload,
  FaUpload,
  FaPlay,
} from "react-icons/fa";
import permissionService from "../../services/permissionService";
import roleService from "../../services/roleService";

// Extended Permission Categories with more icons
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    employees: <FaUsers className="h-5 w-5" />,
    recruitment: <FaUserTie className="h-5 w-5" />,
    attendance: <FaCalendar className="h-5 w-5" />,
    payroll: <FaMoneyBill className="h-5 w-5" />,
    timesheet: <FaRegClock className="h-5 w-5" />,
    roster: <FaClipboardList className="h-5 w-5" />,
    performance: <FaChartBar className="h-5 w-5" />,
    settings: <FaCog className="h-5 w-5" />,
    organization: <FaBuilding className="h-5 w-5" />,
    reports: <FaChartLine className="h-5 w-5" />,
    notifications: <FaBell className="h-5 w-5" />,
    finance: <FaCreditCard className="h-5 w-5" />,
    system: <FaWrench className="h-5 w-5" />,
    database: <FaDatabase className="h-5 w-5" />,
    cloud: <FaCloud className="h-5 w-5" />,
    network: <FaNetworkWired className="h-5 w-5" />,
    mobile: <FaMobileAlt className="h-5 w-5" />,
    desktop: <FaDesktop className="h-5 w-5" />,
    server: <FaServer className="h-5 w-5" />,
    security: <FaShieldVirus className="h-5 w-5" />,
    admin: <FaUserShield className="h-5 w-5" />,
    superadmin: <FaUserSecret className="h-5 w-5" />,
    manager: <FaUserTag className="h-5 w-5" />,
    staff: <FaUserCheck className="h-5 w-5" />,
    guest: <FaUserTimes className="h-5 w-5" />,
    trainee: <FaUserClock className="h-5 w-5" />,
    trainer: <FaUserGraduate className="h-5 w-5" />,
    auditor: <FaUserNinja className="h-5 w-5" />,
    analyst: <FaUserAstronaut className="h-5 w-5" />,
    doctor: <FaUserMd className="h-5 w-5" />,
    nurse: <FaUserNurse className="h-5 w-5" />,
    patient: <FaUserInjured className="h-5 w-5" />,
    team: <FaUserFriends className="h-5 w-5" />,
    custom: <FaUserCog className="h-5 w-5" />,
    editor: <FaUserEdit className="h-5 w-5" />,
    viewer: <FaUserMinus className="h-5 w-5" />,
    creator: <FaUserPlus className="h-5 w-5" />,
  };
  
  return iconMap[categoryName] || <FaFolder className="h-5 w-5" />;
};

const getCategoryColor = (categoryName) => {
  const colorMap = {
    employees: "bg-green-100 text-green-600",
    recruitment: "bg-purple-100 text-purple-600",
    attendance: "bg-yellow-100 text-yellow-600",
    payroll: "bg-red-100 text-red-600",
    timesheet: "bg-blue-100 text-blue-600",
    roster: "bg-indigo-100 text-indigo-600",
    performance: "bg-pink-100 text-pink-600",
    settings: "bg-gray-100 text-gray-600",
    organization: "bg-teal-100 text-teal-600",
    reports: "bg-cyan-100 text-cyan-600",
    notifications: "bg-amber-100 text-amber-600",
    finance: "bg-emerald-100 text-emerald-600",
    system: "bg-slate-100 text-slate-600",
    admin: "bg-purple-100 text-purple-600",
    superadmin: "bg-red-100 text-red-600",
    manager: "bg-blue-100 text-blue-600",
  };
  
  return colorMap[categoryName] || "bg-gray-100 text-gray-600";
};

// Parse permission name to get category and action
const parsePermissionName = (name) => {
  const parts = name.split('.');
  if (parts.length >= 2) {
    return {
      category: parts[0],
      action: parts[1],
      displayName: `${parts[0]} ${parts[1]}`.replace(/\b\w/g, l => l.toUpperCase()),
      fullName: name,
    };
  }
  return {
    category: 'other',
    action: name,
    displayName: name.replace(/\b\w/g, l => l.toUpperCase()),
    fullName: name,
  };
};

// Get category details by ID
const getCategoryDetails = (categoryId) => {
  return {
    id: categoryId,
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/([A-Z])/g, ' $1'),
    icon: getCategoryIcon(categoryId),
    color: getCategoryColor(categoryId),
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
    run: { color: "bg-indigo-100 text-indigo-800", icon: <FaPlay className="h-3 w-3" />, label: "Run" },
    approve: { color: "bg-green-100 text-green-800", icon: <FaCheck className="h-3 w-3" />, label: "Approve" },
    reject: { color: "bg-red-100 text-red-800", icon: <FaTimes className="h-3 w-3" />, label: "Reject" },
    export: { color: "bg-blue-100 text-blue-800", icon: <FaDownload className="h-3 w-3" />, label: "Export" },
    import: { color: "bg-green-100 text-green-800", icon: <FaUpload className="h-3 w-3" />, label: "Import" },
    assign: { color: "bg-purple-100 text-purple-800", icon: <FaUserPlus className="h-3 w-3" />, label: "Assign" },
    review: { color: "bg-yellow-100 text-yellow-800", icon: <FaSearch className="h-3 w-3" />, label: "Review" },
    generate: { color: "bg-indigo-100 text-indigo-800", icon: <FaFileAlt className="h-3 w-3" />, label: "Generate" },
    schedule: { color: "bg-blue-100 text-blue-800", icon: <FaCalendar className="h-3 w-3" />, label: "Schedule" },
    track: { color: "bg-green-100 text-green-800", icon: <FaChartLine className="h-3 w-3" />, label: "Track" },
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

// Category Management Modal
const CategoryManagementModal = ({ isOpen, onClose, categories, onAddCategory, onEditCategory, onDeleteCategory, loading }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCategory) {
      setCategoryForm({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
      setShowAddForm(true);
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!categoryForm.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (!/^[a-z]+$/.test(categoryForm.name)) {
      newErrors.name = "Category name must be lowercase letters only (no spaces or special characters)";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingCategory) {
        await onEditCategory(editingCategory.id, categoryForm);
      } else {
        await onAddCategory(categoryForm);
      }
      
      // Reset form
      setCategoryForm({ name: "", description: "" });
      setEditingCategory(null);
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ general: error.message || "Failed to save category" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaFolder className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
                <p className="text-sm text-gray-500">Add, edit, or delete permission categories</p>
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

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="h-4 w-4" />
                  {errors.general}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Existing Categories</h3>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingCategory(null);
                    setCategoryForm({ name: "", description: "" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <FaFolderPlus className="h-4 w-4" /> Add New Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map(category => {
                  const details = getCategoryDetails(category.id);
                  return (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${details.color}`}>
                            {details.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{details.name}</h4>
                            <p className="text-xs text-gray-500">{category.count || 0} permissions</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setShowAddForm(true);
                            }}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Edit Category"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                          {category.count === 0 && (
                            <button
                              onClick={() => onDeleteCategory(category.id)}
                              disabled={loading}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete Category"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add/Edit Category Form */}
            {showAddForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingCategory ? `Edit ${editingCategory.name}` : "Add New Category"}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value.toLowerCase() }))}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., organization"
                      disabled={loading || !!editingCategory}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Use lowercase letters only, no spaces or special characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this category includes"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingCategory(null);
                        setCategoryForm({ name: "", description: "" });
                        setErrors({});
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
                      {editingCategory ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Permission Form Modal with Quick Add
const PermissionFormModal = ({ isOpen, onClose, permission, categories, standardActions, onSave, loading, onQuickAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedActions, setSelectedActions] = useState([]);
  const [customAction, setCustomAction] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        guard_name: permission.guard_name || "web",
      });
      const parsed = parsePermissionName(permission.name);
      setSelectedCategory(parsed.category);
      setSelectedActions([parsed.action]);
    } else {
      setFormData({
        name: "",
        guard_name: "web",
      });
      setSelectedCategory("");
      setSelectedActions([]);
      setCustomAction("");
    }
    setErrors({});
  }, [permission, isOpen]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (customAction) {
      setFormData(prev => ({
        ...prev,
        name: `${category}.${customAction}`
      }));
    } else if (selectedActions.length > 0) {
      setFormData(prev => ({
        ...prev,
        name: `${category}.${selectedActions[0]}`
      }));
    }
  };

  const handleActionSelect = (action) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(prev => prev.filter(a => a !== action));
    } else {
      setSelectedActions(prev => [...prev, action]);
    }
    
    if (selectedCategory && action && !showQuickAdd) {
      setFormData(prev => ({
        ...prev,
        name: `${selectedCategory}.${action}`
      }));
    }
  };

  const handleCustomActionChange = (e) => {
    const value = e.target.value;
    setCustomAction(value);
    setSelectedActions([]);
    if (selectedCategory && value) {
      setFormData(prev => ({
        ...prev,
        name: `${selectedCategory}.${value}`
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Permission name is required";
    } else if (!formData.name.includes('.')) {
      newErrors.name = "Permission name must follow format: category.action";
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

  const handleQuickAddSubmit = async () => {
    if (!selectedCategory || selectedActions.length === 0) {
      setErrors({ general: "Please select a category and at least one action" });
      return;
    }

    try {
      await onQuickAdd(selectedCategory, selectedActions);
      onClose();
    } catch (error) {
      console.error('Quick add error:', error);
      setErrors({ 
        general: error.response?.data?.message || "Failed to add permissions. Please try again." 
      });
    }
  };

  if (!isOpen) return null;

  const parsed = parsePermissionName(formData.name);
  const categoryDetails = getCategoryDetails(parsed.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaKey className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {permission ? `Edit Permission` : "Create Permission"}
                </h2>
                <p className="text-sm text-gray-500">
                  {showQuickAdd ? "Quick add multiple permissions" : "Create a single permission"}
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

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="h-4 w-4" />
                  {errors.general}
                </div>
              </div>
            )}

            {/* Toggle between single and quick add */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${!showQuickAdd ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Single Permission
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${showQuickAdd ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Quick Add Multiple
              </button>
            </div>

            {showQuickAdd ? (
              // Quick Add Multiple Permissions
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Add Permissions</h3>
                  <p className="text-gray-600 mb-4">
                    Select a category and choose standard actions to create multiple permissions at once.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(category => {
                      const details = getCategoryDetails(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryChange(category.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedCategory === category.id
                              ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${details.color}`}>
                            {details.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">{details.name}</div>
                            <div className="text-xs text-gray-500">{category.count} permissions</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedCategory && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Actions *
                      </label>
                      <div className="text-xs text-gray-500">
                        {selectedActions.length} selected
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {standardActions.map(action => (
                        <div key={action.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`action-${action.id}`}
                            checked={selectedActions.includes(action.id)}
                            onChange={() => handleActionSelect(action.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`action-${action.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                            {action.name}
                          </label>
                          <PermissionTypeBadge action={action.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Preview</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCategory && selectedActions.length > 0 ? (
                      selectedActions.map(action => (
                        <div key={action} className="flex items-center justify-between p-2 bg-white rounded">
                          <code className="text-sm px-2 py-1 rounded bg-gray-100">
                            {selectedCategory}.{action}
                          </code>
                          <PermissionTypeBadge action={action} />
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-600 text-sm">Select a category and actions to preview permissions</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Single Permission Form
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Choose a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {getCategoryDetails(category.id).name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Type *
                    </label>
                    <div className="space-y-2">
                      <select
                        value={selectedActions[0] || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleActionSelect(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading || !selectedCategory}
                      >
                        <option value="">Select standard action</option>
                        {standardActions.map(action => (
                          <option key={action.id} value={action.id}>
                            {action.name}
                          </option>
                        ))}
                      </select>
                      
                      <div className="text-center text-gray-400 text-sm">OR</div>
                      
                      <div>
                        <input
                          type="text"
                          value={customAction}
                          onChange={handleCustomActionChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter custom action"
                          disabled={loading || !selectedCategory}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use lowercase letters, no spaces (e.g., "approve", "generate_report")
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                {formData.name && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Permission Name:</span>
                        <code className="text-sm bg-white px-2 py-1 rounded font-mono">
                          {formData.name}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${categoryDetails.color}`}>
                            {categoryDetails.icon}
                          </div>
                          <span className="font-medium">{categoryDetails.name}</span>
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Permission Naming Convention</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Permissions follow the format: <code className="bg-yellow-100 px-1 py-0.5 rounded">category.action</code>
                      </p>
                      <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                        <li>• Category: Lowercase, singular noun (e.g., "employees", "organization")</li>
                        <li>• Action: Lowercase verb describing the operation (e.g., "view", "create", "manage")</li>
                        <li>• Examples: "employees.view", "organization.manage", "payroll.run"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              {showQuickAdd ? (
                <button
                  type="button"
                  onClick={handleQuickAddSubmit}
                  disabled={loading || !selectedCategory || selectedActions.length === 0}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
                  Add {selectedActions.length} Permission{selectedActions.length !== 1 ? 's' : ''}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.name}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
                  {permission ? "Update Permission" : "Create Permission"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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

// Category Card Component
const CategoryCard = ({ category, permissions, onClick, isExpanded, onManageCategories }) => {
  const categoryPermissions = permissions.filter(p => 
    parsePermissionName(p.name).category === category.id
  );

  if (categoryPermissions.length === 0) return null;

  const categoryDetails = getCategoryDetails(category.id);

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-5 transition-all hover:shadow-md ${
        isExpanded ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={onClick}
        >
          <div className={`p-3 rounded-lg ${categoryDetails.color}`}>
            {categoryDetails.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{categoryDetails.name}</h3>
            <p className="text-sm text-gray-500">{categoryDetails.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {categoryPermissions.length} permissions
          </span>
          <FaChevronRight className={`h-4 w-4 text-gray-400 transition-transform cursor-pointer ${
            isExpanded ? 'rotate-90' : ''
          }`} 
          onClick={onClick}
          />
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

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "delete", loading }) => {
  if (!isOpen) return null;

  const buttonColors = {
    delete: "bg-red-600 hover:bg-red-700",
    clone: "bg-blue-600 hover:bg-blue-700",
    category_delete: "bg-red-600 hover:bg-red-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${
            type.includes("delete") ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            {type.includes("delete") ? (
              <FaTrash className="h-6 w-6" />
            ) : (
              <FaCopy className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">
              {type.includes("delete") 
                ? "This action cannot be undone" 
                : type === "clone" ? "Create a copy of this permission" : ""}
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 pl-1">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 ${buttonColors[type] || buttonColors.delete}`}
          >
            {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
            {type.includes("delete") ? "Delete" : "Clone"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Permission Management Component
export default function PermissionManagementPage() {
  const [view, setView] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({
    form: false,
    confirm: false,
    categoryManagement: false,
    permission: null,
    category: null,
    type: "delete",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [standardActions, setStandardActions] = useState([]);

  // Fetch data on component mount
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
      
      // Extract categories from permissions
      const categoryMap = new Map();
      permissionsData.forEach(permission => {
        const category = permission.name.split('.')[0];
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category) + 1);
        } else {
          categoryMap.set(category, 1);
        }
      });
      
      const categoriesData = Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }));
      
      setCategories(categoriesData);
      
      // Get standard actions
      const actions = permissionService.getStandardActions();
      setStandardActions(actions);
      
      // Fetch permissions for each role
      const rolePerms = {};
      for (const role of rolesData) {
        try {
          const rolePermData = await roleService.getRolePermissions(role.id);
          rolePerms[role.id] = rolePermData.permissions || [];
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

    return filtered;
  }, [searchTerm, selectedCategory, view, permissions]);

  const handleOpenForm = (permission = null) => {
    setModalState(prev => ({ ...prev, form: true, permission }));
  };

  const handleCloseForm = () => {
    setModalState(prev => ({ ...prev, form: false, permission: null }));
  };

  const handleOpenCategoryManagement = () => {
    setModalState(prev => ({ ...prev, categoryManagement: true }));
  };

  const handleCloseCategoryManagement = () => {
    setModalState(prev => ({ ...prev, categoryManagement: false }));
  };

  const handleOpenConfirm = (permission, type = "delete") => {
    setModalState(prev => ({ ...prev, confirm: true, permission, type }));
  };

  const handleOpenCategoryConfirm = (category, type = "category_delete") => {
    setModalState(prev => ({ ...prev, confirm: true, category, type }));
  };

  const handleCloseConfirm = () => {
    setModalState(prev => ({ ...prev, confirm: false, permission: null, category: null, type: "delete" }));
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
        
        // Update categories
        const category = formData.name.split('.')[0];
        const categoryExists = categories.find(c => c.id === category);
        if (!categoryExists) {
          setCategories(prev => [...prev, { id: category, name: category, count: 1 }]);
        } else {
          setCategories(prev => prev.map(c => 
            c.id === category ? { ...c, count: c.count + 1 } : c
          ));
        }
        
        setSuccessMessage(`Permission "${savedPermission.name}" created successfully!`);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error saving permission:', err);
      setError(err.response?.data?.message || 'Failed to save permission. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddPermissions = async (category, actions) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create permissions for each action
      const createPromises = actions.map(action => 
        permissionService.createPermission({
          name: `${category}.${action}`,
          guard_name: 'web'
        })
      );

      const savedPermissions = await Promise.all(createPromises);
      setPermissions(prev => [...prev, ...savedPermissions]);
      
      // Update category count
      const categoryExists = categories.find(c => c.id === category);
      if (!categoryExists) {
        setCategories(prev => [...prev, { id: category, name: category, count: actions.length }]);
      } else {
        setCategories(prev => prev.map(c => 
          c.id === category ? { ...c, count: c.count + actions.length } : c
        ));
      }
      
      setSuccessMessage(`${actions.length} permissions created successfully for ${category}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error quick adding permissions:', err);
      setError(err.response?.data?.message || 'Failed to create permissions. Please try again.');
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
      
      // Update permissions list
      setPermissions(prev => prev.filter(p => p.id !== modalState.permission.id));
      
      // Update category count
      const category = modalState.permission.name.split('.')[0];
      setCategories(prev => {
        const updated = prev.map(c => 
          c.id === category ? { ...c, count: Math.max(0, c.count - 1) } : c
        );
        // Remove category if count is 0
        return updated.filter(c => c.count > 0);
      });
      
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
      
      // Update category count
      const category = savedPermission.name.split('.')[0];
      setCategories(prev => prev.map(c => 
        c.id === category ? { ...c, count: c.count + 1 } : c
      ));
      
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

  const handleAddCategory = async (categoryData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create a default view permission for the new category
      const newPermission = await permissionService.createPermission({
        name: `${categoryData.name}.view`,
        guard_name: 'web'
      });
      
      // Add to permissions list
      setPermissions(prev => [...prev, newPermission]);
      
      // Add to categories list
      const newCategory = {
        id: categoryData.name,
        name: categoryData.name.charAt(0).toUpperCase() + categoryData.name.slice(1),
        count: 1,
        description: categoryData.description
      };
      
      setCategories(prev => [...prev, newCategory]);
      
      setSuccessMessage(`Category "${categoryData.name}" created successfully with a default view permission!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (oldCategoryName, categoryData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update all permissions in this category
      const categoryPermissions = permissions.filter(p => 
        p.name.startsWith(`${oldCategoryName}.`)
      );
      
      const updatePromises = categoryPermissions.map(permission => {
        const newName = permission.name.replace(`${oldCategoryName}.`, `${categoryData.name}.`);
        return permissionService.updatePermission(permission.id, {
          name: newName,
          guard_name: permission.guard_name
        });
      });
      
      await Promise.all(updatePromises);
      
      // Update permissions list
      setPermissions(prev => prev.map(p => {
        if (p.name.startsWith(`${oldCategoryName}.`)) {
          return {
            ...p,
            name: p.name.replace(`${oldCategoryName}.`, `${categoryData.name}.`)
          };
        }
        return p;
      }));
      
      // Update categories list
      setCategories(prev => prev.map(c => 
        c.id === oldCategoryName 
          ? { ...c, id: categoryData.name, name: categoryData.name, description: categoryData.description }
          : c
      ));
      
      setSuccessMessage(`Category updated from "${oldCategoryName}" to "${categoryData.name}" successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error editing category:', err);
      setError('Failed to edit category. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Delete all permissions in this category
      const categoryPermissions = permissions.filter(p => 
        p.name.startsWith(`${categoryName}.`)
      );
      
      const deletePromises = categoryPermissions.map(permission => 
        permissionService.deletePermission(permission.id)
      );
      
      await Promise.all(deletePromises);
      
      // Remove from permissions list
      setPermissions(prev => prev.filter(p => !p.name.startsWith(`${categoryName}.`)));
      
      // Remove from categories list
      setCategories(prev => prev.filter(c => c.id !== categoryName));
      
      setSuccessMessage(`Category "${categoryName}" and all its permissions deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
      
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setSaving(false);
    }
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
            <div className="relative group">
              <button
                onClick={() => handleOpenForm()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaPlus className="h-4 w-4" /> Create Permission
              </button>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-1 z-10 w-48">
                <button
                  onClick={() => handleOpenForm()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" /> Single Permission
                </button>
                <button
                  onClick={() => {
                    handleOpenForm();
                    // The form modal will handle showing quick add
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" /> Multiple Permissions
                </button>
                <button
                  onClick={handleOpenCategoryManagement}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
                >
                  <FaFolderPlus className="h-4 w-4" /> Manage Categories
                </button>
              </div>
            </div>
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
                {categories.length}
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
                <FaFolder className="inline mr-2" /> Categories View
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
                <FaList className="inline mr-2" /> Permissions View
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
              {categories.map(category => {
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
                    onManageCategories={handleOpenCategoryManagement}
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
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => handleOpenForm()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        <FaPlus className="inline mr-2" />
                        Create Permission
                      </button>
                      <button
                        onClick={handleOpenCategoryManagement}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        <FaFolderPlus className="inline mr-2" />
                        Manage Categories
                      </button>
                    </div>
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
                {selectedCategory && (
                  <span className="ml-2">
                    in <span className="font-semibold">{getCategoryDetails(selectedCategory).name}</span> category
                  </span>
                )}
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
        categories={categories}
        standardActions={standardActions}
        onSave={handleSavePermission}
        onQuickAdd={handleQuickAddPermissions}
        loading={saving}
      />

      <CategoryManagementModal
        isOpen={modalState.categoryManagement}
        onClose={handleCloseCategoryManagement}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={(categoryName) => handleOpenCategoryConfirm({ id: categoryName, name: categoryName }, "category_delete")}
        loading={saving}
      />

      <ConfirmationModal
        isOpen={modalState.confirm}
        onClose={handleCloseConfirm}
        onConfirm={modalState.type === "delete" 
          ? handleDeletePermission 
          : modalState.type === "clone" 
            ? () => handleClonePermission(modalState.permission)
            : () => handleDeleteCategory(modalState.category.id)
        }
        title={
          modalState.type === "delete" 
            ? "Delete Permission" 
            : modalState.type === "clone" 
              ? "Clone Permission" 
              : "Delete Category"
        }
        message={
          modalState.type === "delete"
            ? `Are you sure you want to delete "${modalState.permission?.name}"?`
            : modalState.type === "clone"
              ? `Create a copy of "${modalState.permission?.name}"?`
              : `Are you sure you want to delete the "${modalState.category?.name}" category and all its permissions?`
        }
        type={modalState.type}
        loading={saving}
      />
    </div>
  );
}
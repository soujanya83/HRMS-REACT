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
  FaBook,
  FaSitemap,
  FaLayerGroup,
  FaBox,
} from "react-icons/fa";
import permissionService from "../../services/permissionService";
import roleService from "../../services/roleService";

// Extended Permission Categories with more icons
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    recruitment: <FaUserTie className="h-5 w-5" />,
    employee: <FaUsers className="h-5 w-5" />,
    rostering: <FaClipboardList className="h-5 w-5" />,
    attendance: <FaCalendar className="h-5 w-5" />,
    timesheet: <FaRegClock className="h-5 w-5" />,
    payroll: <FaMoneyBill className="h-5 w-5" />,
    performance: <FaChartBar className="h-5 w-5" />,
    settings: <FaCog className="h-5 w-5" />,
    organization: <FaBuilding className="h-5 w-5" />,
    organizations: <FaBuilding className="h-5 w-5" />,
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
    module: <FaBox className="h-5 w-5" />,
    page: <FaBook className="h-5 w-5" />,
    menu: <FaSitemap className="h-5 w-5" />,
  };
  
  return iconMap[categoryName] || <FaFolder className="h-5 w-5" />;
};

const getCategoryColor = (categoryName) => {
  const colorMap = {
    recruitment: "bg-purple-100 text-purple-600",
    employee: "bg-green-100 text-green-600",
    rostering: "bg-indigo-100 text-indigo-600",
    attendance: "bg-yellow-100 text-yellow-600",
    timesheet: "bg-blue-100 text-blue-600",
    payroll: "bg-red-100 text-red-600",
    performance: "bg-pink-100 text-pink-600",
    settings: "bg-gray-100 text-gray-600",
    organization: "bg-teal-100 text-teal-600",
    organizations: "bg-teal-100 text-teal-600",
    reports: "bg-cyan-100 text-cyan-600",
    notifications: "bg-amber-100 text-amber-600",
    finance: "bg-emerald-100 text-emerald-600",
    system: "bg-slate-100 text-slate-600",
    admin: "bg-purple-100 text-purple-600",
    superadmin: "bg-red-100 text-red-600",
    manager: "bg-blue-100 text-blue-600",
    module: "bg-blue-100 text-blue-600",
    page: "bg-green-100 text-green-600",
  };
  
  return colorMap[categoryName] || "bg-gray-100 text-gray-600";
};

// Parse permission name to get category and action - UPDATED for module.page.action
const parsePermissionName = (name) => {
  return permissionService.parsePermissionName(name);
};

// Get category details by ID
const getCategoryDetails = (categoryId) => {
  return {
    id: categoryId,
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/_/g, ' '),
    icon: getCategoryIcon(categoryId),
    color: getCategoryColor(categoryId),
    description: `${categoryId.replace(/_/g, ' ')} permissions`,
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

// Module Management Modal
const ModuleManagementModal = ({ isOpen, onClose, modules, onAddModule, onEditModule, onDeleteModule, loading }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    name: "",
    description: "",
  });
  const [editingModule, setEditingModule] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingModule) {
      setModuleForm({
        name: editingModule.name,
        description: editingModule.description || "",
      });
      setShowAddForm(true);
    }
  }, [editingModule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!moduleForm.name.trim()) {
      newErrors.name = "Module name is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingModule) {
        await onEditModule(editingModule.id, moduleForm);
      } else {
        await onAddModule(moduleForm);
      }
      
      // Reset form
      setModuleForm({ name: "", description: "" });
      setEditingModule(null);
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving module:', error);
      setErrors({ general: error.message || "Failed to save module" });
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
                <FaBox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Manage Modules</h2>
                <p className="text-sm text-gray-500">Add, edit, or delete modules</p>
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
          {/* Modules List */}
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
                <h3 className="text-lg font-semibold text-gray-800">Existing Modules</h3>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingModule(null);
                    setModuleForm({ name: "", description: "" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <FaPlus className="h-4 w-4" /> Add New Module
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.map(module => {
                  const details = getCategoryDetails(module.name.toLowerCase());
                  return (
                    <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${details.color}`}>
                            {details.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{module.name}</h4>
                            <p className="text-xs text-gray-500">ID: {module.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingModule(module);
                              setShowAddForm(true);
                            }}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Edit Module"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onDeleteModule(module.id)}
                            disabled={loading}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Module"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add/Edit Module Form */}
            {showAddForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingModule ? `Edit ${editingModule.name}` : "Add New Module"}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Name *
                    </label>
                    <input
                      type="text"
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Employee Management"
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this module includes"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingModule(null);
                        setModuleForm({ name: "", description: "" });
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
                      {editingModule ? "Update Module" : "Create Module"}
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

// Module Details Modal
const ModuleDetailsModal = ({ isOpen, onClose, module, pages, loading }) => {
  if (!isOpen || !module) return null;

  const moduleDetails = getCategoryDetails(module.name.toLowerCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${moduleDetails.color}`}>
                {moduleDetails.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{module.name} Module</h2>
                <p className="text-sm text-gray-500">Module ID: {module.id}</p>
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
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading pages...</span>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pages in this Module</h3>
                  {pages.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FaBook className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No pages found in this module</p>
                      <p className="text-sm text-gray-500 mt-1">Add pages to this module to enable permissions</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pages.map(page => (
                        <div key={page.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{page.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">Slug: {page.slug}</p>
                              <p className="text-xs text-gray-500 mt-2">Page ID: {page.id}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Page
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <FaInfoCircle className="h-5 w-5" />
                    About Module Pages
                  </h4>
                  <p className="text-sm text-blue-700">
                    Each page in a module can have permissions associated with it. 
                    The system automatically generates permissions in the format: 
                    <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">{`module.page.action`}</code>
                    For example: <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">{`${module.name.toLowerCase()}.${pages[0]?.slug || 'page'}.view`}</code>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Permission Form Modal with Quick Add
const PermissionFormModal = ({ isOpen, onClose, permission, modules, standardActions, onSave, loading, onQuickAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  });
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [permissionType, setPermissionType] = useState("page"); // "page" or "module"
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        guard_name: permission.guard_name || "web",
      });
      const parsed = parsePermissionName(permission.name);
      setSelectedModule(parsed.module);
      setSelectedPage(parsed.page || "");
      setSelectedAction(parsed.action);
      setPermissionType(parsed.page ? "page" : "module");
    } else {
      setFormData({
        name: "",
        guard_name: "web",
      });
      setSelectedModule("");
      setSelectedPage("");
      setSelectedAction("");
      setCustomAction("");
      setPermissionType("page");
    }
    setErrors({});
  }, [permission, isOpen]);

  const handleModuleChange = (moduleName) => {
    setSelectedModule(moduleName.toLowerCase());
    setSelectedPage("");
    updatePermissionName();
  };

  const handlePageChange = (pageSlug) => {
    setSelectedPage(pageSlug);
    updatePermissionName();
  };

  const handleActionChange = (action) => {
    setSelectedAction(action);
    setCustomAction("");
    updatePermissionName();
  };

  const handleCustomActionChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, '_');
    setCustomAction(value);
    setSelectedAction("");
    updatePermissionName();
  };

  const handlePermissionTypeChange = (type) => {
    setPermissionType(type);
    setSelectedPage("");
    updatePermissionName();
  };

  const updatePermissionName = () => {
    let permissionName = "";
    
    if (permissionType === "page" && selectedModule && selectedPage && (selectedAction || customAction)) {
      const action = selectedAction || customAction;
      permissionName = `${selectedModule}.${selectedPage}.${action}`;
    } else if (permissionType === "module" && selectedModule && (selectedAction || customAction)) {
      const action = selectedAction || customAction;
      permissionName = `${selectedModule}.${action}`;
    }
    
    setFormData(prev => ({
      ...prev,
      name: permissionName
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.general = "Please complete all required fields";
    } else if (!formData.name.includes('.')) {
      newErrors.general = "Permission name must follow format: module.action or module.page.action";
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
      setErrors({ 
        general: error.response?.data?.message || "Failed to save permission. Please try again." 
      });
    }
  };

  if (!isOpen) return null;

  const parsed = parsePermissionName(formData.name);
  const moduleDetails = getCategoryDetails(selectedModule || parsed.module);

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
                  Create permissions in format: module.page.action
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

            <div className="space-y-6">
              {/* Permission Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Type *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePermissionTypeChange("page")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${permissionType === "page" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <FaBook className="inline mr-2" /> Page Permission
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePermissionTypeChange("module")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${permissionType === "module" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <FaBox className="inline mr-2" /> Module Permission
                  </button>
                </div>
              </div>

              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Module *
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Choose a module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.name.toLowerCase()}>
                      {module.name} (ID: {module.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Selection (only for page permissions) */}
              {permissionType === "page" && selectedModule && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Slug *
                  </label>
                  <input
                    type="text"
                    value={selectedPage}
                    onChange={(e) => handlePageChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., add_manage_profiles"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use lowercase letters with underscores (e.g., "add_manage_profiles", "employment_history")
                  </p>
                </div>
              )}

              {/* Action Selection */}
              {(selectedModule && (permissionType === "module" || (permissionType === "page" && selectedPage))) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Action *
                  </label>
                  <div className="space-y-2">
                    <select
                      value={selectedAction}
                      onChange={(e) => handleActionChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
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
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use lowercase letters, no spaces (e.g., "approve", "generate_report")
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="font-medium">
                        {permissionType === "page" ? "Page Permission" : "Module Permission"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Action:</span>
                      <PermissionTypeBadge action={selectedAction || customAction} />
                    </div>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Permission Naming Convention</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Permissions follow these formats:
                    </p>
                    <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                      <li>• <strong>Page Permission:</strong> <code className="bg-yellow-100 px-1 py-0.5 rounded">module.page.action</code></li>
                      <li>• <strong>Module Permission:</strong> <code className="bg-yellow-100 px-1 py-0.5 rounded">module.action</code></li>
                      <li>• <strong>Examples:</strong> "employee.add_manage_profiles.view", "payroll.manage", "settings.edit"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.name}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
                {permission ? "Update Permission" : "Create Permission"}
              </button>
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
  const module = getCategoryDetails(parsed.module);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${module.color}`}>
            {module.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{parsed.displayName}</h3>
            <p className="text-sm text-gray-500 mt-1">{module.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {permission.name}
              </code>
              <span className="text-xs text-gray-500">ID: {permission.id}</span>
            </div>
            {parsed.page && (
              <div className="mt-2 flex items-center gap-2">
                <FaBook className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">Page: {parsed.page.replace(/_/g, ' ')}</span>
              </div>
            )}
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
          Type: <span className="font-medium text-gray-700">
            {parsed.type === 'page_permission' ? 'Page Permission' : 'Module Permission'}
          </span>
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

// Module Card Component
const ModuleCard = ({ module, permissions, onClick, isExpanded, onManageModules, onViewPages }) => {
  const modulePermissions = permissions.filter(p => 
    parsePermissionName(p.name).module === module.name.toLowerCase()
  );

  const moduleDetails = getCategoryDetails(module.name.toLowerCase());

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-5 transition-all hover:shadow-md ${
        isExpanded ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={onClick}>
          <div className={`p-3 rounded-lg ${moduleDetails.color}`}>
            {moduleDetails.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{module.name}</h3>
            <p className="text-sm text-gray-500">Module ID: {module.id}</p>
            <p className="text-sm text-gray-500">{modulePermissions.length} permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewPages(module)}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 flex items-center gap-2"
            title="View Pages"
          >
            <FaBook className="h-3 w-3" /> Pages
          </button>
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
            {modulePermissions.map(permission => {
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
    module_delete: "bg-red-600 hover:bg-red-700",
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
  const [view, setView] = useState("modules");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({
    form: false,
    confirm: false,
    moduleManagement: false,
    moduleDetails: false,
    permission: null,
    module: null,
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
      // Fetch modules, permissions, and roles
      const [modulesResponse, permissionsData, rolesData] = await Promise.all([
        permissionService.getModules(),
        permissionService.getPermissions(),
        roleService.getRoles()
      ]);
      
      setModules(modulesResponse);
      setPermissions(permissionsData);
      setRoles(rolesData);
      
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

  // Filter permissions based on search and module
  const filteredPermissions = React.useMemo(() => {
    let filtered = [...permissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parsePermissionName(permission.name).displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (selectedModule && view === "permissions") {
      filtered = filtered.filter(permission => 
        parsePermissionName(permission.name).module === selectedModule.name.toLowerCase()
      );
    }

    return filtered;
  }, [searchTerm, selectedModule, view, permissions]);

  const handleOpenForm = (permission = null) => {
    setModalState(prev => ({ ...prev, form: true, permission }));
  };

  const handleCloseForm = () => {
    setModalState(prev => ({ ...prev, form: false, permission: null }));
  };

  const handleOpenModuleManagement = () => {
    setModalState(prev => ({ ...prev, moduleManagement: true }));
  };

  const handleCloseModuleManagement = () => {
    setModalState(prev => ({ ...prev, moduleManagement: false }));
  };

  const handleOpenModuleDetails = async (module) => {
    try {
      setLoading(true);
      const modulePages = await permissionService.getModulePages(module.id);
      setPages(modulePages);
      setModalState(prev => ({ ...prev, moduleDetails: true, module }));
    } catch (err) {
      setError('Failed to load module pages');
      console.error('Error loading module pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModuleDetails = () => {
    setModalState(prev => ({ ...prev, moduleDetails: false, module: null }));
  };

  const handleOpenConfirm = (permission, type = "delete") => {
    setModalState(prev => ({ ...prev, confirm: true, permission, type }));
  };

  const handleOpenModuleConfirm = (module, type = "module_delete") => {
    setModalState(prev => ({ ...prev, confirm: true, module, type }));
  };

  const handleCloseConfirm = () => {
    setModalState(prev => ({ ...prev, confirm: false, permission: null, module: null, type: "delete" }));
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
      setError(err.response?.data?.message || 'Failed to save permission. Please try again.');
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

  const handleAddModule = async (moduleData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // For now, we'll just add it locally
      const newModule = {
        id: modules.length + 1,
        name: moduleData.name,
        description: moduleData.description
      };
      
      setModules(prev => [...prev, newModule]);
      
      setSuccessMessage(`Module "${moduleData.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error adding module:', err);
      setError('Failed to add module. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleEditModule = async (oldModuleId, moduleData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      setModules(prev => prev.map(m => 
        m.id === oldModuleId 
          ? { ...m, name: moduleData.name, description: moduleData.description }
          : m
      ));
      
      setSuccessMessage(`Module updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error editing module:', err);
      setError('Failed to edit module. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Remove from modules list
      setModules(prev => prev.filter(m => m.id !== moduleId));
      
      setSuccessMessage(`Module deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
      
    } catch (err) {
      console.error('Error deleting module:', err);
      setError('Failed to delete module. Please try again.');
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
              Manage system permissions using module.page.action format
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
            </div>
            <button
              onClick={handleOpenModuleManagement}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FaBox className="h-4 w-4" /> Manage Modules
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
                <FaBox className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {modules.length}
              </span>
            </div>
            <p className="text-sm text-gray-600">Modules</p>
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
                  setView("modules");
                  setSelectedModule(null);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === "modules"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaBox className="inline mr-2" /> Modules View
              </button>
              <button
                onClick={() => {
                  setView("permissions");
                  setSelectedModule(null);
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
                  view === "modules" 
                    ? "Search modules..." 
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
          {view === "modules" ? (
            /* Modules View */
            <div className="space-y-6">
              {modules.map(module => {
                const modulePermissions = permissions.filter(p => 
                  parsePermissionName(p.name).module === module.name.toLowerCase()
                );
                
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    permissions={modulePermissions}
                    onClick={() => {
                      setView("permissions");
                      setSelectedModule(module);
                    }}
                    isExpanded={selectedModule?.id === module.id && view === "permissions"}
                    onManageModules={handleOpenModuleManagement}
                    onViewPages={() => handleOpenModuleDetails(module)}
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
                        onClick={handleOpenModuleManagement}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        <FaBox className="inline mr-2" />
                        Manage Modules
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
                {selectedModule && (
                  <span className="ml-2">
                    in <span className="font-semibold">{selectedModule.name}</span> module
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
        modules={modules}
        standardActions={standardActions}
        onSave={handleSavePermission}
        loading={saving}
      />

      <ModuleManagementModal
        isOpen={modalState.moduleManagement}
        onClose={handleCloseModuleManagement}
        modules={modules}
        onAddModule={handleAddModule}
        onEditModule={handleEditModule}
        onDeleteModule={(moduleId) => handleOpenModuleConfirm({ id: moduleId, name: modules.find(m => m.id === moduleId)?.name }, "module_delete")}
        loading={saving}
      />

      <ModuleDetailsModal
        isOpen={modalState.moduleDetails}
        onClose={handleCloseModuleDetails}
        module={modalState.module}
        pages={pages}
        loading={loading}
      />

      <ConfirmationModal
        isOpen={modalState.confirm}
        onClose={handleCloseConfirm}
        onConfirm={modalState.type === "delete" 
          ? handleDeletePermission 
          : modalState.type === "clone" 
            ? () => handleClonePermission(modalState.permission)
            : () => handleDeleteModule(modalState.module.id)
        }
        title={
          modalState.type === "delete" 
            ? "Delete Permission" 
            : modalState.type === "clone" 
              ? "Clone Permission" 
              : "Delete Module"
        }
        message={
          modalState.type === "delete"
            ? `Are you sure you want to delete "${modalState.permission?.name}"?`
            : modalState.type === "clone"
              ? `Create a copy of "${modalState.permission?.name}"?`
              : `Are you sure you want to delete the "${modalState.module?.name}" module?`
        }
        type={modalState.type}
        loading={saving}
      />
    </div>
  );
}
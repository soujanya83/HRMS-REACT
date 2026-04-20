// RoleManagementPage.jsx - Fixed permission assignment
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUsers,
  FaUserShield,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaCopy,
  FaCheck,
  FaEye,
  FaLock,
  FaUserCheck,
  FaUserCog,
  FaUserTie,
  FaChartBar,
  FaMoneyBill,
  FaCalendar,
  FaFileAlt,
  FaBuilding,
  FaClipboardList,
  FaSpinner,
  FaSync,
  FaExclamationTriangle,
  FaPlusCircle,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaBriefcase,
  FaClock,
  FaCreditCard,
  FaCog,
  FaKey,
  FaHome,
  FaInfoCircle,
  FaFilter,
  FaArrowLeft,
  FaBox,
  FaBook,
  FaChevronRight,
  FaCheckCircle,
  FaRegClock,
  FaShieldAlt,
  FaWrench,
  FaDownload,
  FaUpload,
  FaPlay,
  FaBell,
  FaChartLine,
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import roleService from "../../services/roleService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import axiosClient from "../../axiosClient";

// Module Icons
const moduleIcons = {
  'recruitment': <FaUserTie className="h-5 w-5" />,
  'employee': <FaUsers className="h-5 w-5" />,
  'rostering': <FaClipboardList className="h-5 w-5" />,
  'attendance': <FaCalendar className="h-5 w-5" />,
  'timesheet': <FaClock className="h-5 w-5" />,
  'payroll': <FaMoneyBill className="h-5 w-5" />,
  'performance': <FaChartBar className="h-5 w-5" />,
  'settings': <FaCog className="h-5 w-5" />,
  'organization': <FaBuilding className="h-5 w-5" />,
  'centers': <FaBuilding className="h-5 w-5" />,
};

// Get module display name
const getModuleDisplayName = (module) => {
  const displayNames = {
    'recruitment': 'Recruitment',
    'employee': 'Employee',
    'rostering': 'Rostering',
    'attendance': 'Attendance',
    'timesheet': 'Timesheet',
    'payroll': 'Payroll',
    'performance': 'Performance',
    'settings': 'Settings',
    'organization': 'Organization',
    'centers': 'Centers',
  };
  return displayNames[module] || module.charAt(0).toUpperCase() + module.slice(1);
};

// Get page display name from slug
const getPageDisplayName = (slug) => {
  const pageNames = {
    'job_openings': 'Job Openings',
    'applicants': 'Applicants',
    'interview_scheduling': 'Interview Scheduling',
    'interview': 'Interview',
    'selection_offers': 'Selection & Offers',
    'onboarding': 'Onboarding',
    'manage_profiles': 'Manage Profiles',
    'employment_history': 'Employment History',
    'probation': 'Probation',
    'exit_offboarding': 'Offboarding',
    'shift_scheduling': 'Shift Scheduling',
    'roster_periods': 'Roster Periods',
    'weekly_monthly_rosters': 'Weekly / Monthly Rosters',
    'shift_swapping_requests': 'Shift Swapping Requests',
    'attendance_tracking': 'Attendance Tracking',
    'manual_adjustments': 'Manual Adjustments',
    'leave_requests': 'Leave Requests',
    'leave_balance': 'Leave Balance',
    'holidays_calendars': 'Holidays & Calendars',
    'timesheet_entry': 'Timesheet Entry',
    'timesheet_approvals': 'Approvals',
    'run_payroll': 'Run Payroll',
    'goal_setting': 'Goal Setting',
    'kpi_okr_tracking': 'KPI / OKR Tracking',
    'performance_reviews': 'Performance Reviews',
    'feedback_appraisals': 'Feedback & Appraisals',
    'role_management': 'Role Management',
    'assign_role': 'Assign Role to User',
    'permission_management': 'Permission Management',
    'connect_xero': 'Connect to Xero',
    'organizations': 'Organizations',
  };
  return pageNames[slug] || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Parse permission name
const parsePermission = (permissionName) => {
  const parts = permissionName.split('.');
  if (parts.length === 3) {
    return {
      module: parts[0],
      page: parts[1],
      action: parts[2],
    };
  }
  return null;
};

// Role Card Component
const RoleCard = ({ role, onEdit, onDelete, onView, onClone, loading, userCount }) => {
  const isSystemRole = role.name?.toLowerCase().includes('admin') || role.name?.toLowerCase().includes('super');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50">
            <FaUserShield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{role.name}</h3>
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

// Role Form Modal with API-based Permissions
const RoleFormModal = ({ isOpen, onClose, role, onSave, loading, selectedOrganization, allPermissions }) => {
  const [formData, setFormData] = useState({
    name: "",
    permission_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // Build module-page structure from permissions - use useMemo to prevent recalculation
  const modulePageStructure = useMemo(() => {
    const structure = {};
    allPermissions.forEach(permission => {
      const parsed = parsePermission(permission.name);
      if (parsed && parsed.module && parsed.page && parsed.action) {
        if (!structure[parsed.module]) {
          structure[parsed.module] = {};
        }
        if (!structure[parsed.module][parsed.page]) {
          structure[parsed.module][parsed.page] = [];
        }
        if (!structure[parsed.module][parsed.page].includes(parsed.action)) {
          structure[parsed.module][parsed.page].push(parsed.action);
        }
      }
    });
    return structure;
  }, [allPermissions]);

  const modules = useMemo(() => Object.keys(modulePageStructure).sort(), [modulePageStructure]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: role?.name || "",
        permission_ids: role?.permission_ids || [],
      });
      setErrors({});
      
      const expanded = {};
      modules.forEach(module => {
        expanded[module] = true;
      });
      setExpandedModules(expanded);
    }
  }, [isOpen, role, modules]);

  // Group permissions by module and page for display
  const groupedPermissions = useMemo(() => {
    const grouped = {};
    allPermissions.forEach(permission => {
      const parsed = parsePermission(permission.name);
      if (parsed) {
        if (!grouped[parsed.module]) {
          grouped[parsed.module] = {};
        }
        if (!grouped[parsed.module][parsed.page]) {
          grouped[parsed.module][parsed.page] = [];
        }
        grouped[parsed.module][parsed.page].push(permission);
      }
    });
    return grouped;
  }, [allPermissions]);

  const getTotalSelected = useCallback(() => formData.permission_ids.length, [formData.permission_ids.length]);
  const getTotalPermissions = useCallback(() => allPermissions.length, [allPermissions.length]);

  const toggleModule = useCallback((moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  }, []);

  const handlePermissionToggle = useCallback((permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }));
  }, []);

  const handlePageToggle = useCallback((moduleName, pageSlug) => {
    const pagePermissions = allPermissions.filter(p => {
      const parsed = parsePermission(p.name);
      return parsed && parsed.module === moduleName && parsed.page === pageSlug;
    });
    const pagePermissionIds = pagePermissions.map(p => p.id);
    
    setFormData(prev => {
      const allSelected = pagePermissionIds.every(id => prev.permission_ids.includes(id));
      return {
        ...prev,
        permission_ids: allSelected
          ? prev.permission_ids.filter(id => !pagePermissionIds.includes(id))
          : [...prev.permission_ids, ...pagePermissionIds.filter(id => !prev.permission_ids.includes(id))],
      };
    });
  }, [allPermissions]);

  const handleModuleToggle = useCallback((moduleName) => {
    const modulePermissions = allPermissions.filter(p => {
      const parsed = parsePermission(p.name);
      return parsed && parsed.module === moduleName;
    });
    const modulePermissionIds = modulePermissions.map(p => p.id);
    
    setFormData(prev => {
      const allSelected = modulePermissionIds.every(id => prev.permission_ids.includes(id));
      return {
        ...prev,
        permission_ids: allSelected
          ? prev.permission_ids.filter(id => !modulePermissionIds.includes(id))
          : [...prev.permission_ids, ...modulePermissionIds.filter(id => !prev.permission_ids.includes(id))],
      };
    });
  }, [allPermissions]);

  const handleSelectAll = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permission_ids: allPermissions.map(p => p.id),
    }));
  }, [allPermissions]);

  const handleDeselectAll = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permission_ids: [],
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrors({ name: "Role name is required" });
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ general: error.response?.data?.message || "Failed to save role" });
    }
  }, [formData, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiX className="h-5 w-5 text-gray-500" />
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
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
                {selectedOrganization && (
                  <div className="mt-3 text-sm text-gray-500">
                    Organization: <span className="font-medium">{selectedOrganization.name}</span>
                  </div>
                )}
              </div>

              {/* Permissions Section */}
              {allPermissions.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Module & Page Permissions</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <FaCheck className="h-3 w-3" />
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        <HiX className="h-3 w-3" />
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Modules and Pages Structure */}
                  <div className="space-y-4">
                    {modules.map(module => {
                      const pages = Object.keys(groupedPermissions[module] || {}).sort();
                      let totalSelectedInModule = 0;
                      let totalPermissionsInModule = 0;
                      
                      pages.forEach(page => {
                        const pagePerms = groupedPermissions[module][page];
                        totalPermissionsInModule += pagePerms.length;
                        pagePerms.forEach(perm => {
                          if (formData.permission_ids.includes(perm.id)) {
                            totalSelectedInModule++;
                          }
                        });
                      });
                      
                      const isModuleFullySelected = totalSelectedInModule === totalPermissionsInModule && totalPermissionsInModule > 0;
                      const isModulePartiallySelected = totalSelectedInModule > 0 && totalSelectedInModule < totalPermissionsInModule;
                      const moduleDisplayName = getModuleDisplayName(module);

                      return (
                        <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Module Header */}
                          <div 
                            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                              isModuleFullySelected 
                                ? 'bg-green-50 border-b border-green-200' 
                                : isModulePartiallySelected 
                                ? 'bg-yellow-50 border-b border-yellow-200'
                                : 'bg-gray-50 border-b border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3" onClick={() => toggleModule(module)}>
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                {moduleIcons[module] || <FaList className="h-5 w-5 text-blue-600" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-800 text-lg">{moduleDisplayName}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    isModuleFullySelected 
                                      ? 'bg-green-100 text-green-700' 
                                      : isModulePartiallySelected 
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {totalSelectedInModule}/{totalPermissionsInModule}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {pages.length} pages
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isModuleFullySelected}
                                onChange={() => handleModuleToggle(module)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                type="button"
                                onClick={() => toggleModule(module)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedModules[module] ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            </div>
                          </div>

                          {/* Module Pages */}
                          {expandedModules[module] && (
                            <div className="p-4 bg-white">
                              <div className="space-y-4">
                                {pages.map(page => {
                                  const pagePermissions = groupedPermissions[module][page];
                                  const selectedCount = pagePermissions.filter(p => formData.permission_ids.includes(p.id)).length;
                                  const allSelected = selectedCount === pagePermissions.length;
                                  const someSelected = selectedCount > 0 && selectedCount < pagePermissions.length;
                                  const pageDisplayName = getPageDisplayName(page);

                                  return (
                                    <div key={page} className="border border-gray-200 rounded-lg overflow-hidden">
                                      {/* Page Header */}
                                      <div className={`px-4 py-2 flex items-center justify-between ${
                                        allSelected ? 'bg-green-50' : someSelected ? 'bg-blue-50' : 'bg-gray-50'
                                      }`}>
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => handlePageToggle(module, page)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                          />
                                          <span className="font-medium text-gray-800">{pageDisplayName}</span>
                                          <span className="text-xs text-gray-400">({page})</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {selectedCount}/{pagePermissions.length} selected
                                        </div>
                                      </div>
                                      
                                      {/* Page Actions */}
                                      <div className="p-3 bg-white">
                                        <div className="flex flex-wrap gap-3">
                                          {pagePermissions.map(permission => {
                                            const parsed = parsePermission(permission.name);
                                            const action = parsed?.action || 'unknown';
                                            const isChecked = formData.permission_ids.includes(permission.id);
                                            
                                            const actionLabels = {
                                              view: { label: "View", color: "blue", icon: <FaEye className="h-3 w-3" /> },
                                              add: { label: "Add", color: "green", icon: <FaPlus className="h-3 w-3" /> },
                                              create: { label: "Create", color: "green", icon: <FaPlus className="h-3 w-3" /> },
                                              edit: { label: "Edit", color: "yellow", icon: <FaEdit className="h-3 w-3" /> },
                                              update: { label: "Update", color: "yellow", icon: <FaEdit className="h-3 w-3" /> },
                                              delete: { label: "Delete", color: "red", icon: <FaTrash className="h-3 w-3" /> },
                                              manage: { label: "Manage", color: "purple", icon: <FaCog className="h-3 w-3" /> },
                                              approve: { label: "Approve", color: "green", icon: <FaCheck className="h-3 w-3" /> },
                                              reject: { label: "Reject", color: "red", icon: <HiX className="h-3 w-3" /> },
                                            };
                                            
                                            const actionInfo = actionLabels[action] || { 
                                              label: action.charAt(0).toUpperCase() + action.slice(1), 
                                              color: "gray", 
                                              icon: <FaLock className="h-3 w-3" /> 
                                            };
                                            
                                            return (
                                              <label
                                                key={permission.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                                  isChecked
                                                    ? `bg-${actionInfo.color}-50 border-${actionInfo.color}-300 shadow-sm`
                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                                }`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={() => handlePermissionToggle(permission.id)}
                                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className={`text-sm font-medium text-gray-700 capitalize flex items-center gap-1`}>
                                                  {actionInfo.icon}
                                                  {actionInfo.label}
                                                </span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Permissions Summary */}
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaUserShield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Permissions Summary</h4>
                          <p className="text-sm text-gray-600">
                            {getTotalSelected()} of {getTotalPermissions()} permissions selected
                          </p>
                        </div>
                      </div>
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${(getTotalSelected() / getTotalPermissions()) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
const RoleDetailsModal = ({ isOpen, onClose, role, allPermissions }) => {
  const rolePermissions = allPermissions.filter(p => role?.permission_ids?.includes(p.id)) || [];
  const groupedPermissions = rolePermissions.reduce((acc, perm) => {
    const parsed = parsePermission(perm.name);
    if (parsed) {
      if (!acc[parsed.module]) acc[parsed.module] = [];
      acc[parsed.module].push({ page: parsed.page, action: parsed.action, name: perm.name });
    }
    return acc;
  }, {});

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <HiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">Created</div>
              <div className="text-gray-800">
                {new Date(role.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Permissions</div>
              <div className="text-gray-800">
                {rolePermissions.length} permissions
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions by Module</h3>
          <div className="space-y-4">
            {Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions assigned</p>
            ) : (
              Object.keys(groupedPermissions).sort().map(module => {
                const moduleDisplayName = getModuleDisplayName(module);
                return (
                  <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        {moduleIcons[module] || <FaList className="h-4 w-4 text-blue-600" />}
                        <h4 className="font-semibold text-gray-800">{moduleDisplayName}</h4>
                        <span className="text-xs text-gray-500">({groupedPermissions[module].length})</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="space-y-2">
                        {groupedPermissions[module].map((perm, idx) => {
                          const pageDisplayName = getPageDisplayName(perm.page);
                          const actionLabels = { view: "View", add: "Add", create: "Create", edit: "Edit", update: "Update", delete: "Delete", manage: "Manage" };
                          const actionDisplay = actionLabels[perm.action] || perm.action;
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <FaCheck className="h-3 w-3 text-green-500" />
                              <span className="text-sm text-gray-700">
                                {pageDisplayName} - {actionDisplay}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${type === "delete" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
            {type === "delete" ? <FaTrash className="h-6 w-6" /> : <FaCopy className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className={`px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors ${type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
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
  
  const [modalState, setModalState] = useState({
    form: false,
    details: false,
    confirm: false,
    type: "delete",
    role: null,
  });

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axiosClient.get('/permissions');
      let permissionsArray = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        permissionsArray = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        permissionsArray = response.data;
      } else if (Array.isArray(response)) {
        permissionsArray = response;
      }
      
      // Filter permissions for current organization
      const filteredPermissions = permissionsArray.filter(p => p.organization_id === selectedOrganization?.id);
      return filteredPermissions;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }, [selectedOrganization]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        fetchPermissions(),
      ]);
      
      let rolesArray = [];
      if (rolesData && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      } else if (rolesData && Array.isArray(rolesData)) {
        rolesArray = rolesData;
      } else if (rolesData && rolesData.success && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      }
      
      setRoles(rolesArray);
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPermissions]);

  // Function to sync permissions to a role using POST /roles/{roleId}/permissions
  const syncRolePermissions = useCallback(async (roleId, permissionIds) => {
    try {
      // First get the permission names from the IDs
      const selectedPermissions = permissions.filter(p => permissionIds.includes(p.id));
      const permissionNames = selectedPermissions.map(p => p.name);
      
      console.log('🔄 Syncing permissions for role:', roleId);
      console.log('📋 Permission IDs:', permissionIds);
      console.log('📋 Permission Names:', permissionNames);
      
      // Call the sync permissions API
      const response = await axiosClient.post(`/roles/${roleId}/permissions`, {
        permissions: permissionNames
      });
      
      console.log('✅ Permissions synced successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error syncing permissions:', error);
      throw error;
    }
  }, [permissions]);

  const handleSaveRole = useCallback(async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let savedRole;
      
      if (modalState.role) {
        // Update existing role
        savedRole = await roleService.updateRole(modalState.role.id, {
          name: formData.name,
          guard_name: 'web',
        });
        
        // Sync permissions after update
        if (formData.permission_ids && formData.permission_ids.length > 0) {
          await syncRolePermissions(savedRole.id, formData.permission_ids);
        }
        
        setRoles(prev => prev.map(role => role.id === modalState.role.id ? savedRole : role));
        setSuccessMessage(`Role "${savedRole.name}" updated successfully with ${formData.permission_ids.length} permissions!`);
      } else {
        // Create new role first
        const newRole = await roleService.createRole({
          name: formData.name,
          guard_name: 'web',
          organization_id: selectedOrganization?.id,
        });
        
        savedRole = newRole;
        
        // Then sync permissions to the newly created role
        if (formData.permission_ids && formData.permission_ids.length > 0) {
          await syncRolePermissions(savedRole.id, formData.permission_ids);
        }
        
        setRoles(prev => [...prev, savedRole]);
        setSuccessMessage(`Role "${savedRole.name}" created successfully with ${formData.permission_ids.length} permissions!`);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData(); // Refresh the data
      handleCloseForm();
    } catch (err) {
      console.error('Error saving role:', err);
      setError(err.response?.data?.message || 'Failed to save role. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [modalState.role, selectedOrganization, syncRolePermissions, fetchData]);

  const handleDeleteRole = useCallback(async () => {
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
  }, [modalState.role]);

  const handleCloneRole = useCallback(async (role) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First fetch the permissions of the original role to ensure we have them all
      const permResponse = await roleService.getRolePermissions(role.id);
      const permissionIds = (permResponse.permissions || []).map(p => p.id);
      
      // Create a new role with copy name
      const newRole = await roleService.createRole({
        name: `${role.name} (Copy)`,
        guard_name: 'web',
        organization_id: selectedOrganization?.id,
      });
      
      // Copy permissions from original role
      if (permissionIds.length > 0) {
        await syncRolePermissions(newRole.id, permissionIds);
      }
      
      setRoles(prev => [...prev, newRole]);
      setSuccessMessage(`Role "${newRole.name}" cloned successfully with ${permissionIds.length} permissions!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
      fetchData();
    } catch (err) {
      console.error('Error cloning role:', err);
      setError('Failed to clone role. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [selectedOrganization, syncRolePermissions, fetchData]);

  const handleOpenForm = useCallback(async (role = null) => {
    if (role) {
      setLoading(true);
      try {
        const response = await roleService.getRolePermissions(role.id);
        const permissionIds = (response.permissions || []).map(p => p.id);
        const enrichedRole = { ...role, permission_ids: permissionIds };
        setModalState(prev => ({ ...prev, form: true, role: enrichedRole }));
      } catch (err) {
        console.error('Failed to fetch role permissions:', err);
        setError('Failed to load role permissions. Opening with current state.');
        setModalState(prev => ({ ...prev, form: true, role }));
      } finally {
        setLoading(false);
      }
    } else {
      setModalState(prev => ({ ...prev, form: true, role: null }));
    }
  }, []);

  const handleCloseForm = useCallback(() => {
    setModalState(prev => ({ ...prev, form: false, role: null }));
  }, []);

  const handleOpenDetails = useCallback(async (role) => {
    setLoading(true);
    try {
      const response = await roleService.getRolePermissions(role.id);
      const permissionIds = (response.permissions || []).map(p => p.id);
      const enrichedRole = { ...role, permission_ids: permissionIds };
      setModalState(prev => ({ ...prev, details: true, role: enrichedRole }));
    } catch (err) {
      console.error('Failed to fetch role permissions:', err);
      setError('Failed to load role permissions.');
      setModalState(prev => ({ ...prev, details: true, role }));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
    setModalState(prev => ({ ...prev, details: false, role: null }));
  }, []);

  const handleOpenConfirm = useCallback((role, type = "delete") => {
    setModalState(prev => ({ ...prev, confirm: true, role, type }));
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setModalState(prev => ({ ...prev, confirm: false, role: null, type: "delete" }));
  }, []);

  const filteredRoles = roles.filter(role => {
    if (role.name?.toLowerCase() === 'superadmin') return false;
    return role.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalRoles = roles.filter(r => r.name?.toLowerCase() !== 'superadmin').length;

  if (!selectedOrganization?.id) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading roles and permissions...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {selectedOrganization.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
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
          <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <FaPlus className="h-4 w-4" /> Create New Role
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-50"><FaUserShield className="h-6 w-6 text-blue-600" /></div>
              <span className="text-lg font-bold text-gray-800">{totalRoles}</span>
            </div>
            <p className="text-sm text-gray-600">Total Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-50"><FaList className="h-6 w-6 text-green-600" /></div>
              <span className="text-lg font-bold text-gray-800">{permissions.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Permissions</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50"><FaUserCog className="h-6 w-6 text-purple-600" /></div>
              <span className="text-lg font-bold text-gray-800">{roles.filter(r => r.name?.toLowerCase().includes('admin') && r.name?.toLowerCase() !== 'superadmin').length}</span>
            </div>
            <p className="text-sm text-gray-600">Admin Roles</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-50"><FaUserCheck className="h-6 w-6 text-orange-600" /></div>
              <span className="text-lg font-bold text-gray-800">{roles.filter(r => !r.name?.toLowerCase().includes('admin') && r.name?.toLowerCase() !== 'superadmin').length}</span>
            </div>
            <p className="text-sm text-gray-600">Custom Roles</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-grow min-w-[250px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search roles by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
              <FaSync className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4"><FaUserShield className="h-16 w-16 mx-auto" /></div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">{searchTerm ? "No roles found" : "No roles available"}</h3>
              <p className="text-gray-500 mb-4">{searchTerm ? "Try adjusting your search" : "Create your first role to get started"}</p>
              {!searchTerm && (
                <button onClick={() => handleOpenForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  <FaPlus className="inline mr-2" /> Create First Role
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

        {filteredRoles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">Showing <span className="font-semibold">{filteredRoles.length}</span> of <span className="font-semibold">{totalRoles}</span> roles</div>
              <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={modalState.form}
        onClose={handleCloseForm}
        role={modalState.role}
        onSave={handleSaveRole}
        loading={saving}
        selectedOrganization={selectedOrganization}
        allPermissions={permissions}
      />

      <RoleDetailsModal
        isOpen={modalState.details}
        onClose={handleCloseDetails}
        role={modalState.role}
        allPermissions={permissions}
      />

      <ConfirmationModal
        isOpen={modalState.confirm}
        onClose={handleCloseConfirm}
        onConfirm={modalState.type === "delete" ? handleDeleteRole : () => handleCloneRole(modalState.role)}
        title={modalState.type === "delete" ? "Delete Role" : "Clone Role"}
        message={modalState.type === "delete" ? `Are you sure you want to delete "${modalState.role?.name}"? This action cannot be undone.` : `Create a copy of "${modalState.role?.name}"? You can modify the duplicate.`}
        type={modalState.type}
        loading={saving}
      />
    </div>
  );
}
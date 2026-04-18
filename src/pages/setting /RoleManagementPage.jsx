// RoleManagementPage.jsx - Complete with all imports
import React, { useState, useEffect } from "react";
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

// Page definitions with their permissions
const PAGE_ACTIONS = ['view', 'add', 'edit', 'delete'];

// Define all pages/modules with their permissions
const MODULES_AND_PAGES = [
  {
    module: "Recruitment",
    pages: [
      { name: "Job Openings", slug: "job_openings" },
      { name: "Applicants", slug: "applicants" },
      { name: "Interview Scheduling", slug: "interview_scheduling" },
      { name: "Interview", slug: "interview" },
      { name: "Selection & Offers", slug: "selection_offers" },
      { name: "Onboarding", slug: "onboarding" },
    ]
  },
  {
    module: "Employee",
    pages: [
      { name: "Manage Profiles", slug: "manage_profiles" },
      { name: "Employment History", slug: "employment_history" },
      { name: "Probation", slug: "probation" },
      { name: "Offboarding", slug: "offboarding" },
    ]
  },
  {
    module: "Rostering",
    pages: [
      { name: "Shift Scheduling", slug: "shift_scheduling" },
      { name: "Roster Periods", slug: "roster_periods" },
      { name: "Weekly / Monthly Rosters", slug: "weekly_monthly_rosters" },
      { name: "Shift Swapping Requests", slug: "shift_swapping" },
    ]
  },
  {
    module: "Attendance",
    pages: [
      { name: "Attendance Tracking", slug: "attendance_tracking" },
      { name: "Manual Adjustments", slug: "manual_adjustments" },
      { name: "Leave Requests", slug: "leave_requests" },
      { name: "Leave Balance", slug: "leave_balance" },
      { name: "Holidays & Calendars", slug: "holidays_calendars" },
    ]
  },
  {
    module: "Timesheet",
    pages: [
      { name: "Timesheet Entry", slug: "timesheet_entry" },
      { name: "Approvals", slug: "approvals" },
    ]
  },
  {
    module: "Payroll",
    pages: [
      { name: "Run Payroll", slug: "run_payroll" },
    ]
  },
  {
    module: "Performance",
    pages: [
      { name: "Goal Setting", slug: "goal_setting" },
      { name: "KPI / OKR Tracking", slug: "kpi_okr_tracking" },
      { name: "Performance Reviews", slug: "performance_reviews" },
      { name: "Feedback & Appraisals", slug: "feedback_appraisals" },
    ]
  },
  {
    module: "Settings",
    pages: [
      { name: "Role Management", slug: "role_management" },
      { name: "Assign Role to User", slug: "assign_role" },
      { name: "Permission Management", slug: "permission_management" },
      { name: "Connect to Xero", slug: "connect_xero" },
    ]
  },
  {
    module: "Centers",
    pages: [
      { name: "Organizations", slug: "organizations" },
    ]
  }
];

// Module Icons
const moduleIcons = {
  'Recruitment': <FaUserTie className="h-5 w-5" />,
  'Employee': <FaUsers className="h-5 w-5" />,
  'Rostering': <FaClipboardList className="h-5 w-5" />,
  'Attendance': <FaCalendar className="h-5 w-5" />,
  'Timesheet': <FaClock className="h-5 w-5" />,
  'Payroll': <FaMoneyBill className="h-5 w-5" />,
  'Performance': <FaChartBar className="h-5 w-5" />,
  'Settings': <FaCog className="h-5 w-5" />,
  'Centers': <FaBuilding className="h-5 w-5" />,
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

// Role Form Modal with Page-based Permissions
const RoleFormModal = ({ isOpen, onClose, role, onSave, loading, selectedOrganization }) => {
  const [formData, setFormData] = useState({
    name: "",
    permissions: {},
  });
  const [errors, setErrors] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialPermissions = {};
      MODULES_AND_PAGES.forEach(module => {
        initialPermissions[module.module] = {};
        module.pages.forEach(page => {
          initialPermissions[module.module][page.slug] = {
            view: false,
            add: false,
            edit: false,
            delete: false
          };
        });
      });
      
      if (role && role.permissions) {
        Object.keys(initialPermissions).forEach(moduleName => {
          Object.keys(initialPermissions[moduleName]).forEach(pageSlug => {
            PAGE_ACTIONS.forEach(action => {
              const permissionName = `${moduleName.toLowerCase()}.${pageSlug}.${action}`;
              if (role.permissions[permissionName]) {
                initialPermissions[moduleName][pageSlug][action] = true;
              }
            });
          });
        });
      }
      
      setFormData({
        name: role?.name || "",
        permissions: initialPermissions,
      });
      setErrors({});
      
      const expanded = {};
      MODULES_AND_PAGES.forEach(module => {
        expanded[module.module] = true;
      });
      setExpandedModules(expanded);
    }
  }, [role, isOpen]);

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  const handlePagePermissionChange = (moduleName, pageSlug, action, isChecked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [pageSlug]: {
            ...prev.permissions[moduleName][pageSlug],
            [action]: isChecked
          }
        }
      }
    }));
  };

  const handleSelectAllPagePermissions = (moduleName, pageSlug) => {
    const currentPagePerms = formData.permissions[moduleName]?.[pageSlug] || {};
    const allSelected = PAGE_ACTIONS.every(action => currentPagePerms[action] === true);
    
    const newPagePerms = {};
    PAGE_ACTIONS.forEach(action => {
      newPagePerms[action] = !allSelected;
    });
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [pageSlug]: newPagePerms
        }
      }
    }));
  };

  const handleSelectAllModulePermissions = (moduleName) => {
    const module = MODULES_AND_PAGES.find(m => m.module === moduleName);
    if (!module) return;
    
    let allSelected = true;
    module.pages.forEach(page => {
      PAGE_ACTIONS.forEach(action => {
        if (!formData.permissions[moduleName]?.[page.slug]?.[action]) {
          allSelected = false;
        }
      });
    });
    
    const newPermissions = { ...formData.permissions };
    module.pages.forEach(page => {
      if (!newPermissions[moduleName][page.slug]) {
        newPermissions[moduleName][page.slug] = {};
      }
      PAGE_ACTIONS.forEach(action => {
        newPermissions[moduleName][page.slug][action] = !allSelected;
      });
    });
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  const handleSelectAll = () => {
    const newPermissions = { ...formData.permissions };
    MODULES_AND_PAGES.forEach(module => {
      module.pages.forEach(page => {
        if (!newPermissions[module.module][page.slug]) {
          newPermissions[module.module][page.slug] = {};
        }
        PAGE_ACTIONS.forEach(action => {
          newPermissions[module.module][page.slug][action] = true;
        });
      });
    });
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  const handleDeselectAll = () => {
    const newPermissions = { ...formData.permissions };
    MODULES_AND_PAGES.forEach(module => {
      module.pages.forEach(page => {
        if (newPermissions[module.module][page.slug]) {
          PAGE_ACTIONS.forEach(action => {
            newPermissions[module.module][page.slug][action] = false;
          });
        }
      });
    });
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrors({ name: "Role name is required" });
      return;
    }

    const submitData = {
      name: formData.name,
      permissions: formData.permissions,
    };

    try {
      await onSave(submitData);
      onClose();
    } catch (error) {
      setErrors({ general: error.response?.data?.message || "Failed to save role" });
    }
  };

  if (!isOpen) return null;

  const getTotalSelected = () => {
    let total = 0;
    MODULES_AND_PAGES.forEach(module => {
      module.pages.forEach(page => {
        PAGE_ACTIONS.forEach(action => {
          if (formData.permissions[module.module]?.[page.slug]?.[action]) {
            total++;
          }
        });
      });
    });
    return total;
  };

  const getTotalPermissions = () => {
    let total = 0;
    MODULES_AND_PAGES.forEach(module => {
      total += module.pages.length * PAGE_ACTIONS.length;
    });
    return total;
  };

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
                  {MODULES_AND_PAGES.map(module => {
                    const moduleName = module.module;
                    const pages = module.pages;
                    
                    let totalSelectedInModule = 0;
                    let totalPermissionsInModule = pages.length * PAGE_ACTIONS.length;
                    pages.forEach(page => {
                      PAGE_ACTIONS.forEach(action => {
                        if (formData.permissions[moduleName]?.[page.slug]?.[action]) {
                          totalSelectedInModule++;
                        }
                      });
                    });
                    
                    const isModuleFullySelected = totalSelectedInModule === totalPermissionsInModule && totalPermissionsInModule > 0;
                    const isModulePartiallySelected = totalSelectedInModule > 0 && totalSelectedInModule < totalPermissionsInModule;

                    return (
                      <div key={moduleName} className="border border-gray-200 rounded-lg overflow-hidden">
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
                          <div className="flex items-center gap-3" onClick={() => toggleModule(moduleName)}>
                            <div className="p-2 rounded-lg bg-white shadow-sm">
                              {moduleIcons[moduleName] || <FaList className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800 text-lg">{moduleName}</h3>
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
                                {pages.length} pages • {PAGE_ACTIONS.length} actions each
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isModuleFullySelected}
                              onChange={() => handleSelectAllModulePermissions(moduleName)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              onClick={() => toggleModule(moduleName)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedModules[moduleName] ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                        </div>

                        {/* Module Pages */}
                        {expandedModules[moduleName] && (
                          <div className="p-4 bg-white">
                            <div className="space-y-4">
                              {pages.map(page => {
                                const pageSlug = page.slug;
                                const pagePermissions = formData.permissions[moduleName]?.[pageSlug] || {};
                                const allPageActionsSelected = PAGE_ACTIONS.every(action => pagePermissions[action] === true);
                                const somePageActionsSelected = PAGE_ACTIONS.some(action => pagePermissions[action] === true);
                                
                                return (
                                  <div key={pageSlug} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Page Header */}
                                    <div className={`px-4 py-2 flex items-center justify-between ${
                                      allPageActionsSelected ? 'bg-green-50' : somePageActionsSelected ? 'bg-blue-50' : 'bg-gray-50'
                                    }`}>
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={allPageActionsSelected}
                                          onChange={() => handleSelectAllPagePermissions(moduleName, pageSlug)}
                                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="font-medium text-gray-800">{page.name}</span>
                                        <span className="text-xs text-gray-400">({pageSlug})</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {PAGE_ACTIONS.filter(a => pagePermissions[a]).length}/{PAGE_ACTIONS.length} selected
                                      </div>
                                    </div>
                                    
                                    {/* Page Actions */}
                                    <div className="p-3 bg-white">
                                      <div className="flex flex-wrap gap-3">
                                        {PAGE_ACTIONS.map(action => {
                                          const isChecked = pagePermissions[action] === true;
                                          const actionLabels = {
                                            view: { label: "View", color: "blue", icon: <FaEye className="h-3 w-3" /> },
                                            add: { label: "Add", color: "green", icon: <FaPlus className="h-3 w-3" /> },
                                            edit: { label: "Edit", color: "yellow", icon: <FaEdit className="h-3 w-3" /> },
                                            delete: { label: "Delete", color: "red", icon: <FaTrash className="h-3 w-3" /> }
                                          };
                                          const actionInfo = actionLabels[action];
                                          
                                          return (
                                            <label
                                              key={action}
                                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                                isChecked
                                                  ? `bg-${actionInfo.color}-50 border-${actionInfo.color}-300 shadow-sm`
                                                  : "bg-white border-gray-200 hover:bg-gray-50"
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handlePagePermissionChange(moduleName, pageSlug, action, !isChecked)}
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
const RoleDetailsModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  const getSelectedPermissions = () => {
    const selected = [];
    if (role.permissions) {
      Object.keys(role.permissions).forEach(moduleName => {
        Object.keys(role.permissions[moduleName]).forEach(pageSlug => {
          PAGE_ACTIONS.forEach(action => {
            if (role.permissions[moduleName][pageSlug]?.[action]) {
              selected.push({ module: moduleName, page: pageSlug, action });
            }
          });
        });
      });
    }
    return selected;
  };

  const selectedPermissions = getSelectedPermissions();
  const groupedByModule = selectedPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
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

        <div className="p-6 overflow-y-auto">
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
                {selectedPermissions.length} permissions
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions by Module</h3>
          <div className="space-y-4">
            {Object.keys(groupedByModule).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions assigned</p>
            ) : (
              Object.keys(groupedByModule).sort().map(module => (
                <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      {moduleIcons[module] || <FaList className="h-4 w-4 text-blue-600" />}
                      <h4 className="font-semibold text-gray-800">{module}</h4>
                      <span className="text-xs text-gray-500">({groupedByModule[module].length})</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {groupedByModule[module].map((perm, idx) => {
                        const pageInfo = MODULES_AND_PAGES
                          .find(m => m.module === module)
                          ?.pages.find(p => p.slug === perm.page);
                        const actionLabels = { view: "View", add: "Add", edit: "Edit", delete: "Delete" };
                        
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <FaCheck className="h-3 w-3 text-green-500" />
                            <span className="text-sm text-gray-700">
                              {pageInfo?.name || perm.page} - {actionLabels[perm.action] || perm.action}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
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
      fetchRoles();
    }
  }, [selectedOrganization]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await roleService.getRoles();
      
      let rolesArray = [];
      if (rolesData && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      } else if (rolesData && Array.isArray(rolesData)) {
        rolesArray = rolesData;
      } else if (rolesData && rolesData.success && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      }
      
      setRoles(rolesArray);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError(err.response?.data?.message || 'Failed to load roles. Please try again.');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let savedRole;
      
      if (modalState.role) {
        savedRole = await roleService.updateRole(modalState.role.id, {
          name: formData.name,
          permissions: formData.permissions,
        });
        setRoles(prev => prev.map(role => role.id === modalState.role.id ? savedRole : role));
        setSuccessMessage(`Role "${savedRole.name}" updated successfully!`);
      } else {
        savedRole = await roleService.createRole({
          name: formData.name,
          permissions: formData.permissions,
          organization_id: selectedOrganization?.id,
        });
        setRoles(prev => [...prev, savedRole]);
        setSuccessMessage(`Role "${savedRole.name}" created successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
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
        permissions: role.permissions || {},
        organization_id: selectedOrganization?.id,
      };
      
      const savedRole = await roleService.createRole(newRoleData);
      setRoles(prev => [...prev, savedRole]);
      setSuccessMessage(`Role "${savedRole.name}" cloned successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
      fetchRoles();
    } catch (err) {
      console.error('Error cloning role:', err);
      setError('Failed to clone role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-gray-600">Loading roles...</p>
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
              <span className="text-lg font-bold text-gray-800">{MODULES_AND_PAGES.reduce((total, m) => total + (m.pages.length * PAGE_ACTIONS.length), 0)}</span>
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
            <button onClick={fetchRoles} className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
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
      />

      <RoleDetailsModal
        isOpen={modalState.details}
        onClose={handleCloseDetails}
        role={modalState.role}
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
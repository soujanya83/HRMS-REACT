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
  FaShieldAlt,
  FaChartBar,
  FaCog,
  FaMoneyBill,
  FaCalendar,
  FaFileAlt,
  FaClipboardList,
  FaRegClock,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSync,
  FaEye,
  FaBuilding,
  FaUserTie,
  FaChartLine,
  FaBell,
  FaCreditCard,
  FaWrench,
  FaDownload,
  FaUpload,
  FaPlay,
  FaBook,
  FaBox,
  FaArrowLeft,
  FaChevronRight,
  FaFilter,
  FaHome,
  FaCheckCircle,
  FaListUl,
} from "react-icons/fa";
import permissionService from "../../services/permissionService";

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Safe getModuleDetails function
const getModuleDetails = (moduleName) => {
  if (!moduleName || typeof moduleName !== 'string') {
    return {
      name: 'Unknown Module',
      icon: <FaBox className="h-6 w-6" />,
      color: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }

  const safeName = moduleName.toLowerCase().trim();
  
  const iconMap = {
    recruitment: <FaUserTie className="h-6 w-6" />,
    employee: <FaUsers className="h-6 w-6" />,
    rostering: <FaClipboardList className="h-6 w-6" />,
    attendance: <FaCalendar className="h-6 w-6" />,
    timesheet: <FaRegClock className="h-6 w-6" />,
    payroll: <FaMoneyBill className="h-6 w-6" />,
    performance: <FaChartBar className="h-6 w-6" />,
    settings: <FaCog className="h-6 w-6" />,
    organization: <FaBuilding className="h-6 w-6" />,
    organizations: <FaBuilding className="h-6 w-6" />,
    reports: <FaChartLine className="h-6 w-6" />,
    notifications: <FaBell className="h-6 w-6" />,
    finance: <FaCreditCard className="h-6 w-6" />,
    system: <FaWrench className="h-6 w-6" />,
    default: <FaBox className="h-6 w-6" />,
  };
  
  const colorMap = {
    recruitment: "bg-purple-100 text-purple-600 border-purple-200",
    employee: "bg-green-100 text-green-600 border-green-200",
    rostering: "bg-indigo-100 text-indigo-600 border-indigo-200",
    attendance: "bg-yellow-100 text-yellow-600 border-yellow-200",
    timesheet: "bg-blue-100 text-blue-600 border-blue-200",
    payroll: "bg-red-100 text-red-600 border-red-200",
    performance: "bg-pink-100 text-pink-600 border-pink-200",
    settings: "bg-gray-100 text-gray-600 border-gray-200",
    organization: "bg-teal-100 text-teal-600 border-teal-200",
    organizations: "bg-teal-100 text-teal-600 border-teal-200",
    reports: "bg-cyan-100 text-cyan-600 border-cyan-200",
    notifications: "bg-amber-100 text-amber-600 border-amber-200",
    finance: "bg-emerald-100 text-emerald-600 border-emerald-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
  };
  
  const icon = iconMap[safeName] || iconMap.default;
  const color = colorMap[safeName] || colorMap.default;
  const displayName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
  
  return { name: displayName, icon, color };
};

// Parse permission name
const parsePermissionName = (name) => {
  if (!name || typeof name !== 'string') {
    return {
      module: 'unknown',
      page: '',
      action: 'unknown',
      type: 'other',
      displayName: 'Unknown Permission'
    };
  }
  
  const parts = name.split('.');
  if (parts.length === 3) {
    // module.page.action format
    return {
      module: parts[0],
      page: parts[1],
      action: parts[2],
      type: 'page_permission',
      displayName: `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].replace(/_/g, ' ')} ${parts[2]}`.replace(/\b\w/g, l => l.toUpperCase())
    };
  } else if (parts.length === 2) {
    // module.action format
    return {
      module: parts[0],
      page: '',
      action: parts[1],
      type: 'module_permission',
      displayName: `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`.replace(/\b\w/g, l => l.toUpperCase())
    };
  }
  return {
    module: 'other',
    page: '',
    action: name,
    type: 'other',
    displayName: name.replace(/\b\w/g, l => l.toUpperCase())
  };
};

// Permission Type Badge
const PermissionTypeBadge = ({ action }) => {
  if (!action || typeof action !== 'string') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <FaLock className="h-3 w-3" />
        Unknown
      </span>
    );
  }

  const safeAction = action.toLowerCase();
  
  const typeConfig = {
    view: { color: "bg-blue-100 text-blue-800 border border-blue-200", icon: <FaEye className="h-3 w-3" />, label: "View" },
    create: { color: "bg-green-100 text-green-800 border border-green-200", icon: <FaPlus className="h-3 w-3" />, label: "Create" },
    add: { color: "bg-green-100 text-green-800 border border-green-200", icon: <FaPlus className="h-3 w-3" />, label: "Add" },
    edit: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200", icon: <FaEdit className="h-3 w-3" />, label: "Edit" },
    delete: { color: "bg-red-100 text-red-800 border border-red-200", icon: <FaTrash className="h-3 w-3" />, label: "Delete" },
    manage: { color: "bg-purple-100 text-purple-800 border border-purple-200", icon: <FaCog className="h-3 w-3" />, label: "Manage" },
    run: { color: "bg-indigo-100 text-indigo-800 border border-indigo-200", icon: <FaPlay className="h-3 w-3" />, label: "Run" },
    approve: { color: "bg-green-100 text-green-800 border border-green-200", icon: <FaCheck className="h-3 w-3" />, label: "Approve" },
    reject: { color: "bg-red-100 text-red-800 border border-red-200", icon: <FaTimes className="h-3 w-3" />, label: "Reject" },
    export: { color: "bg-blue-100 text-blue-800 border border-blue-200", icon: <FaDownload className="h-3 w-3" />, label: "Export" },
    import: { color: "bg-green-100 text-green-800 border border-green-200", icon: <FaUpload className="h-3 w-3" />, label: "Import" },
    assign: { color: "bg-purple-100 text-purple-800 border border-purple-200", icon: <FaUsers className="h-3 w-3" />, label: "Assign" },
    review: { color: "bg-yellow-100 text-yellow-800 border border-yellow-200", icon: <FaEye className="h-3 w-3" />, label: "Review" },
    generate: { color: "bg-indigo-100 text-indigo-800 border border-indigo-200", icon: <FaFileAlt className="h-3 w-3" />, label: "Generate" },
    schedule: { color: "bg-blue-100 text-blue-800 border border-blue-200", icon: <FaCalendar className="h-3 w-3" />, label: "Schedule" },
    track: { color: "bg-green-100 text-green-800 border border-green-200", icon: <FaChartLine className="h-3 w-3" />, label: "Track" },
  };

  const config = typeConfig[safeAction] || { 
    color: "bg-gray-100 text-gray-800 border border-gray-200", 
    icon: <FaLock className="h-3 w-3" />,
    label: safeAction.charAt(0).toUpperCase() + safeAction.slice(1)
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ============================================
// PAGE 1: MODULES PAGE (ONE PER LINE - PROPER ALIGNMENT)
// ============================================
const ModulesPage = ({ modules, onViewPages, loading }) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Modules</h2>
        <p className="text-gray-600">Select a module to view its pages and permissions</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading modules...</span>
        </div>
      ) : !modules || modules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FaBox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Modules Found</h3>
          <p className="text-gray-500">No modules are available in the system</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map(module => {
            const details = getModuleDetails(module.name.toLowerCase());
            
            return (
              <div key={module.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`p-3 rounded-lg ${details.color} flex-shrink-0`}>
                      {details.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg truncate">
                          {module.name || 'Unnamed Module'}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                          ID: {module.id || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click the button to view all pages in this module
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => onViewPages(module)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium whitespace-nowrap"
                    >
                      <FaBook className="h-4 w-4" /> View All Pages
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// PAGE 2: MODULE PAGES PAGE (ONE PER LINE - PROPER ALIGNMENT)
// ============================================
const ModulePagesPage = ({ module, pages, onOpenForm, onViewPermissions, onBack, loading }) => {
  const moduleDetails = getModuleDetails(module?.name?.toLowerCase() || '');

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 group"
        >
          <FaArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Modules
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg ${moduleDetails.color} flex-shrink-0`}>
            {moduleDetails.icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 truncate">{module?.name || 'Unknown'} Module</h2>
            <p className="text-gray-600 truncate">Select a page to create or view permissions</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading pages...</span>
        </div>
      ) : !pages || pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FaBook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Pages Found</h3>
          <p className="text-gray-500">This module doesn't have any pages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map(page => (
            <div key={page.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600 border border-green-200 flex-shrink-0">
                    <FaBook className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg truncate">
                        {page.name || 'Unnamed Page'}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                        ID: {page.id || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 truncate">
                      Slug: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200 font-mono">{page.slug || 'N/A'}</code>
                    </p>
                    <p className="text-sm text-gray-600">
                      Create permissions or view existing ones for this page
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => onOpenForm(module, page)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium whitespace-nowrap"
                  >
                    <FaPlus className="h-4 w-4" /> Create Permission
                  </button>
                  <button
                    onClick={() => onViewPermissions(module, page)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium whitespace-nowrap"
                  >
                    <FaEye className="h-4 w-4" /> View Permissions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Module Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <FaInfoCircle className="h-5 w-5" />
          About {module?.name || 'Unknown'} Module
        </h4>
        <p className="text-sm text-blue-700">
          This module has {pages?.length || 0} page{pages?.length !== 1 ? 's' : ''}. 
          Each page can have permissions in the format: 
          <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">
            {module?.name?.toLowerCase() || 'module'}.page_slug.action
          </code>
        </p>
      </div>
    </div>
  );
};

// ============================================
// PAGE 3: PAGE PERMISSIONS PAGE (ONE PER LINE - PROPER ALIGNMENT)
// ============================================
const PagePermissionsPage = ({ module, page, permissions, onBack, onOpenForm, loading }) => {
  const moduleDetails = getModuleDetails(module?.name?.toLowerCase() || '');
  
  // Filter permissions for this specific page
  const pagePermissions = React.useMemo(() => {
    if (!module || !page || !permissions) return [];
    
    const moduleName = module.name.toLowerCase();
    const pageSlug = page.slug;
    
    return permissions.filter(p => {
      const parsed = parsePermissionName(p.name);
      return parsed.module === moduleName && parsed.page === pageSlug;
    });
  }, [module, page, permissions]);

  // Get all unique actions
  const uniqueActions = React.useMemo(() => {
    const actions = new Set();
    pagePermissions.forEach(p => {
      const parsed = parsePermissionName(p.name);
      if (parsed.action) actions.add(parsed.action);
    });
    return Array.from(actions);
  }, [pagePermissions]);

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
          <button
            onClick={() => onBack('modules')}
            className="hover:text-gray-800 flex items-center gap-1 group"
          >
            <FaHome className="h-3 w-3" />
            <span className="group-hover:underline">Modules</span>
          </button>
          <FaChevronRight className="h-3 w-3" />
          <button
            onClick={() => onBack('pages')}
            className="hover:text-gray-800 flex items-center gap-1 group"
          >
            <FaBox className="h-3 w-3" />
            <span className="group-hover:underline truncate max-w-[100px]">{module?.name || 'Module'}</span>
          </button>
          <FaChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-800 flex items-center gap-1">
            <FaBook className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{page?.name || 'Page'} Permissions</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-lg ${moduleDetails.color} flex-shrink-0`}>
              {moduleDetails.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-800 truncate">{page?.name || 'Page'} Permissions</h2>
              <div className="flex items-center gap-2 text-gray-600 flex-wrap">
                <span>Module: <span className="font-medium">{module?.name || 'Unknown'}</span></span>
                <span className="hidden md:inline">•</span>
                <span>Slug: <code className="bg-gray-100 px-2 py-0.5 rounded ml-1 font-mono truncate max-w-[200px]">{page?.slug || 'N/A'}</code></span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenForm(module, page)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium whitespace-nowrap flex-shrink-0"
          >
            <FaPlus className="h-4 w-4" /> Create New Permission
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-gray-600">Total Permissions</div>
              <div className="text-2xl font-bold text-gray-800 truncate">{pagePermissions.length}</div>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg border border-blue-200 flex-shrink-0">
              <FaKey className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-gray-600">Unique Actions</div>
              <div className="text-2xl font-bold text-gray-800 truncate">{uniqueActions.length}</div>
            </div>
            <div className="p-2.5 bg-green-100 text-green-600 rounded-lg border border-green-200 flex-shrink-0">
              <FaFilter className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm text-gray-600">Permission Format</div>
              <div className="text-sm font-mono text-gray-800 truncate">
                {module?.name?.toLowerCase() || 'module'}.{page?.slug || 'page'}.action
              </div>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg border border-purple-200 flex-shrink-0">
              <FaBook className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading permissions...</span>
        </div>
      ) : pagePermissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4 border border-gray-200">
            <FaKey className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Permissions Found</h3>
          <p className="text-gray-500 mb-4">This page doesn't have any permissions yet</p>
          <button
            onClick={() => onOpenForm(module, page)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium"
          >
            <FaPlus className="inline mr-2" />
            Create First Permission
          </button>
        </div>
      ) : (
        <>
          {/* Actions Filter */}
          {uniqueActions.length > 0 && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaFilter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Available Actions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueActions.map(action => (
                  <PermissionTypeBadge key={action} action={action} />
                ))}
              </div>
            </div>
          )}
          
          {/* Permissions List - One per line */}
          <div className="space-y-4">
            {pagePermissions.map(permission => {
              const parsed = parsePermissionName(permission.name);
              const createdDate = permission.created_at ? new Date(permission.created_at) : new Date();
              
              return (
                <div key={permission.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-800 text-lg truncate">
                          {parsed.displayName}
                        </h4>
                        <PermissionTypeBadge action={parsed.action} />
                      </div>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 block truncate border border-gray-200 mb-4">
                        {permission.name}
                      </code>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 min-w-[80px]">Permission ID:</span>
                          <span className="font-medium truncate">{permission.id || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 min-w-[60px]">Guard:</span>
                          <span className="font-medium truncate">{permission.guard_name || 'web'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 min-w-[70px]">Created:</span>
                          <span className="font-medium truncate">{createdDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 min-w-[70px]">Module:</span>
                          <span className="font-medium capitalize truncate">{parsed.module}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <FaInfoCircle className="h-5 w-5" />
          About Permissions for this Page
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          All permissions for <strong>{page?.name || 'this page'}</strong> follow the format:
        </p>
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-3 overflow-x-auto">
          <code className="text-sm font-mono whitespace-nowrap">
            {module?.name?.toLowerCase() || 'module'}.{page?.slug || 'page'}.action_name
          </code>
        </div>
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Common actions for this page:</p>
          <div className="flex flex-wrap gap-2">
            {['view', 'create', 'edit', 'delete', 'manage'].map(action => (
              <PermissionTypeBadge key={action} action={action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PERMISSION FORM MODAL
// ============================================
const PermissionFormModal = ({ isOpen, onClose, contextModule, contextPage, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  });
  const [selectedAction, setSelectedAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        guard_name: "web",
      });
      setSelectedAction("");
      setCustomAction("");
      setErrors({});
    }
  }, [isOpen]);

  // Update permission name when action changes
  useEffect(() => {
    if (contextModule && contextPage && (selectedAction || customAction)) {
      const moduleName = contextModule.name.toLowerCase();
      const pageSlug = contextPage.slug;
      const action = selectedAction || customAction;
      const permissionName = `${moduleName}.${pageSlug}.${action}`;
      
      setFormData(prev => ({ ...prev, name: permissionName }));
    }
  }, [contextModule, contextPage, selectedAction, customAction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrors({ general: "Please select an action" });
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || "Failed to save permission. Please try again." 
      });
    }
  };

  if (!isOpen || !contextModule || !contextPage) return null;

  const moduleDetails = getModuleDetails(contextModule.name.toLowerCase());
  const standardActions = [
    { id: 'view', name: 'View' },
    { id: 'create', name: 'Create' },
    { id: 'add', name: 'Add' },
    { id: 'edit', name: 'Edit' },
    { id: 'delete', name: 'Delete' },
    { id: 'manage', name: 'Manage' },
    { id: 'run', name: 'Run' },
    { id: 'approve', name: 'Approve' },
    { id: 'reject', name: 'Reject' },
    { id: 'export', name: 'Export' },
    { id: 'import', name: 'Import' },
    { id: 'assign', name: 'Assign' },
    { id: 'review', name: 'Review' },
    { id: 'generate', name: 'Generate' },
    { id: 'schedule', name: 'Schedule' },
    { id: 'track', name: 'Track' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 rounded-lg border border-blue-200">
                <FaKey className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Create Permission</h2>
                <p className="text-sm text-gray-500 truncate">
                  For {contextPage.name} page in {contextModule.name} module
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {/* Module Info */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${moduleDetails.color} flex-shrink-0`}>
                  {moduleDetails.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-blue-700 truncate">
                    Module: <span className="font-semibold">{contextModule.name}</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1 truncate">
                    Auto-filled from selection
                  </div>
                </div>
              </div>
            </div>

            {/* Page Info */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600 border border-green-200 flex-shrink-0">
                  <FaBook className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-green-700 truncate">
                    Page: <span className="font-semibold">{contextPage.name}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Slug: <code className="bg-green-100 px-1.5 py-0.5 rounded border border-green-200 font-mono truncate max-w-full">{contextPage.slug}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Action *
              </label>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setCustomAction("");
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              >
                <option value="">Select standard action</option>
                {standardActions.map(action => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
              <div className="text-center text-gray-400 text-xs mb-2">OR</div>
              <input
                type="text"
                value={customAction}
                onChange={(e) => {
                  setCustomAction(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                  setSelectedAction("");
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter custom action"
              />
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-1">Permission Preview:</div>
                <code className="text-sm bg-white px-2 py-1.5 rounded border block truncate font-mono">
                  {formData.name}
                </code>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  This permission will be created for: {contextPage.name}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium border border-gray-300 whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
              Create Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function PermissionManagementPage() {
  // State for 3-step flow
  const [currentPage, setCurrentPage] = useState('modules'); // 'modules', 'pages', or 'permissions'
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPermissionForm, setShowPermissionForm] = useState(false);

  // Fetch modules on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [modulesData, permissionsData] = await Promise.all([
        permissionService.getModules(),
        permissionService.getPermissions()
      ]);
      setModules(modulesData || []);
      setPermissions(permissionsData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pages for a module
  const fetchModulePages = async (module) => {
    setPagesLoading(true);
    setError(null);
    try {
      const pagesData = await permissionService.getModulePages(module.id);
      setPages(pagesData || []);
      setSelectedModule(module);
      setCurrentPage('pages');
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError('Failed to load pages for this module');
    } finally {
      setPagesLoading(false);
    }
  };

  // Fetch permissions for a specific page
  const fetchPagePermissions = async (module, page) => {
    setPermissionsLoading(true);
    setError(null);
    try {
      setSelectedModule(module);
      setSelectedPage(page);
      setCurrentPage('permissions');
    } catch (err) {
      console.error('Error navigating to permissions:', err);
      setError('Failed to load permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = (targetPage) => {
    if (targetPage === 'modules') {
      setCurrentPage('modules');
      setSelectedModule(null);
      setSelectedPage(null);
      setPages([]);
    } else if (targetPage === 'pages') {
      setCurrentPage('pages');
      setSelectedPage(null);
    }
  };

  // Open permission form for a specific page
  const handleOpenPermissionForm = (module, page) => {
    setSelectedModule(module);
    setSelectedPage(page);
    setShowPermissionForm(true);
  };

  // Close permission form
  const handleClosePermissionForm = () => {
    setShowPermissionForm(false);
  };

  // Save permission
  const handleSavePermission = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const savedPermission = await permissionService.createPermission(formData);
      
      // Update permissions list
      setPermissions(prev => [...prev, savedPermission]);
      
      setSuccessMessage(`Permission "${savedPermission.name}" created successfully!`);
      
      setTimeout(() => {
        setSuccessMessage(null);
        handleClosePermissionForm();
        
        // Refresh permissions if we're on permissions page
        if (currentPage === 'permissions') {
          fetchData();
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error saving permission:', err);
      setError(err.response?.data?.message || 'Failed to save permission. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    if (currentPage === 'modules') {
      fetchData();
    } else if (currentPage === 'pages' && selectedModule) {
      fetchModulePages(selectedModule);
    } else if (currentPage === 'permissions' && selectedModule && selectedPage) {
      fetchData();
    }
  };

  // Get current page title
  const getPageTitle = () => {
    if (currentPage === 'modules') return 'Modules';
    if (currentPage === 'pages') return selectedModule ? `${selectedModule.name} Pages` : 'Pages';
    if (currentPage === 'permissions') return selectedPage ? `${selectedPage.name} Permissions` : 'Permissions';
    return 'Permission Management';
  };

  // Get current page description
  const getPageDescription = () => {
    if (currentPage === 'modules') return 'Select a module to view its pages';
    if (currentPage === 'pages') return 'Select a page to create or view permissions';
    if (currentPage === 'permissions') return 'View and manage permissions for this page';
    return 'Manage system permissions';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium truncate">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 truncate">{getPageTitle()}</h1>
            <p className="text-gray-600 text-sm mt-1 truncate">{getPageDescription()}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentPage === 'pages' && (
              <button
                onClick={() => handleBack('modules')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-300 whitespace-nowrap"
              >
                <FaArrowLeft className="h-4 w-4" /> Back to Modules
              </button>
            )}
            {currentPage === 'permissions' && (
              <button
                onClick={() => handleBack('pages')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-300 whitespace-nowrap"
              >
                <FaArrowLeft className="h-4 w-4" /> Back to Pages
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <FaSync className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 text-sm truncate">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-600">Total Modules</div>
                <div className="text-2xl font-bold text-gray-800 truncate">{modules.length}</div>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg border border-blue-200 flex-shrink-0">
                <FaBox className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-600">Current {currentPage === 'permissions' ? 'Page' : 'Module'}</div>
                <div className="text-2xl font-bold text-gray-800 truncate">
                  {currentPage === 'modules' ? modules.length : 
                   currentPage === 'pages' ? (selectedModule?.name?.substring(0, 10) || '...') : 
                   currentPage === 'permissions' ? (selectedPage?.name?.substring(0, 10) || '...') : '-'}
                </div>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-lg border border-green-200 flex-shrink-0">
                {currentPage === 'modules' ? <FaBox className="h-5 w-5" /> : 
                 currentPage === 'pages' ? <FaBook className="h-5 w-5" /> : 
                 <FaKey className="h-5 w-5" />}
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-600">Total Permissions</div>
                <div className="text-2xl font-bold text-gray-800 truncate">{permissions.length}</div>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg border border-purple-200 flex-shrink-0">
                <FaKey className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {(currentPage === 'pages' || currentPage === 'permissions') && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <button
              onClick={() => handleBack('modules')}
              className="hover:text-gray-800 flex items-center gap-1 group whitespace-nowrap"
            >
              <FaBox className="h-3 w-3 flex-shrink-0" />
              <span className="group-hover:underline truncate">Modules</span>
            </button>
            {currentPage === 'permissions' && (
              <>
                <FaChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => handleBack('pages')}
                  className="hover:text-gray-800 flex items-center gap-1 group whitespace-nowrap"
                >
                  <FaBook className="h-3 w-3 flex-shrink-0" />
                  <span className="group-hover:underline truncate max-w-[100px]">{selectedModule?.name || 'Module'}</span>
                </button>
              </>
            )}
            <FaChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 flex items-center gap-1 whitespace-nowrap">
              {currentPage === 'pages' ? <FaBook className="h-3 w-3 flex-shrink-0" /> : <FaKey className="h-3 w-3 flex-shrink-0" />}
              <span className="truncate max-w-[150px]">
                {currentPage === 'pages' ? (selectedModule?.name || 'Module') + ' Pages' : 
                 (selectedPage?.name || 'Page') + ' Permissions'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {currentPage === 'modules' ? (
            <ModulesPage
              modules={modules}
              onViewPages={fetchModulePages}
              loading={loading}
            />
          ) : currentPage === 'pages' ? (
            <ModulePagesPage
              module={selectedModule}
              pages={pages}
              onOpenForm={handleOpenPermissionForm}
              onViewPermissions={fetchPagePermissions}
              onBack={() => handleBack('modules')}
              loading={pagesLoading}
            />
          ) : (
            <PagePermissionsPage
              module={selectedModule}
              page={selectedPage}
              permissions={permissions}
              onBack={handleBack}
              onOpenForm={handleOpenPermissionForm}
              loading={permissionsLoading}
            />
          )}
        </div>
      </div>

      {/* Permission Form Modal */}
      <PermissionFormModal
        isOpen={showPermissionForm}
        onClose={handleClosePermissionForm}
        contextModule={selectedModule}
        contextPage={selectedPage}
        onSave={handleSavePermission}
        loading={saving}
      />
    </div>
  );
}
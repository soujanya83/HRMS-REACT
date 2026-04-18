// RoleManagementPage.jsx - With proper checkboxes and select all/deselect all
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
} from "react-icons/fa";
import roleService from "../../services/roleService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import axiosClient from "../../axiosClient";

// Permission Categories (for grouping)
const getPermissionCategory = (permissionName) => {
  const categories = {
    'employees': 'Employees',
    'employee': 'Employee',
    'recruitment': 'Recruitment',
    'attendance': 'Attendance',
    'payroll': 'Payroll',
    'timesheet': 'Timesheet',
    'rostering': 'Rostering',
    'roster': 'Roster',
    'performance': 'Performance',
    'settings': 'Settings',
    'organization': 'Organization',
    'report': 'Reports'
  };
  
  for (const [key, value] of Object.entries(categories)) {
    if (permissionName.startsWith(key)) {
      return value;
    }
  }
  return 'Other';
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

// Permission Modal for Creating New Permissions
const PermissionModal = ({ isOpen, onClose, onSave, selectedOrganization, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    organization_id: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && selectedOrganization) {
      setFormData({
        name: "",
        organization_id: selectedOrganization.id,
      });
      setErrors({});
    }
  }, [isOpen, selectedOrganization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Permission name is required";
    }
    if (!formData.name.includes('.')) {
      newErrors.name = "Permission name must be in format 'category.action' (e.g., employees.add)";
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
        setErrors({ general: error.response?.data?.message || "Failed to create permission" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <FaPlusCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Create Permission</h2>
                <p className="text-sm text-gray-500">Add a new system permission</p>
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

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {errors.general}
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
                placeholder="e.g., employees.add, recruitment.view, payroll.process"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Examples: employees.add, recruitment.view, payroll.process, attendance.approve
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization ID
              </label>
              <input
                type="text"
                value={formData.organization_id || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-assigned from current organization
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
              
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permissions List Modal
const PermissionsListModal = ({ isOpen, onClose, permissions, selectedOrganization }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  if (!isOpen) return null;

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = getPermissionCategory(perm.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredPermissions = permissions.filter(perm => 
    perm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <FaList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Permissions</h2>
                <p className="text-sm text-gray-500">
                  Total: {permissions.length} permissions • Organization: {selectedOrganization?.name}
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

        <div className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Permissions List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredPermissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaLock className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No permissions found</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Try adjusting your search" : "Create your first permission to get started"}
                </p>
              </div>
            ) : searchTerm ? (
              <div className="space-y-2">
                {filteredPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheck className="h-3 w-3 text-green-500" />
                      <span className="text-sm text-gray-700 font-mono">{permission.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">ID: {permission.id}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedPermissions).sort().map(category => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{category}</h3>
                        <span className="text-xs text-gray-500">{groupedPermissions[category].length} permissions</span>
                      </div>
                      {expandedCategories[category] ? (
                        <FaChevronUp className="text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-gray-500" />
                      )}
                    </div>
                    {expandedCategories[category] && (
                      <div className="p-3">
                        <div className="grid grid-cols-1 gap-2">
                          {groupedPermissions[category].map(permission => {
                            const action = permission.name.split('.').pop();
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                              >
                                <div className="flex items-center gap-2">
                                  <FaCheck className="h-3 w-3 text-green-500" />
                                  <span className="text-sm text-gray-700">
                                    {action?.charAt(0).toUpperCase() + action?.slice(1)}
                                  </span>
                                  <span className="text-xs text-gray-400 ml-2">{permission.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">ID: {permission.id}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

// Role Form Modal with Checkboxes
const RoleFormModal = ({ isOpen, onClose, role, permissions, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    permission_ids: [],
  });

  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        permission_ids: role.permission_ids || [],
      });
    } else {
      setFormData({
        name: "",
        permission_ids: [],
      });
    }
    setErrors({});
  }, [role, isOpen]);

  // Get unique categories from permissions
  const categories = [...new Set(permissions.map(p => getPermissionCategory(p.name)))].sort();

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
      // Initialize all categories as expanded
      const expanded = {};
      categories.forEach(cat => { expanded[cat] = true; });
      setExpandedCategories(expanded);
    }
  }, [categories, selectedCategory]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }));
  };

  const handleCategoryToggle = (category) => {
    const categoryPermissions = permissions.filter(p => getPermissionCategory(p.name) === category).map(p => p.id);
    const allCategoryPermissionsSelected = categoryPermissions.every(id => formData.permission_ids.includes(id));

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
      permission_ids: permissions.map(p => p.id),
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      permission_ids: [],
    }));
  };

  const handleSubmit = async (e) => {
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
  };

  if (!isOpen) return null;

  const getCategoryPermissions = (category) => {
    return permissions.filter(p => getPermissionCategory(p.name) === category);
  };

  const getTotalSelected = () => formData.permission_ids.length;
  const getTotalPermissions = () => permissions.length;

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

              {/* Permissions Section */}
              {permissions.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
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
                        <FaTimes className="h-3 w-3" />
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200">
                    {categories.map(category => {
                      const categoryPerms = getCategoryPermissions(category);
                      const selectedCount = categoryPerms.filter(p => formData.permission_ids.includes(p.id)).length;
                      const isSelected = selectedCount === categoryPerms.length && categoryPerms.length > 0;
                      const isPartial = selectedCount > 0 && selectedCount < categoryPerms.length;
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            selectedCategory === category
                              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected && <FaCheck className="h-3 w-3 text-green-600" />}
                          {isPartial && <div className="h-3 w-3 rounded-full bg-yellow-500" />}
                          {category}
                          <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                            {selectedCount}/{categoryPerms.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Category Permissions with Checkboxes */}
                  {selectedCategory && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={getCategoryPermissions(selectedCategory).every(p => 
                              formData.permission_ids.includes(p.id)
                            )}
                            onChange={() => handleCategoryToggle(selectedCategory)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <h4 className="font-semibold text-gray-800">{selectedCategory} Permissions</h4>
                          <span className="text-xs text-gray-500">
                            ({getCategoryPermissions(selectedCategory).filter(p => formData.permission_ids.includes(p.id)).length}/{getCategoryPermissions(selectedCategory).length} selected)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCategory(selectedCategory)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedCategories[selectedCategory] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>

                      {expandedCategories[selectedCategory] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getCategoryPermissions(selectedCategory).map(permission => {
                            const action = permission.name.split('.').pop();
                            const isChecked = formData.permission_ids.includes(permission.id);
                            
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-300 shadow-sm"
                                    : "bg-white border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800 capitalize">
                                    {action?.replace(/_/g, ' ')}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                                    {permission.name}
                                  </p>
                                </div>
                                <FaLock className={`h-4 w-4 ${
                                  isChecked ? "text-blue-600" : "text-gray-300"
                                }`} />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Permissions Summary */}
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FaCheck className="h-4 w-4 text-green-600" />
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
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
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
const RoleDetailsModal = ({ isOpen, onClose, role, permissions }) => {
  if (!isOpen || !role) return null;

  const rolePermissions = permissions.filter(p => role.permission_ids?.includes(p.id)) || [];

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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
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
                {rolePermissions.length} permissions
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions</h3>
          <div className="space-y-4">
            {rolePermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions assigned</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {rolePermissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheck className="h-3 w-3 text-green-500" />
                      <span className="text-sm text-gray-700">{permission.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">ID: {permission.id}</span>
                  </div>
                ))}
              </div>
            )}
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
            className={`px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors ${
              type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
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
  
  const [modalState, setModalState] = useState({
    form: false,
    details: false,
    confirm: false,
    permissionsList: false,
    createPermission: false,
    type: "delete",
    role: null,
  });

  // Fetch data on component mount
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization]);

  const fetchPermissions = async () => {
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
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch roles
      const rolesData = await roleService.getRoles();
      
      let rolesArray = [];
      if (rolesData && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      } else if (rolesData && Array.isArray(rolesData)) {
        rolesArray = rolesData;
      } else if (rolesData && rolesData.success && rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      }
      
      // Fetch permissions directly using axios
      const permissionsArray = await fetchPermissions();
      
      setRoles(rolesArray);
      setPermissions(permissionsArray);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosClient.post('/permissions', formData);
      const newPermission = response.data;
      setPermissions(prev => [...prev, newPermission]);
      setSuccessMessage(`Permission "${newPermission.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (err) {
      console.error('Error creating permission:', err);
      setError(err.response?.data?.message || 'Failed to create permission. Please try again.');
      throw err;
    } finally {
      setSaving(false);
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
          permission_ids: formData.permission_ids,
        });
        setRoles(prev => prev.map(role => 
          role.id === modalState.role.id ? savedRole : role
        ));
        setSuccessMessage(`Role "${savedRole.name}" updated successfully!`);
      } else {
        savedRole = await roleService.createRole({
          name: formData.name,
          permission_ids: formData.permission_ids,
        });
        setRoles(prev => [...prev, savedRole]);
        setSuccessMessage(`Role "${savedRole.name}" created successfully!`);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
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
        permission_ids: role.permission_ids || [],
      };
      
      const savedRole = await roleService.createRole(newRoleData);
      setRoles(prev => [...prev, savedRole]);
      setSuccessMessage(`Role "${savedRole.name}" cloned successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseConfirm();
      fetchData();
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

  const handleOpenPermissionsList = () => {
    setModalState(prev => ({ ...prev, permissionsList: true }));
  };

  const handleClosePermissionsList = () => {
    setModalState(prev => ({ ...prev, permissionsList: false }));
  };

  const handleOpenCreatePermission = () => {
    setModalState(prev => ({ ...prev, createPermission: true }));
  };

  const handleCloseCreatePermission = () => {
    setModalState(prev => ({ ...prev, createPermission: false }));
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
          <p className="text-gray-600">Loading roles and permissions...</p>
          <p className="text-sm text-gray-500 mt-2">Organization: {selectedOrganization.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
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
          <div className="flex gap-3">
            {/* <button
              onClick={handleOpenPermissionsList}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <FaList className="h-4 w-4" /> View Permissions ({permissions.length})
            </button> */}
            {/* <button
              onClick={handleOpenCreatePermission}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FaPlusCircle className="h-4 w-4" /> Create Permission
            </button> */}
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus className="h-4 w-4" /> Create New Role
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
                <FaList className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">{permissions.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Permissions</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-50">
                <FaUserCog className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">
                {roles.filter(r => r.name?.toLowerCase().includes('admin') && r.name?.toLowerCase() !== 'superadmin').length}
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
                {roles.filter(r => !r.name?.toLowerCase().includes('admin') && r.name?.toLowerCase() !== 'superadmin').length}
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
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              <FaSync className="h-4 w-4" /> Refresh
            </button>
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

      <PermissionsListModal
        isOpen={modalState.permissionsList}
        onClose={handleClosePermissionsList}
        permissions={permissions}
        selectedOrganization={selectedOrganization}
      />

      <PermissionModal
        isOpen={modalState.createPermission}
        onClose={handleCloseCreatePermission}
        onSave={handleCreatePermission}
        selectedOrganization={selectedOrganization}
        loading={saving}
      />
    </div>
  );
}
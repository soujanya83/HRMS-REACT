// services/permissionService.js
import axiosClient from '../axiosClient';

const permissionService = {
  // Get all permissions (uses /api/v1/permissions)
  getPermissions: async () => {
    try {
      // Try to get organization ID from localStorage
      let organizationId = localStorage.getItem('selectedOrgId');
      if (!organizationId) {
        organizationId = localStorage.getItem('CURRENT_ORG_ID');
      }
      if (!organizationId) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            organizationId = user?.organization_id;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }
      
      const params = organizationId ? { organization_id: parseInt(organizationId) } : {};
      console.log('📥 Fetching permissions with params:', params);
      
      const response = await axiosClient.get('/permissions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  // Get single permission by ID
  getPermissionById: async (id) => {
    try {
      const response = await axiosClient.get(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permission ${id}:`, error);
      throw error;
    }
  },

  // Create new permission - FIXED to include organization_id
  createPermission: async (permissionData) => {
    try {
      // Try multiple ways to get organization ID
      let organizationId = localStorage.getItem('selectedOrgId');
      if (!organizationId) {
        organizationId = localStorage.getItem('CURRENT_ORG_ID');
      }
      if (!organizationId) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            organizationId = user?.organization_id;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }
      
      // Also check if organization_id was passed in the data
      const finalOrgId = organizationId || permissionData.organization_id || null;
      
      const payload = {
        name: permissionData.name,
        guard_name: permissionData.guard_name || 'web',
        organization_id: finalOrgId ? parseInt(finalOrgId) : null
      };
      
      console.log('📤 Creating permission with payload:', payload);
      console.log('📤 Organization ID source:', organizationId ? 'localStorage' : (permissionData.organization_id ? 'formData' : 'null'));
      
      const response = await axiosClient.post('/permissions', payload);
      console.log('✅ Permission created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating permission:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      // Get organization ID for the update request
      let organizationId = localStorage.getItem('selectedOrgId');
      if (!organizationId) {
        organizationId = localStorage.getItem('CURRENT_ORG_ID');
      }
      
      const payload = {
        name: permissionData.name,
        guard_name: permissionData.guard_name || 'web',
        organization_id: organizationId ? parseInt(organizationId) : null,
        _method: 'PUT'
      };
      
      const response = await axiosClient.post(`/permissions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating permission ${id}:`, error);
      throw error;
    }
  },

  // Delete permission
  deletePermission: async (id) => {
    try {
      const response = await axiosClient.delete(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting permission ${id}:`, error);
      throw error;
    }
  },

  // Bulk create permissions
  bulkCreatePermissions: async (permissionsData) => {
    try {
      // Get organization ID for bulk creation
      let organizationId = localStorage.getItem('selectedOrgId');
      if (!organizationId) {
        organizationId = localStorage.getItem('CURRENT_ORG_ID');
      }
      
      const payload = {
        permissions: permissionsData,
        organization_id: organizationId ? parseInt(organizationId) : null
      };
      
      const response = await axiosClient.post('/permissions/bulk', payload);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating permissions:', error);
      throw error;
    }
  },

  // Get modules from API (uses /api/v1/modules)
  getModules: async () => {
    try {
      const response = await axiosClient.get('/modules');
      
      // Handle response structure: {success: true, count: 8, data: [...]}
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Unexpected modules response structure:', response.data);
      return [];
      
    } catch (error) {
      console.error('Error fetching modules from /modules:', error);
      throw error;
    }
  },

  // Get pages for a module (uses /api/v1/modules/{id}/pages)
  getModulePages: async (moduleId) => {
    try {
      const response = await axiosClient.get(`/modules/${moduleId}/pages`);
      
      // Handle response structure: {message: "...", module_id: 2, data: [...]}
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Unexpected pages response structure:', response.data);
      return [];
      
    } catch (error) {
      console.error(`Error fetching pages for module ${moduleId}:`, error);
      throw error;
    }
  },

  // Create new module (uses /api/v1/modules)
  createModule: async (moduleData) => {
    try {
      const response = await axiosClient.post('/modules', moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  // Update module (uses /api/v1/modules/{id})
  updateModule: async (id, moduleData) => {
    try {
      const response = await axiosClient.post(`/modules/${id}`, moduleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating module ${id}:`, error);
      throw error;
    }
  },

  // Delete module (uses /api/v1/modules/{id})
  deleteModule: async (id) => {
    try {
      const response = await axiosClient.delete(`/modules/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting module ${id}:`, error);
      throw error;
    }
  },

  // Get standard actions
  getStandardActions: () => {
    return [
      { id: 'view', name: 'View', icon: 'eye', color: 'blue' },
      { id: 'create', name: 'Create', icon: 'plus', color: 'green' },
      { id: 'add', name: 'Add', icon: 'plus', color: 'green' },
      { id: 'edit', name: 'Edit', icon: 'edit', color: 'yellow' },
      { id: 'delete', name: 'Delete', icon: 'trash', color: 'red' },
      { id: 'manage', name: 'Manage', icon: 'cog', color: 'purple' },
      { id: 'run', name: 'Run', icon: 'play', color: 'indigo' },
      { id: 'approve', name: 'Approve', icon: 'check', color: 'green' },
      { id: 'reject', name: 'Reject', icon: 'times', color: 'red' },
      { id: 'export', name: 'Export', icon: 'download', color: 'blue' },
      { id: 'import', name: 'Import', icon: 'upload', color: 'green' },
      { id: 'assign', name: 'Assign', icon: 'user-plus', color: 'purple' },
      { id: 'review', name: 'Review', icon: 'search', color: 'yellow' },
      { id: 'generate', name: 'Generate', icon: 'file', color: 'indigo' },
      { id: 'schedule', name: 'Schedule', icon: 'calendar', color: 'blue' },
      { id: 'track', name: 'Track', icon: 'chart-line', color: 'green' },
    ];
  },

  // Helper function to parse permission name into module.page.action format
  parsePermissionName: (name) => {
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
  }
};

export default permissionService;
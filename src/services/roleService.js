// services/roleService.js
import axiosClient from '../axiosClient';

const roleService = {
  // Get all roles - WITH organization_id
  getRoles: async () => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      if (!organizationId) {
        console.error('No organization ID found');
        return { success: false, data: [], message: 'No organization selected' };
      }

      const response = await axiosClient.get('/roles', {
        params: {
          organization_id: parseInt(organizationId)
        }
      });
      console.log('Roles API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      console.error('Error response:', error.response?.data);
      return { success: false, data: [], message: error.response?.data?.message || 'Failed to fetch roles' };
    }
  },

  // Get single role by ID - WITH organization_id
  getRoleById: async (id) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');
      const response = await axiosClient.get(`/roles/${id}`, {
        params: {
          organization_id: organizationId ? parseInt(organizationId) : 15
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  },

  // Create new role - WITH organization_id
  createRole: async (roleData) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      const payload = {
        name: roleData.name,
        guard_name: roleData.guard_name || 'web',
        organization_id: organizationId ? parseInt(organizationId) : 15
      };

      console.log('Creating role with payload:', payload);
      const response = await axiosClient.post('/roles', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update role - WITH organization_id
  updateRole: async (id, roleData) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      const payload = {
        name: roleData.name,
        guard_name: roleData.guard_name || 'web',
        organization_id: organizationId ? parseInt(organizationId) : 15,
        _method: 'PUT'
      };

      console.log('Updating role with payload:', payload);
      const response = await axiosClient.post(`/roles/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  },

  // Delete role - WITH organization_id
  deleteRole: async (id) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');
      const response = await axiosClient.delete(`/roles/${id}`, {
        params: {
          organization_id: organizationId ? parseInt(organizationId) : 15
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  },

  // Get role permissions - WITH organization_id
  getRolePermissions: async (roleId) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');
      const response = await axiosClient.get(`/roles/${roleId}/permissions`, {
        params: {
          organization_id: organizationId ? parseInt(organizationId) : 15
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  },

  // Sync role permissions - WITH organization_id
  syncRolePermissions: async (roleId, permissionIds) => {
    try {
      if (!permissionIds || !Array.isArray(permissionIds)) {
        console.error('Invalid permissionIds:', permissionIds);
        return { success: false };
      }

      const organizationId = localStorage.getItem('selectedOrgId');

      console.log('Syncing permissions for role:', roleId, 'Permissions:', permissionIds);

      const payload = {
        permissions: permissionIds,
        organization_id: organizationId ? parseInt(organizationId) : 15
      };

      const response = await axiosClient.post(`/roles/${roleId}/permissions`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error syncing permissions for role ${roleId}:`, error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      const payload = {
        name: permissionData.name,
        guard_name: permissionData.guard_name || 'web',
        organization_id: organizationId ? parseInt(organizationId) : 15,
        _method: 'PUT'
      };

      const response = await axiosClient.post(`/permissions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating permission ${id}:`, error);
      throw error;
    }
  },

  // Create permission
  createPermission: async (permissionData) => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      const payload = {
        name: permissionData.name,
        guard_name: permissionData.guard_name || 'web',
        organization_id: organizationId ? parseInt(organizationId) : 15
      };

      const response = await axiosClient.post('/permissions', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
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

  //Get user permissions
  getUserPermissions: async () => {
    try {
      const organizationId = JSON.parse(localStorage.getItem('selectedOrgId'));

      const response = await axiosClient.get(`/me/permissions/${organizationId}`);
      console.log("permissions", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Get user roles in organization
  getUserRoles: async (organizationId, userId) => {
    try {
      const response = await axiosClient.get(`/organizations/${organizationId}/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for user ${userId} in organization ${organizationId}:`, error);
      throw error;
    }
  },

  // Assign role to user in organization
  assignRoleToUser: async (organizationId, userId, roleName) => {
    try {
      const response = await axiosClient.post(`/organizations/${organizationId}/users/${userId}/roles`, {
        role: roleName
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning role ${roleName} to user ${userId}:`, error);
      throw error;
    }
  },

  // Remove role from user in organization
  removeRoleFromUser: async (organizationId, userId, roleName) => {
    try {
      const response = await axiosClient.delete(`/organizations/${organizationId}/users/${userId}/roles/${roleName}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing role ${roleName} from user ${userId}:`, error);
      throw error;
    }
  },

  // Get all users
  getUsers: async () => {
    try {
      const response = await axiosClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get all permissions - WITH organization_id
  getAllPermissions: async () => {
    try {
      const organizationId = localStorage.getItem('selectedOrgId');

      const response = await axiosClient.get('/permissions', {
        params: {
          organization_id: organizationId ? parseInt(organizationId) : 15
        }
      });
      console.log('Permissions API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      console.error('Error response:', error.response?.data);
      return { success: false, data: [], message: error.response?.data?.message || 'Failed to fetch permissions' };
    }
  }
};

export default roleService;
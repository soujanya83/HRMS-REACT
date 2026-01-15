// services/roleService.js
import axiosClient from '../axiosClient';

const roleService = {
  // Get all roles
  getRoles: async () => {
    try {
      const response = await axiosClient.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get single role by ID
  getRoleById: async (id) => {
    try {
      const response = await axiosClient.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await axiosClient.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await axiosClient.post(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await axiosClient.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  },

  // Get role permissions
  getRolePermissions: async (roleId) => {
    try {
      const response = await axiosClient.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  },

  // Sync role permissions
  syncRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await axiosClient.post(`/roles/${roleId}/permissions`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      console.error(`Error syncing permissions for role ${roleId}:`, error);
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

  // Get all users (for role assignment)
  getUsers: async () => {
    try {
      const response = await axiosClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await axiosClient.get('/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      throw error;
    }
  }
};

export default roleService;
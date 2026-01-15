// services/permissionService.js
import axiosClient from '../axiosClient';

const permissionService = {
  // Get all permissions
  getPermissions: async () => {
    try {
      const response = await axiosClient.get('/permissions');
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

  // Create new permission
  createPermission: async (permissionData) => {
    try {
      const response = await axiosClient.post('/permissions', permissionData);
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      const response = await axiosClient.post(`/permissions/${id}`, permissionData);
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

  // Get roles that have this permission
  getRolesWithPermission: async (permissionId) => {
    try {
      const response = await axiosClient.get(`/permissions/${permissionId}/roles`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for permission ${permissionId}:`, error);
      throw error;
    }
  },

  // Sync permission with roles
  syncPermissionWithRoles: async (permissionId, roleIds) => {
    try {
      const response = await axiosClient.post(`/permissions/${permissionId}/sync-roles`, {
        role_ids: roleIds
      });
      return response.data;
    } catch (error) {
      console.error(`Error syncing roles for permission ${permissionId}:`, error);
      throw error;
    }
  }
};

export default permissionService;
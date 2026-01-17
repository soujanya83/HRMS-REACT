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

  // Bulk create permissions
  bulkCreatePermissions: async (permissionsData) => {
    try {
      const response = await axiosClient.post('/permissions/bulk', {
        permissions: permissionsData
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating permissions:', error);
      throw error;
    }
  },

  // Get permission categories (extracted from existing permissions)
  getPermissionCategories: async () => {
    try {
      const permissions = await permissionService.getPermissions();
      const categories = new Set();
      permissions.forEach(permission => {
        const parts = permission.name.split('.');
        if (parts.length > 0) {
          categories.add(parts[0]);
        }
      });
      return Array.from(categories).map(category => ({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        count: permissions.filter(p => p.name.startsWith(category + '.')).length
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Create new category (by creating a default permission)
  createCategory: async (categoryName) => {
    try {
      // Create a view permission for the new category
      const response = await axiosClient.post('/permissions', {
        name: `${categoryName}.view`,
        guard_name: 'web'
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category name (by updating all permissions in that category)
  updateCategory: async (oldCategoryName, newCategoryName) => {
    try {
      const permissions = await permissionService.getPermissions();
      const categoryPermissions = permissions.filter(p => p.name.startsWith(oldCategoryName + '.'));
      
      // Update each permission in the category
      const updatePromises = categoryPermissions.map(permission => {
        const newName = permission.name.replace(`${oldCategoryName}.`, `${newCategoryName}.`);
        return permissionService.updatePermission(permission.id, {
          name: newName,
          guard_name: permission.guard_name
        });
      });
      
      await Promise.all(updatePromises);
      return { success: true, message: `Category updated from ${oldCategoryName} to ${newCategoryName}` };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category (by deleting all permissions in that category)
  deleteCategory: async (categoryName) => {
    try {
      const permissions = await permissionService.getPermissions();
      const categoryPermissions = permissions.filter(p => p.name.startsWith(categoryName + '.'));
      
      // Delete each permission in the category
      const deletePromises = categoryPermissions.map(permission => 
        permissionService.deletePermission(permission.id)
      );
      
      await Promise.all(deletePromises);
      return { success: true, message: `Category ${categoryName} deleted successfully` };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get standard actions
  getStandardActions: () => {
    return [
      { id: 'view', name: 'View', icon: 'eye', color: 'blue' },
      { id: 'create', name: 'Create', icon: 'plus', color: 'green' },
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
  }
};

export default permissionService;
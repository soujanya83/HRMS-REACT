// services/assignRoleService.js
import axiosClient from '../axiosClient';

const assignRoleService = {
  // Get user's roles in a specific organization
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
        roles: [roleName]
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning role ${roleName} to user ${userId}:`, error);
      
      // Log the detailed error for debugging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
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

  // Get available roles for organization
  getAvailableRoles: async () => {
    // Return the fixed list from your API documentation
    return ['superadmin', 'organization_admin', 'hr_manager', 'recruiter', 'payroll_manager', 'team_manager', 'employee'];
  }
};

export default assignRoleService;
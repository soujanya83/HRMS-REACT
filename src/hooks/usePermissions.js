// src/hooks/usePermissions.js
// Lightweight hook to check user permissions on any page
// Usage: const { canAdd, canEdit, canDelete, canView, hasPermission } = usePermissions('recruitment.job_openings');

import { useMemo } from 'react';
import { useOrganizations } from '../contexts/OrganizationContext';

const usePermissions = (module) => {
  const { userPermissions: contextPermissions } = useOrganizations();

  // Get permissions from context or localStorage fallback
  const permissions = useMemo(() => {
    if (Array.isArray(contextPermissions) && contextPermissions.length > 0) {
      return contextPermissions;
    }
    try {
      const saved = localStorage.getItem('USER_PERMISSIONS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  }, [contextPermissions]);

  const isSuperadmin = permissions.includes('*');

  // Check a specific permission string
  const hasPermission = (perm) => {
    if (isSuperadmin) return true;
    return permissions.includes(perm);
  };

  // Module-level CRUD checks (e.g., module = 'recruitment.job_openings')
  const canView = isSuperadmin || permissions.includes(`${module}.view`);
  const canAdd = isSuperadmin || permissions.includes(`${module}.add`);
  const canEdit = isSuperadmin || permissions.includes(`${module}.edit`);
  const canDelete = isSuperadmin || permissions.includes(`${module}.delete`);

  return { canView, canAdd, canEdit, canDelete, hasPermission, isSuperadmin, permissions };
};

export default usePermissions;

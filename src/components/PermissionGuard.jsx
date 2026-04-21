import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';

const PermissionGuard = ({ children, permission }) => {
  const { userPermissions, isLoading } = useOrganizations();

  if (isLoading) return null;

  // Simple, direct check
  const hasAccess = 
    userPermissions.includes('*') || 
    !permission || 
    userPermissions.includes(permission);

  if (hasAccess) {
    return children;
  }

  // Silent redirect if unauthorized
  return <Navigate to="/dashboard" replace />;
};

export default PermissionGuard;

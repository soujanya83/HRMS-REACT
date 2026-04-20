// src/contexts/OrganizationContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getOrganizations } from '../services/organizationService';
import roleService from '../services/roleService';

const OrganizationContext = createContext();

export const useOrganizations = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        console.error('useOrganizations must be used within OrganizationProvider');
        return {
            organizations: [],
            selectedOrganization: null,
            selectOrganization: () => {},
            isLoading: false,
            error: null,
            refetchOrganizations: () => {},
            currentUserRole: null,
            isAdmin: false,
            userPermissions: [],
        };
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [userPermissions, setUserPermissions] = useState(() => {
        const saved = localStorage.getItem('USER_PERMISSIONS');
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user roles from localStorage
    const getUserRoles = () => {
        const roles = localStorage.getItem('USER_ROLES');
        return roles ? JSON.parse(roles) : [];
    };

    // Get role for a specific organization
    const getRoleForOrganization = (orgId) => {
        const userRoles = getUserRoles();
        const roleForOrg = userRoles.find(r => r.organization_id === parseInt(orgId));
        console.log(`🔍 getRoleForOrganization: orgId=${orgId}, role=${roleForOrg?.role_name || 'null'}`);
        return roleForOrg?.role_name || null;
    };

    // Check if user is admin for a specific role
    const isAdminRole = (role) => {
        if (!role) return false;
        const adminRoles = ['superadmin', 'organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
        return adminRoles.includes(role?.toLowerCase());
    };

    // Fetch permissions for the specific role
    const fetchPermissions = useCallback(async (roleId, roleName) => {
        // Superadmin bypass - move to top
        if (roleName?.toLowerCase() === 'superadmin') {
            console.log('👑 Superadmin detected in fetchPermissions, granting all permissions');
            return ['*'];
        }

        if (!roleId) {
            console.warn('⚠️ No roleId provided to fetchPermissions');
            return [];
        }

        try {
            console.log(`🔐 Fetching permissions for role ID: ${roleId} (${roleName})`);
            const response = await roleService.getRolePermissions(roleId);
            
            let perms = [];
            if (response && response.permissions && Array.isArray(response.permissions)) {
                perms = response.permissions.map(p => p.name);
            } else if (response && Array.isArray(response.data?.permissions)) {
                perms = response.data.permissions.map(p => p.name);
            }
            
            console.log(`✅ Loaded ${perms.length} permissions for role ${roleName}`);
            return perms;
        } catch (err) {
            console.error('❌ Error fetching permissions:', err);
            return [];
        }
    }, []);

    const fetchOrgs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Fetching organizations...');
            const response = await getOrganizations();
            console.log('📦 Full API response:', response);
            
            let orgs = [];
            
            // Extract organizations from response
            if (response && response.data) {
                const apiData = response.data;
                
                if (apiData.success && apiData.data) {
                    if (Array.isArray(apiData.data.data)) {
                        orgs = apiData.data.data;
                    } else if (Array.isArray(apiData.data)) {
                        orgs = apiData.data;
                    } else if (typeof apiData.data === 'object' && apiData.data !== null) {
                        const innerData = apiData.data;
                        if (innerData.data && Array.isArray(innerData.data)) {
                            orgs = innerData.data;
                        }
                    }
                } else if (Array.isArray(apiData.data)) {
                    orgs = apiData.data;
                } else if (Array.isArray(apiData)) {
                    orgs = apiData;
                }
            }
            
            console.log('📋 Final organizations array:', orgs);
            
            if (!Array.isArray(orgs)) {
                console.error('❌ Organizations is not an array:', orgs);
                setError('Invalid organizations data format');
                setOrganizations([]);
            } else {
                console.log(`✅ Successfully loaded ${orgs.length} organizations`);
                setOrganizations(orgs);

                const userRoles = getUserRoles();
                console.log('👤 User roles from localStorage:', userRoles);
                
                // CRITICAL: First check localStorage for selectedOrgId and role
                let savedOrgId = localStorage.getItem('selectedOrgId');
                let savedRole = localStorage.getItem('CURRENT_USER_ROLE');
                
                console.log(`💾 Saved values - orgId: ${savedOrgId}, role: ${savedRole}`);
                
                let selectedOrg = null;
                let role = savedRole;
                
                // If we have a saved org ID, try to use it
                if (savedOrgId) {
                    selectedOrg = orgs.find(o => o.id === parseInt(savedOrgId));
                    if (selectedOrg) {
                        // Verify the role matches
                        const verifiedRole = getRoleForOrganization(selectedOrg.id);
                        if (verifiedRole !== savedRole) {
                            console.log(`Role mismatch: saved=${savedRole}, verified=${verifiedRole}`);
                            role = verifiedRole;
                            if (role) {
                                localStorage.setItem('CURRENT_USER_ROLE', role);
                            }
                        }
                        console.log(`🎯 Using saved org: ${selectedOrg.name} (ID: ${selectedOrg.id}, Role: ${role}, isAdmin: ${isAdminRole(role)})`);
                    } else {
                        console.log(`⚠️ Saved org ID ${savedOrgId} not found in organizations list`);
                    }
                }
                
                // If no saved org or saved org not found, find the organization with superadmin role
                if (!selectedOrg) {
                    // First try to find superadmin role
                    const superAdminRole = userRoles.find(r => r.role_name?.toLowerCase() === 'superadmin');
                    if (superAdminRole) {
                        selectedOrg = orgs.find(o => o.id === superAdminRole.organization_id);
                        role = superAdminRole.role_name;
                        console.log(`🎯 Found superadmin org: ${selectedOrg?.name} (ID: ${superAdminRole.organization_id}, Role: ${role})`);
                    }
                    
                    // If no superadmin, try other admin roles
                    if (!selectedOrg) {
                        const adminRoles = ['organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
                        for (const adminRole of adminRoles) {
                            const adminRoleObj = userRoles.find(r => r.role_name?.toLowerCase() === adminRole);
                            if (adminRoleObj) {
                                selectedOrg = orgs.find(o => o.id === adminRoleObj.organization_id);
                                role = adminRoleObj.role_name;
                                console.log(`🎯 Found admin org: ${selectedOrg?.name} (Role: ${role})`);
                                break;
                            }
                        }
                    }
                    
                    // If still no organization, use first one
                    if (!selectedOrg && orgs.length > 0) {
                        selectedOrg = orgs[0];
                        role = getRoleForOrganization(selectedOrg.id);
                        console.log(`🎯 Using first org: ${selectedOrg.name} (Role: ${role})`);
                    }
                    
                    if (selectedOrg) {
                        localStorage.setItem('selectedOrgId', selectedOrg.id);
                        if (role) {
                            localStorage.setItem('CURRENT_USER_ROLE', role);
                        }
                    }
                }
                
                if (selectedOrg) {
                    setSelectedOrganization(selectedOrg);
                    setCurrentUserRole(role);
                    
                    // NEW: Fetch permissions for this organization/role
                    const currentRoleObj = userRoles.find(r => parseInt(r.organization_id) === parseInt(selectedOrg.id));
                    console.log('🔍 Current Role Object:', currentRoleObj);
                    
                    const roleIdToUse = currentRoleObj?.role_id || currentRoleObj?.id;
                    if (roleIdToUse || role?.toLowerCase() === 'superadmin') {
                        const perms = await fetchPermissions(roleIdToUse, role);
                        setUserPermissions(perms);
                        localStorage.setItem('USER_PERMISSIONS', JSON.stringify(perms));
                    } else {
                        console.warn('⚠️ Could not find role_id or id for permission fetching', { currentRoleObj, role });
                    }
                    
                    // Dispatch event for sidebar to listen
                    window.dispatchEvent(new CustomEvent('organizationChanged', { 
                        detail: { 
                            organizationId: selectedOrg.id, 
                            organizationName: selectedOrg.name,
                            role: role 
                        } 
                    }));
                } else if (orgs.length > 0) {
                    setSelectedOrganization(orgs[0]);
                    const defaultRole = getRoleForOrganization(orgs[0].id);
                    setCurrentUserRole(defaultRole);
                    
                    // NEW: Fetch permissions for default organization/role
                    const defaultRoleObj = userRoles.find(r => parseInt(r.organization_id) === parseInt(orgs[0].id));
                    console.log('🔍 Default Role Object:', defaultRoleObj);
                    
                    const roleIdToUse = defaultRoleObj?.role_id || defaultRoleObj?.id;
                    if (roleIdToUse || defaultRole?.toLowerCase() === 'superadmin') {
                        const perms = await fetchPermissions(roleIdToUse, defaultRole);
                        setUserPermissions(perms);
                        localStorage.setItem('USER_PERMISSIONS', JSON.stringify(perms));
                    }
                    localStorage.setItem('selectedOrgId', orgs[0].id);
                    if (defaultRole) {
                        localStorage.setItem('CURRENT_USER_ROLE', defaultRole);
                    }
                    console.log(`✨ Using first org: ${orgs[0].name} (Role: ${defaultRole})`);
                    
                    // Dispatch event for sidebar to listen
                    window.dispatchEvent(new CustomEvent('organizationChanged', { 
                        detail: { 
                            organizationId: orgs[0].id, 
                            organizationName: orgs[0].name,
                            role: defaultRole 
                        } 
                    }));
                }
            }
        } catch (error) {
            console.error("❌ Failed to fetch organizations:", error);
            setError("Failed to load organizations. Please try again.");
            setOrganizations([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    const selectOrganization = (orgId) => {
        console.log('🎯 Selecting organization:', orgId);
        const org = organizations.find(o => o.id === parseInt(orgId));
        if (org) {
            const role = getRoleForOrganization(org.id);
            console.log(`📋 Role for ${org.name}: ${role}`);
            console.log(`📋 Is Admin: ${isAdminRole(role)}`);
            
            setSelectedOrganization(org);
            setCurrentUserRole(role);
            localStorage.setItem('selectedOrgId', org.id);
            if (role) {
                localStorage.setItem('CURRENT_USER_ROLE', role);
            } else {
                localStorage.removeItem('CURRENT_USER_ROLE');
            }
            
            console.log('✅ Organization selected:', org.name, 'Role:', role);
            
            // Dispatch event for sidebar to listen
            window.dispatchEvent(new CustomEvent('organizationChanged', { 
                detail: { 
                    organizationId: org.id, 
                    organizationName: org.name,
                    role: role 
                } 
            }));
            
            // Reload to apply role-based changes
            window.location.reload();
        } else {
            console.error('❌ Organization not found:', orgId);
        }
    };

    const isAdmin = isAdminRole(currentUserRole);

    console.log("📊 OrganizationProvider State:", { 
        selectedOrganization: selectedOrganization?.name, 
        currentUserRole, 
        isAdmin,
        organizationsCount: organizations.length 
    });

    const value = {
        organizations,
        selectedOrganization,
        selectOrganization,
        isLoading,
        error,
        refetchOrganizations: fetchOrgs,
        currentUserRole,
        userPermissions,
        isAdmin,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading organizations...</p>
                </div>
            </div>
        );
    }

    if (error && organizations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                    <button
                        onClick={fetchOrgs}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};
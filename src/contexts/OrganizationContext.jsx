// src/contexts/OrganizationContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getOrganizations } from '../services/organizationService';

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
        };
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
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
                        console.log(`🎯 Using saved org: ${selectedOrg.name} (ID: ${selectedOrg.id}, Role: ${role})`);
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
                } else if (orgs.length > 0) {
                    setSelectedOrganization(orgs[0]);
                    const defaultRole = getRoleForOrganization(orgs[0].id);
                    setCurrentUserRole(defaultRole);
                    localStorage.setItem('selectedOrgId', orgs[0].id);
                    if (defaultRole) {
                        localStorage.setItem('CURRENT_USER_ROLE', defaultRole);
                    }
                    console.log(`✨ Using first org: ${orgs[0].name} (Role: ${defaultRole})`);
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
            setSelectedOrganization(org);
            const role = getRoleForOrganization(org.id);
            setCurrentUserRole(role);
            localStorage.setItem('selectedOrgId', org.id);
            if (role) {
                localStorage.setItem('CURRENT_USER_ROLE', role);
            }
            console.log('✅ Organization selected:', org.name, 'Role:', role);
            
            // Reload the page to apply role-based changes
            window.location.reload();
        }
    };

    const isAdmin = currentUserRole ? 
        ['superadmin', 'organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'].includes(currentUserRole?.toLowerCase()) : 
        false;

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
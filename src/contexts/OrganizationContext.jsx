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
        };
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                
                // Check for success: true pattern
                if (apiData.success && apiData.data) {
                    // Try to extract from nested structure
                    if (Array.isArray(apiData.data.data)) {
                        orgs = apiData.data.data;
                        console.log('✅ Found organizations in apiData.data.data');
                    } else if (Array.isArray(apiData.data)) {
                        orgs = apiData.data;
                        console.log('✅ Found organizations in apiData.data');
                    } else if (typeof apiData.data === 'object' && apiData.data !== null) {
                        // If it's an object, check if it has a data property
                        const innerData = apiData.data;
                        if (innerData.data && Array.isArray(innerData.data)) {
                            orgs = innerData.data;
                            console.log('✅ Found organizations in nested data.data');
                        }
                    }
                } else if (Array.isArray(apiData.data)) {
                    orgs = apiData.data;
                    console.log('✅ Found organizations in apiData.data (no success flag)');
                } else if (Array.isArray(apiData)) {
                    orgs = apiData;
                    console.log('✅ Found organizations in apiData');
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

                // Get saved organization from localStorage
                const savedOrgId = localStorage.getItem('selectedOrgId');
                console.log('💾 Saved org ID:', savedOrgId);
                
                if (savedOrgId && orgs.length > 0) {
                    const savedOrg = orgs.find(o => o.id === parseInt(savedOrgId));
                    if (savedOrg) {
                        setSelectedOrganization(savedOrg);
                        console.log('🎯 Set to saved org:', savedOrg.name);
                    } else {
                        // Saved org not found, use first one
                        setSelectedOrganization(orgs[0]);
                        localStorage.setItem('selectedOrgId', orgs[0].id);
                        console.log('🔄 No saved org found, using first:', orgs[0].name);
                    }
                } else if (orgs.length > 0) {
                    // First time, use first org
                    setSelectedOrganization(orgs[0]);
                    localStorage.setItem('selectedOrgId', orgs[0].id);
                    console.log('✨ First time setup, using first org:', orgs[0].name);
                } else {
                    console.log('⚠️ No organizations found');
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
            localStorage.setItem('selectedOrgId', org.id);
            console.log('✅ Organization selected:', org.name);
        }
    };

    const value = {
        organizations,
        selectedOrganization,
        selectOrganization,
        isLoading,
        error,
        refetchOrganizations: fetchOrgs,
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
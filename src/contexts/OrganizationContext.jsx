import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getOrganizations } from '../services/organizationService';

const OrganizationContext = createContext();

export const useOrganizations = () => {
    return useContext(OrganizationContext);
};

export const OrganizationProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrgs = useCallback(async () => {
        try {
            const response = await getOrganizations();
            const orgs = response.data.data || [];
            setOrganizations(orgs);

            const savedOrgId = localStorage.getItem('selectedOrgId');
            const savedOrg = orgs.find(o => o.id === parseInt(savedOrgId));

            if (savedOrg) {
                setSelectedOrganization(savedOrg);
            } else if (orgs.length > 0) {
                setSelectedOrganization(orgs[0]);
                localStorage.setItem('selectedOrgId', orgs[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch organizations for context", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    const selectOrganization = (orgId) => {
        const org = organizations.find(o => o.id === orgId);
        if (org && org.id !== selectedOrganization?.id) {
            setSelectedOrganization(org);
            localStorage.setItem('selectedOrgId', org.id);
            
        }
    };

    const value = {
        organizations,
        selectedOrganization,
        selectOrganization,
        isLoading,
        refetchOrganizations: fetchOrgs,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {!isLoading ? children : <div>Loading Application...</div>}
        </OrganizationContext.Provider>
    );
};
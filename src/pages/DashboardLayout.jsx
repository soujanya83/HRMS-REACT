import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
// 1. Import the new components
import { useOrganizations } from '../contexts/OrganizationContext';
import GlobalLoader from '../components/GlobalLoader';

const DashboardLayout = ({ onLogout, user }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    // 2. Get the loading state from the context
    const { isLoading: isAppLoading } = useOrganizations();

    return (
        <div className="relative min-h-screen md:flex">
            {/* 3. Conditionally render the loader */}
            {isAppLoading && <GlobalLoader />}

            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                onLogout={onLogout} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
                <Header 
                    onMenuButtonClick={() => setSidebarOpen(true)} 
                    onLogout={onLogout} 
                    user={user}
                />
                
                <main className="flex-1 bg-gray-50 overflow-y-auto">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
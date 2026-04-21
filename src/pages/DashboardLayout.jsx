import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useOrganizations } from '../contexts/OrganizationContext';
import GlobalLoader from '../components/GlobalLoader';

const DashboardLayout = ({ onLogout, user }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#f9fafb'); // Default bg-gray-50
    const { isLoading: isAppLoading } = useOrganizations();

    return (
        <div className="relative min-h-screen md:flex">
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
                
                {/* Main content area with dynamic background color */}
                <main 
                    className="flex-1 overflow-y-auto transition-colors duration-300"
                    style={{ backgroundColor: backgroundColor }}
                >
                    <div className="p-6">
                        <Outlet context={{ backgroundColor, setBackgroundColor, user }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
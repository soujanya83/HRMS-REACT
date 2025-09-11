import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ onLogout, user }) => {
    // This state controls the mobile sidebar's slide-in/out visibility
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    // This state controls the desktop sidebar's collapsed/expanded view
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        // This `md:flex` class is crucial. It arranges the sidebar and main content
        // side-by-side on medium screens (tablets) and larger.
        <div className="relative min-h-screen md:flex">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                onLogout={onLogout} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col">
                <Header 
                    onMenuButtonClick={() => setSidebarOpen(true)} 
                    onLogout={onLogout} 
                    user={user}
                />
                
                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;


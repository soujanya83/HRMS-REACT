import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ onLogout, user }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    // THE FIX: Add state to manage the collapsed/expanded state of the sidebar
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="relative min-h-screen md:flex">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                onLogout={onLogout} 
                // THE FIX: Pass down the collapse state and the function to change it
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


import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header'; // 1. Import your new Header component

const DashboardLayout = ({ onLogout }) => {
 
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen md:flex">
     
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                onLogout={onLogout} 
            />

          
            <div className="flex-1 flex flex-col"> 
                <Header onMenuButtonClick={() => setSidebarOpen(true)} />
                
                <main className="flex-1 p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export  default DashboardLayout;
// src/pages/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = ({ onLogout, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { sidebarColor } = useTheme();

  return (
    <div className="flex h-screen">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sidebarColor={sidebarColor}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuButtonClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogout={onLogout} 
          user={user} 
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
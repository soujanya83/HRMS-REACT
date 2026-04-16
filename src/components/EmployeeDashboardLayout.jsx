// src/components/EmployeeDashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import Header from './Header';
import { useTheme } from '../contexts/ThemeContext';

const EmployeeDashboardLayout = ({ onLogout, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { sidebarColor } = useTheme();

  return (
    <div className="flex h-screen">
      <EmployeeSidebar 
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sidebarColor={sidebarColor}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuButtonClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogout={onLogout} 
          user={user} 
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboardLayout;
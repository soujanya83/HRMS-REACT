// src/pages/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DEFAULT_SIDEBAR_COLOR = '#1a4d4d';
const DEFAULT_BG_COLOR = '#F5F5F5';

const DashboardLayout = ({ onLogout, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || DEFAULT_SIDEBAR_COLOR;
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || DEFAULT_BG_COLOR;
  });

  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

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
          <Outlet context={{
            sidebarColor,
            setSidebarColor,
            backgroundColor,
            setBackgroundColor
          }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
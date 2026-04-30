// src/components/EmployeeSidebar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo1.png";
import logoText from "../assets/logotext.png";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineCalendar as HiOutlineLeave,
  HiOutlineSun,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlineLogout,
  HiChevronDoubleLeft,
  HiChevronDoubleRight
} from "react-icons/hi";

// Helper: darken a hex color by a percentage (0-100)
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// Helper: lighten a hex color by a percentage (0-100)
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent / 100));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent / 100));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const EmployeeSidebar = ({
  isSidebarOpen,
  setSidebarOpen,
  onLogout,
  user,
  isCollapsed,
  setIsCollapsed,
  sidebarColor: propSidebarColor
}) => {
  const [currentColor, setCurrentColor] = useState(() => {
    const saved = localStorage.getItem('sidebarColor');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      return saved;
    }
    return propSidebarColor || '#1a2d4e';
  });
  const location = useLocation();

  // Employee navigation links
  const navLinks = useMemo(() => [
    { name: "Dashboard", path: "/dashboard/employee-dashboard", icon: HiOutlineHome },
    { name: "Rostering", path: "/dashboard/rostering/rosters", icon: HiOutlineCalendar },
    { name: "Attendance", path: "/dashboard/attendance/tracking", icon: HiOutlineClipboardList },
    { name: "Leave Management", path: "/dashboard/attendance/requests", icon: HiOutlineLeave },
    { name: "Holidays & Calendar", path: "/dashboard/attendance/holidays", icon: HiOutlineSun },
    { name: "Payroll", path: "/dashboard/payroll/run", icon: HiOutlineCreditCard },
    { name: "Profile Settings", path: "/dashboard/profile", icon: HiOutlineUser },
  ], []);

  const getButtonBorderColor = (color) => {
    return "rgba(255, 255, 255, 0.2)";
  };

  const buttonBorderColor = getButtonBorderColor(currentColor);

  // Set dashboard link (always employee dashboard for this sidebar)
  const dashboardLink = "/dashboard/employee-dashboard";

  // Sidebar background is darkened, active tab uses original/lighter color
  const sidebarBg = darkenColor(currentColor, 30);
  const activeBg = lightenColor(currentColor, 15);
  const hoverBg = lightenColor(currentColor, 8);

  useEffect(() => {
    if (propSidebarColor && propSidebarColor !== 'undefined' && propSidebarColor !== currentColor) {
      setCurrentColor(propSidebarColor);
      localStorage.setItem('sidebarColor', propSidebarColor);
    }
  }, [propSidebarColor, currentColor]);

  useEffect(() => {
    const handleColorUpdate = (event) => {
      if (event.detail.color && event.detail.color !== 'undefined') {
        setCurrentColor(event.detail.color);
        localStorage.setItem('sidebarColor', event.detail.color);
      }
    };

    window.addEventListener('sidebarColorUpdate', handleColorUpdate);
    return () => window.removeEventListener('sidebarColorUpdate', handleColorUpdate);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar wrapper - width reduced from w-72 to w-64 to match admin sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          md:translate-x-0`}
        style={{
          top: "8px",
          left: "6px",
          bottom: "8px",
          height: "calc(100% - 16px)",
        }}
      >
        {/* Sidebar inner */}
        <div
          className="h-full w-full flex flex-col relative overflow-visible antialiased"
          style={{
            backgroundColor: sidebarBg,
            borderRadius: "16px 0 0 16px",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)"
          }}
        >
          {/* Collapse Toggle Button */}
          <div className="absolute -right-3 top-20 z-20 hidden md:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-7 h-7 rounded-full shadow-md transition-all duration-200 hover:scale-105 hover:brightness-110"
              style={{
                backgroundColor: sidebarBg,
                border: `1px solid ${buttonBorderColor}`,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}
            >
              {isCollapsed ? (
                <HiChevronDoubleRight size={14} className="text-white" />
              ) : (
                <HiChevronDoubleLeft size={14} className="text-white" />
              )}
            </button>
          </div>

          {/* Logo Section */}
          <div className="border-b h-[72px] flex-shrink-0" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center p-4 h-full">
              <Link to={dashboardLink} className="flex items-center">
                <img
                  src={logoIcon}
                  alt="CHRISPP Icon"
                  className="h-7 w-auto flex-shrink-0"
                />
                <img
                  src={logoText}
                  alt="CHRISPP Text"
                  className={`h-5 w-auto ml-2 transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "opacity-100 block"}`}
                />
              </Link>
            </div>
          </div>

          {/* Navigation - No user profile section */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-4 mt-2">
            <nav className="px-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm transition-all duration-200 rounded-lg ${isCollapsed ? "justify-center" : ""
                    } ${isActive
                      ? "text-white font-semibold shadow-sm"
                      : "text-white/90 font-medium hover:text-white"
                    }`
                  }
                  style={({ isActive }) => (isActive ? { backgroundColor: activeBg } : {})}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? link.name : ""}
                >
                  <link.icon size={18} className="flex-shrink-0" />
                  <span className={`ml-3 transition-all duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                    {link.name}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
            <button
              onClick={onLogout}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg text-white hover:text-white ${isCollapsed ? "justify-center" : ""
                }`}
              title={isCollapsed ? "Logout" : ""}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <HiOutlineLogout size={18} className="flex-shrink-0" />
              <span className={`ml-3 transition-all duration-200 ${isCollapsed ? "hidden" : "block"}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;
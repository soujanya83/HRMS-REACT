// src/components/EmployeeSidebar.jsx
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (propSidebarColor && propSidebarColor !== 'undefined' && propSidebarColor !== currentColor) {
      setCurrentColor(propSidebarColor);
      localStorage.setItem('sidebarColor', propSidebarColor);
    }
  }, [propSidebarColor]);

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

  // Employee navigation links
  const navLinks = [
    { name: "Dashboard", path: "/dashboard/employee-dashboard", icon: HiOutlineHome },
    { name: "Rostering", path: "/dashboard/rostering/rosters", icon: HiOutlineCalendar },
    { name: "Attendance", path: "/dashboard/attendance/tracking", icon: HiOutlineClipboardList },
    { name: "Leave Management", path: "/dashboard/attendance/requests", icon: HiOutlineLeave },
    { name: "Holidays & Calendar", path: "/dashboard/attendance/holidays", icon: HiOutlineSun },
    { name: "Payroll", path: "/dashboard/payroll/run", icon: HiOutlineCreditCard },
    { name: "Profile Settings", path: "/dashboard/profile", icon: HiOutlineUser },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getEmployeeName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.name) return user.name;
    return "Employee";
  };

  const getEmployeeEmail = () => {
    if (user?.email) return user.email;
    if (user?.personal_email) return user.personal_email;
    return "employee@example.com";
  };

  const getButtonBorderColor = (color) => {
    return "rgba(255, 255, 255, 0.2)";
  };

  const buttonBorderColor = getButtonBorderColor(currentColor);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar wrapper */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen
          ${isCollapsed ? "md:w-20" : "md:w-72"}
          ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"} 
          md:translate-x-0`}
        style={{ 
          top: "8px",
          bottom: "8px",
          height: "calc(100% - 16px)",
        }}
      >
        {/* Sidebar inner */}
        <div
          className="h-full w-full flex flex-col relative overflow-visible"
          style={{ 
            backgroundColor: currentColor,
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
                backgroundColor: currentColor,
                border: `1px solid ${buttonBorderColor}`,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}
            >
              {isCollapsed ? (
                <HiChevronDoubleRight size={14} className="text-gray-300" />
              ) : (
                <HiChevronDoubleLeft size={14} className="text-gray-300" />
              )}
            </button>
          </div>

          {/* Logo Section */}
          <div className="border-b h-[72px] flex-shrink-0" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
            <div className="flex items-center p-4 h-full">
              <Link to="/dashboard" className="flex items-center">
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

          {/* User Profile Section */}
          <div className="flex flex-col items-center pt-6 pb-4 border-b" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg mb-2">
              {getInitials(getEmployeeName())}
            </div>
            
            {/* User Name */}
            <h3 className="text-white font-semibold text-md text-center">
              {getEmployeeName()}
            </h3>
            
            {/* User Email */}
            <p className="text-gray-300 text-xs text-center mt-0.5">
              {getEmployeeEmail()}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
            <nav className="px-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm transition-all duration-200 rounded-lg ${
                      isCollapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "bg-white/15 text-white font-semibold"
                        : "text-gray-300 font-medium hover:bg-white/10 hover:text-white"
                    }`
                  }
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
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Logout" : ""}
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
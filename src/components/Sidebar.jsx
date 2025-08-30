import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo1.png"; 
import logoText from "../assets/logotext.png"; 
import { LuLayoutDashboard } from "react-icons/lu";
import {
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCreditCard,
  HiOutlineLogout,
} from "react-icons/hi";

const Sidebar = ({ isSidebarOpen, setSidebarOpen, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const linkStyle = "flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200";

  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? `${linkStyle} bg-white text-black font-semibold shadow-lg`
      : `${linkStyle} text-gray-300 font-medium hover:bg-white hover:text-black`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
 
      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 bg-black border-r border-gray-800 w-64 flex-col justify-between z-30 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-center p-6 border-b border-gray-800">
            <div className="flex items-center">
              <img
                src={logoIcon}
                alt="CHRISPP Icon"
                className="h-10 w-auto"
              />
              <img
                src={logoText}
                alt="CHRISPP Text"
                className="h-7 w-auto ml-3"
              />
            </div>
          </div>

          <nav className="mt-6 px-4">
            <NavLink to="/dashboard" end className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <LuLayoutDashboard size={22} className="mr-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/dashboard/employees" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineUsers size={22} className="mr-4" />
              <span>Employee</span>
            </NavLink>
            <NavLink to="/dashboard/attendance" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineClipboardList size={22} className="mr-4" />
              <span>Attendance</span>
            </NavLink>
            <NavLink to="/dashboard/payroll" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineCreditCard size={22} className="mr-4" />
              <span>Payroll</span>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full px-4 py-3 my-2 rounded-lg text-gray-300 font-medium hover:bg-white hover:text-red-600 transition-colors duration-200"
          >
            <HiOutlineLogout size={22} className="mr-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


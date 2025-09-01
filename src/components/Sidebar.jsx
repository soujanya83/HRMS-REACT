import React from "react";
// THE FIX: Import `Link` to make the logo clickable
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo1.png";
import logoText from "../assets/logotext.png";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi";

const Sidebar = ({ isSidebarOpen, setSidebarOpen, onLogout, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const linkStyle = "flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200";

  const getNavLinkClass = ({ isActive }) => {
    const collapsedClass = isCollapsed ? 'justify-center' : ''; 
    return isActive
      ? `${linkStyle} bg-white text-black font-semibold shadow-lg ${collapsedClass}`
      : `${linkStyle} text-gray-300 font-medium hover:bg-white hover:text-black ${collapsedClass}`;
  };

  return (
    <>
    
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
 
      <div
        className={`relative bg-black border-r border-gray-800 flex-col justify-between z-30 transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:flex ${
        
          isCollapsed ? 'w-24' : 'w-64'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
           
          <div className="relative hidden md:block">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-[91px] bg-white text-black p-1 rounded-full shadow-md hover:bg-gray-200 transition-transform"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? <HiChevronDoubleRight size={18} /> : <HiChevronDoubleLeft size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-center p-6 border-b border-gray-800 h-[104px]">
            
            <Link to="/dashboard" className="flex items-center">
           
              <img 
                src={logoIcon} 
                alt="CHRISPP Icon" 
                className={`w-auto transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-8'}`} 
              />
              {!isCollapsed && (
                  <img src={logoText} alt="CHRISPP Text" className="h-6 w-auto ml-2 transition-opacity duration-200" />
              )}
            </Link>
          </div>

          <nav className="mt-6 px-4">
            <NavLink to="/dashboard" end className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <LuLayoutDashboard size={isCollapsed ? 28 : 22} className={`flex-shrink-0 ${!isCollapsed ? "mr-4" : ""}`} />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink to="/dashboard/employees" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineUsers size={isCollapsed ? 28 : 22} className={`flex-shrink-0 ${!isCollapsed ? "mr-4" : ""}`} />
              {!isCollapsed && <span>Employee</span>}
            </NavLink>
            <NavLink to="/dashboard/attendance" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineClipboardList size={isCollapsed ? 28 : 22} className={`flex-shrink-0 ${!isCollapsed ? "mr-4" : ""}`} />
              {!isCollapsed && <span>Attendance</span>}
            </NavLink>
            <NavLink to="/dashboard/payroll" className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
              <HiOutlineCreditCard size={isCollapsed ? 28 : 22} className={`flex-shrink-0 ${!isCollapsed ? "mr-4" : ""}`} />
              {!isCollapsed && <span>Payroll</span>}
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogoutClick}
            className={`flex items-center w-full px-4 py-3 my-2 rounded-lg text-gray-300 font-medium hover:bg-white hover:text-red-600 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <HiOutlineLogout size={isCollapsed ? 28 : 22} className={`flex-shrink-0 ${!isCollapsed ? "mr-4" : ""}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


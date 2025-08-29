import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCreditCard,
  HiOutlineLogout,
} from "react-icons/hi";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const linkStyle =
    "flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200";

  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? `${linkStyle} bg-white text-black font-semibold shadow-lg`
      : `${linkStyle} text-gray-300 font-medium hover:bg-white hover:text-black`;
  };

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex h-screen flex-col justify-between sticky top-0">
      <div>
        <div className="flex items-center justify-center p-6 border-b border-gray-800">
          <img src={logo} alt="CHRISPP Logo" className="h-10 w-10" />
        </div>

        <nav className="mt-6 px-4">
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <LuLayoutDashboard size={22} className="mr-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/employees" className={getNavLinkClass}>
            <HiOutlineUsers size={22} className="mr-4" />
            <span>Employee</span>
          </NavLink>
          <NavLink to="/dashboard/attendance" className={getNavLinkClass}>
            <HiOutlineClipboardList size={22} className="mr-4" />
            <span>Attendance</span>
          </NavLink>

          <NavLink to="/dashboard/payroll" className={getNavLinkClass}>
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
  );
};

export default Sidebar;

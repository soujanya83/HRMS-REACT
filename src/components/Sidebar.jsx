import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiChartPie,
  HiUsers,
  HiClipboardList,
  HiCalendar,
} from "react-icons/hi";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600">CHRISPP</h1>
      </div>
      <nav className="mt-6 px-4">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <HiChartPie className="h-6 w-6 mr-3" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/dashboard/employees"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <HiUsers className="h-6 w-6 mr-3" />
          <span>Employee</span>
        </NavLink>
        <NavLink
          to="/dashboard/attendance"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <HiClipboardList className="h-6 w-6 mr-3" />
          <span>Attendance</span>
        </NavLink>
        <NavLink
          to="/dashboard/schedule"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <HiCalendar className="h-6 w-6 mr-3" />
          <span>Schedule</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;

// Sidebar.jsx - Complete working version with rounded LEFT corners
import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo1.png";
import logoText from "../assets/logotext.png";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  HiOutlineOfficeBuilding,
  HiOutlineDocumentSearch,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineMicrophone,
  HiChevronDown,
  HiOutlineBriefcase,
  HiOutlineIdentification,
  HiOutlineUserAdd,
  HiOutlineDocumentText,
  HiOutlineCollection,
  HiOutlineArchive,
  HiOutlineCheckCircle,
  HiOutlineUserRemove,
  HiOutlineFingerPrint,
  HiOutlinePencilAlt,
  HiOutlineDocumentReport,
  HiOutlineCalculator,
  HiOutlineThumbUp,
  HiOutlineTable,
  HiOutlineSwitchHorizontal,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineCash,
  HiOutlineFlag,
  HiOutlineChartPie,
  HiOutlineAnnotation,
  HiOutlineSpeakerphone,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiOutlineShieldCheck,
  HiOutlineKey,
} from "react-icons/hi";

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
  {
    name: "Centers",
    path: "/dashboard/organizations",
    icon: HiOutlineOfficeBuilding,
  },
  {
    name: "Recruitment",
    icon: HiOutlineDocumentSearch,
    children: [
      { name: "Job Openings", path: "/dashboard/recruitment/jobs", icon: HiOutlineBriefcase },
      { name: "Applicants", path: "/dashboard/recruitment/applicants", icon: HiOutlineIdentification },
      { name: "Interview Scheduling", path: "/dashboard/recruitment/interviews", icon: HiOutlineCalendar },
      { name: "Interview", path: "/dashboard/recruitment/interview", icon: HiOutlineMicrophone },
      { name: "Selection & Offers", path: "/dashboard/recruitment/offers", icon: HiOutlineDocumentText },
      { name: "Onboarding", path: "/dashboard/recruitment/onboarding", icon: HiOutlineUserAdd },
    ],
  },
  {
    name: "Employee",
    icon: HiOutlineUsers,
    children: [
      { name: "Manage Profiles", path: "/dashboard/employees", icon: HiOutlineCollection, exact: true },
      { name: "Employment History", path: "/dashboard/employees/history", icon: HiOutlineArchive },
      { name: "Probation", path: "/dashboard/employees/probation", icon: HiOutlineCheckCircle },
      { name: "Offboarding", path: "/dashboard/employees/exit", icon: HiOutlineUserRemove },
    ],
  },
  {
    name: "Rostering",
    icon: HiOutlineCalendar,
    children: [
      { name: "Shift Scheduling", path: "/dashboard/rostering/scheduling", icon: HiOutlineTable },
      { name: "Roster Periods", path: "/dashboard/rostering/periods", icon: HiOutlineCalendar },
      { name: "Weekly / Monthly Rosters", path: "/dashboard/rostering/rosters", icon: HiOutlineViewGrid },
      { name: "Shift Swapping Requests", path: "/dashboard/rostering/swapping", icon: HiOutlineSwitchHorizontal },
    ],
  },
  {
    name: "Attendance",
    icon: HiOutlineClipboardList,
    children: [
      { name: "Attendance Tracking", path: "/dashboard/attendance/tracking", icon: HiOutlineFingerPrint },
      { name: "Manual Adjustments", path: "/dashboard/attendance/adjustments", icon: HiOutlinePencilAlt },
      { name: "Leave Requests", path: "/dashboard/attendance/requests", icon: HiOutlineDocumentReport },
      { name: "Leave Balance", path: "/dashboard/attendance/balance", icon: HiOutlineCalculator },
      { name: "Holidays & Calendars", path: "/dashboard/attendance/holidays", icon: HiOutlineCalendar },
    ],
  },
  {
    name: "Timesheet",
    icon: HiOutlineClock,
    children: [
      { name: "Timesheet Entry", path: "/dashboard/timesheet/entry", icon: HiOutlineClock },
      { name: "Approvals", path: "/dashboard/timesheet/approvals", icon: HiOutlineThumbUp },
    ],
  },
  {
    name: "Payroll",
    icon: HiOutlineCreditCard,
    children: [{ name: "Run Payroll", path: "/dashboard/payroll/run", icon: HiOutlineCash }],
  },
  {
    name: "Performance",
    icon: HiOutlineChartBar,
    children: [
      { name: "Goal Setting", path: "/dashboard/performance/goals", icon: HiOutlineFlag },
      { name: "KPI / OKR Tracking", path: "/dashboard/performance/tracking", icon: HiOutlineChartPie },
      { name: "Performance Reviews", path: "/dashboard/performance/reviews", icon: HiOutlineAnnotation },
      { name: "Feedback & Appraisals", path: "/dashboard/performance/appraisals", icon: HiOutlineSpeakerphone },
    ],
  },
  {
    name: "Settings",
    icon: HiOutlineCog,
    children: [
      { name: "Role Management", path: "/dashboard/settings/roles", icon: HiOutlineShieldCheck },
      { name: "Assign Role to User", path: "/dashboard/settings/assign-role", icon: HiOutlineUserAdd },
      { name: "Permission Management", path: "/dashboard/settings/permissions", icon: HiOutlineKey },
      { name: "Connect to Xero", path: "/dashboard/settings/xero", icon: HiOutlineSwitchHorizontal },
    ],
  },
];

const Sidebar = ({
  isSidebarOpen,
  setSidebarOpen,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  sidebarColor: propSidebarColor,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [currentColor, setCurrentColor] = useState(() => {
    const saved = localStorage.getItem('sidebarColor');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      return saved;
    }
    return propSidebarColor || '#1a4d4d';
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

  useEffect(() => {
    const currentParent = navLinks.find((link) => {
      if (!link.children) return false;
      return link.children.some((child) => {
        if (child.exact) return location.pathname === child.path;
        if (child.path === "/dashboard/employees/manage") {
          return location.pathname === child.path || location.pathname.startsWith(child.path + "/");
        }
        return location.pathname.startsWith(child.path);
      });
    });
    setOpenMenu(currentParent ? currentParent.name : null);
  }, [location.pathname]);

  const handleMenuClick = (menuName) => {
    if (!isCollapsed) setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const getBorderColor = (color) => {
    if (color === "#0B1A2E") return "#1a2d4e";
    if (color === "#2C2C2C") return "#4a4a4a";
    if (color === "#1F5F5B") return "#3a8a85";
    if (color === "#3B1E54") return "#5a2a7a";
    if (color === "#1B4332") return "#2d6a4f";
    if (color === "#334155") return "#4a5a6e";
    if (color === "#1a4d4d") return "#2d6a6a";
    return "#2d6a6a";
  };

  const borderColor = getBorderColor(currentColor);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 flex flex-col justify-between z-30 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen
          ${isCollapsed ? "md:w-24" : "md:w-64"}
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          md:translate-x-0`}
        style={{ 
          backgroundColor: currentColor,
          // 🔥 CHANGED: Border radius on LEFT side corners (top-left and bottom-left)
          borderRadius: "24px 0 0 24px",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute top-[104px] -right-4 -translate-y-1/2 hidden md:block z-10">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white p-1.5 rounded-full shadow-lg transition-colors"
              style={{ backgroundColor: borderColor }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <HiChevronDoubleRight size={18} /> : <HiChevronDoubleLeft size={18} />}
            </button>
          </div>

          <div
            className="border-b h-[104px] flex-shrink-0"
            style={{ borderColor: borderColor }}
          >
            <div className="flex items-center p-6 h-full justify-center">
              <Link to="/dashboard" className="flex items-center">
                <img src={logoIcon} alt="CHRISPP Icon" className="h-10 w-auto flex-shrink-0" />
                <img
                  src={logoText}
                  alt="CHRISPP Text"
                  className={`h-7 w-auto ml-3 transition-all duration-200 ${isCollapsed ? "w-0 opacity-0" : "opacity-100"}`}
                />
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
            <nav className="mt-4 px-4">
              {navLinks.map((link) => (
                <div key={link.name} className="my-2">
                  {!link.children ? (
                    <NavLink
                      to={link.path}
                      end
                      className={({ isActive }) =>
                        `flex items-center px-4 h-14 my-1 rounded-lg text-base transition-colors duration-200 ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "text-white font-semibold bg-white bg-opacity-20 shadow-lg"
                            : "text-gray-300 font-semibold hover:bg-white hover:bg-opacity-10 hover:text-white"
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <link.icon size={22} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-4"}`} />
                      <span className={isCollapsed ? "hidden" : "block"}>{link.name}</span>
                    </NavLink>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMenuClick(link.name)}
                        className={`flex items-center w-full px-4 h-14 rounded-lg text-base text-gray-300 font-semibold transition-colors duration-200 text-left hover:bg-white hover:bg-opacity-10 hover:text-white ${
                          isCollapsed ? "justify-center" : "justify-between"
                        }`}
                      >
                        <div className="flex items-center">
                          <link.icon size={22} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-4"}`} />
                          <span className={isCollapsed ? "hidden" : "block"}>{link.name}</span>
                        </div>
                        <HiChevronDown
                          className={`transition-transform duration-300 ${isCollapsed ? "hidden" : "block"} ${
                            openMenu === link.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          openMenu === link.name && !isCollapsed ? "max-h-screen" : "max-h-0"
                        }`}
                      >
                        <div className="py-2 pl-4">
                          {link.children.map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.path}
                              className={({ isActive }) =>
                                `flex items-center w-full px-4 py-2.5 my-1 rounded-lg text-sm transition-colors duration-200 ${
                                  isActive
                                    ? "text-white font-semibold bg-white bg-opacity-20"
                                    : "text-gray-400 hover:bg-white hover:bg-opacity-10 hover:text-white"
                                }`
                              }
                              onClick={() => setSidebarOpen(false)}
                              end={child.exact || false}
                            >
                              <child.icon size={18} className="mr-3 flex-shrink-0" />
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div
            className="p-4 border-t flex-shrink-0"
            style={{ borderColor: borderColor }}
          >
            <button
              onClick={onLogout}
              className={`flex items-center w-full px-4 h-12 rounded-lg text-base font-semibold transition-colors duration-200 text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <HiOutlineLogout size={22} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-4"}`} />
              <span className={isCollapsed ? "hidden" : "block"}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
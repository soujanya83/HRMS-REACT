// Sidebar.jsx - Rounded LEFT corners only, fully visible collapse button, darker colors
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
  HiOutlineUserCircle,
} from "react-icons/hi";

// Ultra Dark sidebar color options for maximum visibility
const ULTRA_DARK_COLORS = {
  'Deep Navy': '#0A1628',
  'Jet Black': '#0D0D0D',
  'Dark Teal': '#001F1F',
  'Deep Purple': '#1A0033',
  'Forest Black': '#0A1F0A',
  'Slate Black': '#0F172A',
  'Midnight': '#0A0F1D',
  'Charcoal Black': '#1A1A1A'
};

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
  { name: "Employee Dashboard", path: "/dashboard/employee-dashboard", icon: HiOutlineUserCircle },
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
    return propSidebarColor || '#0A1628'; // Ultra dark navy default
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

  const getToggleButtonColor = (color) => {
    // Brighter colors for the toggle button to stand out
    if (color === "#0A1628") return "#1E3A8A";
    if (color === "#0D0D0D") return "#3B3B3B";
    if (color === "#001F1F") return "#005555";
    if (color === "#1A0033") return "#5B00B3";
    if (color === "#0A1F0A") return "#2D6A2D";
    if (color === "#0F172A") return "#2563EB";
    if (color === "#0A0F1D") return "#3B82F6";
    if (color === "#1A1A1A") return "#4B4B4B";
    return "#3B82F6";
  };

  const toggleButtonColor = getToggleButtonColor(currentColor);

  // Get hover background color (lighter version)
  const getHoverBgColor = (color) => {
    return "rgba(255, 255, 255, 0.12)";
  };

  const hoverBgColor = getHoverBgColor(currentColor);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar with rounded LEFT corners only - FULLY VISIBLE */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col justify-between z-30 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          md:translate-x-0`}
      >
        {/* Inner Sidebar Box - ROUNDED LEFT CORNERS ONLY */}
        <div
          className="h-full w-full flex flex-col justify-between overflow-hidden"
          style={{ 
            backgroundColor: currentColor,
            borderRadius: "24px 0 0 24px",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.25)"
          }}
        >
          <div className="relative h-full flex flex-col">
            {/* Collapse Toggle Button - FULLY VISIBLE */}
            <div className="absolute -right-4 top-24 z-20 hidden md:block">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ 
                  backgroundColor: toggleButtonColor,
                  border: "2px solid rgba(255, 255, 255, 0.2)"
                }}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <HiChevronDoubleRight size={16} className="text-white" />
                ) : (
                  <HiChevronDoubleLeft size={16} className="text-white" />
                )}
              </button>
            </div>

            {/* Logo Section - Darker background with border */}
            <div
              className="border-b h-[72px] flex-shrink-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <div className="flex items-center p-4 h-full">
                <Link to="/dashboard" className="flex items-center">
                  <img
                    src={logoIcon}
                    alt="CHRISPP Icon"
                    className="h-8 w-auto flex-shrink-0"
                  />
                  <img
                    src={logoText}
                    alt="CHRISPP Text"
                    className={`h-5 w-auto ml-2 transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "opacity-100 block"}`}
                  />
                </Link>
              </div>
            </div>

            {/* Navigation - Improved with better contrast */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-3 mt-2">
              <nav className="px-3 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {!link.children ? (
                      <NavLink
                        to={link.path}
                        end
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 text-sm transition-all duration-200 rounded-lg ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            isActive
                              ? "text-white font-semibold bg-white/15 shadow-sm"
                              : "text-gray-300 font-medium hover:bg-white/10 hover:text-white"
                          }`
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <link.icon size={20} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                        <span className={`text-sm ${isCollapsed ? "hidden" : "block"}`}>{link.name}</span>
                      </NavLink>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMenuClick(link.name)}
                          className={`flex items-center w-full px-3 py-2 text-sm text-gray-300 font-medium transition-all duration-200 rounded-lg hover:bg-white/10 hover:text-white ${
                            isCollapsed ? "justify-center" : "justify-between"
                          }`}
                        >
                          <div className="flex items-center">
                            <link.icon size={20} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                            <span className={`text-sm ${isCollapsed ? "hidden" : "block"}`}>{link.name}</span>
                          </div>
                          {!isCollapsed && (
                            <HiChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${
                                openMenu === link.name ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>
                        <div
                          className={`transition-all duration-200 ease-in-out overflow-hidden ${
                            openMenu === link.name && !isCollapsed ? "max-h-96" : "max-h-0"
                          }`}
                        >
                          <div className="py-1 pl-10 space-y-0.5">
                            {link.children.map((child) => (
                              <NavLink
                                key={child.name}
                                to={child.path}
                                className={({ isActive }) =>
                                  `flex items-center px-3 py-1.5 text-xs transition-all duration-200 rounded-lg ${
                                    isActive
                                      ? "text-white font-medium bg-white/15"
                                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                                  }`
                                }
                                onClick={() => setSidebarOpen(false)}
                                end={child.exact || false}
                              >
                                <child.icon size={14} className="mr-2 flex-shrink-0" />
                                <span className="text-xs">{child.name}</span>
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

            {/* Logout Button */}
            <div
              className="p-3 border-t flex-shrink-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <button
                onClick={onLogout}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <HiOutlineLogout size={20} className={`flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                <span className={`text-sm ${isCollapsed ? "hidden" : "block"}`}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
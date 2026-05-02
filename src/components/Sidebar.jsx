// Sidebar.jsx - COMPLETELY INDEPENDENT - No props, no context for color
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { useOrganizations } from "../contexts/OrganizationContext";

// DEFAULT COLOR - Dark Navy
const DEFAULT_COLOR = '#0B1A2E';

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

const Sidebar = ({
  isSidebarOpen,
  setSidebarOpen,
  onLogout,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { userPermissions: contextPermissions } = useOrganizations();
  const location = useLocation();

  // GET PERMISSIONS: Use context if available, otherwise fallback to localStorage
  const permissions = useMemo(() => {
    if (Array.isArray(contextPermissions) && contextPermissions.length > 0) {
      return contextPermissions;
    }
    // Fallback: read directly from localStorage
    try {
      const saved = localStorage.getItem('USER_PERMISSIONS');


      if (saved) {
        const parsed = JSON.parse(saved);
        //console.log("USER PERMISSIONS ", parsed);

        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  }, [contextPermissions]);


  // Load color from localStorage ONCE on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarColor');
      if (saved && saved !== 'undefined' && saved !== 'null' && saved !== DEFAULT_COLOR) {
        setCurrentColor(saved);
      } else if (!saved) {
        localStorage.setItem('sidebarColor', DEFAULT_COLOR);
      }
    } catch (error) {
      console.error('Error loading sidebar color:', error);
    }
  }, []);

  // Listen for color update events from color palette
  useEffect(() => {
    const handleColorUpdate = (event) => {
      try {
        if (event.detail && event.detail.color && event.detail.color !== 'undefined' && event.detail.color !== 'null') {
          // console.log('🎨 Sidebar received color update:', event.detail.color);
          setCurrentColor(event.detail.color);
          localStorage.setItem('sidebarColor', event.detail.color);
        }
      } catch (error) {
        console.error('Error updating sidebar color:', error);
      }
    };

    window.addEventListener('sidebarColorUpdate', handleColorUpdate);
    return () => window.removeEventListener('sidebarColorUpdate', handleColorUpdate);
  }, []);

  // Listen for organization change events
  useEffect(() => {
    const handleOrganizationChange = (event) => {
      //console.log('🏢 Organization changed event received:', event.detail);
      if (event.detail && event.detail.role) {
        setCurrentUserRole(event.detail.role);
        localStorage.setItem('CURRENT_USER_ROLE', event.detail.role);
      } else {
        // Fallback: read from localStorage
        const role = localStorage.getItem('CURRENT_USER_ROLE');
        setCurrentUserRole(role);
      }
    };

    // Also listen for storage events (when localStorage changes from another tab)
    const handleStorageChange = (event) => {
      if (event.key === 'CURRENT_USER_ROLE') {
        // console.log('🔄 Storage event - CURRENT_USER_ROLE changed to:', event.newValue);
        setCurrentUserRole(event.newValue);
      }
    };

    window.addEventListener('organizationChanged', handleOrganizationChange);
    window.addEventListener('storage', handleStorageChange);

    // Initial load
    const role = localStorage.getItem('CURRENT_USER_ROLE');
    setCurrentUserRole(role);

    return () => {
      window.removeEventListener('organizationChanged', handleOrganizationChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Determine if user is admin based on role
  const isAdmin = useMemo(() => {
    return currentUserRole === 'superadmin' ||
      currentUserRole === 'organization_admin' ||
      currentUserRole === 'hr_manager' ||
      currentUserRole === 'payroll_manager' ||
      currentUserRole === 'recruiter';
  }, [currentUserRole]);

  // Set dashboard link based on role
  const dashboardLink = useMemo(() => {
    return isAdmin ? "/dashboard/admin-dashboard" : "/dashboard/employee-dashboard";
  }, [isAdmin]);

  // Define base links
  const baseLinks = useMemo(() => [
    {
      name: "Centers",
      path: "/dashboard/organizations",
      icon: HiOutlineOfficeBuilding,
      adminOnly: true,
    },

    {
      name: "Employee",
      icon: HiOutlineUsers,
      children: [
        { name: "Manage Profiles", path: "/dashboard/employees", icon: HiOutlineCollection, exact: true, permission: "employee.add_manage_profiles.view" },
        { name: "Employment History", path: "/dashboard/employees/history", icon: HiOutlineArchive, permission: "employee.employment_history.view" },
        { name: "Probation", path: "/dashboard/employees/probation", icon: HiOutlineCheckCircle, permission: "employee.probation_confirmation.view" },
        { name: "Offboarding", path: "/dashboard/employees/exit", icon: HiOutlineUserRemove, permission: "employee.exit_offboarding.view" },
      ],
    },
    {
      name: "Rostering",
      icon: HiOutlineCalendar,
      children: [
        { name: "Shift Scheduling", path: "/dashboard/rostering/scheduling", icon: HiOutlineTable, permission: "rostering.shift_scheduling.view" },
        { name: "Roster Periods", path: "/dashboard/rostering/periods", icon: HiOutlineCalendar, permission: "rostering.roster_periods.view" },
        { name: "Weekly / Monthly Rosters", path: "/dashboard/rostering/rosters", icon: HiOutlineViewGrid, permission: "rostering.weekly_monthly_rosters.view" },
        { name: "Shift Swapping Requests", path: "/dashboard/rostering/swapping", icon: HiOutlineSwitchHorizontal, permission: "rostering.shift_swapping_requests.view" },
      ],
    },
    {
      name: "Attendance",
      icon: HiOutlineClipboardList,
      children: [
        { name: "Attendance Tracking", path: "/dashboard/attendance/tracking", icon: HiOutlineFingerPrint, permission: "attendance.attendance_tracking.view" },
        { name: "Manual Adjustments", path: "/dashboard/attendance/adjustments", icon: HiOutlinePencilAlt, permission: "attendance.manual_adjustments.view" },
        { name: "Leave Requests", path: "/dashboard/attendance/requests", icon: HiOutlineDocumentReport, permission: "attendance.leave_requests.view" },
        { name: "Leave Balance", path: "/dashboard/attendance/balance", icon: HiOutlineCalculator, permission: "attendance.leave_balance.view" },
        { name: "Holidays & Calendars", path: "/dashboard/attendance/holidays", icon: HiOutlineCalendar, permission: "attendance.holidays_calendars.view" },
      ],
    },
    {
      name: "Timesheet",
      icon: HiOutlineClock,
      children: [
        { name: "Timesheet Entry", path: "/dashboard/timesheet/entry", icon: HiOutlineClock, permission: "timesheet.timesheet_entry.view" },
        { name: "Approvals", path: "/dashboard/timesheet/approvals", icon: HiOutlineThumbUp, permission: "timesheet.timesheet_approvals.view" },
      ],
    },
    {
      name: "Payroll",
      icon: HiOutlineCreditCard,
      children: [{ name: "Run Payroll", path: "/dashboard/payroll/run", icon: HiOutlineCash, permission: "payroll.payroll.view" }],
    },
    {
      name: "Recruitment",
      icon: HiOutlineDocumentSearch,
      children: [
        { name: "Job Openings", path: "/dashboard/recruitment/jobs", icon: HiOutlineBriefcase, permission: "recruitment.job_openings.view" },
        { name: "Applicants", path: "/dashboard/recruitment/applicants", icon: HiOutlineIdentification, permission: "recruitment.applicants.view" },
        { name: "Interview Scheduling", path: "/dashboard/recruitment/interviews", icon: HiOutlineCalendar, permission: "recruitment.interview_scheduling.view" },
        { name: "Interview", path: "/dashboard/recruitment/interview", icon: HiOutlineMicrophone, permission: "recruitment.interview.view" },
        { name: "Selection & Offers", path: "/dashboard/recruitment/offers", icon: HiOutlineDocumentText, permission: "recruitment.selection_offers.view" },
        { name: "Onboarding", path: "/dashboard/recruitment/onboarding", icon: HiOutlineUserAdd, permission: "recruitment.onboarding.view" },
      ],
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
        { name: "Role Management", path: "/dashboard/settings/roles", icon: HiOutlineShieldCheck, permission: "settings.role_management.view" },
        { name: "Assign Role to User", path: "/dashboard/settings/assign-role", icon: HiOutlineUserAdd, permission: "settings.assign_roles_to_users.view" },
        { name: "Permission Management", path: "/dashboard/settings/permissions", icon: HiOutlineKey, permission: "settings.permission_management.view" },
        { name: "Connect to Xero", path: "/dashboard/settings/xero", icon: HiOutlineSwitchHorizontal },
      ],
    },
  ], []);

  // Dashboard links
  const dashboardLinks = useMemo(() => [
    { name: "Dashboard", path: dashboardLink, icon: LuLayoutDashboard }
  ], [dashboardLink]);

  const navLinks = useMemo(() => [...dashboardLinks, ...baseLinks], [dashboardLinks, baseLinks]);

  // Helper to check permission
  const hasPermission = useCallback((permission) => {
    if (!permission) return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [permissions]);

  // Filter links based on permissions
  // Rule: items with children → filter children, show as dropdown if ≥1 visible, hide if 0
  //       items without children (Dashboard, Centers) → always show
  const filteredNavLinks = useMemo(() => {
    const isSuperadmin = permissions.includes('*');
    const result = [];

    for (const link of navLinks) {
      if (link.children) {
        // Filter children by permission
        const allowed = link.children.filter(child => {
          if (isSuperadmin) return true;             // superadmin sees all
          if (!child.permission) return false;       // no permission key = superadmin only
          return permissions.includes(child.permission);
        });

        if (allowed.length > 0) {
          // ALWAYS a dropdown - even for just 1 child
          result.push({ ...link, visibleChildren: allowed, isDropdown: true });
        }
        // 0 allowed children → skip entirely (invisible)
      } else {
        // Simple link - check adminOnly flag
        if (link.adminOnly && !isSuperadmin && !isAdmin) continue;
        result.push({ ...link, isDropdown: false });
      }
    }

    return result;
  }, [navLinks, permissions, isAdmin]);

  //console.log("🧭 SIDEBAR:", { permCount: permissions.length, links: filteredNavLinks.map(l => l.name) });

  // Find active parent menu
  const findActiveParent = useCallback(() => {
    for (const link of navLinks) {
      if (link.children) {
        const isChildActive = link.children.some((child) => {
          if (child.exact) return location.pathname === child.path;
          if (child.path === "/dashboard/employees/manage") {
            return location.pathname === child.path || location.pathname.startsWith(child.path + "/");
          }
          return location.pathname.startsWith(child.path);
        });

        if (isChildActive) {
          return link.name;
        }
      }
    }
    return null;
  }, [location.pathname, navLinks]);

  // Handle submenu open/close
  useEffect(() => {
    const activeParent = findActiveParent();
    setOpenMenu(activeParent);
  }, [location.pathname, findActiveParent]);

  const handleMenuClick = (menuName) => {
    if (!isCollapsed) {
      setOpenMenu(openMenu === menuName ? null : menuName);
    }
  };

  const getButtonBorderColor = () => {
    return "rgba(255, 255, 255, 0.2)";
  };

  const buttonBorderColor = getButtonBorderColor();

  // Sidebar background is darkened, active tab uses original/lighter color
  const sidebarBg = darkenColor(currentColor, 30);
  const activeBg = lightenColor(currentColor, 15);
  const hoverBg = lightenColor(currentColor, 8);

  //console.log('🎨 Sidebar rendering - isAdmin:', isAdmin, 'role:', currentUserRole, 'dashboardLink:', dashboardLink);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar wrapper */}
      <div
        className={`fixed left-0 flex flex-col z-30 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          md:translate-x-0`}
        style={{
          top: "8px",
          left: "6px",
          bottom: "8px",
          height: "calc(100vh - 16px)"
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
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-3 mt-4">
            <nav className={`${isCollapsed ? "px-2" : "px-3"} space-y-1`}>
              {filteredNavLinks.map((link) => (
                <div key={link.name}>
                  {!link.isDropdown ? (
                    <NavLink
                      to={link.path}
                      end
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? "justify-center px-2" : "px-3"} py-2.5 transition-all duration-200 rounded-lg ${isActive
                          ? "text-white font-semibold shadow-sm"
                          : "text-white/90 font-medium hover:text-white"
                        }`
                      }
                      style={({ isActive }) => (isActive ? { backgroundColor: activeBg } : {})}
                      onClick={() => setSidebarOpen(false)}
                      title={isCollapsed ? link.name : ""}
                    >
                      <link.icon size={20} className="flex-shrink-0" />
                      <span className={`text-base ml-3 transition-all duration-200 ${isCollapsed ? "hidden" : "block"}`}>{link.name}</span>
                    </NavLink>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMenuClick(link.name)}
                        className={`flex items-center w-full ${isCollapsed ? "justify-center px-2" : "px-3 justify-between"} py-2.5 text-base text-white font-medium transition-all duration-200 rounded-lg hover:text-white`}
                        style={{ ':hover': { backgroundColor: hoverBg } }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={isCollapsed ? link.name : ""}
                      >
                        <div className="flex items-center">
                          <link.icon size={20} className="flex-shrink-0" />
                          <span className={`text-base ml-3 transition-all duration-200 ${isCollapsed ? "hidden" : "block"}`}>{link.name}</span>
                        </div>
                        {!isCollapsed && (
                          <HiChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${openMenu === link.name ? "rotate-180" : ""
                              }`}
                          />
                        )}
                      </button>
                      <div
                        className={`transition-all duration-200 ease-in-out overflow-hidden ${openMenu === link.name && !isCollapsed ? "max-h-96" : "max-h-0"
                          }`}
                      >
                        <div className="py-1.5 pl-10 space-y-0.5">
                          {(link.visibleChildren || []).map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.path}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 transition-all duration-200 rounded-lg ${isActive
                                  ? "text-white font-semibold shadow-sm"
                                  : "text-white/80 hover:text-white"
                                }`
                              }
                              style={({ isActive }) => (isActive ? { backgroundColor: activeBg } : {})}
                              onClick={() => setSidebarOpen(false)}
                              end={child.exact || false}
                            >
                              <child.icon size={16} className="mr-2 flex-shrink-0" />
                              <span className="text-sm">{child.name}</span>
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
          <div className="p-3 border-t flex-shrink-0" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
            <button
              onClick={onLogout}
              className={`flex items-center w-full ${isCollapsed ? "justify-center px-2" : "px-3"} py-2.5 text-base font-medium transition-all duration-200 rounded-lg text-white hover:text-white`}
              title={isCollapsed ? "Logout" : ""}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <HiOutlineLogout size={20} className="flex-shrink-0" />
              <span className={`text-base ml-3 transition-all duration-200 ${isCollapsed ? "hidden" : "block"}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
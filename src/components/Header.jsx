/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  HiMenuAlt1,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineBell,
  HiCheck,
  HiOutlineOfficeBuilding,
  HiOutlineLogout,
  HiSelector,
  HiChevronDown,
  HiChevronUp,
  HiOutlineCog,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { useLocation, Link, useNavigate } from "react-router-dom";
import profileImage from "../assets/dummy.png";
import { useOrganizations } from "../contexts/OrganizationContext";
import { useTheme } from "../contexts/ThemeContext";
import { getEmployee } from "../services/employeeService";
import { getNotifications, markAsRead } from "../services/notificationService";

const Header = ({ onMenuButtonClick, onLogout, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const orgDropdownRef = useRef(null);
  
  // Notification states
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const notificationDropdownRef = useRef(null);

  const {
    organizations,
    selectedOrganization,
    selectOrganization,
    isLoading,
    currentUserRole,
  } = useOrganizations();
  const { sidebarColor } = useTheme();
  const [employeeName, setEmployeeName] = useState(null);

  // Helper: Retrieve active organization ID
  const getActiveOrgId = () => {
    if (selectedOrganization?.id) {
      return selectedOrganization.id;
    }
    const savedOrgId = localStorage.getItem("selectedOrgId");
    if (savedOrgId) {
      return parseInt(savedOrgId, 10);
    }
    return null;
  };

  // Helper: Format date string to relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  // Fetch initial notifications (page 1)
  const fetchInitialNotifications = async () => {
    const orgId = getActiveOrgId();
    if (!orgId) return;

    setIsLoadingNotifications(true);
    try {
      const response = await getNotifications(orgId, 1);
      if (response.data && response.data.success) {
        const paginatedData = response.data.data;
        setNotifications(paginatedData.data || []);
        setUnreadCount(response.data.unread_count || 0);
        setPage(1);
        setHasMore(paginatedData.current_page < paginatedData.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch initial notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch next page of notifications (infinite scroll)
  const fetchNextNotifications = async () => {
    if (isLoadingMore || !hasMore) return;

    const orgId = getActiveOrgId();
    if (!orgId) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await getNotifications(orgId, nextPage);
      if (response.data && response.data.success) {
        const paginatedData = response.data.data;
        setNotifications((prev) => [...prev, ...(paginatedData.data || [])]);
        setUnreadCount(response.data.unread_count || 0);
        setPage(nextPage);
        setHasMore(paginatedData.current_page < paginatedData.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch next page of notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Fetch notifications on mount or when organization ID changes
  useEffect(() => {
    fetchInitialNotifications();
  }, [selectedOrganization?.id]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target)
      ) {
        setOrgDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    if (!isNotificationOpen) {
      fetchInitialNotifications();
    }
    setNotificationOpen(!isNotificationOpen);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 15) {
      fetchNextNotifications();
    }
  };

  const handleNotificationItemClick = async (notification) => {
    if (!notification.read_at) {
      try {
        await markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    setNotificationOpen(false);

    const routeLink = notification.data?.route_link;
    if (routeLink) {
      const targetLink = routeLink.startsWith("/dashboard")
        ? routeLink
        : `/dashboard${routeLink}`;
      navigate(targetLink);
    }
  };

  // Fetch employee name when on an employee profile page
  useEffect(() => {
    const pathName = location.pathname.split("/").filter((x) => x);
    // Match /dashboard/employees/:id
    if (
      pathName.length === 3 &&
      pathName[0] === "dashboard" &&
      pathName[1] === "employees" &&
      /^\d+$/.test(pathName[2])
    ) {
      const employeeId = pathName[2];
      setEmployeeName(null); // reset while loading
      getEmployee(employeeId)
        .then((response) => {
          const emp = response.data?.data;
          if (emp) {
            const fullName = [emp.first_name, emp.last_name]
              .filter(Boolean)
              .join(" ");
            setEmployeeName(fullName || `Employee #${employeeId}`);
          }
        })
        .catch(() => {
          setEmployeeName(null);
        });
    } else {
      setEmployeeName(null);
    }
  }, [location.pathname]);

  const getPageTitle = () => {
    const pathName = location.pathname.split("/").filter((x) => x);

    // Define dashboard identifiers
    const dashboardPaths = [
      "admin-dashboard",
      "employee-dashboard",
      "dashboard",
    ];

    // Determine if we are on a main dashboard page
    const isDashboard =
      (pathName.length === 1 && pathName[0] === "dashboard") ||
      (pathName.length === 2 &&
        pathName[0] === "dashboard" &&
        dashboardPaths.includes(pathName[1]));

    if (isDashboard) {
      return `Welcome ${user?.name || "User"}`;
    }

    // For other pages, get the most relevant segment
    let title =
      pathName.length > 2
        ? pathName[pathName.length - 1]
        : pathName.length > 1
          ? pathName[1]
          : pathName[0] || "Dashboard";

    // Handle edit routes with IDs
    if (/^\d+$/.test(title) && pathName.includes("edit")) {
      return "Edit";
    }

    // If on employee profile page, show the employee name
    if (/^\d+$/.test(title) && pathName[1] === "employees" && employeeName) {
      return employeeName;
    }

    // If the last segment is a number (e.g. an ID), use route state title if available
    if (/^\d+$/.test(title) && location.state?.jobTitle) {
      return location.state.jobTitle;
    }

    // Convert 'organizations' to 'Centers'
    if (title.toLowerCase() === "organizations") {
      return "Centers";
    }

    return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ");
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onMenuButtonClick}
            className="text-gray-600 mr-4 md:hidden"
            aria-label="Open sidebar"
          >
            <HiMenuAlt1 size={24} />
          </button>
          <h2
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: sidebarColor }}
          >
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex-1 flex justify-center px-4 lg:px-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={orgDropdownRef}>
            <button
              onClick={() => setOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 bg-gray-50/50"
            >
              <HiOutlineOfficeBuilding size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700 hidden md:block max-w-[150px] truncate">
                {isLoading
                  ? "Loading..."
                  : selectedOrganization?.name || "No Center"}
              </span>
              <HiSelector size={16} className="text-gray-400" />
            </button>
            {isOrgDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      selectOrganization(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors ${selectedOrganization?.id === org.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <span className="truncate">{org.name}</span>
                    {selectedOrganization?.id === org.id && (
                      <HiCheck
                        size={16}
                        className="text-indigo-600 flex-shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative transition-all duration-200"
              aria-label="Notifications"
            >
              <HiOutlineBell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-[400px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-semibold text-gray-800 text-base">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {/* Notification items list */}
                <div
                  className="overflow-y-auto flex-1 divide-y divide-gray-100 scrollbar-thin"
                  onScroll={handleScroll}
                  style={{ maxHeight: "380px" }}
                >
                  {isLoadingNotifications && notifications.length === 0 ? (
                    // Initial loader
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                      <p className="text-sm">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    // Empty state
                    <div className="py-12 px-4 flex flex-col items-center justify-center text-center text-gray-500">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <HiOutlineBell size={28} className="text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-700">All caught up!</p>
                      <p className="text-xs text-gray-400 mt-1">You have no notifications for this center.</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => {
                        const isUnread = !notification.read_at;
                        return (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationItemClick(notification)}
                            className={`p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors duration-150 cursor-pointer text-left ${
                              isUnread ? "bg-indigo-50/30" : ""
                            }`}
                          >
                            {/* Icon column */}
                            <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                              isUnread ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500"
                            }`}>
                              {notification.type === "document_upload" ? (
                                <HiOutlineDocumentText size={18} />
                              ) : (
                                <HiOutlineBell size={18} />
                              )}
                            </div>

                            {/* Text column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-0.5">
                                <h4 className={`text-sm font-semibold truncate ${
                                  isUnread ? "text-gray-900" : "text-gray-700"
                                }`}>
                                  {notification.title || "Notification"}
                                </h4>
                                <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                                  {formatRelativeTime(notification.created_at)}
                                </span>
                              </div>
                              <p className={`text-xs break-words leading-relaxed ${
                                isUnread ? "text-gray-600 font-medium" : "text-gray-500"
                              }`}>
                                {notification.message}
                              </p>
                            </div>

                            {/* Unread indicator dot */}
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                        );
                      })}

                      {/* Loading more spinner */}
                      {isLoadingMore && (
                        <div className="py-3 flex items-center justify-center bg-gray-50/50 border-t border-gray-100">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                          <span className="text-xs text-gray-500 font-medium">Loading more...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center group"
            >
              <div className="hidden sm:flex flex-col items-end mr-3">
                <span className="text-gray-800 font-bold text-[15px] group-hover:text-indigo-600 transition-colors leading-tight">
                  {user ? user.name : "User"}
                </span>
                <span className="text-gray-500 text-[10px] font-medium italic">
                  {currentUserRole
                    ? currentUserRole.charAt(0).toUpperCase() +
                      currentUserRole.slice(1).toLowerCase()
                    : "Member"}
                </span>
              </div>
              <div className="relative">
                <img
                  src={profileImage}
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center z-50">
                <img
                  src={profileImage}
                  alt="User profile"
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
                <p className="font-bold text-gray-800 text-lg uppercase tracking-tight">
                  {user ? user.name : "User Name"}
                </p>
                <p className="text-indigo-600 font-bold text-xs uppercase mb-1">
                  {currentUserRole || "Member"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {user ? user.email : "user@example.com"}
                </p>
                <hr className="w-full my-2" />
                {/* {currentUserRole?.toLowerCase() === 'employee' && (
                                    <div className="w-full text-left">
                                        <Link to="/dashboard/profile" className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                                            <HiOutlineUser className="mr-3 text-indigo-500" />
                                            My Profile
                                        </Link>
                                    </div>
                                )} */}
                {/* Profile Settings - visible to everyone */}
                <div className="w-full text-left">
                  <Link
                    to="/dashboard/profile-settings"
                    className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <HiOutlineCog className="mr-3 text-indigo-500" />
                    Profile Settings
                  </Link>
                </div>
                <div className="w-full mt-4">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-4 py-2 border border-red-500 rounded-lg text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <HiOutlineLogout />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from "react";
// THE FIX: Import `useLocation` to read the current URL
import { NavLink, Link, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo1.png";
import logoText from "../assets/logotext.png";
import { LuLayoutDashboard } from "react-icons/lu";
import { 
    HiOutlineOfficeBuilding, HiOutlineDocumentSearch, HiOutlineUsers,
    HiOutlineClipboardList, HiOutlineClock, HiOutlineCalendar,
    HiOutlineCreditCard, HiOutlineChartBar, HiOutlineLogout,
    HiChevronDown, HiOutlineBriefcase, HiOutlineIdentification,
    HiOutlineUserAdd, HiOutlineDocumentText, HiOutlineCollection,
    HiOutlineUserCircle, HiOutlineArchive, HiOutlineCheckCircle,
    HiOutlineUserRemove, HiOutlineFingerPrint, HiOutlinePencilAlt,
    HiOutlineDocumentReport, HiOutlineCalculator, HiOutlineThumbUp,
    HiOutlineTrendingUp, HiOutlineTable, HiOutlineSwitchHorizontal,
    HiOutlineViewGrid, HiOutlineBell, HiOutlineCog, HiOutlineCash,
    HiOutlineMinusCircle, HiOutlinePrinter, HiOutlineGift, HiOutlineFlag,
    HiOutlineChartPie, HiOutlineAnnotation, HiOutlineSpeakerphone,
    HiChevronDoubleLeft,
    HiChevronDoubleRight,
    HiOutlineShieldCheck
} from "react-icons/hi";


const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
    { name: "Organizations", path: "/dashboard/organizations", icon: HiOutlineOfficeBuilding },
    { 
        name: "Recruitment", icon: HiOutlineDocumentSearch,
        children: [
            { name: "Job Openings", path: "/dashboard/recruitment/jobs", icon: HiOutlineBriefcase },
            { name: "Applicants", path: "/dashboard/recruitment/applicants", icon: HiOutlineIdentification },
            { name: "Interview Scheduling", path: "/dashboard/recruitment/interviews", icon: HiOutlineCalendar },
            { name: "Selection & Offers", path: "/dashboard/recruitment/offers", icon: HiOutlineDocumentText },
            { name: "Onboarding", path: "/dashboard/recruitment/onboarding", icon: HiOutlineUserAdd },
        ]
    },
    { 
        name: "Employee", icon: HiOutlineUsers, 
        children: [
            { name: "Employee Directory", path: "/dashboard/employees/directory", icon: HiOutlineCollection },
            { name: "Add / Manage Profiles", path: "/dashboard/employees/manage", icon: HiOutlineUserCircle },
            { name: "Departments & Designations", path: "/dashboard/employees/departments", icon: HiOutlineOfficeBuilding },
            { name: "Employment History", path: "/dashboard/employees/history", icon: HiOutlineArchive },
            { name: "Probation / Confirmation", path: "/dashboard/employees/probation", icon: HiOutlineCheckCircle },
            { name: "Exit / Offboarding", path: "/dashboard/employees/exit", icon: HiOutlineUserRemove },
        ] 
    },
    { 
        name: "Attendance", icon: HiOutlineClipboardList, 
        children: [
            { name: "Attendance Tracking", path: "/dashboard/attendance/tracking", icon: HiOutlineFingerPrint },
            { name: "Manual Adjustments", path: "/dashboard/attendance/adjustments", icon: HiOutlinePencilAlt },
            { name: "Leave Requests", path: "/dashboard/attendance/requests", icon: HiOutlineDocumentReport },
            { name: "Leave Balance", path: "/dashboard/attendance/balance", icon: HiOutlineCalculator },
            { name: "Holidays & Calendars", path: "/dashboard/attendance/holidays", icon: HiOutlineCalendar },
        ] 
    },
    { 
        name: "Timesheet", icon: HiOutlineClock, 
        children: [
            { name: "Timesheet Entry", path: "/dashboard/timesheet/entry", icon: HiOutlineClock },
            { name: "Approvals", path: "/dashboard/timesheet/approvals", icon: HiOutlineThumbUp },
            { name: "Overtime Tracking", path: "/dashboard/timesheet/overtime", icon: HiOutlineTrendingUp },
            { name: "Reports", path: "/dashboard/timesheet/reports", icon: HiOutlineDocumentText },
        ] 
    },
    { 
        name: "Rostering", icon: HiOutlineCalendar, 
        children: [
            { name: "Shift Scheduling", path: "/dashboard/rostering/scheduling", icon: HiOutlineTable },
            { name: "Shift Swapping Requests", path: "/dashboard/rostering/swapping", icon: HiOutlineSwitchHorizontal },
            { name: "Weekly / Monthly Rosters", path: "/dashboard/rostering/rosters", icon: HiOutlineViewGrid },
            { name: "Notifications", path: "/dashboard/rostering/notifications", icon: HiOutlineBell },
        ] 
    },
    { 
        name: "Payroll", icon: HiOutlineCreditCard, 
        children: [
            { name: "Salary Structure Setup", path: "/dashboard/payroll/setup", icon: HiOutlineCog },
            { name: "Salary Processing", path: "/dashboard/payroll/processing", icon: HiOutlineCash },
            { name: "Deductions", path: "/dashboard/payroll/deductions", icon: HiOutlineMinusCircle },
            { name: "Payslip Generation", path: "/dashboard/payroll/payslips", icon: HiOutlinePrinter },
            { name: "Bonus & Incentives", path: "/dashboard/payroll/bonus", icon: HiOutlineGift },
            { name: "Payroll Reports", path: "/dashboard/payroll/reports", icon: HiOutlineDocumentReport },
        ] 
    },
    { 
        name: "Performance", icon: HiOutlineChartBar, 
        children: [
            { name: "Goal Setting", path: "/dashboard/performance/goals", icon: HiOutlineFlag },
            { name: "KPI / OKR Tracking", path: "/dashboard/performance/tracking", icon: HiOutlineChartPie },
            { name: "Performance Reviews", path: "/dashboard/performance/reviews", icon: HiOutlineAnnotation },
            { name: "Feedback & Appraisals", path: "/dashboard/performance/appraisals", icon: HiOutlineSpeakerphone },
        ],
    },
     {
        name: "Settings", icon: HiOutlineCog,
        children: [
            { name: "Manage Permission", path: "/dashboard/settings/permission", icon: HiOutlineShieldCheck }
        ]
    }
];

const Sidebar = ({ isSidebarOpen, setSidebarOpen, onLogout, isCollapsed, setIsCollapsed }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation();

    // THE FIX: This `useEffect` checks the URL and opens the correct parent menu on page load/navigation
    useEffect(() => {
        const currentParent = navLinks.find(link =>
            link.children?.some(child => location.pathname.startsWith(child.path))
        );
        if (currentParent) {
            setOpenMenu(currentParent.name);
        }
    }, [location.pathname]);

    const handleLogoutClick = () => {
        onLogout();
    };

    const handleMenuClick = (menuName) => {
        if (!isCollapsed) {
            setOpenMenu(openMenu === menuName ? null : menuName);
        }
    };

    const linkStyle =
        "flex items-center px-4 h-14 my-1 rounded-lg text-base transition-colors duration-200";

    const getNavLinkClass = ({ isActive }) => {
        const collapsedClass = isCollapsed ? 'justify-center' : '';
        return isActive
            ? `${linkStyle} bg-brand-blue text-white font-semibold shadow-lg ${collapsedClass}`
            : `${linkStyle} text-gray-300 font-semibold hover:bg-white hover:text-black ${collapsedClass}`;
    };

    const getSubNavLinkClass = ({ isActive }) => {
        return isActive
            ? `flex items-center w-full px-4 py-2.5 my-1 rounded-lg text-sm bg-brand-blue text-white font-semibold`
            : `flex items-center w-full px-4 py-2.5 my-1 rounded-lg text-sm text-gray-400 hover:bg-white hover:text-black`;
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>
     
            <div 
                className={`fixed inset-y-0 left-0 bg-black border-r border-gray-800 flex flex-col justify-between z-30 transition-all duration-300 ease-in-out
                md:sticky md:top-0 md:h-screen
                ${isCollapsed ? 'md:w-24' : 'md:w-64'}
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                md:translate-x-0`}
            >
                <div className="relative h-full flex flex-col">
                    <div className="absolute top-[104px] -right-4 -translate-y-1/2 hidden md:block z-10">
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)} 
                            className="bg-white text-black p-1.5 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <HiChevronDoubleRight size={18} /> : <HiChevronDoubleLeft size={18} />}
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
                        <div>
                            <div className="flex items-center p-6 border-b border-gray-800 h-[104px] justify-center">
                                <Link to="/dashboard" className="flex items-center">
                                    <img src={logoIcon} alt="CHRISPP Icon" className="h-10 w-auto flex-shrink-0" />
                                    <img src={logoText} alt="CHRISPP Text" className={`h-7 w-auto ml-3 transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`} />
                                </Link>
                            </div>

                            <nav className="mt-4 px-4">
                                {navLinks.map((link) => (
                                    <div key={link.name} className="my-2">
                                        {!link.children ? (
                                            <NavLink to={link.path} end className={getNavLinkClass} onClick={() => setSidebarOpen(false)}>
                                                <link.icon size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-4'}`} />
                                                <span className={isCollapsed ? 'hidden' : 'block'}>{link.name}</span>
                                            </NavLink>
                                        ) : (
                                            <>
                                                <button onClick={() => handleMenuClick(link.name)} className={`flex items-center w-full px-4 h-14 rounded-lg text-base text-gray-300 font-semibold hover:bg-white hover:text-black transition-colors duration-200 text-left ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                                                    <div className="flex items-center">
                                                        <link.icon size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-4'}`} />
                                                        <span className={isCollapsed ? 'hidden' : 'block'}>{link.name}</span>
                                                    </div>
                                                    <HiChevronDown className={`transition-transform duration-300 ${isCollapsed ? 'hidden' : 'block'} ${openMenu === link.name ? 'rotate-180' : ''}`} />
                                                </button>
                                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openMenu === link.name && !isCollapsed ? 'max-h-screen' : 'max-h-0'}`}>
                                                    <div className="py-2 pl-4">
                                                        {link.children.map((child) => (
                                                           // THE FIX: The `end` prop has been removed to allow partial matching
                                                           <NavLink key={child.name} to={child.path} className={getSubNavLinkClass} onClick={() => setSidebarOpen(false)}>
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
                    </div>
                    
                    <div className="p-4 border-t border-gray-800">
                        <button onClick={handleLogoutClick} className={`flex items-center w-full px-4 h-12 rounded-lg text-base font-semibold hover:bg-white hover:text-red-600 text-white duration-200 ${isCollapsed ? 'justify-center' : ''}`}>
                            <HiOutlineLogout size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-4'}`} />
                            <span className={isCollapsed ? 'hidden' : 'block'}>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;


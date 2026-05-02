/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt1, HiOutlineUser, HiOutlineSearch, HiOutlineBell, HiCheck, HiOutlineOfficeBuilding, HiOutlineLogout, HiSelector, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useLocation, Link } from 'react-router-dom';
import profileImage from '../assets/dummy.png';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ onMenuButtonClick, onLogout, user }) => {
    const location = useLocation();
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isOrgDropdownOpen, setOrgDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const orgDropdownRef = useRef(null);
    const { organizations, selectedOrganization, selectOrganization, isLoading, currentUserRole } = useOrganizations();
    const { sidebarColor } = useTheme();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
            if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target)) {
                setOrgDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPageTitle = () => {
        const pathName = location.pathname.split('/').filter(x => x);
        
        // Define dashboard identifiers
        const dashboardPaths = ['admin-dashboard', 'employee-dashboard', 'dashboard'];
        
        // Determine if we are on a main dashboard page
        const isDashboard = (pathName.length === 1 && pathName[0] === 'dashboard') || 
                           (pathName.length === 2 && pathName[0] === 'dashboard' && dashboardPaths.includes(pathName[1]));

        if (isDashboard) {
            return `Welcome ${user?.name || 'User'}`;
        }
        
        // For other pages, get the most relevant segment
        let title = pathName.length > 2 ? pathName[pathName.length - 1] : (pathName.length > 1 ? pathName[1] : pathName[0] || 'Dashboard');
        
        // Handle edit routes with IDs
        if (/^\d+$/.test(title) && pathName.includes('edit')) {
            return 'Edit';
        }

        // If the last segment is a number (e.g. an ID), use route state title if available
        if (/^\d+$/.test(title) && location.state?.jobTitle) {
            return location.state.jobTitle;
        }
        
        // Convert 'organizations' to 'Centers'
        if (title.toLowerCase() === 'organizations') {
            return 'Centers';
        }
        
        return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
    };

    const handleLogoutClick = () => { onLogout(); };

    const getInitials = (name) => {
        if (!name) return "";
        const words = name.split(' ');
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 bg-white shadow-sm z-20">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <button onClick={onMenuButtonClick} className="text-gray-600 mr-4 md:hidden" aria-label="Open sidebar"><HiMenuAlt1 size={24} /></button>
                    <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: sidebarColor }}>
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
                                {isLoading ? 'Loading...' : selectedOrganization?.name || 'No Center'}
                            </span>
                            <HiSelector size={16} className="text-gray-400" />
                        </button>
                        {isOrgDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                                {organizations.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => { selectOrganization(org.id); setOrgDropdownOpen(false); }}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors ${selectedOrganization?.id === org.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <span className="truncate">{org.name}</span>
                                        {selectedOrganization?.id === org.id && <HiCheck size={16} className="text-indigo-600 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100"><HiOutlineBell size={24} /></button>

                    <div className="relative" ref={userDropdownRef}>
                        <button onClick={() => setUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center group">
                            <div className="hidden sm:flex flex-col items-end mr-3">
                                <span className="text-gray-800 font-bold text-[15px] group-hover:text-indigo-600 transition-colors leading-tight">
                                    {user ? user.name : 'User'}
                                </span>
                                <span className="text-gray-500 text-[10px] font-medium italic">
                                    {currentUserRole ? (currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1).toLowerCase()) : 'Member'}
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
                                <img src={profileImage} alt="User profile" className="w-20 h-20 rounded-full object-cover mb-2" />
                                <p className="font-bold text-gray-800 text-lg uppercase tracking-tight">{user ? user.name : 'User Name'}</p>
                                <p className="text-indigo-600 font-bold text-xs uppercase mb-1">{currentUserRole || 'Member'}</p>
                                <p className="text-sm text-gray-500 mb-4">{user ? user.email : 'user@example.com'}</p>
                                <hr className="w-full my-2" />
                                {currentUserRole?.toLowerCase() === 'employee' && (
                                    <div className="w-full text-left">
                                        <Link to="/dashboard/profile" className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                                            <HiOutlineUser className="mr-3 text-indigo-500" />
                                            My Profile
                                        </Link>
                                    </div>
                                )}
                                <div className="w-full mt-4">
                                    <button onClick={handleLogoutClick} className="w-full px-4 py-2 border border-red-500 rounded-lg text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2">
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
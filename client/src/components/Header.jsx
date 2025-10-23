import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt1, HiOutlineUser, HiOutlineSearch, HiOutlineBell, HiCheck, HiOutlineOfficeBuilding, HiOutlineLogout } from 'react-icons/hi';
import { useLocation, Link } from 'react-router-dom';
import profileImage from '../assets/dummy.png'; 
import { useOrganizations } from '../contexts/OrganizationContext';

const Header = ({ onMenuButtonClick, onLogout, user }) => {
    const location = useLocation();
    const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isOrgDropdownOpen, setOrgDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const orgDropdownRef = useRef(null);
    const { organizations, selectedOrganization, selectOrganization, isLoading } = useOrganizations();

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
        const title = pathName.length > 1 ? pathName[1] : 'Dashboard';
        return title.charAt(0).toUpperCase() + title.slice(1);
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
                    <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
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
                        <button onClick={() => setOrgDropdownOpen(!isOrgDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                            <HiOutlineOfficeBuilding size={24} className="text-gray-600" />
                            <span className="font-semibold text-gray-800 hidden md:block">
                                {isLoading ? 'Loading...' : selectedOrganization?.name || 'No Organization'}
                            </span>
                        </button>
                        {isOrgDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2">
                                <p className="font-bold px-4 py-2 text-gray-800">Select Organization</p>
                                <hr/>
                                {organizations.map(org => (
                                    <button 
                                        key={org.id}
                                        onClick={() => { selectOrganization(org.id); setOrgDropdownOpen(false); }}
                                        className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                    >
                                        <span>{org.name}</span>
                                        {selectedOrganization?.id === org.id && <HiCheck className="text-brand-blue" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100"><HiOutlineBell size={24} /></button>

                    <div className="relative" ref={userDropdownRef}>
                        <button onClick={() => setUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center">
                            <span className="text-gray-700 font-medium mr-3 hidden sm:block">{user ? user.name : 'User'}</span>
                            <img src={profileImage} alt="User profile" className="w-10 h-10 rounded-full object-cover" />
                        </button>
                        {isUserDropdownOpen && (
                           <div className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center">
                                <img src={profileImage} alt="User profile" className="w-20 h-20 rounded-full object-cover mb-2" />
                                <p className="font-bold text-gray-800 text-lg">{user ? user.name : 'User Name'}</p>
                                <p className="text-sm text-gray-500 mb-4">{user ? user.email : 'user@example.com'}</p>
                                <hr className="w-full my-2" />
                                <div className="w-full text-left">
                                    <Link to="/dashboard/profile" className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                                        <HiOutlineUser className="mr-3" />
                                        My Profile
                                    </Link>
                                </div>
                                <div className="w-full mt-4">
                                    <button onClick={handleLogoutClick} className="w-full px-4 py-2 border border-indigo-500 rounded-lg text-indigo-500 font-semibold hover:bg-indigo-500 hover:text-white transition-colors duration-200">
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
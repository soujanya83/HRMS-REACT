import React, { useState, useEffect, useRef } from 'react';
// THE FIX: Remove HiUserCircle as we are now using a real image
import { HiMenuAlt1, HiOutlineUser } from 'react-icons/hi';
import { useLocation, Link, useNavigate } from 'react-router-dom';
// THE FIX: Import your new profile image
import profileImage from '../assets/dummy.png'; 

const Header = ({ onMenuButtonClick, onLogout, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    const handleLogoutClick = () => {
        onLogout();
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
                    <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className="flex items-center"
                    >
                        <span className="text-gray-700 font-medium mr-3 hidden sm:block">
                            {user ? user.name : 'User'}
                        </span>
                        {/* THE FIX: Replaced the icon with your profile image */}
                        <img 
                            src={profileImage} 
                            alt="User profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center">
                            {/* THE FIX: Replaced the initials with your profile image */}
                            <img 
                                src={profileImage} 
                                alt="User profile"
                                className="w-20 h-20 rounded-full object-cover mb-2"
                            />
                            
                            <p className="font-bold text-gray-800 text-lg">{user ? user.name : 'User Name'}</p>
                            <p className="text-sm text-gray-500 mb-4">{user ? user.email : 'user@example.com'}</p>

                            <hr className="w-full my-2" />

                            <div className="w-full text-left">
                                <Link 
                                    to="/dashboard/profile"
                                    className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <HiOutlineUser className="mr-3" />
                                    My Profile
                                </Link>
                            </div>

                            <div className="w-full mt-4">
                                <button
                                    onClick={handleLogoutClick}
                                    className="w-full px-4 py-2 border border-indigo-500 rounded-lg text-indigo-500 font-semibold hover:bg-indigo-500 hover:text-white transition-colors duration-200"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;


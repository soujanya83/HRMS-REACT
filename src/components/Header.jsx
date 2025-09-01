import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt1, HiUserCircle, HiOutlineUser } from 'react-icons/hi';
import { useLocation, Link, useNavigate } from 'react-router-dom';

 
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
                        <HiUserCircle size={36} className="text-gray-400" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center">
                       
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold mb-2">
                                {user ? getInitials(user.name) : 'U'}
                            </div>
                      
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


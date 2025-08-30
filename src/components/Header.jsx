import React from 'react';
import { HiMenuAlt1, HiUserCircle } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuButtonClick }) => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className="sticky top-0 bg-white shadow-sm z-10">
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

                <div className="flex items-center">
                    <span className="text-gray-700 font-medium mr-3 hidden sm:block">Mikky</span>
                    <HiUserCircle size={36} className="text-gray-400" />
                </div>
            </div>
        </header>
    );
};

export default Header;


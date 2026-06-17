import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaFileAlt,
  FaClipboardList,
  FaShieldAlt,
} from 'react-icons/fa';

const EmployeeOnboardingLayout = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard/employee-onboarding/personal-details',
      label: 'Personal Details',
      icon: FaUser,
    },
    {
      path: '/dashboard/employee-onboarding/certificates',
      label: 'Certificates',
      icon: FaFileAlt,
    },
    {
      path: '/dashboard/employee-onboarding/documents',
      label: 'Documents',
      icon: FaClipboardList,
    },
    {
      path: '/dashboard/employee-onboarding/policies',
      label: 'Policies',
      icon: FaShieldAlt,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Employee Onboarding</h2>
          <p className="text-sm text-gray-500 mt-1">Complete your profile</p>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeOnboardingLayout;

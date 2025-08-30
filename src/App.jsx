import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './index.css';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardContent from './components/DashboardContent';

const EmployeePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Employee Page</h1></div>;
const AttendancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Attendance Page</h1></div>;
const PayrollPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Payroll Page</h1></div>;

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ isLoggedIn, children }) => {
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

function App() {
  // FIX 1: Initialize state from sessionStorage.
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("isLoggedIn") === "true"
  );

  // This effect is optional but helps sync state changes to sessionStorage.
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('isLoggedIn', 'true');
    } else {
      sessionStorage.removeItem('isLoggedIn');
    }
  }, [isLoggedIn]);

  // FIX 2: On login, save state to sessionStorage.
  const handleLogin = () => {
    sessionStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // FIX 3: On logout, remove state from sessionStorage.
  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
            <LoginPage onLogin={handleLogin} />
        </PublicRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <DashboardLayout onLogout={handleLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardContent /> },
        { path: "employees", element: <EmployeePage /> },
        { path: "attendance", element: <AttendancePage /> },
        { path: "payroll", element: <PayrollPage /> },
      ],
    },
    {
      path: "/",
      element: <Navigate to="/login" />,
    },
    {
      path: "*",
      element: <Navigate to="/login" />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

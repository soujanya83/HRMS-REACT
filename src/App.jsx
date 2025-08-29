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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage onLogin={handleLogin} />,
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
      path: "*",
      element: <Navigate to="/dashboard" />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardContent from "./components/DashboardContent";
import { logout } from "./services/auth";  

const EmployeePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Employee Page</h1></div>;
const AttendancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Attendance Page</h1></div>;
const PayrollPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Payroll Page</h1></div>;

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ isLoggedIn, children }) => {
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("ACCESS_TOKEN"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
 
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logout();  
      console.log("Logout successful on server");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <PublicRoute isLoggedIn={isLoggedIn}><LoginPage onLogin={handleLogin} /></PublicRoute>,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <DashboardLayout onLogout={handleLogout} user={user} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardContent /> },
        { path: "employees", element: <EmployeePage /> },
        { path: "attendance", element: <AttendancePage /> },
        { path: "payroll", element: <PayrollPage /> },
      ],
    },
    { path: "/", element: <Navigate to="/login" /> },
    { path: "*", element: <Navigate to="/login" /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
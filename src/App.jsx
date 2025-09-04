import React, { useState } from "react";
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

// THE FIX: Import your new Organizations page
import OrganizationsPage from "./pages/OrganizationsPage"; 

// --- Placeholder Pages ---
const EmployeePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Employee Page</h1></div>;
const AttendancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Attendance Page</h1></div>;
const PayrollPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Payroll Page</h1></div>;
const RecruitmentPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Recruitment Page</h1></div>;
const TimesheetPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Timesheet Page</h1></div>;
const RosteringPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Rostering Page</h1></div>;
const PerformancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Performance Page</h1></div>;
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings Page</h1></div>;


// --- Route Protectors ---
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ isLoggedIn, children }) => {
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- Main App Component ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("ACCESS_TOKEN"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
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
        // THE FIX: Connect the Organizations path to your new component
        { path: "organizations", element: <OrganizationsPage /> },
        { path: "recruitment/*", element: <RecruitmentPage /> }, // Using * to catch sub-routes
        { path: "employees/*", element: <EmployeePage /> },
        { path: "attendance/*", element: <AttendancePage /> },
        { path: "timesheet/*", element: <TimesheetPage /> },
        { path: "rostering/*", element: <RosteringPage /> },
        { path: "payroll/*", element: <PayrollPage /> },
        { path: "performance/*", element: <PerformancePage /> },
        { path: "settings/*", element: <SettingsPage /> },
      ],
    },
    { path: "/", element: <Navigate to="/login" /> },
    { path: "*", element: <Navigate to="/login" /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
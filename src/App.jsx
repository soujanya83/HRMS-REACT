import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

// --- Import Pages ---
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardContent from "./components/DashboardContent";
import OrganizationsPage from "./pages/OrganizationsPage";
import JobOpeningsPage from "./pages/Recruitment/JobOpeningsPage";
import ApplicantsPage from "./pages/Recruitment/ApplicantsPage";
// THE FIX: Import your new InterviewSchedulingPage component
import InterviewSchedulingPage from "./pages/Recruitment/InterviewSchedulingPage";

// --- Import Services & Contexts ---
import { logout } from "./services/auth";
import { OrganizationProvider } from "./contexts/OrganizationContext";

// --- Placeholder Pages ---
const EmployeePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Employee Page</h1></div>;
// ... other placeholder pages

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
      localStorage.clear();
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
          <OrganizationProvider>
            <DashboardLayout onLogout={handleLogout} user={user} />
          </OrganizationProvider>
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardContent /> },
        { path: "organizations/*", element: <OrganizationsPage /> },
        // THE FIX: Added the new route for Interview Scheduling
        { 
          path: "recruitment", 
          children: [
            { path: "jobs/*", element: <JobOpeningsPage /> },
            { path: "applicants/*", element: <ApplicantsPage /> },
            { path: "interviews", element: <InterviewSchedulingPage /> },
          ]
        },
        { path: "employees/*", element: <EmployeePage /> },
        // ... all other routes
      ],
    },
    { path: "/", element: <Navigate to="/login" /> },
    { path: "*", element: <Navigate to="/login" /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
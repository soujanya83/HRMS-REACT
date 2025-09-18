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
import InterviewSchedulingPage from "./pages/Recruitment/InterviewSchedulingPage";
import SelectionAndOffersPage from "./pages/Recruitment/SelectionAndOffersPage";
// THE FIX: Import your new OnboardingPage component
import OnboardingPage from "./pages/Recruitment/OnboardingPage";

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
    // ... logout logic
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
        // THE FIX: Added the new route for Onboarding
        { 
          path: "recruitment", 
          children: [
            { path: "jobs/*", element: <JobOpeningsPage /> },
            { path: "applicants/*", element: <ApplicantsPage /> },
            { path: "interviews", element: <InterviewSchedulingPage /> },
            { path: "offers", element: <SelectionAndOffersPage /> },
            { path: "onboarding", element: <OnboardingPage /> },
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
// src/App.jsx
import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

import PublicEmployeeForm from './pages/public/PublicEmployeeForm';
import InterviewPage from "./pages/Recruitment/InterviewPage";
import ApplicationSuccess from './pages/public/ApplicationSuccess';

// --- Import Pages ---
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import EmployeeDashboardLayout from "./components/EmployeeDashboardLayout";
import ErrorPage from "./pages/ErrorPage";
import DashboardContent from "./components/DashboardContent";
import EmployeeDashboard2 from "./components/EmployeeDashboard2";
import OrganizationsPage from "./pages/OrganizationsPage";
import JobOpeningsPage from "./pages/Recruitment/JobOpeningsPage";
import ApplicantsPage from "./pages/Recruitment/ApplicantsPage";
import InterviewSchedulingPage from "./pages/Recruitment/InterviewSchedulingPage";
import SelectionAndOffersPage from "./pages/Recruitment/SelectionAndOffersPage";
import OnboardingPage from "./pages/Recruitment/OnboardingPage";
import EmployeeList from "./pages/Employees/EmployeeList";
import EmployeeForm from "./pages/Employees/EmployeeForm";
import EmployeeProfile from "./pages/Employees/EmployeeProfile";
import EmployeeHistoryPage from "./pages/Employees/EmployeeHistoryPage";
import ManageProfiles from "./pages/Employees/ManageProfiles"; 
import ProbationConfirmation from "./pages/Employees/ProbationConfirmation";
import ExitOffboarding from "./pages/Employees/ExitOffboarding";
import EmployeeDocumentsPage from "./pages/Employees/EmployeeDocumentsPage";

// --- Import Attendance Pages ---
import AttendanceTracking from "./pages/Attendance/AttendanceTracking";
import ManualAdjustments from "./pages/Attendance/ManualAdjustments";
import LeaveRequests from "./pages/Attendance/LeaveRequests";
import LeaveBalance from "./pages/Attendance/LeaveBalance";
import HolidaysCalendars from "./pages/Attendance/HolidaysCalendars";

// --- Import Timesheet Pages ---
import TimesheetEntry from "./pages/Timesheet/TimesheetEntry";
import TimesheetApprovals from "./pages/Timesheet/TimesheetApprovals";

// --- Import Rostering Pages ---
import ShiftScheduling from "./pages/Rostering/ShiftScheduling";
import ShiftSwapping from "./pages/Rostering/ShiftSwapping";
import RostersPage from "./pages/Rostering/RostersPage";
import NotificationsPage from "./pages/Rostering/NotificationsPage";
import RosterPeriods from "./pages/Rostering/RosterPeriods";

// --- Import Payroll Pages ---
import RunPayroll from "./pages/Payroll/RunPayroll";
import PayslipGeneration from "./pages/Payroll/PayslipGeneration";

// --- Import Performance Pages ---
import GoalSetting from "./pages/Performance/GoalSetting";
import KPIOKRTracking from "./pages/Performance/KPIOKRTracking";
import PerformanceReviews from "./pages/Performance/PerformanceReviews";
import FeedbackAppraisals from "./pages/Performance/FeedbackAppraisals";

// --- Import Services & Contexts ---
import { logout } from "./services/auth";
import { OrganizationProvider, useOrganizations } from "./contexts/OrganizationContext";
import XeroIntegrationPage from "./pages/setting /XeroIntegrationPage";
import RoleManagementPage from "./pages/setting /RoleManagementPage";
import PermissionManagementPage from "./pages/setting /PermissionManagementPage";
import AssignRolePage from "./pages/setting /AssignRolePage";

// --- Import Theme Context ---
import { ThemeProvider } from "./contexts/ThemeContext";

// --- Helper function to check if user is admin based on role ---
const isAdminUser = (roleName) => {
  if (!roleName) return false;
  const adminRoles = ['superadmin', 'organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
  return adminRoles.includes(roleName?.toLowerCase());
};

// --- Route Protectors ---
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ isLoggedIn, children }) => {
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- Dashboard Router Component - Uses context from parent provider ---
const DashboardRouter = ({ isLoggedIn, user, onLogout }) => {
  // This hook is now safe because it's inside OrganizationProvider
  const { selectedOrganization, currentUserRole, isLoading } = useOrganizations();
  
  console.log("🔍 DashboardRouter Debug:", {
    isLoading,
    currentUserRole,
    selectedOrganizationName: selectedOrganization?.name,
    selectedOrganizationId: selectedOrganization?.id
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is admin
  const isAdmin = isAdminUser(currentUserRole);
  
  console.log("🎯 isAdmin:", isAdmin, "currentUserRole:", currentUserRole);
  console.log("🎯 Using Layout:", isAdmin ? "AdminLayout (DashboardLayout)" : "EmployeeLayout (EmployeeDashboardLayout)");
  
  // Choose layout based on role
  const Layout = isAdmin ? DashboardLayout : EmployeeDashboardLayout;
  
  return (
    <Layout onLogout={onLogout} user={user} />
  );
};

// --- Root Redirect Component ---
const RootRedirect = () => {
  const { currentUserRole, isLoading } = useOrganizations();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const isAdmin = isAdminUser(currentUserRole);
  const redirectPath = isAdmin ? "/dashboard/admin-dashboard" : "/dashboard/employee-dashboard";
  
  console.log("🎯 RootRedirect - isAdmin:", isAdmin, "redirecting to:", redirectPath);
  
  return <Navigate to={redirectPath} replace />;
};

// --- Main App Component ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("ACCESS_TOKEN"));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogin = (userData, roles) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (roles) {
      localStorage.setItem("USER_ROLES", JSON.stringify(roles));
    }
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
    // Public routes
    {
      path: "/apply/:organizationId",
      element: <PublicEmployeeForm />,
    },
    {
      path: "/apply-success",
      element: <ApplicationSuccess />,
    },
    {
      path: "/login",
      element: <PublicRoute isLoggedIn={isLoggedIn}><LoginPage onLogin={handleLogin} /></PublicRoute>,
    },
    // Protected routes - Dashboard wrapped with OrganizationProvider at the top level
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <OrganizationProvider>
            <DashboardRouter isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
          </OrganizationProvider>
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        // Root redirect based on role
        { index: true, element: <RootRedirect /> },
        // Admin Dashboard
        { path: "admin-dashboard", element: <DashboardContent /> },
        // Employee Dashboard
        { path: "employee-dashboard", element: <EmployeeDashboard2 /> },
        // All routes
        { path: "organizations/*", element: <OrganizationsPage /> },
        { 
          path: "recruitment", 
          children: [
            { path: "jobs/*", element: <JobOpeningsPage /> },
            { path: "applicants/*", element: <ApplicantsPage /> },
            { path: "interviews", element: <InterviewSchedulingPage /> },
            { path: "interview", element: <InterviewPage /> },
            { path: "interview/:id", element: <InterviewPage /> },
            { path: "offers", element: <SelectionAndOffersPage /> },
            { path: "onboarding", element: <OnboardingPage /> },
          ]
        },
        {
          path: "employees",
          children: [
            { index: true, element: <EmployeeList /> },
            { path: "new", element: <EmployeeForm /> },
            { path: "edit/:id", element: <EmployeeForm /> },
            { path: "manage", element: <ManageProfiles /> },
            { path: "probation", element: <ProbationConfirmation /> },
            { path: "exit", element: <ExitOffboarding /> },
            { path: "history", element: <EmployeeHistoryPage /> },
            { path: ":id/documents", element: <EmployeeDocumentsPage /> },
            { path: ":id", element: <EmployeeProfile /> },
          ]
        },
        {
          path: "settings/*", 
          children: [
            { path: "roles", element: <RoleManagementPage /> },
            { path: "assign-role", element: <AssignRolePage /> },
            { path: "permissions", element: <PermissionManagementPage /> },
            { path: "xero", element: <XeroIntegrationPage /> },
            { index: true, element: <Navigate to="roles" replace /> }
          ]
        },
        { 
          path: "attendance", 
          children: [
            { path: "tracking", element: <AttendanceTracking /> },
            { path: "adjustments", element: <ManualAdjustments /> },
            { path: "requests", element: <LeaveRequests /> },
            { path: "balance", element: <LeaveBalance /> },
            { path: "holidays", element: <HolidaysCalendars /> },
            { index: true, element: <Navigate to="tracking" replace /> }
          ]
        },
        { 
          path: "timesheet", 
          children: [
            { path: "entry", element: <TimesheetEntry /> },
            { path: "approvals", element: <TimesheetApprovals /> },
            { index: true, element: <Navigate to="entry" replace /> }
          ]
        },
        { 
          path: "rostering", 
          children: [
            { path: "scheduling", element: <ShiftScheduling /> },
            { path: "swapping", element: <ShiftSwapping /> },
            { path: "rosters", element: <RostersPage /> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "periods", element: <RosterPeriods /> },
            { index: true, element: <Navigate to="scheduling" replace /> }
          ]
        },
        {
          path: "payroll",
          children: [
            { path: "run", element: <RunPayroll /> },
            { path: "payslip", element: <PayslipGeneration /> },
            { index: true, element: <Navigate to="run" replace /> },
          ],
        },
        { 
          path: "performance", 
          children: [
            { path: "goals", element: <GoalSetting /> },
            { path: "tracking", element: <KPIOKRTracking /> },
            { path: "reviews", element: <PerformanceReviews /> },
            { path: "appraisals", element: <FeedbackAppraisals /> },
            { index: true, element: <Navigate to="goals" replace /> }
          ]
        },
        { path: "profile", element: <div>Profile Settings Page</div> },
      ],
    },
    // Default redirects
    { path: "/", element: <Navigate to="/login" /> },
    { path: "/apply", element: <Navigate to="/login" /> },
    { path: "*", element: <Navigate to="/login" /> },
  ]);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
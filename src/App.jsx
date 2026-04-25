// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

import roleService from "./services/roleService";

import PublicEmployeeForm from './pages/public/PublicEmployeeForm';
import InterviewPage from "./pages/Recruitment/InterviewPage";
import ApplicationSuccess from './pages/public/ApplicationSuccess';

// --- Import Pages ---
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
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
import PermissionGuard from "./components/PermissionGuard";

// --- Import Theme Context ---
import { ThemeProvider } from "./contexts/ThemeContext";

// --- Helper function to check if user is admin based on role ---
const isAdminUser = (roleName) => {
  if (!roleName) return false;
  const adminRoles = ['superadmin', 'organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
  return adminRoles.includes(roleName?.toLowerCase());
};

// --- Route Protectors ---
const ProtectedRoute = ({ isLoggedIn, user, children, isChangePasswordPage = false }) => {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  
  // If user has a temporary password and is NOT on the change password page, redirect them there
  if (user?.temp_pass_status === 0 && !isChangePasswordPage) {
    return <Navigate to="/change-password" replace />;
  }
  
  return children;
};

const PublicRoute = ({ isLoggedIn, user, children }) => {
  if (isLoggedIn) {
    // If logged in but has temporary password, redirect to change password
    if (user?.temp_pass_status === 0) {
      return <Navigate to="/change-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// --- Role Guard for protecting specific dashboard routes ---
const RoleGuard = ({ children, allowedRoles }) => {
  const { currentUserRole, isLoading } = useOrganizations();
  if (isLoading) return null;
  if (!allowedRoles.includes(currentUserRole?.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// --- Dashboard Router Component - Uses context from parent provider ---
const DashboardRouter = ({ isLoggedIn, user, onLogout }) => {
  // This hook is now safe because it's inside OrganizationProvider
  const { selectedOrganization, currentUserRole, userPermissions, isLoading } = useOrganizations();

  console.log("🔍 DashboardRouter Debug:", {
    isLoading,
    currentUserRole,
    selectedOrganizationName: selectedOrganization?.name,
    selectedOrganizationId: selectedOrganization?.id,
    permissionsCount: userPermissions?.length,
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

  // Check if user is admin BY ROLE or BY PERMISSIONS
  const isAdmin = isAdminUser(currentUserRole);
  
  // If user has ANY permissions, they should see the admin layout
  // (the sidebar will filter what's visible based on permissions)
  const hasPermissions = Array.isArray(userPermissions) && userPermissions.length > 0;

  // Use admin layout if user is admin OR has any module permissions
  const useAdminLayout = isAdmin || hasPermissions;

  console.log("🎯 isAdmin:", isAdmin, "hasPermissions:", hasPermissions, "useAdminLayout:", useAdminLayout);

  // Choose layout based on role + permissions
  const Layout = useAdminLayout ? DashboardLayout : EmployeeDashboardLayout;

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

  // Dashboard page is based on ROLE only (not permissions)
  const isAdmin = isAdminUser(currentUserRole);
  const redirectPath = isAdmin ? "/dashboard/admin-dashboard" : "/dashboard/employee-dashboard";

  console.log("🎯 RootRedirect - isAdmin:", isAdmin, "role:", currentUserRole, "→", redirectPath);

  return <Navigate to={redirectPath} replace />;
};

// --- Main App Component ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("ACCESS_TOKEN"));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [employee, setEmployee] = useState(() => {
    const employeeData = localStorage.getItem("employee");
    return employeeData ? JSON.parse(employeeData) : null;
  });

  const handleLogin = (userData, roles, employeeData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (roles) {
      localStorage.setItem("USER_ROLES", JSON.stringify(roles));
    }
    if (employeeData) {
      localStorage.setItem("employee", JSON.stringify(employeeData));
      setEmployee(employeeData);
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
      element: <PublicRoute isLoggedIn={isLoggedIn} user={user}><LoginPage onLogin={handleLogin} /></PublicRoute>,
    },
    {
      path: "/change-password",
      element: <ProtectedRoute isLoggedIn={isLoggedIn} user={user} isChangePasswordPage={true}><ChangePasswordPage onLogout={handleLogout} /></ProtectedRoute>,
    },
    // Protected routes - Dashboard wrapped with OrganizationProvider at the top level
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn} user={user}>
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
            { path: "jobs/*", element: <PermissionGuard permission="recruitment.job_openings.view"><JobOpeningsPage /></PermissionGuard> },
            { path: "applicants/*", element: <PermissionGuard permission="recruitment.applicants.view"><ApplicantsPage /></PermissionGuard> },
            { path: "interviews", element: <PermissionGuard permission="recruitment.interview_scheduling.view"><InterviewSchedulingPage /></PermissionGuard> },
            { path: "interview", element: <PermissionGuard permission="recruitment.interview.view"><InterviewPage /></PermissionGuard> },
            { path: "interview/:id", element: <PermissionGuard permission="recruitment.interview.view"><InterviewPage /></PermissionGuard> },
            { path: "offers", element: <PermissionGuard permission="recruitment.selection_offers.view"><SelectionAndOffersPage /></PermissionGuard> },
            { path: "onboarding", element: <PermissionGuard permission="recruitment.onboarding.view"><OnboardingPage /></PermissionGuard> },
          ]
        },
        {
          path: "employees",
          children: [
            { index: true, element: <PermissionGuard permission="employee.add_manage_profiles.view"><EmployeeList /></PermissionGuard> },
            { path: "new", element: <PermissionGuard permission="employee.add_manage_profiles.add"><EmployeeForm /></PermissionGuard> },
            { path: "edit/:id", element: <PermissionGuard permission="employee.add_manage_profiles.edit"><EmployeeForm /></PermissionGuard> },
            { path: "manage", element: <PermissionGuard permission="employee.add_manage_profiles.view"><ManageProfiles /></PermissionGuard> },
            { path: "probation", element: <PermissionGuard permission="employee.probation_confirmation.view"><ProbationConfirmation /></PermissionGuard> },
            { path: "exit", element: <PermissionGuard permission="employee.exit_offboarding.view"><ExitOffboarding /></PermissionGuard> },
            { path: "history", element: <PermissionGuard permission="employee.employment_history.view"><EmployeeHistoryPage /></PermissionGuard> },
            { path: ":id/documents", element: <PermissionGuard permission="employee.add_manage_profiles.view"><EmployeeDocumentsPage /></PermissionGuard> },
            { path: ":id", element: <PermissionGuard permission="employee.add_manage_profiles.view"><EmployeeProfile /></PermissionGuard> },
          ]
        },
        {
          path: "settings/*",
          children: [
            { path: "roles", element: <PermissionGuard permission="settings.role_management.view"><RoleManagementPage /></PermissionGuard> },
            { path: "assign-role", element: <PermissionGuard permission="settings.assign_roles_to_users.view"><AssignRolePage /></PermissionGuard> },
            { path: "permissions", element: <PermissionGuard permission="settings.permission_management.view"><PermissionManagementPage /></PermissionGuard> },
            { path: "xero", element: <XeroIntegrationPage /> },
            { index: true, element: <Navigate to="roles" replace /> }
          ]
        },
        {
          path: "attendance",
          children: [
            { path: "tracking", element: <PermissionGuard permission="attendance.attendance_tracking.view"><AttendanceTracking /></PermissionGuard> },
            { path: "adjustments", element: <PermissionGuard permission="attendance.manual_adjustments.view"><ManualAdjustments /></PermissionGuard> },
            { path: "requests", element: <PermissionGuard permission="attendance.leave_requests.view"><LeaveRequests /></PermissionGuard> },
            { path: "balance", element: <PermissionGuard permission="attendance.leave_balance.view"><LeaveBalance /></PermissionGuard> },
            { path: "holidays", element: <PermissionGuard permission="attendance.holidays_calendars.view"><HolidaysCalendars /></PermissionGuard> },
            { index: true, element: <Navigate to="tracking" replace /> }
          ]
        },
        {
          path: "timesheet",
          children: [
            { path: "entry", element: <PermissionGuard permission="timesheet.timesheet_entry.view"><TimesheetEntry /></PermissionGuard> },
            { path: "approvals", element: <PermissionGuard permission="timesheet.timesheet_approvals.view"><TimesheetApprovals /></PermissionGuard> },
            { index: true, element: <Navigate to="entry" replace /> }
          ]
        },
        {
          path: "rostering",
          children: [
            { path: "scheduling", element: <PermissionGuard permission="rostering.shift_scheduling.view"><ShiftScheduling /></PermissionGuard> },
            { path: "swapping", element: <PermissionGuard permission="rostering.shift_swapping_requests.view"><ShiftSwapping /></PermissionGuard> },
            { path: "rosters", element: <PermissionGuard permission="rostering.weekly_monthly_rosters.view"><RostersPage /></PermissionGuard> },
            { path: "notifications", element: <NotificationsPage /> },
            { path: "periods", element: <PermissionGuard permission="rostering.roster_periods.view"><RosterPeriods /></PermissionGuard> },
            { index: true, element: <Navigate to="scheduling" replace /> }
          ]
        },
        {
          path: "payroll",
          children: [
            { path: "run", element: <PermissionGuard permission="payroll.payroll.view"><RunPayroll /></PermissionGuard> },
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
        { path: "profile", element: <RoleGuard allowedRoles={['employee']}><PublicEmployeeForm isDashboard={true} /></RoleGuard> },
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
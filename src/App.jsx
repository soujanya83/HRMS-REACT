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
import ErrorPage from "./pages/ErrorPage";
import DashboardContent from "./components/DashboardContent";
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
import OvertimeTracking from "./pages/Timesheet/OvertimeTracking";
import TimesheetReports from "./pages/Timesheet/TimesheetReports";

// --- Import Rostering Pages ---
import ShiftScheduling from "./pages/Rostering/ShiftScheduling";
import ShiftSwapping from "./pages/Rostering/ShiftSwapping";
import RostersPage from "./pages/Rostering/RostersPage";
import NotificationsPage from "./pages/Rostering/NotificationsPage";
import RosterPeriods from "./pages/Rostering/RosterPeriods";

// --- Import Payroll Pages ---
import SalaryStructureSetup from "./pages/Payroll/SalaryStructureSetup";
import SalaryProcessing from "./pages/Payroll/SalaryProcessing";
import Deductions from "./pages/Payroll/Deductions";
import PayslipGeneration from "./pages/Payroll/PayslipGeneration";
import BonusIncentives from "./pages/Payroll/BonusIncentives";
import PayrollReports from "./pages/Payroll/PayrollReports";

// --- Import Performance Pages ---
import GoalSetting from "./pages/Performance/GoalSetting";
import KPIOKRTracking from "./pages/Performance/KPIOKRTracking";
import PerformanceReviews from "./pages/Performance/PerformanceReviews";
import FeedbackAppraisals from "./pages/Performance/FeedbackAppraisals";

// --- Import Services & Contexts ---
import { logout } from "./services/auth";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import XeroIntegrationPage from "./pages/setting /XeroIntegrationPage";
import RoleManagementPage from "./pages/setting /RoleManagementPage";
import PermissionManagementPage from "./pages/setting /PermissionManagementPage";
import AssignRolePage from "./pages/setting /AssignRolePage";

// --- Placeholder Pages (for routes that are not yet built) ---
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
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <DashboardContent /> },
        { path: "organizations/*", element: <OrganizationsPage /> },
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
            { path: "overtime", element: <OvertimeTracking /> },
            { path: "reports", element: <TimesheetReports /> },
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
            { path: "notifications", element: <NotificationsPage /> },
             { path: "periods", element: <RosterPeriods /> },
            { index: true, element: <Navigate to="scheduling" replace /> }
          ]
        },
        { 
          path: "payroll", 
          children: [
            { path: "setup", element: <SalaryStructureSetup /> },
            { path: "processing", element: <SalaryProcessing /> },
            { path: "deductions", element: <Deductions /> },
            { path: "payslips", element: <PayslipGeneration /> },
            { path: "bonus", element: <BonusIncentives /> },
            { path: "reports", element: <PayrollReports /> },
            { index: true, element: <Navigate to="processing" replace /> }
          ]
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
{
  path: "settings/*", 
  children: [
    { path: "roles", element: <RoleManagementPage /> },
    { path: "assign-role", element: <AssignRolePage /> }, // Add this line
    { path: "permissions", element: <PermissionManagementPage /> },
    { path: "xero", element: <XeroIntegrationPage /> },
    { index: true, element: <Navigate to="roles" replace /> }
  ]
}
      ],
    },
    { path: "/", element: <Navigate to="/login" /> },
    { path: "*", element: <Navigate to="/login" /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
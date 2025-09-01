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

const EmployeePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Employee Page</h1>
  </div>
);
const AttendancePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Attendance Page</h1>
  </div>
);
const PayrollPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Payroll Page</h1>
  </div>
);

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
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("isLoggedIn") === "true"
  );
  // THE FIX: Add state to store the user's data from the API
  const [user, setUser] = useState(
    () => JSON.parse(sessionStorage.getItem("user")) || null
  );

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem("isLoggedIn", "true");
    } else {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("user"); // Also remove user data on logout
    }
  }, [isLoggedIn]);

  // THE FIX: Update handleLogin to accept and store the user data
  const handleLogin = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <LoginPage onLogin={handleLogin} />
        </PublicRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          {/* THE FIX: Pass the user data down to the DashboardLayout */}
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

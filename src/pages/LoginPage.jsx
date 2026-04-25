import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/image1.png";
import { login, forgotPassword, verifyOtp, resetPassword } from "../services/auth"; 

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();

  // Function to determine dashboard based on user role
  const getDashboardPath = (roles, selectedOrganizationId) => {
    // Find the role for the selected organization
    const userRoleForOrg = roles.find(
      role => role.organization_id === selectedOrganizationId
    );
    
    if (!userRoleForOrg) {
      return "/dashboard"; // Default to admin dashboard
    }
    
    const roleName = userRoleForOrg.role_name?.toLowerCase();
    
    // Check if user is admin (superadmin, organization_admin, hr_manager)
    const isAdminRole = roleName === 'superadmin' || 
                        roleName === 'organization_admin' || 
                        roleName === 'hr_manager' ||
                        roleName === 'payroll_manager' ||
                        roleName === 'recruiter';
    
    if (isAdminRole) {
      return "/dashboard"; // Admin Dashboard (DashboardContent)
    } else {
      return "/dashboard/employee-dashboard"; // Employee Dashboard (EmployeeDashboard2)
    }
  };

  // Handle login submit
  // In LoginPage.jsx, update the handleSubmit function:

// src/pages/LoginPage.jsx - Updated handleSubmit function
// In LoginPage.jsx, update the handleSubmit function:

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  if (validateForm()) {
    setIsSubmitting(true);
    try {
      const response = await login(email, password);
      console.log("API Response:", response.data);

      // Clear existing data first
      localStorage.clear();
      
      const token = response.data.data.token;
      const userData = response.data.data.user;
      const employeeData = response.data.data.employee; // Added employee data
      const userRoles = response.data.data.roles || [];
      
      console.log("User Roles from API:", userRoles);
      
      // Store new data
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('USER_ROLES', JSON.stringify(userRoles));
      if (employeeData) {
        localStorage.setItem('employee', JSON.stringify(employeeData));
      }

      // 1. Check for temporary password FIRST
      if (userData.temp_pass_status === 0) {
        console.log("🚀 Redirecting to Change Password Page (Temporary Password detected)");
        
        // Still need to call onLogin to set global state
        onLogin(userData, userRoles, employeeData);
        
        navigate("/change-password");
        return;
      }
      
      // 2. Continue with organization/role selection if password is NOT temporary
      let selectedOrg = null;
      let selectedRole = null;
      
      // Priority: superadmin first
      const superAdminOrg = userRoles.find(r => r.role_name?.toLowerCase() === 'superadmin');
      if (superAdminOrg) {
        selectedOrg = superAdminOrg;
        selectedRole = superAdminOrg.role_name;
        console.log("Found superadmin organization:", superAdminOrg.organization_name);
      } else {
        // Then check other admin roles
        const adminRoles = ['organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
        for (const role of adminRoles) {
          const adminOrg = userRoles.find(r => r.role_name?.toLowerCase() === role);
          if (adminOrg) {
            selectedOrg = adminOrg;
            selectedRole = role;
            break;
          }
        }
      }
      
      // If no admin role found, use the first organization
      if (!selectedOrg && userRoles.length > 0) {
        selectedOrg = userRoles[0];
        selectedRole = selectedOrg.role_name;
      }
      
      if (selectedOrg) {
        localStorage.setItem('selectedOrgId', selectedOrg.organization_id);
        localStorage.setItem('CURRENT_USER_ROLE', selectedRole);
        console.log(`✅ Selected Organization: ${selectedOrg.organization_name} (ID: ${selectedOrg.organization_id}) with role: ${selectedRole}`);
      }
      
      // Pass both user data, roles, and employee data to onLogin
      onLogin(userData, userRoles, employeeData);
      
      // Determine which dashboard to navigate to
      const isAdmin = selectedRole?.toLowerCase() === 'superadmin' || 
                      ['organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'].includes(selectedRole?.toLowerCase());
      
      if (isAdmin) {
        console.log("🚀 Redirecting to Admin Dashboard");
        navigate("/dashboard/admin-dashboard");
      } else {
        console.log("🚀 Redirecting to Employee Dashboard");
        navigate("/dashboard/employee-dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      const newErrors = {};
      if (error.response?.data?.message) {
          newErrors.api = error.response.data.message;
      } else {
          newErrors.api = "Login failed. Please check your credentials.";
      }
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  }
};

  // Validate login form
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email address is invalid.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate forgot password form
  const validateForgotPasswordForm = () => {
    const newErrors = {};
    if (!resetEmail.trim()) newErrors.resetEmail = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(resetEmail)) newErrors.resetEmail = "Email address is invalid.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP form
  const validateOtpForm = () => {
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP is required.";
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = "OTP must be 6 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate reset password form
  const validateResetPasswordForm = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "New password is required.";
    else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    
    if (validateForgotPasswordForm()) {
      setIsSubmitting(true);
      try {
        const response = await forgotPassword(resetEmail);
        console.log("Forgot Password Response:", response.data);
        
        if (response.data.status === true) {
          setSuccessMessage(response.data.message || "Password reset OTP sent to email");
          setShowForgotPassword(false);
          setShowOtpVerification(true);
          
          // Start countdown for OTP resend (60 seconds)
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setErrors({ api: response.data.message || "Failed to send OTP" });
        }
      } catch (error) {
        console.error("Forgot Password Error:", error);
        const errorMsg = error.response?.data?.message || "Failed to send OTP. Please try again.";
        setErrors({ api: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    
    if (validateOtpForm()) {
      setIsSubmitting(true);
      try {
        const response = await verifyOtp(resetEmail, otp);
        console.log("Verify OTP Response:", response.data);
        
        if (response.data.status === true) {
          setSuccessMessage("OTP verified successfully");
          setShowOtpVerification(false);
          setShowResetPassword(true);
        } else {
          setErrors({ api: response.data.message || "Invalid OTP" });
        }
      } catch (error) {
        console.error("Verify OTP Error:", error);
        const errorMsg = error.response?.data?.message || "Failed to verify OTP. Please try again.";
        setErrors({ api: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    
    if (validateResetPasswordForm()) {
      setIsSubmitting(true);
      try {
        const response = await resetPassword(resetEmail, otp, newPassword, confirmPassword);
        console.log("Reset Password Response:", response.data);
        
        if (response.data.status === true) {
          setSuccessMessage("Password reset successfully! You can now login with your new password.");
          
          // Reset all states
          setTimeout(() => {
            setShowResetPassword(false);
            setResetEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccessMessage("");
          }, 3000);
        } else {
          setErrors({ api: response.data.message || "Failed to reset password" });
        }
      } catch (error) {
        console.error("Reset Password Error:", error);
        const errorMsg = error.response?.data?.message || "Failed to reset password. Please try again.";
        setErrors({ api: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setErrors({});
    setSuccessMessage("");
    setIsSubmitting(true);
    
    try {
      const response = await forgotPassword(resetEmail);
      console.log("Resend OTP Response:", response.data);
      
      if (response.data.status === true) {
        setSuccessMessage("New OTP sent to your email");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({ api: response.data.message || "Failed to resend OTP" });
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      setErrors({ api: "Failed to resend OTP. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOtpVerification(false);
    setShowResetPassword(false);
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">CHRISPP</h1>
            <h2 className="text-2xl font-light leading-tight">
              {showForgotPassword || showOtpVerification || showResetPassword 
                ? "Password Recovery" 
                : "Welcome to"}
            </h2>
            {!showForgotPassword && !showOtpVerification && !showResetPassword && (
              <p className="mt-6 text-blue-200">
                CHRISPP is an acronym for Cloud-based Human Resource Information
                System with Payroll and Performance Management. A smart, easy,
                cloud-based HR for people who matter most.
              </p>
            )}
            {(showForgotPassword || showOtpVerification || showResetPassword) && (
              <p className="mt-6 text-blue-200">
                Reset your password securely. We'll send you a one-time password
                to verify your identity.
              </p>
            )}
          </div>
          <div className="mt-8 md:mt-0 text-sm text-blue-300">
            <p>
              &copy; {new Date().getFullYear()} Your Fraxxra Tech. All Rights
              Reserved.
            </p>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Login Form */}
            {!showForgotPassword && !showOtpVerification && !showResetPassword && (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Login</h3>
                <p className="text-gray-500 mb-8">Login to your Account</p>
                <form onSubmit={handleSubmit} noValidate>
                  {errors.api && (
                    <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.api}</p>
                  )}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-2">{errors.email}</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" size={20} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setResetEmail(email);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </form>
              </>
            )}

            {/* Forgot Password Form */}
            {showForgotPassword && (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h3>
                <p className="text-gray-500 mb-8">Enter your email to receive OTP</p>
                
                {successMessage && (
                  <p className="text-green-500 text-sm text-center mb-4 bg-green-100 p-3 rounded-lg">{successMessage}</p>
                )}
                
                <form onSubmit={handleForgotPassword} noValidate>
                  {errors.api && (
                    <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.api}</p>
                  )}
                  
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="email"
                        id="resetEmail"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.resetEmail ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.resetEmail && (
                      <p className="text-red-500 text-xs mt-2">{errors.resetEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg focus:outline-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* OTP Verification Form */}
            {showOtpVerification && (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h3>
                <p className="text-gray-500 mb-8">Enter the 6-digit code sent to {resetEmail}</p>
                
                {successMessage && (
                  <p className="text-green-500 text-sm text-center mb-4 bg-green-100 p-3 rounded-lg">{successMessage}</p>
                )}
                
                <form onSubmit={handleVerifyOtp} noValidate>
                  {errors.api && (
                    <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.api}</p>
                  )}
                  
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="text"
                        id="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={isSubmitting}
                        maxLength="6"
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.otp ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.otp && (
                      <p className="text-red-500 text-xs mt-2">{errors.otp}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isSubmitting}
                      className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpVerification(false);
                        setShowForgotPassword(true);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg focus:outline-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || otp.length !== 6}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Reset Password Form */}
            {showResetPassword && (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h3>
                <p className="text-gray-500 mb-8">Create a new password for your account</p>
                
                {successMessage && (
                  <p className="text-green-500 text-sm text-center mb-4 bg-green-100 p-3 rounded-lg">{successMessage}</p>
                )}
                
                <form onSubmit={handleResetPassword} noValidate>
                  {errors.api && (
                    <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.api}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" size={20} />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.newPassword ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
                      >
                        {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-2">{errors.newPassword}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" size={20} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
                      >
                        {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-2">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setShowOtpVerification(true);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg focus:outline-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPassword || !confirmPassword}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
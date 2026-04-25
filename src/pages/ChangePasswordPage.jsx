import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/image1.png";
import { changePassword } from "../services/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "New password is required.";
    else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters.";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await changePassword(newPassword, confirmPassword);

        if (response.data.status === true) {
          toast.success("Password changed successfully! Please login with your new credentials.", {
            position: "top-right",
            autoClose: 3000,
          });

          localStorage.clear();
          navigate("/login", { replace: true });
        } else {
          setErrors({ api: response.data.message || "Failed to change password" });
        }
      } catch (error) {
        console.error("Change Password Error:", error);
        const errorMsg = error.response?.data?.message || "Failed to change password. Please try again.";
        setErrors({ api: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <ToastContainer />
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Panel - Branding (Matching Login Page) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">CHRISPP</h1>
            <h2 className="text-2xl font-light leading-tight">Secure Your Account</h2>
            <p className="mt-6 text-blue-200">
              You are using a temporary password. For security reasons, you must change your password before continuing.
            </p>
          </div>
          <div className="mt-8 md:mt-0 text-sm text-blue-300">
            <p>&copy; {new Date().getFullYear()} Your Fraxxra Tech. All Rights Reserved.</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex items-center justify-center">
          <div className="w-full max-w-md">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Change Password</h3>
            <p className="text-gray-500 mb-8">Create a new secure password</p>

            <form onSubmit={handleSubmit} noValidate>
              {errors.api && (
                <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.api}</p>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${errors.newPassword ? "border-red-500" : "border-gray-200"
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed ${errors.confirmPassword ? "border-red-500" : "border-gray-200"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

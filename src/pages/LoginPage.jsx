import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/image1.png";
import { login } from "../services/auth"; // Import the login service

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email address is invalid.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await login(email, password);
        console.log("API Response:", response.data);

        // Store the token and user data from the response
        localStorage.setItem('ACCESS_TOKEN', response.data.data.token);
        const userData = response.data.data.user;
        
        onLogin(userData); // Pass user data up to App.js
        navigate("/dashboard");
      } catch (error) {
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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4">CHRISPP</h1>
            <h2 className="text-2xl font-light leading-tight">Welcome to</h2>
            <p className="mt-6 text-blue-200">
              CHRISPP is an acronym for Cloud-based Human Resource Information
              System with Payroll and Performance Management. A smart, easy,
              cloud-based HR for people who matter most.
            </p>
          </div>
          <div className="mt-8 md:mt-0 text-sm text-blue-300">
            <p>
              &copy; {new Date().getFullYear()} Your Fraxxra Tech. All Rights
              Reserved.
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex items-center justify-center">
          <div className="w-full max-w-md">
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                )}
              </div>
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-6 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
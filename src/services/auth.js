import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
  headers: {
    'Accept': 'application/json'
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function
export const login = (email, password) => {
  return axiosClient.post("/login", { email, password });
};

// Forgot Password - Request OTP
export const forgotPassword = (email) => {
  return axiosClient.post("/forgot-password", { email });
};

// Verify OTP
export const verifyOtp = (email, otp) => {
  return axiosClient.post("/verify-otp", { email, otp });
};

// Reset Password
export const resetPassword = (email, otp, password, password_confirmation) => {
  return axiosClient.post("/reset-password", { 
    email, 
    otp, 
    password, 
    password_confirmation 
  });
};

// Logout function
export const logout = () => {
  // Clear token from localStorage
  localStorage.removeItem('ACCESS_TOKEN');
  return axiosClient.post("/logout");
};

// Optional: Get current user
export const getUser = () => {
  return axiosClient.get("/user");
};

// Optional: Refresh token
export const refreshToken = () => {
  return axiosClient.post("/refresh-token");
};
import axiosClient from "../axiosClient";

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

// Change Password (for temporary password users)
export const changePassword = (new_password, new_password_confirmation) => {
  return axiosClient.post("/change-password", {
    new_password,
    new_password_confirmation
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
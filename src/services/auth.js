import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
  headers: {
    'Accept': 'application/json'
  }
});

// This "interceptor" automatically adds the auth token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Login function
export const login = (email, password) => {
  return axiosClient.post("/login", { email, password });
};

// Logout function
export const logout = () => {
  return axiosClient.post("/logout");
};
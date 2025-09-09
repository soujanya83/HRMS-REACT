import axios from 'axios';

// Create an Axios instance with a base configuration
const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
  withCredentials: true, 
  headers: {
    'Accept': 'application/json'
  }
});

// This "interceptor" automatically adds the auth token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
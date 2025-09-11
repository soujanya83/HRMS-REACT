import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
  withCredentials: true, 
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

export default axiosClient;
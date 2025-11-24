import axios from 'axios';

 const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
});

 axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

 axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
       localStorage.removeItem('ACCESS_TOKEN');
       window.location.href = '/login'; 
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
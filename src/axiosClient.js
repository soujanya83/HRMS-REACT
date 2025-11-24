import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ADD DEBUGGING HERE
  console.log('🚀 Making API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    headers: config.headers,
    data: config.data,
    params: config.params
  });
  
  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // ADD DEBUGGING HERE
    console.log('✅ API Response SUCCESS:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // ADD DEBUGGING HERE
    console.log('❌ API Response ERROR:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ACCESS_TOKEN');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
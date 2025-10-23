import axios from "axios";

 const axiosClient = axios.create({
  baseURL: 'https://api.chrispp.com/api/v1',
  headers: {
    'Accept': 'application/json'
  }
});

 axiosClient.interceptors.request.use((config) => {
   const token = localStorage.getItem('ACCESS_TOKEN');
   config.headers.Authorization = `Bearer ${token}`;
  return config;
});

 export const login = (email, password) => {
  return axiosClient.post("/login", { email, password });
};

 export const logout = () => {
   return axiosClient.post("/logout");
};


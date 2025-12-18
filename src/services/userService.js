// In services/userService.js
import axiosClient from "../axiosClient";

export const getUsers = (params = {}) => {
  return axiosClient.get("/users", { params });
};
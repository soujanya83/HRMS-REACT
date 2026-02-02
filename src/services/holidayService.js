// src/services/holidayService.js
import axiosClient from '../axiosClient';

export const holidayService = {
  getHolidays: () => {
    return axiosClient.get('/organization-holiday');
  },

  createHoliday: (data) => {
    return axiosClient.post('/organization-holiday', data);
  },

  getHoliday: (id) => {
    return axiosClient.get(`/organization-holiday/${id}`);
  },

  updateHoliday: (id, data) => {
    return axiosClient.post(`/organization-holiday/${id}`, data);
  },

  partialUpdateHoliday: (id, data) => {
    return axiosClient.post(`/organization-holiday/${id}/partial`, data);
  },

  deleteHoliday: (id) => {
    return axiosClient.delete(`/organization-holiday/${id}`);
  }
};

export default holidayService;
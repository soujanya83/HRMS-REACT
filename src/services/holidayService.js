// src/services/holidayService.js
import axiosClient from '../axiosClient';

export const holidayService = {
  getHolidays: (params, headers = {}) => {
    return axiosClient.get('/holidays', { params, headers });
  },

  createHoliday: (data) => {
    return axiosClient.post('/holidays', data);
  },

  getHoliday: (id) => {
    return axiosClient.get(`/holidays/${id}`);
  },

  updateHoliday: (id, data) => {
    return axiosClient.put(`/holidays/${id}`, data);
  },

  deleteHoliday: (id) => {
    return axiosClient.delete(`/holidays/${id}`);
  },

  syncAustralianHolidays: (year) => {
    return axiosClient.post('/holidays/sync-australian', { year });
  },

  getAustralianStates: () => {
    return axiosClient.get('/holidays/australian-states');
  },

  setStateCode: (stateCode) => {
    return axiosClient.post('/holidays/set-state', { state_code: stateCode });
  },

  getUpcomingHolidays: (params) => {
    return axiosClient.get('/holidays/upcoming', {
      params,
      headers: {
        "X-State-Code": "AU-NSW"
      }
    });
  }
};

export default holidayService;

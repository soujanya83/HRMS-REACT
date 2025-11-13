import axiosClient from "../axiosClient";


export const getHolidays = (params = {}) => {
  return axiosClient.get("/holidays", { params });
};


export const getHolidayById = (id) => {
  return axiosClient.get(`/holidays/${id}`);
};


export const createHoliday = (holidayData) => {
  return axiosClient.post("/holidays", holidayData);
};


export const updateHoliday = (id, holidayData) => {
  return axiosClient.put(`/holidays/${id}`, holidayData);
};

export const deleteHoliday = (id) => {
  return axiosClient.delete(`/holidays/${id}`);
};

// Get holidays by year
export const getHolidaysByYear = (year, params = {}) => {
  return axiosClient.get(`/holidays/by-year/${year}`, { params });
};

// Get holidays by month
export const getHolidaysByMonth = (year, month, params = {}) => {
  return axiosClient.get(`/holidays/by-month/${year}/${month}`, { params });
};
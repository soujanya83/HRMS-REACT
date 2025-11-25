import axiosClient from '../axiosClient';

// Job Offer API Service
export const getJobOffers = (params = {}) => {
  return axiosClient.get('/recruitment/job-offers', { params });
};

export const getJobOfferById = (id) => {
  return axiosClient.get(`/recruitment/job-offers/${id}`);
};

export const createJobOffer = (data) => {
  return axiosClient.post('/recruitment/job-offers', data);
};

export const updateJobOffer = (id, data) => {
  return axiosClient.patch(`/recruitment/job-offers/${id}`, data);
};

export const deleteJobOffer = (id) => {
  return axiosClient.delete(`/recruitment/job-offers/${id}`);
};

export const getJobOffersByStatus = (status) => {
  return axiosClient.get(`/recruitment/job-offers/status/${status}`);
};

export const getJobOffersByJobOpening = (jobOpeningId) => {
  return axiosClient.get(`/recruitment/job-offers/job-opening/${jobOpeningId}`);
};

export const getExpiredJobOffers = () => {
  return axiosClient.get('/recruitment/job-offers/expired/list');
};

export const updateJobOfferStatus = (id, status) => {
  return axiosClient.post(`/recruitment/job-offers/${id}/status`, { status });
};

export const downloadOfferLetter = (id) => {
  return axiosClient.get(`/recruitment/job-offers/${id}/offer-letter/download`, {
    responseType: 'blob'
  });
};

// Additional related APIs
export const getJobOpenings = (params = {}) => {
  return axiosClient.get('/recruitment/job-openings', { params });
};

// Since there's no specific endpoint for final candidates, we'll use applicants endpoint
// and filter by status or use a different approach
export const getFinalCandidates = (jobOpeningId) => {
  // If your API has a specific endpoint for final candidates, use it here
  // Otherwise, we'll get all applicants and filter by interview status
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      status: 'final_round_completed' // or whatever status indicates final candidates
    }
  });
};

// Alternative: Get candidates who have completed interviews
export const getApplicantsForJob = (jobOpeningId, params = {}) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      ...params
    }
  });
};




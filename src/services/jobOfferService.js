import axiosClient from '../axiosClient';

// Job Offer API Service - Complete Implementation
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

export const getPendingJobOffers = () => {
  return axiosClient.get('/recruitment/job-offers/pending/list');
};

export const updateJobOfferStatus = (id, status) => {
  return axiosClient.post(`/recruitment/job-offers/${id}/status`, { status });
};

export const downloadOfferLetter = (id) => {
  return axiosClient.get(`/recruitment/job-offers/${id}/offer-letter/download`, {
    responseType: 'blob'
  });
};

// Additional utility functions for job offers
export const getJobOpenings = (params = {}) => {
  return axiosClient.get('/recruitment/job-openings', { params });
};

export const getFinalCandidates = (jobOpeningId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      status: 'final_round_completed'
    }
  });
};

export const getApplicantsForJob = (jobOpeningId, params = {}) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      ...params
    }
  });
};

// Get applicants who are ready for job offers (completed final interviews)
export const getOfferReadyApplicants = (jobOpeningId) => {
  return axiosClient.get('/recruitment/applicants', {
    params: { 
      job_opening_id: jobOpeningId,
      status: 'final_round_completed'
    }
  });
};

// Get job offer statistics
export const getJobOfferStats = (organizationId) => {
  return axiosClient.get('/recruitment/job-offers', {
    params: { organization_id: organizationId }
  }).then(response => {
    const offers = response.data?.data || [];
    
    const stats = {
      total: offers.length,
      sent: offers.filter(offer => offer.status === 'Sent').length,
      accepted: offers.filter(offer => offer.status === 'Accepted').length,
      rejected: offers.filter(offer => offer.status === 'Rejected').length,
      expired: offers.filter(offer => {
        const expiryDate = new Date(offer.expiry_date);
        return expiryDate < new Date() && offer.status === 'Sent';
      }).length,
      pending: offers.filter(offer => offer.status === 'Sent').length
    };
    
    return { data: { data: stats } };
  });
};
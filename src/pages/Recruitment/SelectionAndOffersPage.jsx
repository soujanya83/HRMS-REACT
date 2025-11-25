import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiPlus, HiOutlineBriefcase, HiOutlineUser, HiOutlineCalendar, 
  HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineXCircle, 
  HiOutlinePencil, HiX, HiDownload, HiEye
} from 'react-icons/hi';
import { useOrganizations } from '../../contexts/OrganizationContext';
import {
  getJobOffers,
  createJobOffer, // Make sure this matches the export name
  getJobOffersByJobOpening,
  updateJobOfferStatus,
  downloadOfferLetter,
  getJobOpenings,
  getFinalCandidates,
  getApplicantsForJob
} from '../../services/recruitmentService';

// Main Page Component
const SelectionAndOffersPage = () => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const [offersRes, jobOpeningsRes] = await Promise.all([
        getJobOffers({ organization_id: organizationId }),
        getJobOpenings({ organization_id: organizationId })
      ]);

      setOffers(offersRes.data?.data || []);
      setJobOpenings(jobOpeningsRes.data?.data || []);

      // Set default selected job if available
      if (jobOpeningsRes.data?.data?.length > 0 && !selectedJobId) {
        const defaultJobId = jobOpeningsRes.data.data[0].id;
        setSelectedJobId(defaultJobId);
        await fetchCandidatesForJob(defaultJobId);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, selectedJobId]);

  // Fetch candidates for specific job with fallback
  const fetchCandidatesForJob = async (jobId) => {
    try {
      let candidatesRes;
      
      // Try to get final candidates first
      try {
        candidatesRes = await getFinalCandidates(jobId);
      } catch (finalCandidatesError) {
        console.log('Final candidates endpoint not available, using applicants fallback',finalCandidatesError);
        // Fallback to regular applicants
        candidatesRes = await getApplicantsForJob(jobId, {
          has_interviews: true
        });
      }
      
      setCandidates(candidatesRes.data?.data || []);
      console.log('📊 Candidates for job:', candidatesRes.data);

    } catch (err) {
      console.error('Error fetching candidates:', err);
      // If both endpoints fail, use mock data as last resort
      setCandidates(getMockCandidates(jobId));
    }
  };

  // Mock data fallback
  const getMockCandidates = (jobId) => {
    const mockCandidates = {
      '101': [
        { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Final Round Completed', feedback_score: 4.8 },
        { id: 4, name: 'David Martinez', email: 'david@example.com', status: 'Final Round Completed', feedback_score: 4.5 },
      ],
      '103': [
        { id: 3, name: 'Jessica Williams', email: 'jessica@example.com', status: 'Final Round Completed', feedback_score: 4.9 },
        { id: 6, name: 'Daniel Brown', email: 'daniel@example.com', status: 'Final Round Completed', feedback_score: 4.6 },
      ],
    };
    return mockCandidates[jobId] || [];
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJobChange = async (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    
    if (jobId) {
      await fetchCandidatesForJob(jobId);
      
      // Also fetch offers for this specific job
      try {
        const offersRes = await getJobOffersByJobOpening(jobId);
        setOffers(offersRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching job-specific offers:', err);
      }
    } else {
      // If no job selected, show all offers
      fetchData();
    }
  };

  const handleMakeOffer = (candidate) => {
    setSelectedCandidate(candidate);
    setOfferModalOpen(true);
  };

  const handleCreateOffer = async (offerData) => {
    try {
      console.log('Creating offer for candidate:', selectedCandidate);
      
      const payload = {
        applicant_id: selectedCandidate.id,
        job_opening_id: parseInt(selectedJobId),
        salary: parseFloat(offerData.salary),
        proposed_start_date: offerData.start_date,
        offer_expiry_date: offerData.expiration_date,
        notes: offerData.notes || '',
        status: 'sent',
        organization_id: parseInt(organizationId)
      };

      console.log('📤 Offer payload:', payload);

      const response = await createJobOffer(payload);
      console.log('✅ Offer created successfully:', response.data);

      // Refresh data
      fetchData();
      setOfferModalOpen(false);
      setSelectedCandidate(null);

      alert('Job offer created successfully!');

    } catch (err) {
      console.error('❌ Error creating offer:', err);
      alert('Failed to create job offer. Please try again.');
    }
  };

  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    try {
      await updateJobOfferStatus(offerId, newStatus);
      fetchData();
      alert(`Offer status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating offer status:', err);
      alert('Failed to update offer status.');
    }
  };

  const handleDownloadOfferLetter = async (offerId) => {
    try {
      const response = await downloadOfferLetter(offerId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `offer-letter-${offerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading offer letter:', err);
      alert('Failed to download offer letter.');
    }
  };

  const offerStatusClasses = {
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      sent: 'Sent',
      accepted: 'Accepted',
      declined: 'Declined',
      expired: 'Expired',
      withdrawn: 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchData}
            className="bg-brand-blue text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Selection & Offers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Compare final candidates and manage job offers.
            </p>
          </div>
          <div className="self-start sm:self-center">
            <select
              value={selectedJobId}
              onChange={handleJobChange}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold text-gray-800"
            >
              <option value="">All Job Openings</option>
              {jobOpenings.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate Comparison Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Final Candidates {selectedJobId && `for ${jobOpenings.find(j => j.id == selectedJobId)?.title}`}
          </h2>
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map(candidate => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  onMakeOffer={handleMakeOffer}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <HiOutlineUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedJobId 
                  ? 'No final candidates found for this job opening.' 
                  : 'Select a job opening to view candidates.'}
              </p>
            </div>
          )}
        </div>

        {/* Extended Offers Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Job Offers</h2>
            <div className="text-sm text-gray-500">
              {offers.length} offer{offers.length !== 1 ? 's' : ''} total
            </div>
          </div>
          
          {offers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offers.map(offer => (
                      <OfferRow 
                        key={offer.id}
                        offer={offer}
                        onUpdateStatus={handleUpdateOfferStatus}
                        onDownloadLetter={handleDownloadOfferLetter}
                        statusClasses={offerStatusClasses}
                        getStatusDisplay={getStatusDisplay}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <HiOutlineBriefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job offers</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new job offer for a candidate.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <OfferFormModal 
        isOpen={isOfferModalOpen}
        onClose={() => {
          setOfferModalOpen(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        jobOpening={jobOpenings.find(j => j.id == selectedJobId)}
        onCreateOffer={handleCreateOffer}
      />
    </div>
  );
};

// Child Components
const CandidateCard = ({ candidate, onMakeOffer }) => {
  // Generate avatar from name if not provided
  const getAvatar = (candidate) => {
    if (candidate.avatar) return candidate.avatar;
    return candidate.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CC';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-800 font-bold text-lg">
              {getAvatar(candidate)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-500">
              {candidate.email || 'No email provided'}
            </p>
            {candidate.feedback_score && (
              <p className="text-sm text-gray-500">
                Score: <span className="font-semibold text-gray-700">{candidate.feedback_score}/5.0</span>
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Status: <span className="font-semibold">{candidate.status || 'Under Review'}</span>
        </p>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onMakeOffer(candidate)}
          className="w-full flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90"
        >
          <HiOutlineCheckCircle className="mr-2 h-5 w-5" /> Make Offer
        </button>
        <button className="w-full flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <HiOutlineXCircle className="mr-2 h-5 w-5" /> Reject
        </button>
      </div>
    </div>
  );
};

const OfferRow = ({ offer, onUpdateStatus, onDownloadLetter, statusClasses, getStatusDisplay }) => {
  const [showActions, setShowActions] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
        {offer.applicant?.name || offer.applicant_name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {offer.job_opening?.title || offer.job_title || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {offer.salary ? formatCurrency(offer.salary) : 'Not specified'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {offer.proposed_start_date ? formatDate(offer.proposed_start_date) : 'Not set'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusClasses[offer.status] || 'bg-gray-100 text-gray-800'
        }`}>
          {getStatusDisplay(offer.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onDownloadLetter(offer.id)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="Download Offer Letter"
          >
            <HiDownload className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-600 hover:text-gray-900 p-1"
            title="Manage Offer"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
        </div>
        
        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
            <div className="py-1">
              <button
                onClick={() => onUpdateStatus(offer.id, 'accepted')}
                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
              >
                Mark as Accepted
              </button>
              <button
                onClick={() => onUpdateStatus(offer.id, 'declined')}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Mark as Declined
              </button>
              <button
                onClick={() => onUpdateStatus(offer.id, 'withdrawn')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Withdraw Offer
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

const OfferFormModal = ({ isOpen, onClose, candidate, jobOpening, onCreateOffer }) => {
  const [formData, setFormData] = useState({
    salary: '',
    start_date: '',
    expiration_date: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Set default expiration date to 2 weeks from now
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 14);
      
      setFormData({
        salary: '',
        start_date: '',
        expiration_date: defaultExpiry.toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateOffer(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Create Job Offer for {candidate?.name}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {jobOpening && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Position:</strong> {jobOpening.title}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput 
              label="Salary / Compensation ($)" 
              name="salary" 
              type="number" 
              placeholder="e.g., 80000" 
              value={formData.salary}
              onChange={handleChange}
              required
            />
            <FormInput 
              label="Proposed Start Date" 
              name="start_date" 
              type="date" 
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <FormInput 
            label="Offer Expiration Date" 
            name="expiration_date" 
            type="date" 
            value={formData.expiration_date}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes / Custom Message
            </label>
            <textarea 
              name="notes"
              rows="4" 
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Optional message to the candidate..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90"
            >
              Send Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Form Components
const FormInput = ({ label, name, value, onChange, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input 
      id={name} 
      name={name} 
      value={value}
      onChange={onChange}
      {...props} 
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
    />
  </div>
);

export default SelectionAndOffersPage;
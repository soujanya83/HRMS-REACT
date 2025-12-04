import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  HiPlus, HiOutlineBriefcase, HiOutlineUser, HiOutlineCalendar, 
  HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineXCircle, 
  HiOutlinePencil, HiX, HiDownload, HiEye
} from 'react-icons/hi';
import { useOrganizations } from '../../contexts/OrganizationContext';
import {
  getJobOffers,
  createJobOffer,
  getJobOffersByJobOpening,
  downloadOfferLetter,
  getJobOpenings,
  getFinalCandidates,
  getApplicantsForJob,
  getJobOfferById,
  updateApplicantStatus  // ADDED for applicant status updates
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

      console.log('📦 Offers response:', offersRes.data);
      console.log('📦 Job openings response:', jobOpeningsRes.data);

      setOffers(offersRes.data?.data || []);
      setJobOpenings(jobOpeningsRes.data?.data || []);

      // Set default selected job if available
      if (jobOpeningsRes.data?.data?.length > 0 && !selectedJobId) {
        const defaultJobId = jobOpeningsRes.data.data[0].id;
        setSelectedJobId(defaultJobId);
        await fetchCandidatesForJob(defaultJobId);
      }

    } catch (err) {
      console.error('❌ Error fetching data:', err);
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
        console.log('🎯 Final candidates:', candidatesRes.data);
      } catch (finalCandidatesError) {
        console.log('🔄 Final candidates endpoint not available, using applicants fallback',finalCandidatesError);
        // Fallback to regular applicants with interview status
        candidatesRes = await getApplicantsForJob(jobId, {
          status: 'interview_completed'
        });
      }
      
      const candidatesData = candidatesRes.data?.data || [];
      console.log('📊 Candidates for job:', candidatesData);
      
      // Transform API data to match component expectations
      const transformedCandidates = candidatesData.map(candidate => ({
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
        status: candidate.status,
        feedback_score: 4.5 // Default score, you can calculate from interviews if available
      }));
      
      setCandidates(transformedCandidates);

    } catch (err) {
      console.error('❌ Error fetching candidates:', err);
      // If both endpoints fail, use mock data as last resort
      setCandidates(getMockCandidates(jobId));
    }
  };

  // Mock data fallback
  const getMockCandidates = (jobId) => {
    const mockCandidates = {
      '1': [
        { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Final Round Completed', feedback_score: 4.8 },
        { id: 4, name: 'David Martinez', email: 'david@example.com', status: 'Final Round Completed', feedback_score: 4.5 },
      ],
      '2': [
        { id: 3, name: 'Jessica Williams', email: 'jessica@example.com', status: 'Final Round Completed', feedback_score: 4.9 },
        { id: 6, name: 'Daniel Brown', email: 'daniel@example.com', status: 'Final Round Completed', feedback_score: 4.6 },
      ],
      '3': [
        { id: 2, name: 'Michael Chen', email: 'michael@example.com', status: 'Final Round Completed', feedback_score: 4.7 },
        { id: 5, name: 'Emily Davis', email: 'emily@example.com', status: 'Final Round Completed', feedback_score: 4.8 },
      ],
      '4': [
        { id: 7, name: 'John Doe', email: 'johndoe@example.com', status: 'Final Round Completed', feedback_score: 4.6 },
      ]
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
        console.log('📋 Job-specific offers:', offersRes.data);
        setOffers(offersRes.data?.data || []);
      } catch (err) {
        console.error('❌ Error fetching job-specific offers:', err);
        // Fallback to filtering existing offers
        const filteredOffers = offers.filter(offer => 
          offer.job_opening_id === parseInt(jobId)
        );
        setOffers(filteredOffers);
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
      console.log('🎯 Creating offer for candidate:', selectedCandidate);
      console.log('📝 Offer data:', offerData);

      // Validate required fields
      if (!selectedCandidate?.id || !selectedJobId) {
        alert('Missing candidate or job information');
        return;
      }

      // Format dates properly for API - FIXED VERSION
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Use en-CA locale which gives YYYY-MM-DD format
        return date.toLocaleDateString('en-CA');
      };

      // Build payload according to API expectations
      const payload = {
        applicant_id: parseInt(selectedCandidate.id),
        job_opening_id: parseInt(selectedJobId),
        salary_offered: parseFloat(offerData.salary).toFixed(2), // Ensure 2 decimal places
        offer_date: formatDateForAPI(new Date()),
        expiry_date: formatDateForAPI(offerData.expiration_date),
        joining_date: formatDateForAPI(offerData.start_date),
        status: 'Sent' // Use exact case as in your successful example
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      const response = await createJobOffer(payload);
      console.log('✅ Success! Response:', response.data);

      await fetchData();
      setOfferModalOpen(false);
      setSelectedCandidate(null);
      alert('Job offer created successfully!');

    } catch (err) {
      console.error('❌ Full error:', err);
      
      // Enhanced error logging
      if (err.response?.data) {
        console.error('🚨 Server error details:', err.response.data);
        
        // Display specific validation errors
        if (err.response.data.errors) {
          const errorMessages = Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Please fix the following issues:\n${errorMessages}`);
        } else if (err.response.data.message) {
          alert(`Error: ${err.response.data.message}`);
        }
      } else {
        alert('Failed to create job offer. Please try again.');
      }
    }
  };

  // UPDATED: Handle applicant status updates
  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    try {
      console.log('🔄 Updating applicant status:', { offerId, newStatus });
      
      // First, get the job offer to get the applicant ID
      const currentOfferRes = await getJobOfferById(offerId);
      const offerData = currentOfferRes.data?.data;
      
      if (!offerData || !offerData.applicant_id) {
        alert('Could not find applicant information for this offer.');
        return;
      }
      
      const applicantId = offerData.applicant_id;
      console.log('📋 Found applicant ID:', applicantId);
      
      // Define ONLY the 4 statuses you want
      const validApplicantStatuses = ['applied', 'interview_schedule', 'shortlisted', 'hired'];
      
      // Check if the requested status is valid
      if (!validApplicantStatuses.includes(newStatus)) {
        alert(`Invalid status. Please use one of: ${validApplicantStatuses.join(', ')}`);
        return;
      }
      
      console.log('📤 Updating applicant status:', {
        applicantId,
        currentStatus: offerData.applicant?.status,
        newStatus: newStatus
      });
      
      // Update the APPLICANT status
      const response = await updateApplicantStatus(applicantId, newStatus);
      console.log('✅ Applicant status updated:', response.data);
      
      // Refresh the data to show updated status
      await fetchData();
      
      alert(`Applicant status updated to ${newStatus}`);
      
    } catch (err) {
      console.error('❌ Error updating applicant status:', err);
      
      if (err.response?.data) {
        console.error('Server error details:', err.response.data);
        
        if (err.response.data.errors) {
          const errorMessages = Object.entries(err.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Validation failed:\n${errorMessages}`);
        } else if (err.response.data.message) {
          alert(`Error: ${err.response.data.message}`);
        }
      } else {
        alert('Failed to update applicant status. Please try again.');
      }
    }
  };

  // ADD THIS FUNCTION - It was missing!
  const handleDownloadOfferLetter = async (offerId) => {
    try {
      console.log('📥 Downloading offer letter for:', offerId);
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
      
      console.log('✅ Offer letter downloaded successfully');
      
    } catch (err) {
      console.error('❌ Error downloading offer letter:', err);
      alert('Failed to download offer letter. The file may not be available yet.');
    }
  };

  const offerStatusClasses = {
    Applied: 'bg-blue-100 text-blue-800',
    'Interview Schedule': 'bg-purple-100 text-purple-800',
    Shortlisted: 'bg-yellow-100 text-yellow-800',
    Hired: 'bg-green-100 text-green-800',
    // Keep these for backward compatibility
    Sent: 'bg-blue-100 text-blue-800',
    Accepted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Expired: 'bg-orange-100 text-orange-800',
    Withdrawn: 'bg-gray-100 text-gray-800'
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      applied: 'Applied',
      interview_schedule: 'Interview Schedule',
      shortlisted: 'Shortlisted',
      hired: 'Hired',
      // Keep these for backward compatibility
      sent: 'Sent',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      withdrawn: 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job offers...</p>
        </div>
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
            className="bg-brand-blue text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
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
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Final Candidates {selectedJobId && `for ${jobOpenings.find(j => j.id == selectedJobId)?.title}`}
            </h2>
            <span className="text-sm text-gray-500">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </span>
          </div>
          
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

        {/* Job Offers Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
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
      
      {/* Offer Form Modal */}
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

// Candidate Card Component
const CandidateCard = ({ candidate, onMakeOffer }) => {
  const getAvatar = (candidate) => {
    if (candidate.avatar) return candidate.avatar;
    return candidate.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CC';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-800 font-bold text-lg">
              {getAvatar(candidate)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{candidate.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {candidate.email || 'No email provided'}
            </p>
            {candidate.feedback_score && (
              <p className="text-sm text-gray-500">
                Score: <span className="font-semibold text-gray-700">{candidate.feedback_score}/5.0</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Status: <span className="font-semibold text-gray-800">{candidate.status || 'Under Review'}</span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onMakeOffer(candidate)}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90 transition-opacity"
        >
          <HiOutlineCheckCircle className="mr-2 h-5 w-5" /> Make Offer
        </button>
        <button className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <HiOutlineXCircle className="mr-2 h-5 w-5" /> Reject
        </button>
      </div>
    </div>
  );
};

// Offer Row Component - FIXED WITH STABLE DROPDOWNS
const OfferRow = ({ offer, onUpdateStatus, onDownloadLetter, statusClasses, getStatusDisplay }) => {
  const [showActions, setShowActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  
  const statusBtnRef = useRef(null);
  const actionBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCandidateName = (offer) => {
    if (offer.applicant) {
      return `${offer.applicant.first_name} ${offer.applicant.last_name}`;
    }
    return 'Unknown Candidate';
  };

  const getJobTitle = (offer) => {
    if (offer.job_opening) {
      return offer.job_opening.title;
    }
    return 'Unknown Position';
  };

  // UPDATED: Use ONLY the 4 applicant statuses
  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'interview_schedule', label: 'Interview Schedule' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'hired', label: 'Hired' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to calculate position and toggle dropdown
  const toggleDropdown = (e, type) => {
    e.stopPropagation();
    
    if (type === 'status') {
      if (!showStatusDropdown) {
        const rect = statusBtnRef.current.getBoundingClientRect();
        setDropdownPos({ 
          top: rect.bottom + window.scrollY + 5, 
          left: rect.left + window.scrollX 
        });
        setShowStatusDropdown(true);
        setShowActions(false);
      } else {
        setShowStatusDropdown(false);
      }
    } else if (type === 'actions') {
      if (!showActions) {
        const rect = actionBtnRef.current.getBoundingClientRect();
       setDropdownPos({ top: rect.bottom + 5, left: rect.right - 250 });
        
        setShowActions(true);
        setShowStatusDropdown(false);
      } else {
        setShowActions(false);
      }
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-indigo-800 font-bold">
              {getCandidateName(offer).split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{getCandidateName(offer)}</div>
            <div className="text-sm text-gray-500">{offer.applicant?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {getJobTitle(offer)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
        {offer.salary_offered ? formatCurrency(offer.salary_offered) : 'Not specified'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(offer.offer_date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(offer.expiry_date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <button
            ref={statusBtnRef}
            onClick={(e) => toggleDropdown(e, 'status')}
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              statusClasses[getStatusDisplay(offer.status)] || 'bg-gray-100 text-gray-800'
            } hover:opacity-90 transition-opacity flex items-center gap-1`}
          >
            {getStatusDisplay(offer.status)}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Status Dropdown - FIXED POSITION */}
          {showStatusDropdown && createPortal(
            <div 
              ref={dropdownRef}
              className="absolute w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
              style={{ 
                top: dropdownPos.top, 
                left: dropdownPos.left,
                maxHeight: '240px',
                overflowY: 'auto'
              }}
            >
              <div className="py-1">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onUpdateStatus(offer.id, option.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      offer.status === option.value 
                        ? 'bg-brand-blue text-white hover:bg-brand-blue' 
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2 relative">
          <button
            onClick={() => onDownloadLetter(offer.id)}
            className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
            title="Download Offer Letter"
          >
            <HiDownload className="h-4 w-4" />
          </button>
          <button
            ref={actionBtnRef}
            onClick={(e) => toggleDropdown(e, 'actions')}
            className="text-gray-600 hover:text-gray-900 p-1 transition-colors relative"
            title="More Actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 a1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              6
            </span>
          </button>
          
          {/* Actions Dropdown - FIXED POSITION */}
          {showActions && createPortal(
            <div 
              ref={dropdownRef}
              className="absolute w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
              style={{ 
                top: dropdownPos.top, 
                left: dropdownPos.left,
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    onUpdateStatus(offer.id, 'shortlisted');
                    setShowActions(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Shortlisted
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(offer.id, 'hired');
                    setShowActions(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                >
                  <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
                  Mark as Hired
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => setShowActions(false)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HiEye className="mr-2 h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => setShowActions(false)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HiOutlinePencil className="mr-2 h-4 w-4" />
                  Edit Offer
                </button>
                <button
                  onClick={() => setShowActions(false)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resend Email
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
      </td>
    </tr>
  );
};

// Offer Form Modal Component
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
      
      // Set default start date to 3 weeks from now
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() + 21);
      
      setFormData({
        salary: jobOpening?.salary_range?.split('-')[0]?.trim() || '75000',
        start_date: defaultStart.toISOString().split('T')[0],
        expiration_date: defaultExpiry.toISOString().split('T')[0],
        notes: `We are pleased to offer you the position of ${jobOpening?.title}. We believe your skills and experience will be a valuable addition to our team.`
      });
    }
  }, [isOpen, jobOpening]);

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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Create Job Offer for {candidate?.name}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {jobOpening && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Position:</strong> {jobOpening.title}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Location:</strong> {jobOpening.location || 'Not specified'}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Employment Type:</strong> {jobOpening.employment_type || 'Not specified'}
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
              min="0"
              step="1000"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Custom Message
            </label>
            <textarea 
              name="notes"
              rows="4" 
              value={formData.notes}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
              placeholder="Optional message to the candidate..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="py-2 px-6 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
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
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input 
      id={name} 
      name={name} 
      value={value}
      onChange={onChange}
      {...props} 
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
    />
  </div>
);

export default SelectionAndOffersPage;
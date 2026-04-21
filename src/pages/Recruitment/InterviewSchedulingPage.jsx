import React, { useState, useEffect, useCallback } from 'react';
import usePermissions from '../../hooks/usePermissions';
import { 
  HiPlus, HiChevronLeft, HiChevronRight, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineVideoCamera, HiX, HiPencil, HiTrash, HiFilter 
} from 'react-icons/hi';
import { useOrganizations } from '../../contexts/OrganizationContext';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getUpcomingInterviews,
  getApplicantsForInterviews,
  getInterviewersFromInterviews,
  updateApplicantStatus
} from '../../services/recruitmentService';

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// Interview type options
const interviewTypeOptions = [
  'phone_screen',
  'technical', 
  'hr_round',
  'final',
  'cultural_fit',
  'panel',
  'one_on_one',
];

// Status options - UPDATED TO MATCH API VALID VALUES
const statusOptions = [
  { 
    value: 'applied', 
    label: 'Applied', 
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  { 
    value: 'interview-scheduled', 
    label: 'Interview Scheduled', 
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  { 
    value: 'shortlisted', 
    label: 'Shortlisted', 
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  }
];

// Result options - UPDATED TO MATCH API VALUES
const resultOptions = [
  { value: 'progress', label: 'In Progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'on_hold', label: 'On Hold' }
];

// Helper Form Components
const FormInput = ({ label, name, type = 'text', error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input 
      type={type} 
      id={name} 
      name={name} 
      {...props} 
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`} 
    />
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

const FormSelect = ({ label, name, children, error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <select 
      id={name} 
      name={name} 
      {...props} 
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

const FormTextarea = ({ label, name, error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea 
      id={name} 
      name={name} 
      {...props} 
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`} 
    />
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

// Date Filter Component
const DateFilter = ({ isOpen, onClose, onApplyFilter, filterDate }) => {
  const [selectedDate, setSelectedDate] = useState(filterDate || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(filterDate || '');
    }
  }, [isOpen, filterDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter(selectedDate);
    onClose();
  };

  const handleClear = () => {
    setSelectedDate('');
    onApplyFilter('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Filter Interviews by Date
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="filterDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to show all interviews
            </p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={handleClear}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              Clear Filter
            </button>
            <button 
              type="submit" 
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Slide-Over Panel for Scheduling/Editing an Interview
const InterviewFormSlideOver = ({ 
  isOpen, 
  onClose, 
  onSave, 
  interview, 
  applicants, 
  formErrors, 
  interviewers 
}) => {
  const [formData, setFormData] = useState({
    applicant_id: '',
    interview_type: 'phone_screen',
    scheduled_at: '',
    location: '',
    notes: '',
    feedback: '',
    result: 'progress',
    interviewer_ids: []
  });

  // Filter applicants to only show interview-ready ones
  const interviewReadyApplicants = applicants.filter(applicant => 
    !['Applied', 'Rejected', 'On Hold'].includes(applicant.status)
  );

  useEffect(() => {
    if (interview) {
      setFormData({
        applicant_id: interview.applicant_id || interview.applicant?.id || '',
        interview_type: interview.interview_type || 'phone_screen',
        scheduled_at: interview.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
        location: interview.location || '',
        notes: interview.notes || '',
        feedback: interview.feedback || '',
        result: interview.result || 'progress',
        interviewer_ids: interview.interviewer_ids || interview.interviewers?.map(i => i.id) || []
      });
    } else {
      setFormData({
        applicant_id: '',
        interview_type: 'phone_screen',
        scheduled_at: '',
        location: '',
        notes: '',
        feedback: '',
        result: 'progress',
        interviewer_ids: []
      });
    }
  }, [interview, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, options } = e.target;
    
    if (type === 'select-multiple') {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white shadow-xl">
              <div className="p-6 bg-gray-50">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {interview ? 'Edit Interview' : 'Schedule New Interview'}
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button type="button" onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500">
                      <HiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <FormSelect 
                  label="Applicant *" 
                  name="applicant_id" 
                  value={formData.applicant_id} 
                  onChange={handleChange}
                  error={formErrors.applicant_id}
                  required
                >
                  <option value="">Select Applicant</option>
                  {interviewReadyApplicants.length > 0 ? (
                    interviewReadyApplicants.map(applicant => (
                      <option key={applicant.id} value={applicant.id}>
                        {applicant.first_name} {applicant.last_name} - {applicant.job_opening?.title} ({applicant.status})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No interview-ready applicants. Please update applicant statuses first.
                    </option>
                  )}
                </FormSelect>
                
                <FormSelect 
                  label="Interview Type *" 
                  name="interview_type" 
                  value={formData.interview_type} 
                  onChange={handleChange}
                  error={formErrors.interview_type}
                  required
                >
                  {interviewTypeOptions.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </FormSelect>
                
                <FormSelect 
                  label="Initial Result *" 
                  name="result" 
                  value={formData.result} 
                  onChange={handleChange}
                  error={formErrors.result}
                  required
                >
                  {resultOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
                
                <FormSelect 
                  label="Interviewers *" 
                  name="interviewer_ids" 
                  value={formData.interviewer_ids} 
                  onChange={handleChange}
                  error={formErrors.interviewer_ids}
                  multiple
                  required
                  size="4"
                >
                  {interviewers.length > 0 ? (
                    interviewers.map(interviewer => (
                      <option key={interviewer.id} value={interviewer.id}>
                        {interviewer.name || `${interviewer.first_name} ${interviewer.last_name}`} 
                        {interviewer.email ? ` (${interviewer.email})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No interviewers available. Please add interviewers first.</option>
                  )}
                </FormSelect>
                <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple interviewers</p>
                
                <FormInput 
                  type="datetime-local" 
                  label="Date & Time *" 
                  name="scheduled_at" 
                  value={formData.scheduled_at} 
                  onChange={handleChange}
                  error={formErrors.scheduled_at}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
                
                <FormInput 
                  label="Location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  error={formErrors.location}
                  placeholder="Office, Zoom, Google Meet, etc."
                />

                <FormTextarea 
                  label="Initial Feedback (Optional)" 
                  name="feedback" 
                  value={formData.feedback} 
                  onChange={handleChange}
                  error={formErrors.feedback}
                  placeholder="Any initial notes or feedback about the interview..."
                  rows="3"
                />
                
                <FormTextarea 
                  label="Additional Notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  error={formErrors.notes}
                  placeholder="Additional notes about the interview..."
                  rows="3"
                />
              </div>
              
              <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-4 border-t">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90"
                >
                  {interview ? 'Update Interview' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

// Main Page Component
const InterviewSchedulingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;
  const { canAdd, canEdit, canDelete } = usePermissions('recruitment.interview_scheduling');

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const [interviewsRes, upcomingRes, applicantsRes] = await Promise.all([
        getInterviews({ organization_id: organizationId }),
        getUpcomingInterviews(),
        getApplicantsForInterviews(organizationId)
      ]);

      const interviewsData = interviewsRes.data?.data || [];
      setInterviews(interviewsData);
      setFilteredInterviews(interviewsData);
      setUpcomingInterviews(upcomingRes.data?.data || []);
      setApplicants(applicantsRes.data?.data || []);

      const interviewersRes = await getInterviewersFromInterviews(organizationId);
      setInterviewers(interviewersRes.data?.data || []);

      console.log('📊 Data loaded:', {
        interviews: interviewsData.length || 0,
        applicants: applicantsRes.data?.data?.length || 0,
        interviewers: interviewersRes.data?.data?.length || 0
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply date filter
  const applyDateFilter = (date) => {
    setFilterDate(date);
    
    if (!date) {
      setFilteredInterviews(interviews);
    } else {
      const filtered = interviews.filter(interview => {
        if (!interview.scheduled_at) return false;
        const interviewDate = new Date(interview.scheduled_at).toISOString().split('T')[0];
        return interviewDate === date;
      });
      setFilteredInterviews(filtered);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format date for API
  const formatDateForAPI = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = '00';
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const handleSaveInterview = async (interviewData) => {
    try {
      console.log('🎯 Starting interview save process...');
      console.log('📝 Form data being submitted:', interviewData);
      setFormErrors({});

      const validationErrors = {};
      
      if (!interviewData.applicant_id) {
        validationErrors.applicant_id = ['Please select an applicant'];
      }
      if (!interviewData.scheduled_at) {
        validationErrors.scheduled_at = ['Please select date and time'];
      }
      if (!interviewData.interviewer_ids || interviewData.interviewer_ids.length === 0) {
        validationErrors.interviewer_ids = ['Please select at least one interviewer'];
      }
      if (!interviewData.interview_type) {
        validationErrors.interview_type = ['Please select interview type'];
      }
      if (!interviewData.result || !resultOptions.find(opt => opt.value === interviewData.result)) {
        validationErrors.result = ['Please select a valid result'];
      }

      if (interviewData.scheduled_at && new Date(interviewData.scheduled_at) <= new Date()) {
        validationErrors.scheduled_at = ['Interview date must be in the future'];
      }

      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      const selectedApplicant = applicants.find(app => app.id === parseInt(interviewData.applicant_id));
      console.log('👤 Selected applicant:', selectedApplicant);

      if (selectedApplicant && selectedApplicant.status === 'Applied') {
        const shouldUpdateStatus = window.confirm(
          `This applicant's current status is "Applied". To schedule an interview, the status needs to be updated to "Shortlisted" or similar.\n\nWould you like to update the applicant status automatically?`
        );

        if (shouldUpdateStatus) {
          try {
            console.log('🔄 Updating applicant status to "Shortlisted"...');
            await updateApplicantStatus(parseInt(interviewData.applicant_id), 'Shortlisted');
            console.log('✅ Applicant status updated successfully');
            
            const applicantsRes = await getApplicantsForInterviews(organizationId);
            setApplicants(applicantsRes.data?.data || []);
            
          } catch (statusError) {
            console.error('❌ Failed to update applicant status:', statusError);
            alert('Could not automatically update applicant status. Please update it manually first.');
            return;
          }
        } else {
          alert('Cannot schedule interview. Applicant status must be updated first.');
          return;
        }
      }

      const formattedDate = formatDateForAPI(interviewData.scheduled_at);
      if (!formattedDate) {
        alert('Invalid date format. Please check the selected date and time.');
        return;
      }

      const payload = {
        applicant_id: parseInt(interviewData.applicant_id),
        interview_type: interviewData.interview_type,
        scheduled_at: formattedDate,
        location: interviewData.location || 'Office',
        status: 'scheduled',
        organization_id: parseInt(organizationId),
        notes: interviewData.notes || '',
        feedback: interviewData.feedback || '',
        result: interviewData.result && resultOptions.find(opt => opt.value === interviewData.result) 
          ? interviewData.result 
          : 'progress',
        
        interviewer_ids: Array.isArray(interviewData.interviewer_ids) 
          ? interviewData.interviewer_ids.map(id => parseInt(id))
          : [parseInt(interviewData.interviewer_ids)],
        
        duration: 60,
        interview_round: 1,
      };

      if (selectedApplicant?.job_opening_id) {
        payload.job_opening_id = selectedApplicant.job_opening_id;
      }

      console.log('📤 Final payload being sent:', JSON.stringify(payload, null, 2));

      let response;
      if (editingInterview) {
        console.log('🔄 Updating existing interview:', editingInterview.id);
        response = await updateInterview(editingInterview.id, payload);
      } else {
        console.log('🆕 Creating new interview');
        response = await createInterview(payload);
      }
      
      console.log('✅ API Success Response:', response.data);
      
      await fetchData();
      setSlideOverOpen(false);
      setEditingInterview(null);
      setFormErrors({});
      
      alert(editingInterview ? 'Interview updated successfully!' : 'Interview scheduled successfully!');
      
    } catch (err) {
      console.error('❌ Error saving interview:', err);
      
      console.error('🔴 Complete error object:', err);
      console.error('🔴 Error response data:', err.response?.data);
      console.error('🔴 Error response status:', err.response?.status);
      
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        console.error('🔴 400 Bad Request Details:', errorData);
        
        if (errorData.message?.includes('Applicant status does not allow interview scheduling')) {
          const currentStatus = errorData.current_status;
          const allowedStatuses = errorData.allowed_statuses || [];
          
          const errorMessage = 
            `Cannot schedule interview for this applicant.\n\n` +
            `Current Status: "${currentStatus}"\n` +
            `Allowed Statuses: ${allowedStatuses.join(', ')}\n\n` +
            `Please update the applicant's status to one of the allowed statuses before scheduling an interview.`;
          
          alert(errorMessage);
        } else if (errorData.message) {
          alert(`Error: ${errorData.message}`);
        } else {
          alert('Bad Request: Please check all fields and try again.');
        }
      } else if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        console.error('🟡 422 Validation Errors:', validationErrors);
        
        setFormErrors(validationErrors);
        
        let errorMessage = 'Please fix the following errors:\n\n';
        Object.entries(validationErrors).forEach(([field, messages]) => {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          errorMessage += `• ${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}\n`;
        });
        
        alert(errorMessage);
        
      } else if (err.response?.status === 500) {
        const errorData = err.response.data;
        console.error('🔴 500 Server Error Details:', errorData);
        alert('Server error occurred. Please try again or contact support.');
      } else if (err.request) {
        console.error('🔴 Network Error:', err.request);
        alert('Network error: Could not connect to server. Please check your internet connection.');
      } else {
        alert('Failed to save interview. Please try again.');
      }
    }
  };

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setSlideOverOpen(true);
  };

  const handleDeleteInterview = async (id) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        await deleteInterview(id);
        await fetchData();
        alert('Interview deleted successfully!');
      } catch (err) {
        console.error('Error deleting interview:', err);
        alert('Failed to delete interview.');
      }
    }
  };

  const handleStatusUpdate = async (interviewId, newStatus) => {
    try {
      const interview = interviews.find(i => i.id === interviewId);
      if (!interview || !interview.applicant_id) {
        alert('Could not find applicant for this interview');
        return;
      }
      
      await updateApplicantStatus(interview.applicant_id, newStatus);
      await fetchData();
      alert(`Status updated to ${newStatus === 'applied_interview_schedule' ? 'Applied & interview-schedule' : 'Shortlisted'}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const getInterviewsForDate = (date) => {
    const interviewsToUse = filterDate ? filteredInterviews : interviews;
    return interviewsToUse.filter(interview => {
      if (!interview.scheduled_at) return false;
      const interviewDate = new Date(interview.scheduled_at);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const formatInterviewTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
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
    <>
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div 
        className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Interview Scheduling</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and schedule interviews for all job applicants.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center">
              <button 
                onClick={() => setFilterOpen(true)}
                className={`inline-flex items-center gap-2 justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm ${
                  filterDate 
                    ? 'border-brand-blue text-brand-blue bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <HiFilter className="h-4 w-4" />
                Filter by Date
                {filterDate && (
                  <span className="ml-1 bg-brand-blue text-white text-xs px-2 py-1 rounded-full">
                    {new Date(filterDate).toLocaleDateString()}
                  </span>
                )}
              </button>
              
              {canAdd && (
                <button 
                  onClick={() => {
                    setEditingInterview(null);
                    setFormErrors({});
                    setSlideOverOpen(true);
                  }}
                  className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:opacity-90"
                >
                  <HiPlus className="h-5 w-5" /> Schedule Interview
                </button>
              )}
            </div>
          </div>

          {filterDate && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiFilter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Showing interviews for: <strong>{new Date(filterDate).toLocaleDateString()}</strong>
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <button 
                  onClick={() => applyDateFilter('')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filter
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md lg:flex">
            <div className="lg:flex-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                      <HiChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                      <HiChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    <div key={day} className="py-2">{day}</div>
                  )}
                </div>
                
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => 
                    <div key={`empty-${i}`} className="border rounded-lg"></div>
                  )}
                  
                  {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = day + 1;
                    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
                    const interviewsForDay = getInterviewsForDate(fullDate);
                    
                    return (
                      <div key={date} className="border rounded-lg p-2 h-24 flex flex-col hover:bg-gray-50">
                        <span className={`font-semibold ${fullDate.toDateString() === new Date().toDateString() ? 'text-brand-blue' : ''}`}>
                          {date}
                        </span>
                        <div className="mt-1 overflow-y-auto text-xs space-y-1 flex-1">
                          {interviewsForDay.map(interview => (
                            <div 
                              key={interview.id} 
                              className="bg-blue-100 text-blue-800 p-1 rounded text-xs truncate cursor-pointer hover:bg-blue-200"
                              onClick={() => {
                                if (canEdit) handleEditInterview(interview);
                              }}
                              title={`${interview.applicant?.first_name} ${interview.applicant?.last_name} - ${formatInterviewTime(interview.scheduled_at)}`}
                            >
                              {interview.applicant?.first_name} {formatInterviewTime(interview.scheduled_at)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Interviews</h3>
                <div className="space-y-4">
                  {upcomingInterviews.length > 0 ? (
                    upcomingInterviews.slice(0, 5).map(interview => (
                      <div key={interview.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div className="bg-white p-2 rounded-lg">
                          <HiOutlineCalendar className="h-5 w-5 text-brand-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {interview.applicant?.first_name} {interview.applicant?.last_name}
                          </p>
                          <p className="text-xs text-gray-600">{interview.job_opening?.title}</p>
                          <p className="text-xs text-gray-500">
                            {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString([], { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            }) : 'Date not set'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              statusOptions.find(s => s.value === interview.status)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {statusOptions.find(s => s.value === interview.status)?.label || interview.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming interviews</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md mt-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">All Interviews</h3>
                <div className="text-sm text-gray-500">
                  {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} total
                  {filterDate && ` (filtered by date)`}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInterviews.length > 0 ? (
                      filteredInterviews.map(interview => (
                        <tr key={interview.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-700 font-medium text-sm">
                                  {interview.applicant?.first_name?.[0]}{interview.applicant?.last_name?.[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {interview.applicant?.first_name} {interview.applicant?.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {interview.applicant?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.job_opening?.title || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString([], { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            }) : 'Not scheduled'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.interview_type || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={interview.status || 'scheduled'}
                              disabled={!canEdit}
                              onChange={(e) => handleStatusUpdate(interview.id, e.target.value)}
                              className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${
                                statusOptions.find(s => s.value === interview.status)?.color || 'bg-gray-100 text-gray-800'
                              } ${!canEdit ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => handleEditInterview(interview)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Edit"
                                >
                                  <HiPencil className="h-4 w-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteInterview(interview.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                  title="Delete Interview"
                                >
                                  <HiTrash className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          {filterDate 
                            ? `No interviews found for ${new Date(filterDate).toLocaleDateString()}. Try a different date or clear the filter.`
                            : 'No interviews found. Schedule your first interview to get started.'
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <InterviewFormSlideOver 
          isOpen={isSlideOverOpen}
          onClose={() => {
            setSlideOverOpen(false);
            setEditingInterview(null);
            setFormErrors({});
          }}
          onSave={handleSaveInterview}
          interview={editingInterview}
          applicants={applicants}
          formErrors={formErrors}
          interviewers={interviewers}
        />
        
        <DateFilter 
          isOpen={isFilterOpen}
          onClose={() => setFilterOpen(false)}
          onApplyFilter={applyDateFilter}
          filterDate={filterDate}
        />
      </div>
    </>
  );
};

export default InterviewSchedulingPage;
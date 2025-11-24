import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiPlus, HiChevronLeft, HiChevronRight, HiOutlineCalendar, HiOutlineClock, 
  HiOutlineUser, HiOutlineVideoCamera, HiX, HiPencil, HiTrash 
} from 'react-icons/hi';
import { useOrganizations } from '../../contexts/OrganizationContext';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getUpcomingInterviews,
  updateInterviewStatus,
  getApplicantsForInterviews
} from '../../services/recruitmentService';

// Interview type options
const interviewTypeOptions = [
  'Phone Screen',
  'Technical Interview',
  'HR Round',
  'Final Interview',
  'Cultural Fit',
  'Panel Interview',
  'One-on-One'
];

// Status options based on your API response
const statusOptions = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-yellow-100 text-yellow-800' }
];

// Main Page Component
const InterviewSchedulingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
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
      const [interviewsRes, upcomingRes, applicantsRes] = await Promise.all([
        getInterviews({ organization_id: organizationId }),
        getUpcomingInterviews(),
        getApplicantsForInterviews(organizationId)
      ]);

      console.log('Interviews API Response:', interviewsRes.data);
      console.log('Upcoming Interviews API Response:', upcomingRes.data);
      console.log('Applicants API Response:', applicantsRes.data);

      setInterviews(interviewsRes.data?.data || []);
      setUpcomingInterviews(upcomingRes.data?.data || []);
      setApplicants(applicantsRes.data?.data || []);

    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveInterview = async (interviewData) => {
    try {
      const payload = {
        applicant_id: interviewData.applicant_id,
        interview_type: interviewData.interview_type,
        scheduled_at: interviewData.scheduled_at,
        location: interviewData.location || 'Office',
        status: 'scheduled',
        organization_id: organizationId,
        notes: interviewData.notes
      };

      console.log('Saving interview payload:', payload);

      if (editingInterview) {
        await updateInterview(editingInterview.id, payload);
      } else {
        await createInterview(payload);
      }
      
      fetchData();
      setSlideOverOpen(false);
      setEditingInterview(null);
    } catch (err) {
      console.error('Error saving interview:', err);
      alert('Failed to save interview. Please try again.');
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
        fetchData();
      } catch (err) {
        console.error('Error deleting interview:', err);
        alert('Failed to delete interview.');
      }
    }
  };

  const handleStatusUpdate = async (interviewId, newStatus) => {
    try {
      await updateInterviewStatus(interviewId, newStatus);
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const getInterviewsForDate = (date) => {
    return interviews.filter(interview => {
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

  // Get interviewer names from interview data
  const getInterviewerNames = (interview) => {
    if (interview.interviewers && interview.interviewers.length > 0) {
      return interview.interviewers.map(i => i.name || `${i.first_name} ${i.last_name}`).join(', ');
    }
    return 'Not assigned';
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Interview Scheduling</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and schedule interviews for all job applicants.
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingInterview(null);
              setSlideOverOpen(true);
            }}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:opacity-90 self-start sm:self-center"
          >
            <HiPlus className="h-5 w-5" /> Schedule Interview
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md lg:flex">
          {/* Calendar View */}
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
                            onClick={() => handleEditInterview(interview)}
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

          {/* Upcoming Interviews Sidebar */}
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

        {/* Interviews List Table */}
        <div className="bg-white rounded-xl shadow-md mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Interviews</h3>
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
                  {interviews.length > 0 ? (
                    interviews.map(interview => (
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
                            onChange={(e) => handleStatusUpdate(interview.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${
                              statusOptions.find(s => s.value === interview.status)?.color || 'bg-gray-100 text-gray-800'
                            }`}
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
                            <button
                              onClick={() => handleEditInterview(interview)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <HiPencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No interviews found. Schedule your first interview to get started.
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
        }}
        onSave={handleSaveInterview}
        interview={editingInterview}
        applicants={applicants}
      />
    </div>
  );
};

// Slide-Over Panel for Scheduling/Editing an Interview
const InterviewFormSlideOver = ({ isOpen, onClose, onSave, interview, applicants }) => {
  const [formData, setFormData] = useState({
    applicant_id: '',
    interview_type: 'Phone Screen',
    scheduled_at: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (interview) {
      setFormData({
        applicant_id: interview.applicant_id || interview.applicant?.id || '',
        interview_type: interview.interview_type || 'Phone Screen',
        scheduled_at: interview.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
        location: interview.location || '',
        notes: interview.notes || ''
      });
    } else {
      setFormData({
        applicant_id: '',
        interview_type: 'Phone Screen',
        scheduled_at: '',
        location: '',
        notes: ''
      });
    }
  }, [interview, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                  label="Applicant" 
                  name="applicant_id" 
                  value={formData.applicant_id} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Applicant</option>
                  {applicants.map(applicant => (
                    <option key={applicant.id} value={applicant.id}>
                      {applicant.first_name} {applicant.last_name} - {applicant.job_opening?.title}
                    </option>
                  ))}
                </FormSelect>
                
                <FormSelect 
                  label="Interview Type" 
                  name="interview_type" 
                  value={formData.interview_type} 
                  onChange={handleChange}
                  required
                >
                  {interviewTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </FormSelect>
                
                <FormInput 
                  type="datetime-local" 
                  label="Date & Time" 
                  name="scheduled_at" 
                  value={formData.scheduled_at} 
                  onChange={handleChange}
                  required
                />
                
                <FormInput 
                  label="Location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  placeholder="Office, Zoom, Google Meet, etc."
                />
                
                <FormTextarea 
                  label="Notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Additional notes about the interview..."
                  rows="3"
                />
              </div>
              
              <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-4 border-t">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90">
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

// Helper Form Components
const FormInput = ({ label, name, type = 'text', ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input 
      type={type} 
      id={name} 
      name={name} 
      {...props} 
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
    />
  </div>
);

const FormSelect = ({ label, name, children, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <select 
      id={name} 
      name={name} 
      {...props} 
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
    >
      {children}
    </select>
  </div>
);

const FormTextarea = ({ label, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea 
      id={name} 
      name={name} 
      {...props} 
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
    />
  </div>
);

export default InterviewSchedulingPage;
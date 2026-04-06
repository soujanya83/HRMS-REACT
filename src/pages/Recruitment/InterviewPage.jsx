// src/pages/Recruitment/InterviewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaBriefcase,
  FaEnvelope,
  FaPhoneAlt,
  FaSearch,
  FaDownload,
  FaPrint,
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaUsers,
  FaClipboardList,
  FaMicrophone,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaMedal,
  FaUserTie,
  FaGraduationCap,
  FaUserCircle
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import interviewService from '../../services/interviewService';
import { getApplicants } from '../../services/recruitmentService';

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name || name === 'N/A' || name === 'Unknown Applicant') return 'NA';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Helper function to get display name
const getDisplayName = (applicant) => {
  if (applicant.name && applicant.name !== 'N/A') {
    return applicant.name;
  }
  if (applicant.first_name || applicant.last_name) {
    const firstName = applicant.first_name || '';
    const lastName = applicant.last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  if (applicant.email) {
    return applicant.email.split('@')[0];
  }
  return 'Unknown Applicant';
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, size = "md", readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl"
  };
  
  const getStarIcon = (index) => {
    const starValue = index + 1;
    if (hoverRating >= starValue && !readonly) {
      return <FaStar className="text-yellow-400 cursor-pointer transition-transform hover:scale-110" />;
    }
    if (rating >= starValue) {
      return <FaStar className="text-yellow-400" />;
    }
    if (rating >= starValue - 0.5 && rating < starValue) {
      return <FaStarHalfAlt className="text-yellow-400" />;
    }
    return <FaRegStar className={!readonly ? "cursor-pointer text-gray-300" : "text-gray-300"} />;
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          onMouseEnter={() => !readonly && setHoverRating(index + 1)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange?.(index + 1)}
          className={`${sizes[size]} transition-all duration-200`}
        >
          {getStarIcon(index)}
        </span>
      ))}
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, answerData, onAnswerChange, onRatingChange, onSave, index, saving, savingId }) => {
  const isSavingThis = saving && savingId === question.id;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
              {index}
            </div>
            <h3 className="font-semibold text-gray-800">
              {question.question}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rating:</span>
            <StarRating 
              rating={answerData?.rating || 0} 
              onRatingChange={(rating) => onRatingChange(question.id, rating)}
              size="md"
              readonly={isSavingThis}
            />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Candidate's Response
        </label>
        <textarea
          value={answerData?.answer || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          rows={3}
          placeholder="Type the candidate's answer here..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
          disabled={isSavingThis}
        />
        
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onSave(question.id)}
            disabled={isSavingThis || (!answerData?.answer?.trim() && !answerData?.rating)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            {isSavingThis ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaSave size={14} />
            )}
            Save Answer & Rating
          </button>
        </div>
      </div>
    </div>
  );
};

// Applicant Card Component - With Name, Avatar Initials, and Rating
// Applicant Card Component - With Average Rating Display
// Applicant Card Component - Complete
const ApplicantCard = ({ applicant, isSelected, onSelect, averageRating }) => {
  const getDisplayName = (applicant) => {
    if (applicant.name && applicant.name !== 'N/A') {
      return applicant.name;
    }
    if (applicant.first_name || applicant.last_name) {
      const firstName = applicant.first_name || '';
      const lastName = applicant.last_name || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    if (applicant.email) {
      return applicant.email.split('@')[0];
    }
    return 'Unknown Applicant';
  };

  const getInitials = (name) => {
    if (!name || name === 'N/A' || name === 'Unknown Applicant') return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = getDisplayName(applicant);
  const initials = getInitials(displayName);
  const position = applicant.position || applicant.designation?.title || 'Applied';

  // Debug log to check averageRating
  console.log(`Applicant: ${displayName}, Rating: ${averageRating}`);

  return (
    <div
      onClick={() => onSelect(applicant)}
      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 bg-blue-50/50 shadow-md' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with Initials */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm ${
            isSelected 
              ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {initials}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Applicant Name and Rating in same row */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <h4 className="font-semibold text-gray-800 truncate text-sm">
              {displayName}
            </h4>
            {/* Average Rating with Stars */}
            <div className="flex items-center gap-1">
              <StarRating rating={averageRating} readonly size="sm" />
              <span className="text-xs font-semibold text-gray-600">
                {averageRating.toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Position/Status */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">{position}</span>
          </div>
          
          {/* Email and Phone */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <FaEnvelope size={10} /> {applicant.email || 'No email'}
            </span>
            <span className="flex items-center gap-1">
              <FaPhoneAlt size={10} /> {applicant.phone || applicant.mobile || 'No phone'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Interview Page Component
const InterviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [answers, setAnswers] = useState({});
  const [averageRatings, setAverageRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all questions
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await interviewService.getQuestions();
      const questionsData = response.data?.data || [];
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    }
  }, []);

  // Fetch all applicants with their average ratings
  // Fetch all applicants with their average ratings
const fetchApplicants = useCallback(async () => {
  try {
    const response = await getApplicants({});
    const applicantsData = response.data?.data || [];
    setApplicants(applicantsData);
    
    // ✅ Fetch average ratings for all applicants
    for (const applicant of applicantsData) {
      try {
        const ratingResponse = await interviewService.getAverageRatingByApplicant(applicant.id);
        console.log(`Rating for ${applicant.id}:`, ratingResponse.data); // Debug log
        setAverageRatings(prev => ({
          ...prev,
          [applicant.id]: ratingResponse.data?.average_rating || 0
        }));
      } catch (error) {
        console.error(`Error fetching rating for applicant ${applicant.id}:`, error);
        setAverageRatings(prev => ({ ...prev, [applicant.id]: 0 }));
      }
    }
  } catch (error) {
    console.error('Error fetching applicants:', error);
    toast.error('Failed to load applicants');
  }
}, []);

  // Fetch answers for selected applicant
  const fetchAnswersForApplicant = useCallback(async (applicantId) => {
    try {
      const response = await interviewService.getAnswersByApplicant(applicantId);
      const answersData = response.data?.data || [];
      
      const answersMap = {};
      answersData.forEach(answer => {
        answersMap[answer.question_id] = {
          answer_id: answer.id,
          answer: answer.answer,
          rating: answer.rating || 0
        };
      });
      
      setAnswers(answersMap);
      
      const ratingResponse = await interviewService.getAverageRatingByApplicant(applicantId);
      setAverageRatings(prev => ({
        ...prev,
        [applicantId]: ratingResponse.data?.average_rating || 0
      }));
      
    } catch (error) {
      console.error('Error fetching answers:', error);
      setAnswers({});
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchQuestions(),
        fetchApplicants()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchQuestions, fetchApplicants]);

  // Load answers when applicant is selected
  useEffect(() => {
    if (selectedApplicant) {
      fetchAnswersForApplicant(selectedApplicant.id);
    }
  }, [selectedApplicant, fetchAnswersForApplicant]);

  // Handle URL param
  useEffect(() => {
    if (id && applicants.length > 0) {
      const applicant = applicants.find(a => a.id === parseInt(id));
      if (applicant) {
        setSelectedApplicant(applicant);
      }
    }
  }, [id, applicants]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: answer
      }
    }));
  };

  const handleRatingChange = (questionId, rating) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        rating: rating
      }
    }));
  };

  const handleSaveAnswer = async (questionId) => {
    if (!selectedApplicant) return;
    
    const answerData = answers[questionId];
    if (!answerData?.answer?.trim() && !answerData?.rating) {
      toast.warning('Please add an answer or rating before saving');
      return;
    }
    
    setSaving(true);
    setSavingQuestionId(questionId);
    
    try {
      if (answerData?.answer_id) {
        if (answerData.rating > 0) {
          await interviewService.rateAnswer(answerData.answer_id, answerData.rating);
          toast.success('Rating updated successfully!');
        }
      } else {
        if (answerData?.answer?.trim()) {
          const submitResponse = await interviewService.submitAnswer({
            question_id: questionId,
            applicant_id: selectedApplicant.id,
            answer: answerData.answer
          });
          
          if (answerData.rating > 0 && submitResponse.data?.data?.id) {
            await interviewService.rateAnswer(submitResponse.data.data.id, answerData.rating);
          }
          toast.success('Answer saved successfully!');
        }
      }
      
      await fetchAnswersForApplicant(selectedApplicant.id);
      
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error(error.response?.data?.message || 'Failed to save answer');
    } finally {
      setSaving(false);
      setSavingQuestionId(null);
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const displayName = getDisplayName(applicant);
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (applicant.email && applicant.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const answeredQuestions = Object.values(answers).filter(a => a?.answer?.trim()).length;
  const ratedQuestions = Object.values(answers).filter(a => a?.rating > 0).length;
  const completionPercentage = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;
  const currentAvgRating = selectedApplicant ? (averageRatings[selectedApplicant.id] || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/recruitment/interviews')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Phone Screening Interviews</h1>
                <p className="text-sm text-gray-500">Conduct and manage phone screening interviews for candidates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FaPrint size={14} /> Print
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <FaDownload size={14} /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-85px)]">
        {/* LEFT PANEL - Applicants List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {['all', 'new', 'scheduled', 'in_progress', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          
          {/* Applicants List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredApplicants.map(applicant => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                isSelected={selectedApplicant?.id === applicant.id}
                onSelect={setSelectedApplicant}
                averageRating={averageRatings[applicant.id] || 0}
              />
            ))}
            
            {filteredApplicants.length === 0 && (
              <div className="text-center py-12">
                <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applicants found</p>
              </div>
            )}
          </div>
          
          {/* Footer Stats */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Applicants</span>
              <span className="font-semibold text-gray-800">{applicants.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Total Questions</span>
              <span className="font-semibold text-gray-800">{questions.length}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Interview Details */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {selectedApplicant ? (
            <div className="p-6 max-w-5xl mx-auto">
              {/* Applicant Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                      {getInitials(getDisplayName(selectedApplicant))}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{getDisplayName(selectedApplicant)}</h2>
                      <p className="text-blue-100">{selectedApplicant.position || 'Position not set'}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
                        <span className="flex items-center gap-1">
                          <FaEnvelope size={12} /> {selectedApplicant.email || 'No email'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPhoneAlt size={12} /> {selectedApplicant.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <div className="text-sm opacity-90">Overall Rating</div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={currentAvgRating} readonly size="lg" />
                      <span className="text-2xl font-bold">{currentAvgRating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      Based on {ratedQuestions} rated answers
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Answered</p>
                      <p className="text-2xl font-bold text-gray-800">{answeredQuestions}/{questions.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaClipboardList className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Rated</p>
                      <p className="text-2xl font-bold text-gray-800">{ratedQuestions}/{questions.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FaStar className="text-yellow-600 text-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Completion</p>
                      <p className="text-2xl font-bold text-gray-800">{Math.round(completionPercentage)}%</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaChartLine className="text-green-600 text-xl" />
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-800">{currentAvgRating.toFixed(1)}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaMedal className="text-purple-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaMicrophone className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Interview Questions</h3>
                </div>
                
                {questions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-gray-500">No questions available. Please add questions first.</p>
                  </div>
                ) : (
                  questions.map((question, idx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      answerData={answers[question.id]}
                      onAnswerChange={handleAnswerChange}
                      onRatingChange={handleRatingChange}
                      onSave={handleSaveAnswer}
                      index={idx + 1}
                      saving={saving}
                      savingId={savingQuestionId}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserTie className="text-4xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select an Applicant</h3>
                <p className="text-gray-500">
                  Choose an applicant from the left panel to conduct the phone screening interview.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
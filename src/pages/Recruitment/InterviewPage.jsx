// src/pages/Recruitment/InterviewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaBriefcase,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaDownload,
  FaPrint,
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaUsers,
  FaClipboardList,
  FaMicrophone,
  FaRegCommentDots,
  FaUserCircle,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaMedal,
  FaUserTie,
  FaGraduationCap,
  FaHeart,
  FaBrain,
  FaLightbulb,
  FaBuilding,
  FaUserPlus,
  FaFileAlt,
  FaPhone,
  FaEnvelopeOpen,
  FaCalendarCheck,
  FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Service functions
import axiosClient from '../../axiosClient.js';

// ============================================
// API SERVICE FUNCTIONS
// ============================================

// Questions API
const getQuestions = () => axiosClient.get('/questions');
const createQuestion = (data) => axiosClient.post('/questions', data);
const updateQuestion = (id, data) => axiosClient.put(`/questions/${id}`, data);
const deleteQuestion = (id) => axiosClient.delete(`/questions/${id}`);

// Answers API
const submitAnswer = (data) => axiosClient.post('/answers', data);
const getAnswersByApplicant = (applicantId) => axiosClient.get(`/answers/applicant/${applicantId}`);
const rateAnswer = (answerId, rating) => axiosClient.put(`/answers/rating/${answerId}`, { rating });
const getAverageRating = (applicantId) => axiosClient.get(`/answers/average/${applicantId}`);
const deleteAnswer = (id) => axiosClient.delete(`/answers/${id}`);

// Applicants API
const getApplicants = (params) => axiosClient.get('/recruitment/applicants', { params });

// ============================================
// COMPONENTS
// ============================================

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
const QuestionCard = ({ question, answerData, onAnswerChange, onRatingChange, index, saving }) => {
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
              readonly={saving}
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
          disabled={saving}
        />
        
        {/* Quick Response Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAnswerChange(question.id, "Excellent response - demonstrated deep understanding and relevant experience")}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            disabled={saving}
          >
            ⭐ Excellent
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange(question.id, "Good response - showed competence and knowledge")}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            disabled={saving}
          >
            👍 Good
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange(question.id, "Average response - basic understanding, needs more detail")}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            disabled={saving}
          >
            📝 Average
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange(question.id, "Weak response - lacked detail and understanding")}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            disabled={saving}
          >
            ⚠️ Weak
          </button>
        </div>
      </div>
    </div>
  );
};

// Applicant Card Component
const ApplicantCard = ({ applicant, isSelected, onSelect, averageRating }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return <FaCheckCircle className="text-green-600" size={12} />;
      case 'in_progress': return <FaClock className="text-blue-600" size={12} />;
      case 'scheduled': return <FaCalendarAlt className="text-yellow-600" size={12} />;
      default: return null;
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

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
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base ${
            isSelected ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-gray-600 to-gray-800'
          }`}>
            {getInitials(applicant.name)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">
              {applicant.name}
            </h4>
            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={averageRating} readonly size="sm" />
                <span className="text-xs font-semibold text-gray-600">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700">{applicant.position || 'N/A'}</span>
            {applicant.experience && (
              <>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500">{applicant.experience}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaEnvelope size={10} /> {applicant.email}
            </span>
            <span className="flex items-center gap-1">
              <FaPhoneAlt size={10} /> {applicant.phone || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex-shrink-0 text-right">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(applicant.status)}`}>
            {getStatusIcon(applicant.status)}
            {applicant.status || 'New'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN INTERVIEW PAGE COMPONENT
// ============================================
const InterviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [answers, setAnswers] = useState({});
  const [averageRatings, setAverageRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [overallComment, setOverallComment] = useState('');
  const [recommend, setRecommend] = useState(false);

  // Fetch all questions
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await getQuestions();
      const questionsData = response.data?.data || [];
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    }
  }, []);

  // Fetch all applicants
  const fetchApplicants = useCallback(async () => {
    try {
      const response = await getApplicants({});
      const applicantsData = response.data?.data || [];
      setApplicants(applicantsData);
      
      // Fetch average ratings for all applicants
      for (const applicant of applicantsData) {
        try {
          const ratingResponse = await getAverageRating(applicant.id);
          setAverageRatings(prev => ({
            ...prev,
            [applicant.id]: ratingResponse.data?.average_rating || 0
          }));
        } catch (error) {
          console.error(`Error fetching rating for applicant ${applicant.id}:`, error);
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
      const response = await getAnswersByApplicant(applicantId);
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
      
      // Also fetch average rating
      const ratingResponse = await getAverageRating(applicantId);
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

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: answer
      }
    }));
  };

  // Handle rating change
  const handleRatingChange = async (questionId, rating) => {
    const currentAnswer = answers[questionId];
    
    // Update local state
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        rating: rating
      }
    }));
    
    // If answer already exists, update rating via API
    if (currentAnswer?.answer_id) {
      try {
        await rateAnswer(currentAnswer.answer_id, rating);
        toast.success('Rating updated!');
        
        // Refresh average rating
        if (selectedApplicant) {
          const ratingResponse = await getAverageRating(selectedApplicant.id);
          setAverageRatings(prev => ({
            ...prev,
            [selectedApplicant.id]: ratingResponse.data?.average_rating || 0
          }));
        }
      } catch (error) {
        console.error('Error updating rating:', error);
        toast.error('Failed to update rating');
      }
    }
  };

  // Calculate overall rating from current answers
  const calculateOverallRating = () => {
    const ratingValues = Object.values(answers).filter(a => a?.rating > 0);
    if (ratingValues.length === 0) return 0;
    const sum = ratingValues.reduce((a, b) => a + b.rating, 0);
    return sum / ratingValues.length;
  };

  // Save all answers
  const handleSaveFeedback = async () => {
    if (!selectedApplicant) return;
    
    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Submit each answer
      for (const [questionId, answerData] of Object.entries(answers)) {
        if (!answerData.answer?.trim()) continue;
        
        try {
          if (answerData.answer_id) {
            // Answer exists - update rating only (since PUT for answer might not exist)
            if (answerData.rating > 0) {
              await rateAnswer(answerData.answer_id, answerData.rating);
            }
            successCount++;
          } else {
            // New answer - create it
            const submitResponse = await submitAnswer({
              question_id: parseInt(questionId),
              applicant_id: selectedApplicant.id,
              answer: answerData.answer
            });
            
            // If rating provided, update it
            if (answerData.rating > 0 && submitResponse.data?.data?.id) {
              await rateAnswer(submitResponse.data.data.id, answerData.rating);
            }
            successCount++;
          }
        } catch (error) {
          console.error(`Error saving answer for question ${questionId}:`, error);
          errorCount++;
        }
      }
      
      // Refresh answers and rating
      await fetchAnswersForApplicant(selectedApplicant.id);
      
      if (errorCount === 0) {
        toast.success(`✅ All answers saved successfully! (${successCount} answers)`);
      } else {
        toast.warning(`⚠️ ${successCount} saved, ${errorCount} failed`);
      }
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const overallRating = calculateOverallRating();
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
                <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
          
          {/* Stats Footer */}
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
              {/* Applicant Header Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                      {selectedApplicant.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedApplicant.name}</h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <FaBriefcase size={12} /> {selectedApplicant.position || 'Position not set'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
                        <span className="flex items-center gap-1">
                          <FaEnvelope size={12} /> {selectedApplicant.email}
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

              {/* Progress Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Answered</p>
                      <p className="text-2xl font-bold text-gray-800">{answeredQuestions}/{questions.length}</p>
                      <p className="text-xs text-gray-400">Questions</p>
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
                      <p className="text-xs text-gray-400">Questions</p>
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
                      <p className="text-xs text-gray-400">Overall</p>
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
                      <p className="text-xs text-gray-400">Out of 5</p>
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
                  <span className="text-sm text-gray-400 ml-2">Rate each answer from 1-5 stars</span>
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
                      index={idx + 1}
                      saving={saving}
                    />
                  ))
                )}
              </div>

              {/* Overall Comments */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaRegCommentDots className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Overall Assessment</h3>
                </div>
                
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder="Enter overall comments about the candidate. Highlight strengths, areas for improvement, and final recommendation..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
                  disabled={saving}
                />
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={recommend}
                      onChange={(e) => setRecommend(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">✅ Recommend for next round</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-sm text-gray-700">🎓 Montessori experience preferred</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                    <span className="text-sm text-gray-700">📅 Available for immediate start</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-gray-100 py-4 border-t border-gray-200 -mx-6 px-6">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeedback}
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  {saving && <FaSpinner className="animate-spin" />}
                  <FaSave />
                  Save Interview Feedback
                </button>
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
                  Choose an applicant from the left panel to conduct the phone screening interview and record their responses.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Tip: Rate each answer and add detailed notes for accurate assessment
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
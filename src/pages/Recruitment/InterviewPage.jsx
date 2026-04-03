// src/pages/Recruitment/InterviewPage.jsx
import React, { useState, useEffect } from 'react';
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
  FaRocket,
  FaAward
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

// Sample Interview Questions
const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    question: "Please tell me about yourself?",
    description: "Experience, background, and motivation",
    category: "General",
    icon: <FaUserCircle className="text-blue-500" />
  },
  {
    id: 2,
    question: "What do you like the most & least about working with children?",
    description: "Passion for kids and challenges faced",
    category: "Experience",
    icon: <FaHeart className="text-pink-500" />
  },
  {
    id: 3,
    question: "What five items would you put in an empty classroom?",
    description: "Creativity and reasoning",
    category: "Creative Thinking",
    icon: <FaLightbulb className="text-yellow-500" />
  },
  {
    id: 4,
    question: "How do you stay up to date on the latest information in the sector?",
    description: "Professional development and learning",
    category: "Professional Development",
    icon: <FaGraduationCap className="text-green-500" />
  },
  {
    id: 5,
    question: "Describe a challenging situation with a child and how you handled it?",
    description: "Problem-solving and conflict resolution",
    category: "Problem Solving",
    icon: <FaBrain className="text-purple-500" />
  }
];

// Sample Applicants Data
const SAMPLE_APPLICANTS = [
  {
    id: 1,
    name: "Alexandra Westwood",
    email: "alexandra.westwood@email.com",
    phone: "+61 412 345 678",
    position: "Childcare Educator",
    experience: "8 years",
    currentRole: "Lead Educator (3 years)",
    location: "Melbourne, VIC",
    appliedDate: "2026-01-10",
    status: "Completed",
    overallRating: 4.5,
    hasMontessori: true,
    interviewDate: "2026-01-14",
    interviewer: "Kavisha Dassanayake",
    avatar: "AW",
    answers: {
      1: { answer: "experience for 8 years, lead educator for 3 years, has alot of experience, familiar with montessori approach, did not previously have the montessori approach", rating: 4 },
      2: { answer: "passion for kids, surrounded by other educators without the same commitment", rating: 4 },
      3: { answer: "said good examples and why, creative things, good reasoning", rating: 4 },
      4: { answer: "follows sector updates through professional networks, attends workshops, reads industry publications", rating: 4 },
      5: { answer: "", rating: 0 }
    }
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+61 423 456 789",
    position: "Early Childhood Teacher",
    experience: "5 years",
    currentRole: "Room Leader",
    location: "Sydney, NSW",
    appliedDate: "2026-01-09",
    status: "In Progress",
    overallRating: 4.2,
    hasMontessori: false,
    interviewDate: "2026-01-15",
    interviewer: "Sarah Johnson",
    avatar: "MC",
    answers: {
      1: { answer: "5 years in early childhood education, passionate about child development", rating: 4 },
      2: { answer: "Love seeing children's growth, challenge is managing large groups", rating: 4 },
      3: { answer: "Books, art supplies, building blocks, sensory toys, plants", rating: 3 },
      4: { answer: "Regular webinars, ACEQA updates", rating: 4 },
      5: { answer: "", rating: 0 }
    }
  },
  {
    id: 3,
    name: "Emma Watson",
    email: "emma.watson@email.com",
    phone: "+61 434 567 890",
    position: "Assistant Educator",
    experience: "3 years",
    currentRole: "Assistant Educator",
    location: "Brisbane, QLD",
    appliedDate: "2026-01-08",
    status: "Scheduled",
    overallRating: 0,
    hasMontessori: false,
    interviewDate: "2026-01-16",
    interviewer: "Michael Brown",
    avatar: "EW",
    answers: {
      1: { answer: "", rating: 0 },
      2: { answer: "", rating: 0 },
      3: { answer: "", rating: 0 },
      4: { answer: "", rating: 0 },
      5: { answer: "", rating: 0 }
    }
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+61 445 678 901",
    position: "Childcare Educator",
    experience: "6 years",
    currentRole: "Lead Educator",
    location: "Perth, WA",
    appliedDate: "2026-01-07",
    status: "Completed",
    overallRating: 4.8,
    hasMontessori: true,
    interviewDate: "2026-01-12",
    interviewer: "Kavisha Dassanayake",
    avatar: "JW",
    answers: {
      1: { answer: "6 years experience, Montessori trained, passionate about child-led learning", rating: 5 },
      2: { answer: "Love fostering independence, challenge is maintaining work-life balance", rating: 4 },
      3: { answer: "Sensory table, art easel, reading nook, building area, quiet corner", rating: 5 },
      4: { answer: "Active member of Early Childhood Australia", rating: 5 },
      5: { answer: "Handled biting incident by observing patterns and working with parents", rating: 5 }
    }
  }
];

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
const QuestionCard = ({ question, answer, rating, onAnswerChange, onRatingChange, index }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
              {index}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{question.icon}</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {question.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">
              {question.question}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rating:</span>
            <StarRating 
              rating={rating} 
              onRatingChange={onRatingChange}
              size="md"
            />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Candidate's Response
        </label>
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={3}
          placeholder="Type the candidate's answer here..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
        />
        
        {/* Quick Response Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAnswerChange("Excellent response - demonstrated deep understanding and relevant experience")}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            ⭐ Excellent
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange("Good response - showed competence and knowledge")}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            👍 Good
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange("Average response - basic understanding, needs more detail")}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
          >
            📝 Average
          </button>
          <button
            type="button"
            onClick={() => onAnswerChange("Weak response - lacked detail and understanding")}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            ⚠️ Weak
          </button>
        </div>
      </div>
    </div>
  );
};

// Applicant Card Component
const ApplicantCard = ({ applicant, isSelected, onSelect }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <FaCheckCircle className="text-green-600" size={12} />;
      case 'In Progress': return <FaClock className="text-blue-600" size={12} />;
      case 'Scheduled': return <FaCalendarAlt className="text-yellow-600" size={12} />;
      default: return null;
    }
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
            {applicant.avatar}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">
              {applicant.name}
            </h4>
            {applicant.overallRating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={applicant.overallRating} readonly size="sm" />
                <span className="text-xs font-semibold text-gray-600">
                  {applicant.overallRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700">{applicant.position}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{applicant.experience}</span>
            {applicant.hasMontessori && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Montessori
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaEnvelope size={10} /> {applicant.email}
            </span>
            <span className="flex items-center gap-1">
              <FaPhoneAlt size={10} /> {applicant.phone}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt size={10} /> {applicant.location}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex-shrink-0 text-right">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(applicant.status)}`}>
            {getStatusIcon(applicant.status)}
            {applicant.status}
          </span>
          {applicant.interviewDate && (
            <p className="text-xs text-gray-400 mt-1">
              {applicant.interviewDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Interview Page Component
const InterviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [applicants, setApplicants] = useState(SAMPLE_APPLICANTS);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [answers, setAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [overallComment, setOverallComment] = useState('');
  const [recommend, setRecommend] = useState(false);

  useEffect(() => {
    if (id) {
      const applicant = applicants.find(a => a.id === parseInt(id));
      if (applicant) {
        setSelectedApplicant(applicant);
      }
    }
  }, [id, applicants]);

  useEffect(() => {
    if (selectedApplicant) {
      setAnswers(selectedApplicant.answers || {});
      const ratingsObj = {};
      Object.keys(selectedApplicant.answers || {}).forEach(key => {
        ratingsObj[key] = selectedApplicant.answers[key]?.rating || 0;
      });
      setRatings(ratingsObj);
    }
  }, [selectedApplicant]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer, rating: prev[questionId]?.rating || 0 }
    }));
  };

  const handleRatingChange = (questionId, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: rating
    }));
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer: prev[questionId]?.answer || '', rating }
    }));
  };

  const calculateOverallRating = () => {
    const ratingValues = Object.values(ratings).filter(r => r > 0);
    if (ratingValues.length === 0) return 0;
    const sum = ratingValues.reduce((a, b) => a + b, 0);
    return sum / ratingValues.length;
  };

  const handleSaveFeedback = async () => {
    setSaving(true);
    
    const feedbackData = {
      applicantId: selectedApplicant.id,
      applicantName: selectedApplicant.name,
      interviewDate: new Date().toISOString(),
      interviewer: "Current User",
      answers: answers,
      ratings: ratings,
      overallRating: calculateOverallRating(),
      overallComment: overallComment,
      recommend: recommend,
      status: "Completed"
    };
    
    console.log("Saving feedback:", feedbackData);
    
    setTimeout(() => {
      setApplicants(prev => prev.map(app => 
        app.id === selectedApplicant.id 
          ? { 
              ...app, 
              answers: answers,
              overallRating: calculateOverallRating(),
              status: "Completed"
            }
          : app
      ));
      
      setSelectedApplicant(prev => ({
        ...prev,
        answers: answers,
        overallRating: calculateOverallRating(),
        status: "Completed"
      }));
      
      setSaving(false);
      alert("✅ Feedback saved successfully!");
    }, 1000);
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const overallRating = calculateOverallRating();
  const answeredQuestions = Object.values(answers).filter(a => a?.answer?.trim()).length;
  const ratedQuestions = Object.values(ratings).filter(r => r > 0).length;
  const completionPercentage = Math.round((answeredQuestions / INTERVIEW_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-100">
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
              {['all', 'Scheduled', 'In Progress', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
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
              <span className="text-gray-600">Completed Interviews</span>
              <span className="font-semibold text-green-600">{applicants.filter(a => a.status === 'Completed').length}</span>
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
                      {selectedApplicant.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedApplicant.name}</h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <FaBriefcase size={12} /> {selectedApplicant.position}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
                        <span className="flex items-center gap-1">
                          <FaEnvelope size={12} /> {selectedApplicant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPhoneAlt size={12} /> {selectedApplicant.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt size={12} /> {selectedApplicant.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <div className="text-sm opacity-90">Overall Rating</div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={overallRating} readonly size="lg" />
                      <span className="text-2xl font-bold">{overallRating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      Interview: {selectedApplicant.interviewDate}
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
                      <p className="text-2xl font-bold text-gray-800">{answeredQuestions}/{INTERVIEW_QUESTIONS.length}</p>
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
                      <p className="text-2xl font-bold text-gray-800">{ratedQuestions}/{INTERVIEW_QUESTIONS.length}</p>
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
                      <p className="text-2xl font-bold text-gray-800">{completionPercentage}%</p>
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
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedApplicant.experience}</p>
                      <p className="text-xs text-gray-400">Total</p>
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
                
                {INTERVIEW_QUESTIONS.map((question, idx) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answer={answers[question.id]?.answer || ''}
                    rating={ratings[question.id] || 0}
                    onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                    onRatingChange={(rating) => handleRatingChange(question.id, rating)}
                    index={idx + 1}
                  />
                ))}
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
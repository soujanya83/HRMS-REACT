// src/services/interviewService.js
import axiosClient from '../axiosClient';

// ============================================
// QUESTIONS API
// ============================================

// Get all questions
export const getQuestions = () => {
  return axiosClient.get('/questions');
};

// Get a single question by ID
export const getQuestionById = (id) => {
  return axiosClient.get(`/questions/${id}`);
};

// Create a new question
export const createQuestion = (questionData) => {
  return axiosClient.post('/questions', questionData);
};

// Update a question
export const updateQuestion = (id, questionData) => {
  return axiosClient.put(`/questions/${id}`, questionData);
};

// Delete a question
export const deleteQuestion = (id) => {
  return axiosClient.delete(`/questions/${id}`);
};

// ============================================
// ANSWERS API
// ============================================

// Submit an answer for a question
export const submitAnswer = (answerData) => {
  // answerData format: { question_id, applicant_id, answer }
  return axiosClient.post('/answers', answerData);
};

// Get all answers for a specific applicant
export const getAnswersByApplicant = (applicantId) => {
  return axiosClient.get(`/answers/applicant/${applicantId}`);
};

// Get a specific answer by ID
export const getAnswerById = (id) => {
  return axiosClient.get(`/answers/${id}`);
};

// Rate an answer (update rating)
export const rateAnswer = (answerId, rating) => {
  return axiosClient.put(`/answers/rating/${answerId}`, { rating });
};

// Get average rating for an applicant
export const getAverageRatingByApplicant = (applicantId) => {
  return axiosClient.get(`/answers/average/${applicantId}`);
};

// Delete an answer
export const deleteAnswer = (id) => {
  return axiosClient.delete(`/answers/${id}`);
};

// Get answers by question (for analytics)
export const getAnswersByQuestion = (questionId) => {
  return axiosClient.get(`/answers/question/${questionId}`);
};

// ============================================
// BULK OPERATIONS
// ============================================

// Submit multiple answers at once (for complete interview)
export const submitBulkAnswers = async (applicantId, answers) => {
  // answers format: [{ question_id, answer, rating }, ...]
  const results = [];
  const errors = [];

  for (const answer of answers) {
    try {
      // First submit the answer
      const submitResponse = await submitAnswer({
        question_id: answer.question_id,
        applicant_id: applicantId,
        answer: answer.answer || ''
      });
      
      // If rating is provided, update it
      if (answer.rating && answer.rating > 0 && submitResponse.data?.data?.id) {
        await rateAnswer(submitResponse.data.data.id, answer.rating);
      }
      
      results.push({
        question_id: answer.question_id,
        success: true,
        data: submitResponse.data
      });
    } catch (error) {
      errors.push({
        question_id: answer.question_id,
        success: false,
        error: error.response?.data?.message || error.message
      });
    }
  }

  return { 
    success: errors.length === 0,
    results, 
    errors,
    total: answers.length,
    successful: results.length,
    failed: errors.length
  };
};

// Get complete interview data for an applicant
export const getInterviewData = async (applicantId) => {
  try {
    // Get all questions
    const questionsResponse = await getQuestions();
    const questions = questionsResponse.data?.data || [];
    
    // Get applicant's answers
    const answersResponse = await getAnswersByApplicant(applicantId);
    const answers = answersResponse.data?.data || [];
    
    // Get average rating
    const avgRatingResponse = await getAverageRatingByApplicant(applicantId);
    const averageRating = avgRatingResponse.data?.average_rating || 0;
    
    // Map answers to questions
    const mappedData = questions.map(question => {
      const answer = answers.find(a => a.question_id === question.id);
      return {
        question_id: question.id,
        question: question.question,
        answer: answer?.answer || '',
        rating: answer?.rating || 0,
        answer_id: answer?.id || null,
        created_at: answer?.created_at || null,
        updated_at: answer?.updated_at || null
      };
    });
    
    return {
      success: true,
      applicant_id: applicantId,
      average_rating: averageRating,
      questions: mappedData,
      total_questions: questions.length,
      answered_questions: answers.length,
      rated_questions: answers.filter(a => a.rating > 0).length,
      completion_percentage: questions.length > 0 ? (answers.length / questions.length) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching interview data:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      applicant_id: applicantId,
      questions: [],
      total_questions: 0,
      answered_questions: 0,
      rated_questions: 0,
      completion_percentage: 0
    };
  }
};

// Save complete interview (submit all answers and ratings)
export const saveCompleteInterview = async (applicantId, interviewData) => {
  // interviewData format: { answers: [{ question_id, answer, rating }], overall_comment, recommend }
  const results = [];
  const errors = [];
  
  for (const item of interviewData.answers) {
    try {
      // Check if answer already exists
      const existingAnswersResponse = await getAnswersByApplicant(applicantId);
      const existingAnswer = existingAnswersResponse.data?.data?.find(a => a.question_id === item.question_id);
      
      if (existingAnswer) {
        // Update existing answer's rating only
        if (item.rating !== existingAnswer.rating && item.rating > 0) {
          await rateAnswer(existingAnswer.id, item.rating);
          results.push({ 
            question_id: item.question_id, 
            action: 'rating_updated', 
            rating: item.rating,
            success: true
          });
        } else {
          results.push({ 
            question_id: item.question_id, 
            action: 'no_change',
            success: true
          });
        }
      } else {
        // Create new answer
        const submitResponse = await submitAnswer({
          question_id: item.question_id,
          applicant_id: applicantId,
          answer: item.answer || ''
        });
        
        // Set rating if provided
        if (item.rating > 0 && submitResponse.data?.data?.id) {
          await rateAnswer(submitResponse.data.data.id, item.rating);
        }
        
        results.push({ 
          question_id: item.question_id, 
          action: 'created', 
          data: submitResponse.data,
          success: true
        });
      }
    } catch (error) {
      errors.push({
        question_id: item.question_id,
        success: false,
        error: error.response?.data?.message || error.message
      });
    }
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
    total_processed: interviewData.answers.length,
    successful: results.filter(r => r.success).length,
    failed: errors.length
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate completion percentage for an applicant
export const getCompletionPercentage = async (applicantId) => {
  try {
    const [questionsRes, answersRes] = await Promise.all([
      getQuestions(),
      getAnswersByApplicant(applicantId)
    ]);
    
    const totalQuestions = questionsRes.data?.data?.length || 0;
    const answeredQuestions = answersRes.data?.data?.length || 0;
    
    return {
      total: totalQuestions,
      answered: answeredQuestions,
      percentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    };
  } catch (error) {
    console.error('Error calculating completion:', error);
    return { total: 0, answered: 0, percentage: 0 };
  }
};

// Get rating distribution for an applicant
export const getRatingDistribution = async (applicantId) => {
  try {
    const response = await getAnswersByApplicant(applicantId);
    const answers = response.data?.data || [];
    
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    answers.forEach(answer => {
      if (answer.rating >= 1 && answer.rating <= 5) {
        distribution[answer.rating]++;
      }
    });
    
    return distribution;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
};

// Get all applicants with their average ratings
export const getApplicantsWithRatings = async (applicants) => {
  try {
    const applicantsWithRatings = await Promise.all(
      applicants.map(async (applicant) => {
        try {
          const ratingResponse = await getAverageRatingByApplicant(applicant.id);
          return {
            ...applicant,
            average_rating: ratingResponse.data?.average_rating || 0
          };
        } catch (error) {
          return {
            ...applicant,
            average_rating: 0
          };
        }
      })
    );
    
    return applicantsWithRatings;
  } catch (error) {
    console.error('Error getting applicants with ratings:', error);
    return applicants;
  }
};

// Export all functions as default object
const interviewService = {
  // Questions
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  
  // Answers
  submitAnswer,
  getAnswersByApplicant,
  getAnswerById,
  rateAnswer,
  getAverageRatingByApplicant,
  deleteAnswer,
  getAnswersByQuestion,
  
  // Bulk operations
  submitBulkAnswers,
  getInterviewData,
  saveCompleteInterview,
  
  // Utilities
  getCompletionPercentage,
  getRatingDistribution,
  getApplicantsWithRatings
};

export default interviewService;
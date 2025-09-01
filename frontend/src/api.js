const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API functions
export const getChallenges = async () => {
  const res = await fetch(`${API_BASE_URL}/challenges`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getChallenge = async (challengeId) => {
  const res = await fetch(`${API_BASE_URL}/challenges/${challengeId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Get submissions for a challenge (company only)
export const getChallengeSubmissions = async (challengeId) => {
  const res = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submissions`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Submit solution to a challenge
export const submitSolution = async (solutionData) => {
  const res = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(solutionData)
  });
  return handleResponse(res);
};

// Create a new challenge (company only)
export const createChallenge = async (challengeData) => {
  const res = await fetch(`${API_BASE_URL}/challenges`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(challengeData)
  });
  return handleResponse(res);
};

// Get user's own submissions
export const getUserSubmissions = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/submissions`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Get a specific submission
export const getSubmission = async (submissionId) => {
  const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Review a submission (company only)
export const reviewSubmission = async (submissionId, reviewData) => {
  const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/review`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData)
  });
  return handleResponse(res);
};

// Get submission for review (company only)
export const getSubmissionForReview = async (submissionId) => {
  const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/review`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Get company submissions for review
export const getCompanySubmissions = async (status = 'all', page = 1, limit = 20) => {
  const params = new URLSearchParams({ status, page: page.toString(), limit: limit.toString() });
  const res = await fetch(`${API_BASE_URL}/submissions/company-reviews?${params}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Auth
export const login = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(res);
};

export const register = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(res);
};

export const verifyToken = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Get current user's profile
export const getUserProfile = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

// Update current user's profile
export const updateUserProfile = async (profileData) => {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(res);
};

// Get leaderboard (optionally by timeframe)
export const getLeaderboard = async (timeframe = 'all') => {
  const url = timeframe && timeframe !== 'all'
    ? `${API_BASE_URL}/auth/leaderboard?timeframe=${encodeURIComponent(timeframe)}`
    : `${API_BASE_URL}/auth/leaderboard`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse(res);
};

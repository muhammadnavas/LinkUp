// api/index.js or api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all challenges
export const getChallenges = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

// Get specific challenge by ID
export const getChallenge = async (challengeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    throw error;
  }
};

// Submit solution to challenge
export const submitSolution = async (challengeId, solutionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(solutionData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error submitting solution:', error);
    throw error;
  }
};

// Get user's submissions for a challenge
export const getSubmissions = async (challengeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submissions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

// Auth functions
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Challenges
export const getChallenges = (params) => API.get("/challenges", { params });
export const getChallenge = (id) => API.get(`/challenges/${id}`);

// Submissions
export const submitSolution = (challengeId, data) => API.post(`/submissions/${challengeId}`, data);
export const getSubmissions = (params) => API.get("/submissions", { params });
export const getSubmission = (id) => API.get(`/submissions/${id}`);

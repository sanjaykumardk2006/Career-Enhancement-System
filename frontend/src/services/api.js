import axios from 'axios';

// In development, defaults to '/api' (proxied by Vite to localhost:5000)
// In production on Vercel, uses VITE_API_URL (e.g., https://career-backend.onrender.com/api)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({ baseURL });

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Resume
export const getResume = () => API.get('/resume');
export const updateResume = (data) => API.put('/resume', data);
export const uploadResume = (formData) => API.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const analyzeResume = () => API.post('/resume/analyze');

// Career
export const getCareerRecommendations = (data) => API.post('/career/recommendations', data);
export const careerChat = (data) => API.post('/career/chat', data);
export const getSkillGapAnalysis = (data) => API.post('/career/skill-gap', data);
export const generateRoadmap = (data) => API.post('/career/roadmap', data);
export const getRoadmap = () => API.get('/career/roadmap');
export const updateTopicProgress = (data) => API.put('/career/roadmap/topic', data);

// Interview
export const startInterview = (data) => API.post('/interview/start', data);
export const submitAnswers = (id, data) => API.put(`/interview/${id}/submit`, data);
export const getInterviews = () => API.get('/interview');
export const getInterview = (id) => API.get(`/interview/${id}`);

// Jobs
export const getJobApplications = () => API.get('/jobs');
export const createJobApplication = (data) => API.post('/jobs', data);
export const updateJobApplication = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJobApplication = (id) => API.delete(`/jobs/${id}`);
export const adminGetStats = () => API.get('/jobs/admin/stats');
export const adminGetAllApplications = () => API.get('/jobs/admin/all');

export default API;

// frontend/src/config.js
// Use environment variable for API URL
const getApiUrl = () => {
  // For production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    return 'https://ai-interview-backend.onrender.com';
  }
  // For development (localhost)
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  register: `${API_URL}/api/register`,
  login: `${API_URL}/api/login`,
  logout: `${API_URL}/api/logout`,
  checkAuth: `${API_URL}/api/check-auth`,
  questions: `${API_URL}/api/questions`,
  analyzeAnswer: `${API_URL}/api/analyze-answer`,
  saveInterview: `${API_URL}/api/save-interview`,
  getSessions: `${API_URL}/api/user-sessions`,
  getSession: (id) => `${API_URL}/api/session/${id}`,
  deleteSession: (id) => `${API_URL}/api/session/${id}`,
  detectFace: `${API_URL}/api/detect-face`
};
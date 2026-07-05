// frontend/src/config.js
// Use environment variable or fallback to Render URL
export const API_URL = process.env.REACT_APP_API_URL 
  || (process.env.NODE_ENV === 'production' 
    ? 'https://ai-interview-backend-pwb6.onrender.com' 
    : 'http://localhost:5000');

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
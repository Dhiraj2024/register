import axios from 'axios';

/**
 * Shared Axios API Service instance.
 * Reads base URL from VITE_API_URL environment variable.
 * In development, if VITE_API_URL is omitted or set to http://localhost:5000,
 * it points to the local backend.
 * In production on Vercel, it points to the deployed backend URL.
 */
const rawBaseURL = import.meta.env.VITE_API_URL || '';
// Clean trailing slash if present
const baseURL = rawBaseURL.replace(/\/$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_reg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors like token expiration / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server responded with 401 Unauthorized (token invalid/expired)
    if (error.response && error.response.status === 401) {
      // Don't loop redirect if the failed request was the login attempt itself
      const requestUrl = error.config ? error.config.url : '';
      if (!requestUrl.includes('/api/auth/login')) {
        console.warn('[API] Session expired or invalid. Clearing credentials...');
        localStorage.removeItem('student_reg_token');
        localStorage.removeItem('student_reg_admin');
        // Dispatch custom event so AuthContext reacts smoothly without full page reload
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — redirect on 401 (session expired / unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Public pages that should NEVER be redirected away from on 401
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    const onPublicPage = publicPaths.some((p) => window.location.pathname.startsWith(p));

    // /auth/me returning 401 just means "not logged in" — don't redirect, let AuthContext handle it
    const isSilentCheck = requestUrl.includes('/auth/me');

    if (status === 401 && !onPublicPage && !isSilentCheck) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

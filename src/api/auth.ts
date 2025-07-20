import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Only add Authorization header if not logging in or signing up
  if (
    token &&
    config.url !== '/login' &&
    config.url !== '/signup'
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  signup: async (username: string, email: string, password: string) => {
    const response = await axios.post('http://localhost:8080/signup', { username, email, password });
    return response.data;
  },
};

export default api;
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add API version to the URL
    const apiVersion = process.env.REACT_APP_API_VERSION || 'v1';
    if (config.url && !config.url.startsWith('/')) {
      config.url = `/${apiVersion}${config.url}`;
    } else if (config.url) {
      config.url = `/${apiVersion}${config.url}`;
    }

    // Add request timestamp for debugging
    config.headers['X-Request-Time'] = new Date().toISOString();
    
    // Add authorization header if token exists
    const token = localStorage.getItem('accessToken') || 
                 document.cookie.match(/accessToken=([^;]+)/)?.[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for common error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          console.error('Unauthorized:', data);
          // Clear tokens on 401 errors
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          break;
        case 403:
          console.error('Forbidden:', data);
          break;
        case 404:
          console.error('Not Found:', data);
          break;
        case 409:
          console.error('Conflict:', data);
          break;
        case 422:
          console.error('Validation Error:', data);
          break;
        case 429:
          console.error('Rate Limited:', data);
          break;
        case 500:
          console.error('Internal Server Error:', data);
          break;
        case 503:
          console.error('Service Unavailable:', data);
          break;
        default:
          console.error('API Error:', data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service class for organized endpoint management
export class ApiService {
  // Authentication endpoints
  static auth = {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    
    register: (userData: any) =>
      apiClient.post('/auth/register', userData),
    
    refresh: (refreshToken: string) =>
      apiClient.post('/auth/refresh', { refreshToken }),
    
    logout: (refreshToken?: string) =>
      apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {}),

    // OAuth endpoints
    googleOAuth: (data: { accessToken: string; idToken?: string }) =>
      apiClient.post('/auth/oauth/google', data),

    appleOAuth: (data: { 
      identityToken: string; 
      authorizationCode?: string; 
      email?: string; 
      firstName?: string; 
      lastName?: string; 
    }) =>
      apiClient.post('/auth/oauth/apple', data),

    // OTP endpoints
    sendOTP: (data: { 
      phone: string; 
      purpose?: 'registration' | 'login' | 'password_reset';
      userId?: string;
    }) =>
      apiClient.post('/auth/send-otp', data),

    verifyOTP: (data: {
      phone: string;
      otp: string;
      purpose?: 'registration' | 'login' | 'password_reset';
      userId?: string;
    }) =>
      apiClient.post('/auth/verify-otp', data),

    registerWithPhone: (data: {
      phone: string;
      firstName: string;
      lastName: string;
      role?: string;
    }) =>
      apiClient.post('/auth/register-phone', data),

    // Profile and status endpoints
    getProfile: () =>
      apiClient.get('/auth/me'),

    checkStatus: () =>
      apiClient.get('/auth/status'),
  };

  // User endpoints
  static users = {
    getProfile: () =>
      apiClient.get('/users/profile'),
    
    updateProfile: (data: any) =>
      apiClient.put('/users/profile', data),
    
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  };

  // Salon endpoints
  static salons = {
    getAll: (params?: any) =>
      apiClient.get('/salons', { params }),
    
    getById: (id: string) =>
      apiClient.get(`/salons/${id}`),
    
    create: (data: any) =>
      apiClient.post('/salons', data),
    
    update: (id: string, data: any) =>
      apiClient.put(`/salons/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/salons/${id}`),
    
    getAvailability: (id: string, params: any) =>
      apiClient.get(`/salons/${id}/availability`, { params }),
  };

  // Booking endpoints
  static bookings = {
    getAll: (params?: any) =>
      apiClient.get('/bookings', { params }),
    
    getById: (id: string) =>
      apiClient.get(`/bookings/${id}`),
    
    create: (data: any) =>
      apiClient.post('/bookings', data),
    
    cancel: (id: string) =>
      apiClient.put(`/bookings/${id}/cancel`),
  };

  // QR Code endpoints
  static qr = {
    generate: (data: any) =>
      apiClient.post('/qr/generate', data),
    
    validate: (code: string) =>
      apiClient.post('/qr/validate', { code }),
  };

  // AI endpoints
  static ai = {
    uploadForSuggestions: (file: File, preferences?: any) => {
      const formData = new FormData();
      formData.append('image', file);
      if (preferences) {
        formData.append('preferences', JSON.stringify(preferences));
      }
      return apiClient.post('/ai/suggestions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    getSuggestions: (id: string) =>
      apiClient.get(`/ai/suggestions/${id}`),
  };

  // Payment endpoints
  static payments = {
    getSubscription: (salonId: string) =>
      apiClient.get(`/payments/subscription/${salonId}`),
    
    webhook: (data: any) =>
      apiClient.post('/payments/webhook/revenuecat', data),
  };

  // Analytics endpoints
  static analytics = {
    getSalonAnalytics: (salonId: string, params?: any) =>
      apiClient.get(`/analytics/salon/${salonId}`, { params }),
  };

  // Notification endpoints
  static notifications = {
    getAll: (params?: any) =>
      apiClient.get('/notifications', { params }),
    
    markAsRead: (id: string) =>
      apiClient.put(`/notifications/${id}/read`),
    
    updatePreferences: (preferences: any) =>
      apiClient.post('/notifications/preferences', preferences),
  };

  // Review endpoints
  static reviews = {
    create: (data: any) =>
      apiClient.post('/reviews', data),
    
    getBySalon: (salonId: string, params?: any) =>
      apiClient.get(`/reviews/salon/${salonId}`, { params }),
  };

  // Admin endpoints
  static admin = {
    getUsers: (params?: any) =>
      apiClient.get('/admin/users', { params }),
    
    getSalons: (params?: any) =>
      apiClient.get('/admin/salons', { params }),
    
    getAnalytics: (params?: any) =>
      apiClient.get('/admin/analytics', { params }),
  };
}

export default apiClient;
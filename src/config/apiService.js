import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_BASE_URL, { API_ENDPOINTS } from './api.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.PROFILE),
    updateProfile: (data) => apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
    changePassword: (data) => apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
    seedAdmin: () => apiClient.post(API_ENDPOINTS.AUTH.SEED_ADMIN),
  },

  // User Management
  users: {
    getAll: () => apiClient.get(API_ENDPOINTS.USERS.GET_ALL),
    create: (data) => apiClient.post(API_ENDPOINTS.USERS.CREATE, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.USERS.DELETE(id)),
  },

  // Categories
  categories: {
    getAll: () => apiClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL),
    getFoodCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES.GET_FOOD_CATEGORIES),
    getDrinkCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES.GET_DRINK_CATEGORIES),
    getDessertCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES.GET_DESSERT_CATEGORIES),
    getHookahCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES.GET_HOOKAH_CATEGORIES),
    add: (data) => apiClient.post(API_ENDPOINTS.CATEGORIES.ADD_CATEGORY, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE_CATEGORY(id), data),
    updateOrder: (id, order) => apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE_CATEGORY(id), { order }),
    batchUpdateOrder: (updates) => {
      // For batch updates, we'll make multiple requests
      return Promise.all(updates.map(update => 
        apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE_CATEGORY(update.id), { order: update.order })
      ));
    },
    delete: (id) => apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE_CATEGORY(id)),
    seed: () => apiClient.post(API_ENDPOINTS.CATEGORIES.SEED_CATEGORIES),
  },

  // Foods
  foods: {
    getAll: () => apiClient.get(API_ENDPOINTS.FOODS.GET_ALL),
    add: (data) => apiClient.post(API_ENDPOINTS.FOODS.ADD, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.FOODS.UPDATE(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.FOODS.DELETE(id)),
  },

  // Drinks
  drinks: {
    getAll: () => apiClient.get(API_ENDPOINTS.DRINKS.GET_ALL),
    add: (data) => apiClient.post(API_ENDPOINTS.DRINKS.ADD, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.DRINKS.UPDATE(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.DRINKS.DELETE(id)),
    search: (query) => apiClient.get(`${API_ENDPOINTS.DRINKS.SEARCH}?q=${query}`),
  },

  // Desserts
  desserts: {
    getAll: () => apiClient.get(API_ENDPOINTS.DESSERTS.GET_ALL),
    add: (data) => apiClient.post(API_ENDPOINTS.DESSERTS.ADD, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.DESSERTS.UPDATE(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.DESSERTS.DELETE(id)),
  },

  // Hookahs
  hookahs: {
    getAll: () => apiClient.get(API_ENDPOINTS.HOOKAHS.GET_ALL),
    add: (data) => apiClient.post(API_ENDPOINTS.HOOKAHS.ADD, data),
    update: (id, data) => apiClient.put(API_ENDPOINTS.HOOKAHS.UPDATE(id), data),
    delete: (id) => apiClient.delete(API_ENDPOINTS.HOOKAHS.DELETE(id)),
  },

  // Images
  images: {
    food: {
      getAll: () => apiClient.get(API_ENDPOINTS.IMAGES.FOOD.GET_ALL),
      add: (formData) => apiClient.post(API_ENDPOINTS.IMAGES.FOOD.ADD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (id) => apiClient.delete(API_ENDPOINTS.IMAGES.FOOD.DELETE(id)),
    },
    drink: {
      getAll: () => apiClient.get(API_ENDPOINTS.IMAGES.DRINK.GET_ALL),
      add: (formData) => apiClient.post(API_ENDPOINTS.IMAGES.DRINK.ADD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (id) => apiClient.delete(API_ENDPOINTS.IMAGES.DRINK.DELETE(id)),
    },
    dessert: {
      getAll: () => apiClient.get(API_ENDPOINTS.IMAGES.DESSERT.GET_ALL),
      add: (formData) => apiClient.post(API_ENDPOINTS.IMAGES.DESSERT.ADD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (id) => apiClient.delete(API_ENDPOINTS.IMAGES.DESSERT.DELETE(id)),
    },
    hookah: {
      getAll: () => apiClient.get(API_ENDPOINTS.IMAGES.HOOKAH.GET_ALL),
      add: (formData) => apiClient.post(API_ENDPOINTS.IMAGES.HOOKAH.ADD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (id) => apiClient.delete(API_ENDPOINTS.IMAGES.HOOKAH.DELETE(id)),
    },
    special: {
      getAll: () => apiClient.get(API_ENDPOINTS.IMAGES.SPECIAL.GET_ALL),
      add: (formData) => apiClient.post(API_ENDPOINTS.IMAGES.SPECIAL.ADD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      delete: (id) => apiClient.delete(API_ENDPOINTS.IMAGES.SPECIAL.DELETE(id)),
    },
  },
};

// Utility functions
export const handleApiError = (error, operation = 'operation') => {
  console.error(`Error during ${operation}:`, error);
  
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        toast.error(data.message || 'Invalid request');
        break;
      case 401:
        toast.error('Unauthorized access');
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(data.message || `Failed to ${operation}`);
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error(`Failed to ${operation}`);
  }
};

export default apiService; 
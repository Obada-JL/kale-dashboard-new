// Kale Cafe API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kale-cafe.com';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    SEED_ADMIN: '/api/auth/seed-admin',
  },

  // User Management
  USERS: {
    GET_ALL: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
  },

  // Categories
  CATEGORIES: {
    GET_ALL: '/api/getCategories',
    GET_FOOD_CATEGORIES: '/api/getFoodCategories',
    GET_DRINK_CATEGORIES: '/api/getDrinkCategories',
    GET_DESSERT_CATEGORIES: '/api/getDessertCategories',
    GET_HOOKAH_CATEGORIES: '/api/getHookahCategories',
    ADD_CATEGORY: '/api/addCategory',
    UPDATE_CATEGORY: (id) => `/api/updateCategory/${id}`,
    DELETE_CATEGORY: (id) => `/api/deleteCategory/${id}`,
    SEED_CATEGORIES: '/api/seedCategories',
  },
  
  // Foods
  FOODS: {
    GET_ALL: '/api/getFoods',
    ADD: '/api/addFood',
    UPDATE: (id) => `/api/updateFood/${id}`,
    DELETE: (id) => `/api/deleteFood/${id}`,
  },
  
  // Drinks
  DRINKS: {
    GET_ALL: '/api/getDrinks',
    ADD: '/api/addDrink',
    UPDATE: (id) => `/api/updateDrink/${id}`,
    DELETE: (id) => `/api/deleteDrink/${id}`,
    SEARCH: '/api/searchDrink',
  },
    
  // Desserts
  DESSERTS: {
    GET_ALL: '/api/getDesserts',
    ADD: '/api/addDessert',
    UPDATE: (id) => `/api/updateDessert/${id}`,
    DELETE: (id) => `/api/deleteDessert/${id}`,
  },
  
  // Hookahs
  HOOKAHS: {
    GET_ALL: '/api/gethookahs',
    ADD: '/api/addhookah',
    UPDATE: (id) => `/api/updatehookah/${id}`,
    DELETE: (id) => `/api/deletehookah/${id}`,
  },
    
    // Images
  IMAGES: {
    FOOD: {
      GET_ALL: '/api/getFoodImages',
      ADD: '/api/addFoodImage',
      DELETE: (id) => `/api/deleteFoodImage/${id}`,
    },
    DRINK: {
      GET_ALL: '/api/getDrinkImages',
      ADD: '/api/addDrinkImage',
      DELETE: (id) => `/api/deleteDrinkImage/${id}`,
    },
    DESSERT: {
      GET_ALL: '/api/getDessertImages',
      ADD: '/api/addDessertImage',
      DELETE: (id) => `/api/deleteDessertImage/${id}`,
    },
    HOOKAH: {
      GET_ALL: '/api/getHookahImages',
      ADD: '/api/addHookahImage',
      DELETE: (id) => `/api/deleteHookahImage/${id}`,
    },
    SPECIAL: {
      GET_ALL: '/api/getSpecialImages',
      ADD: '/api/addSpecialImage',
      DELETE: (id) => `/api/deleteSpecialImage/${id}`,
    },
  },
};

export default API_BASE_URL; 
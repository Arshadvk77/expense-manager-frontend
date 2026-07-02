import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const categoriesAPI = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load categories' };
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create category' };
    }
  },
  

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update category' };
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete category' };
    }
  },
};
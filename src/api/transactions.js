import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const transactionsAPI = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.BASE, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load transactions' };
    }
  },

  get: async (id) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load transaction' };
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TRANSACTIONS.BASE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save transaction' };
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update transaction' };
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete transaction' };
    }
  },
};
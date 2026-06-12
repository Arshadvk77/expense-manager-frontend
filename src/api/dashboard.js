import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const dashboardAPI = {
  summary: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load dashboard' };
    }
  },
};
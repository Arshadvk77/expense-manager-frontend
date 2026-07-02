import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const reportsAPI = {
  summary: async (period = 'year') => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.REPORTS.SUMMARY, { params: { period } });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to load reports' };
    }
  },
};
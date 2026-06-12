import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const contactAPI = {
  send: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACT.BASE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },
};
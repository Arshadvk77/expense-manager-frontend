import apiClient from './client';

export const transfersAPI = {
  list: async () => {
    try {
      const response = await apiClient.get('/transfers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load transfers' };
    }
  },
  create: async (payload) => {
    try {
      const response = await apiClient.post('/transfers', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to record transfer' };
    }
  },
  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/transfers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete transfer' };
    }
  },
};
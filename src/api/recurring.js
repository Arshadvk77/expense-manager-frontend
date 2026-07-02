import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const recurringAPI = {
  list:   async ()        => req(() => apiClient.get(API_ENDPOINTS.RECURRING.BASE)),
  create: async (payload) => req(() => apiClient.post(API_ENDPOINTS.RECURRING.BASE, payload)),
  update: async (id, p)   => req(() => apiClient.put(`${API_ENDPOINTS.RECURRING.BASE}/${id}`, p)),
  remove: async (id)      => req(() => apiClient.delete(`${API_ENDPOINTS.RECURRING.BASE}/${id}`)),
};

async function req(fn) {
  try {
    const response = await fn();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Request failed' };
  }
}
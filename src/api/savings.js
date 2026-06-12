import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const savingsAPI = {
  list:    async ()        => req(() => apiClient.get(API_ENDPOINTS.SAVINGS.BASE)),
  create:  async (payload) => req(() => apiClient.post(API_ENDPOINTS.SAVINGS.BASE, payload)),
  update:  async (id, p)   => req(() => apiClient.put(`${API_ENDPOINTS.SAVINGS.BASE}/${id}`, p)),
  remove:  async (id)      => req(() => apiClient.delete(`${API_ENDPOINTS.SAVINGS.BASE}/${id}`)),
  contribute: async (id, amount) => req(() => apiClient.post(`${API_ENDPOINTS.SAVINGS.BASE}/${id}/contribute`, { amount })),
};

async function req(fn) {
  try {
    const response = await fn();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Request failed' };
  }
}
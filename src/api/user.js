import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const userAPI = {
  updateProfile:     async (payload) => req(() => apiClient.put(API_ENDPOINTS.USER.PROFILE, payload)),
  changePassword:    async (payload) => req(() => apiClient.put(API_ENDPOINTS.USER.PASSWORD, payload)),
  updatePreferences: async (payload) => req(() => apiClient.patch(API_ENDPOINTS.USER.PREFERENCES, payload)),
  updateCurrencies:  async (payload) => req(() => apiClient.post(API_ENDPOINTS.USER.CURRENCIES, payload)),
  deleteAccount:     async (password) => req(() => apiClient.delete(API_ENDPOINTS.USER.DELETE, { data: { password } })),
};

async function req(fn) {
  try {
    const response = await fn();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Request failed' };
  }
}
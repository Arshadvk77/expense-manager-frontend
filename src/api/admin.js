import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const adminAPI = {
  contactMessages: async (params = {}) => req(() => apiClient.get(API_ENDPOINTS.ADMIN.CONTACT_MESSAGES, { params })),
  setHandled:      async (id, isHandled) => req(() => apiClient.patch(`${API_ENDPOINTS.ADMIN.CONTACT_MESSAGES}/${id}`, { is_handled: isHandled })),
  removeMessage:   async (id) => req(() => apiClient.delete(`${API_ENDPOINTS.ADMIN.CONTACT_MESSAGES}/${id}`)),
};

async function req(fn) {
  try {
    const response = await fn();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Request failed' };
  }
}
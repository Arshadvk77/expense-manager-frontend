import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const adminAPI = {
    contactMessages: async (params = {}) => req(() => apiClient.get(API_ENDPOINTS.ADMIN.CONTACT_MESSAGES, { params })),
    setHandled: async (id, isHandled) => req(() => apiClient.patch(`${API_ENDPOINTS.ADMIN.CONTACT_MESSAGES}/${id}`, { is_handled: isHandled })),
    removeMessage: async (id) => req(() => apiClient.delete(`${API_ENDPOINTS.ADMIN.CONTACT_MESSAGES}/${id}`)),
    stats: async () => req(() => apiClient.get(API_ENDPOINTS.ADMIN.STATS)),
    users: async (params) => req(() => apiClient.get(API_ENDPOINTS.ADMIN.USERS, { params })),
    user: async (id) => req(() => apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`)),
    setAdmin: async (id, isAdmin) => req(() => apiClient.patch(`${API_ENDPOINTS.ADMIN.USERS}/${id}/admin`, { is_admin: isAdmin })),
    removeUser: async (id) => req(() => apiClient.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`)),
};

async function req(fn) {
    try {
        const response = await fn();
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Request failed' };
    }
}
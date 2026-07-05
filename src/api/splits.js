import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const splitsAPI = {
  list: async () => req(() => apiClient.get(API_ENDPOINTS.SPLITS.BASE)),
  create: async (payload) => req(() => apiClient.post(API_ENDPOINTS.SPLITS.BASE, payload)),
  searchUsers: async (q) => req(() => apiClient.get(API_ENDPOINTS.SPLITS.SEARCH_USERS, { params: { q } })),
  settle: async (pid, v) => req(() => apiClient.patch(`${API_ENDPOINTS.SPLITS.BASE}/participants/${pid}/settle`, { is_settled: v })),
  remove: async (id) => req(() => apiClient.delete(`${API_ENDPOINTS.SPLITS.BASE}/${id}`)),
  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/splits/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update split' };
    }
  },
  byPerson: async () => {
    try {
      const response = await apiClient.get('/splits/by-person');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load people' };
    }
  },
  settlePerson: async (name, isSettled = true) => {
    try {
      const response = await apiClient.patch('/splits/settle-person', { name, is_settled: isSettled });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to settle' };
    }
  }

};

async function req(fn) {
  try { return (await fn()).data; }
  catch (err) { throw err.response?.data || { message: 'Request failed' }; }
}


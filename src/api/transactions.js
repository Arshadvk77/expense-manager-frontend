import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';


export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const transactionsAPI = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.BASE, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load transactions' };
    }
  },

  get: async (id) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load transaction' };
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TRANSACTIONS.BASE, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save transaction' };
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update transaction' };
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete transaction' };
    }
  },

// add inside the transactionsAPI object:
  exportFile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.EXPORT, { responseType: 'blob' });
    return response.data;
  },

  template: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.IMPORT_TEMPLATE, { responseType: 'blob' });
    return response.data;
  },

  importFile: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const response = await apiClient.post(API_ENDPOINTS.TRANSACTIONS.IMPORT, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Import failed' };
    }
  },
};


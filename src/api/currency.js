import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const currencyAPI = {
  list: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CURRENCY.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load currencies' };
    }
  },

  rates: async (base) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CURRENCY.RATES, { params: { base } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to load rates' };
    }
  },
};
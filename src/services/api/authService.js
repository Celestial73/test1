/**
 * Authentication API Service
 * Centralized API calls for authentication
 */

import axiosInstance from '../../api/axios.js';
import { getErrorMessage } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';

export const authService = {
  /**
   * Login with Telegram initData
   * @param {string} initData - Telegram initData string
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Authentication response
   */
  loginWithTelegram: async (initData, signal) => {
    try {
      const response = await axiosInstance.post(
        '/auth/login-telegram',
        {},
        {
          headers: {
            Authorization: `Bearer ${initData}`
          },
          signal
        }
      );

      if (response?.status === 200 || response?.status === 201) {
        return {
          initData,
          ...response.data
        };
      }

      throw new Error('Authentication failed');
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error; // Re-throw abort errors without logging
      }
      logger.error('Authentication error:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};


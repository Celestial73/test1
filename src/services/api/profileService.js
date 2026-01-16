/**
 * Profile API Service
 * Centralized API calls for user profiles
 */

import { axiosPrivate } from '../../api/axios.js';
import { getErrorMessage } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';

export const profileService = {
  /**
   * Get current user's profile
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Profile data
   */
  getMyProfile: async (signal) => {
    try {
      const response = await axiosPrivate.get('/profiles/me', { signal });
      logger.debug('Fetched profile data:', response.data);
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error; // Re-throw abort errors without logging
      }
      logger.error('Error fetching profile:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update current user's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (profileData) => {
    try {
      // Remove undefined fields
      const payload = { ...profileData };
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      logger.debug('Saving profile data:', payload);
      const response = await axiosPrivate.patch('/profiles/me', payload);
      logger.debug('Profile saved successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error saving profile:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};


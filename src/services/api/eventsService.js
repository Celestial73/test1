/**
 * Events API Service
 * Centralized API calls for events
 */

import { axiosPrivate } from '../../api/axios.js';
import { getErrorMessage } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';

/**
 * Transform API event to UI format
 * @param {Object} apiEvent - Event from API
 * @returns {Object} Transformed event for UI
 */
const transformEvent = (apiEvent) => {
  return {
    id: apiEvent.id || apiEvent._id,
    title: apiEvent.title,
    date: apiEvent.starts_at || '',
    time: '',
    location: apiEvent.location,
    description: apiEvent.description,
    attendees: apiEvent.participants || apiEvent.attendees || [],
    maxAttendees: apiEvent.capacity,
    image: apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photo_url || null,
    starts_at: apiEvent.starts_at,
    creator_profile: apiEvent.creator_profile,
  };
};

export const eventsService = {
  /**
   * Get user's events
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Array>} List of user's events
   */
  getMyEvents: async (signal) => {
    try {
      const response = await axiosPrivate.get('/events/me', { signal });
      const events = response.data.results || response.data || [];
      return events.map(transformEvent);
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error; // Re-throw abort errors without logging
      }
      logger.error('Error fetching events:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get event by ID
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Event data
   */
  getEvent: async (eventId, signal) => {
    try {
      const response = await axiosPrivate.get(`/events/${eventId}`, { signal });
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error; // Re-throw abort errors without logging
      }
      logger.error('Error fetching event:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  createEvent: async (eventData) => {
    try {
      const response = await axiosPrivate.post('/events/me', eventData);
      logger.debug('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update an event
   * @param {string|number} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await axiosPrivate.patch(`/events/${eventId}`, eventData);
      logger.debug('Event updated successfully:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete an event
   * @param {string|number} eventId - Event ID
   * @returns {Promise<void>}
   */
  deleteEvent: async (eventId) => {
    try {
      await axiosPrivate.delete(`/events/me/${eventId}`);
      logger.debug('Event deleted successfully');
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete a participant from an event
   * @param {string|number} eventId - Event ID
   * @param {string|number} participantId - Participant ID
   * @returns {Promise<void>}
   */
  deleteParticipant: async (eventId, participantId) => {
    try {
      await axiosPrivate.delete(`/events/me/${eventId}/participants/${participantId}`);
      logger.debug('Participant deleted successfully');
    } catch (error) {
      logger.error('Error deleting participant:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};


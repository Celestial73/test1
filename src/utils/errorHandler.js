/**
 * Centralized error handling utilities
 */

/**
 * Extracts error message from various error formats
 * @param {Error|Object} error - Error object or response
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Axios error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Axios error message
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Standard Error object
  if (error.message) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred';
};

/**
 * Checks if error is an authentication error (401)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Checks if error is a forbidden error (403)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isForbiddenError = (error) => {
  return error?.response?.status === 403;
};

/**
 * Checks if error is a network error
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error?.response && error?.request;
};

/**
 * Checks if error is a canceled request (AbortController cancellation)
 * Canceled requests are expected during navigation and should not be logged as errors
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isCanceledError = (error) => {
  if (!error) return false;
  
  // Axios canceled error codes (most reliable check)
  if (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') {
    return true;
  }
  
  // Error names
  if (error.name === 'AbortError' || error.name === 'CanceledError') {
    return true;
  }
  
  // Check if axios request was aborted (check signal before message)
  if (error.config?.signal?.aborted) {
    return true;
  }
  
  // Error message patterns (case-insensitive, partial match)
  const errorMessage = error.message?.toLowerCase() || '';
  if (errorMessage.includes('canceled') || 
      errorMessage.includes('cancelled') || 
      errorMessage.includes('aborted') ||
      errorMessage === 'canceled' ||
      errorMessage === 'cancelled') {
    return true;
  }
  
  // Check getErrorMessage result as fallback (in case error structure is transformed)
  const transformedMessage = getErrorMessage(error)?.toLowerCase() || '';
  if (transformedMessage.includes('canceled') || 
      transformedMessage.includes('cancelled') || 
      transformedMessage.includes('aborted')) {
    return true;
  }
  
  return false;
};


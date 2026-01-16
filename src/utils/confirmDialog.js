/**
 * Confirmation dialog utility
 * Provides a consistent way to show confirmation dialogs
 * In the future, this can be replaced with a proper UI component
 */

/**
 * Shows a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (optional)
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export const confirmAction = (message, title = 'Confirm') => {
  return new Promise((resolve) => {
    // For now, use browser confirm as fallback
    // TODO: Replace with proper Telegram UI dialog component
    const confirmed = window.confirm(title ? `${title}\n\n${message}` : message);
    resolve(confirmed);
  });
};


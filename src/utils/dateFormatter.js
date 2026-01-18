/**
 * Convert ISO datetime string to dd-mm-yyyy format
 * @param {string} isoString - ISO datetime string (e.g., "5555-02-14T21:00:00.000+00:00")
 * @returns {string} Date in dd-mm-yyyy format (e.g., "14-02-5555") or empty string if invalid
 */
export const formatDateToDDMMYYYY = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '';
  }
};


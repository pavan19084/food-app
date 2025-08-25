/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string} phone
 */

/**
 * Build a User object from API response.
 * @param {any} raw
 * @returns {User}
 */
export const mapUser = (raw) => ({
    id: Number(raw?.id),
    username: String(raw?.username ?? ''),
    email: String(raw?.email ?? ''),
    phone: String(raw?.phone ?? ''),
    avatar: String(raw?.avatar ?? ''),
  });
  
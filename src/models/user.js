/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string} phone
 * @property {string} gender
 * @property {string} profile
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
  gender: String(raw?.gender ?? ''),
  profile: String(raw?.profile ?? ''),
});

/**
 * Update existing user object with new data
 * @param {User} currentUser - Current user object
 * @param {any} updates - Updates from API response
 * @returns {User}
 */
export const updateUser = (currentUser, updates) => {
  const mapped = mapUser(updates?.user ?? updates);
  // Don't merge with old user, just use the new mapped data
  // But preserve fields not in the response
  return {
    id: mapped.id,
    username: mapped.username,
    email: mapped.email,
    phone: mapped.phone,
    gender: mapped.gender || currentUser.gender || '',
    profile: mapped.profile || currentUser.profile || '',
  };
};
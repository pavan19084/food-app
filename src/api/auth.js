import client from './client';

export const register = async ({ username, email, phone, password }) => {
  const { data } = await client.post('/auth/register', { username, email, phone, password });
  return data;
};

export const verifyOtp = async ({ email, otp }) => {
  const { data } = await client.post('/auth/verify-otp', { email, otp });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
};

export const verifyToken = async () => {
  const { data } = await client.get('/auth/verify-token'); // ideally returns { user } or { id, ... }
  return data;
};

export const logout = async () => {
  const { data } = await client.post('/auth/logout');
  return data;
};

export const sendOtp = async ({ email, reason = 'login' }) => {
  const { data } = await client.post('/auth/otp-send', { email, reason });
  return data;
};

export const changePassword = async ({ email, otp, newPassword }) => {
  const { data } = await client.post('/auth/change-password', { email, otp, newPassword });
  return data;
};

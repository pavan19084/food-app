import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Upload_URL = "http://31.97.56.234:3000";
export const BASE_URL = "http://31.97.56.234:3000/api";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach token (if present)
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler = token expired → force logout
let onUnauthorized = null;
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

client.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401 && typeof onUnauthorized === 'function') {
      await onUnauthorized(); // will clear storage + redirect
    }
    return Promise.reject(error);
  }
);

export default client;

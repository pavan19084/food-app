import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as apiLogin,
  register as apiRegister,
  verifyOtp as apiVerifyOtp,
  verifyToken as apiVerifyToken,
  logout as apiLogout,
  sendOtp,
  changePassword,
} from '../api/auth';
import { getUserById, patchUser } from '../api/user';
import { mapUser ,updateUser } from '../models/user';
import { setOnUnauthorized } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, onLoggedOut }) => {
  const [user, setUser] = useState(null);     // User | null
  const [token, setToken] = useState(null);   // string | null
  const [loading, setLoading] = useState(true);

  // Load from storage on boot, then verify token & hydrate latest user
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem('@auth_token'),
          AsyncStorage.getItem('@auth_user'),
        ]);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
          try {
            const vt = await apiVerifyToken(); 
            let verifiedUser = null;

            if (vt?.user) {
              verifiedUser = mapUser(vt.user);
            } else if (vt?.id || vt?.userId) {
              const uid = vt?.id ?? vt?.userId;
              const res = await getUserById(uid);
              verifiedUser = mapUser(res?.user ?? res);
            }

            if (verifiedUser) {
              setUser(verifiedUser);
              await AsyncStorage.setItem('@auth_user', JSON.stringify(verifiedUser));
            }
          } catch {
            await signOut(true);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 401 interceptor callback
  const signOut = async (silent = false) => {
    try { await apiLogout(); } catch (_) {}
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
    if (typeof onLoggedOut === 'function') onLoggedOut();
  };
  setOnUnauthorized(signOut);

  const signIn = async ({ email, password }) => {
    try {
      // Backend only returns token for verified users
      const data = await apiLogin({ email, password });
      if (!data?.token || !data?.user) {
        // If backend sends e.g. { msg: "Account not verified" }, bubble it up
        throw new Error(data?.msg || 'Invalid login response');
      }
      const mapped = mapUser(data.user);
      setUser(mapped);
      setToken(data.token);
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(mapped));
      return mapped;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      throw error;
    }
  };

  const signUp = async ({ username, email, phone, password }) => {
    // No token here (per your flow)
    const res = await apiRegister({ username, email, phone, password });
    return res;
  };

  const confirmOtp = async ({ email, otp }) => {
    // Just marks isVerified=1
    return apiVerifyOtp({ email, otp });
  };

  const saveProfile = async (payload) => {
    if (!user?.id) throw new Error('Missing user id');
    
    // Check if there's a profile change
    const hasProfileChange = payload.profile && !payload.profile.startsWith('http');
    
    let dataToSend;
    
    if (hasProfileChange) {
      // Use FormData for file upload
      dataToSend = new FormData();
      
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value === null || value === undefined || value === '') return;
        if (user[key] === value && key !== 'profile') return;
        
        if (key === 'profile') {
          const uri = value;
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          dataToSend.append('profile', { uri, name: filename, type });
        } else {
          dataToSend.append(key, String(value));
        }
      });
    } else {
      // Use JSON for text-only updates
      dataToSend = {};
      
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        // Skip profile if null or empty
        if (key === 'profile' && (!value || value === '')) return;
        if (value === null || value === undefined || value === '') return;
        if (user[key] === value) return;
        
        dataToSend[key] = value;
      });
    }
    const res = await patchUser(user.id, dataToSend);
    const updated = updateUser(user, res);
    setUser(updated);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(updated));
    return updated;
  };

  const sendForgotPasswordOtp = async ({ email }) => {
    return sendOtp({ email, reason: 'password_reset' });
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    return changePassword({ email, otp, newPassword });
  };

  const value = useMemo(
    () => ({ 
      user, 
      token, 
      loading, 
      signIn, 
      signOut, 
      signUp, 
      confirmOtp, 
      saveProfile,
      sendForgotPasswordOtp,
      resetPassword
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

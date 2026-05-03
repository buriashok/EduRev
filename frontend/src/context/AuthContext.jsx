/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getErrorMessage, userApi } from '../services/api';
import { getRoleHomePath } from '../utils/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingOtp, setPendingOtp] = useState(null);
  const navigate = useNavigate();

  const refreshUser = async () => {
    const response = await userApi.getMe();
    setUser(response.data);
    return response.data;
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { role, otpRequired, message } = response.data;

      if (otpRequired) {
        setPendingOtp({
          email: credentials.email,
          rememberMe: Boolean(credentials.rememberMe),
          role,
        });
        return { success: true, requiresOtp: true, message };
      }

      setPendingOtp(null);

      const currentUser = await refreshUser();
      navigate(getRoleHomePath(role || currentUser.role));

      return { success: true, user: currentUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Login failed') };
    }
  };

  const verifyOtp = async (otp) => {
    if (!pendingOtp?.email) {
      return { success: false, message: 'Your login session expired. Please sign in again.' };
    }

    try {
      const response = await authApi.verifyOtpLogin({
        email: pendingOtp.email,
        otp,
        rememberMe: pendingOtp.rememberMe,
      });
      const { role } = response.data;

      setPendingOtp(null);

      const currentUser = await refreshUser();
      navigate(getRoleHomePath(role || currentUser.role));
      return { success: true, user: currentUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'OTP verification failed') };
    }
  };

  const register = async (payload) => {
    try {
      const response = await authApi.register(payload);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Registration failed') };
    }
  };

  const updateUser = async (updates) => {
    const response = await userApi.updateProfile(updates);
    setUser(response.data);
    return response.data;
  };

  const assumeSession = async ({ role }) => {
    const currentUser = await refreshUser();
    navigate(getRoleHomePath(role || currentUser.role));
    return currentUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout request failures and clear local state anyway.
    } finally {
      setUser(null);
      setPendingOtp(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
        updateUser,
        assumeSession,
        pendingOtp,
        setPendingOtp,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

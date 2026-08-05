import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { signupRequest, loginRequest, sendOtpRequest, verifyOtpRequest } from '../api/auth.js';
import Toast from '../components/Toast.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('realyt_client_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(() => {
    try {
      const token = localStorage.getItem('realyt_client_token');
      return token ? { token } : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastNotice({ id: Date.now(), message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToastNotice(null);
  }, []);

  const saveAuthData = (userObj) => {
    if (userObj) {
      setUser(userObj);
      localStorage.setItem('realyt_client_user', JSON.stringify(userObj));
      if (userObj.token) {
        setSession({ token: userObj.token });
        localStorage.setItem('realyt_client_token', userObj.token);
      }
    }
  };

  const signup = async (email, password, extraData = {}) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const displayName = extraData.name || extraData.fullName || (extraData.firstName ? `${extraData.firstName} ${extraData.lastName}`.trim() : null);
      const data = await signupRequest(email, password, displayName);
      const createdUser = {
        email: data.email || email,
        name: displayName || data.name || email.split('@')[0],
        firstName: extraData.firstName || displayName || email.split('@')[0],
        role: data.role || 'CLIENT',
        token: data.token,
      };
      saveAuthData(createdUser);
      showToast('Account created successfully!', 'success');
      return { ...createdUser, created: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await loginRequest(email, password);
      const userObj = {
        email: data.email || email,
        name: data.name || email.split('@')[0],
        firstName: data.firstName || data.name || email.split('@')[0],
        role: data.role || 'CLIENT',
        token: data.token,
      };
      saveAuthData(userObj);
      showToast("You're logged in", 'success');
      return userObj;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await sendOtpRequest(email);
      return true;
    } catch (error) {
      setAuthError('Unable to send OTP. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email, code) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const payload = await verifyOtpRequest(email, code);
      const userObj = payload.user || { email, name: email.split('@')[0], token: payload.token };
      saveAuthData(userObj);
      showToast("You're logged in", 'success');
      return true;
    } catch (error) {
      setAuthError('Verification failed. Please check your code and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    setAuthError(null);
    localStorage.removeItem('realyt_client_user');
    localStorage.removeItem('realyt_client_token');
    showToast('Logged out', 'info');
  };

  const value = useMemo(() => ({
    user,
    setUser: saveAuthData,
    session,
    authError,
    isLoading,
    signup,
    login,
    loginWithEmail,
    verifyOtp,
    logout,
    showToast,
    isAuthenticated: Boolean(user),
  }), [user, session, authError, isLoading, showToast]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toastNotice && (
        <div className="realyt-toast-container">
          <Toast key={toastNotice.id} message={toastNotice.message} type={toastNotice.type} onClose={hideToast} />
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

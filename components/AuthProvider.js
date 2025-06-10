import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.log('Error loading token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

//logout
   const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
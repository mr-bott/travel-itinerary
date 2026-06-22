"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
        setUser(res.data);
      } catch (error) {
        console.error('Auth error', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    router.push('/trips');
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { name, email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    router.push('/trips');
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

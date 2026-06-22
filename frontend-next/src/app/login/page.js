"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-emerald-900 mb-8">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full p-3 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-900 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full p-3 rounded-xl"
              required
            />
          </div>

          <button type="submit" className="glass-button w-full py-3 rounded-xl font-bold text-lg">
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-emerald-800">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold hover:text-emerald-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

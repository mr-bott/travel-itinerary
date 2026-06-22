"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Calendar, Key, Shield } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, router]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
      setProfileData(res.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) return <div className="text-center p-12 text-emerald-800">Loading profile...</div>;

  if (!user || !profileData) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-8 rounded-3xl text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <UserIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">{profileData.name}</h2>
              <p className="text-emerald-600 font-medium">{profileData.email}</p>
            </div>
            
            <div className="pt-6 border-t border-emerald-500/20">
              <button onClick={logout} className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Account Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/50">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Full Name</p>
                  <p className="text-lg font-medium text-emerald-900">{profileData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/50">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Email Address</p>
                  <p className="text-lg font-medium text-emerald-900">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/50">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Key className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Password</p>
                  <p className="text-lg font-medium text-emerald-900">••••••••</p>
                </div>
                <button className="text-emerald-600 text-sm font-bold hover:text-emerald-800">Change</button>
              </div>

              {profileData.createdAt && (
                <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/50">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Member Since</p>
                    <p className="text-lg font-medium text-emerald-900">
                      {new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

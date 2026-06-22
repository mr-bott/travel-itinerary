"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Map, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 w-full mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Map className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="font-bold text-xl text-emerald-900 hidden sm:block">
                AI Travel Planner
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/trips" className="text-emerald-800 hover:text-emerald-600 font-medium flex items-center gap-2">
                  <Map className="w-4 h-4 hidden sm:block" />
                  <span>My Trips</span>
                </Link>
                <Link href="/profile" className="text-emerald-800 hover:text-emerald-600 font-medium flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-emerald-800 hover:text-emerald-600 font-medium">
                  Login
                </Link>
                <Link href="/register" className="glass-button px-4 py-2 rounded-lg font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

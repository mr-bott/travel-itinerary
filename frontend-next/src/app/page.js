"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, Wallet, Compass, Loader2, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'Medium',
    interests: [],
    travelPace: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interestOptions = [
    'Food & Culinary', 'Culture & Art', 'Adventure', 'Shopping',
    'Nature & Outdoors', 'Nightlife', 'Relaxation', 'History'
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/generate`, formData);
      router.push(`/itinerary/${response.data.itinerary._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-[100vw] relative left-1/2 -translate-x-1/2 min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 overflow-hidden -mt-8">

      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">

        {/* Left Side: Hero Content */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-emerald-800 text-sm font-bold backdrop-blur-sm shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI-Powered Travel Agent</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-emerald-950 tracking-tight leading-[1.1]">
            Stop planning. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              Start packing.
            </span>
          </h1>

          <p className="text-xl text-emerald-700/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            Tell us where you want to go. Our smart AI crafts a hyper-personalized, minute-by-minute itinerary, complete with budget estimates and hotel recommendations.
          </p>

          {/* Floating UI Elements (Decorative) */}
          <div className="hidden lg:flex flex-col gap-4 pt-8">
            <div className="glass p-4 rounded-2xl flex items-center gap-4 w-[80%] transform -rotate-2 hover:rotate-0 transition-all duration-300 shadow-xl border border-white/40">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-inner">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 text-sm">Tokyo, Japan</p>
                <p className="text-xs text-emerald-700">7 Days • Medium Budget</p>
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex items-center gap-4 w-[80%] ml-auto transform rotate-2 hover:rotate-0 transition-all duration-300 shadow-xl border border-white/40">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-inner">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 text-sm">Paris, France</p>
                <p className="text-xs text-emerald-700">14 Days • Luxury Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Glass Card */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="glass p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/60 relative overflow-hidden backdrop-blur-xl bg-white/40">

            {/* Subtle top glare effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />

            {error && (
              <div className="bg-red-50/90 backdrop-blur border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Destination Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  <Plane className="w-4 h-4 text-emerald-600" />
                  Where to?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kyoto, Santorini, New York..."
                  className="w-full p-4 rounded-xl bg-white/60 border border-emerald-100 text-lg shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none text-emerald-900 placeholder:text-emerald-300 font-medium"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none text-emerald-900 font-medium"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none text-emerald-900 font-medium"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Preferences Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    Budget
                  </label>
                  <select
                    className="w-full p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none text-emerald-900 font-medium appearance-none cursor-pointer"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="Low">Low - Budget friendly</option>
                    <option value="Medium">Medium - Standard comfort</option>
                    <option value="High">High - Luxury</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    Pace
                  </label>
                  <select
                    className="w-full p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none text-emerald-900 font-medium appearance-none cursor-pointer"
                    value={formData.travelPace}
                    onChange={(e) => setFormData({ ...formData, travelPace: e.target.value })}
                  >
                    <option value="Slow">Relaxed - Take it easy</option>
                    <option value="Medium">Medium - Balanced</option>
                    <option value="Fast">Fast - See everything</option>
                  </select>
                </div>
              </div>

              {/* Interests Toggles */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-bold text-emerald-950 uppercase tracking-wider block">What are you interested in?</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${formData.interests.includes(interest)
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/30 transform scale-105'
                          : 'bg-white/50 border-emerald-200 text-emerald-700 hover:bg-white hover:border-emerald-400 hover:shadow-md'
                        }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center gap-3 py-5 rounded-2xl font-bold text-xl text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-500 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.7)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.8)] border-0 disabled:opacity-70 overflow-hidden"
                >
                  {/* Button Glare Effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6" />
                      <span>Crafting Your Journey...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate My Itinerary</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>

          <div className="mt-6 text-center lg:text-left pl-4">
            <p className="text-sm font-medium text-emerald-600 flex items-center justify-center lg:justify-start gap-2">
              <Sparkles className="w-4 h-4" /> 100% Free AI Travel Planner
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

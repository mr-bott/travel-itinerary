"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, Wallet, Compass, Loader2, Sparkles } from 'lucide-react';

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
    'Food', 'Culture', 'Adventure', 'Shopping', 
    'Nature', 'Nightlife', 'Relaxation', 'History'
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
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 pt-12 pb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-emerald-900 tracking-tight">
          Your Next Adventure, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
            AI-Crafted.
          </span>
        </h1>
        <p className="text-xl text-emerald-700 max-w-2xl mx-auto leading-relaxed">
          Tell us where you want to go, and our smart travel agent will create a personalized day-by-day itinerary with budget estimates and hotel recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 md:p-10 rounded-3xl space-y-8">
        {error && (
          <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <Plane className="w-4 h-4 text-emerald-600" />
              Destination
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Tokyo, Japan"
              className="glass-input w-full p-4 rounded-xl text-lg"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Start Date
              </label>
              <input
                type="date"
                required
                className="glass-input w-full p-4 rounded-xl"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                End Date
              </label>
              <input
                type="date"
                required
                className="glass-input w-full p-4 rounded-xl"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <Wallet className="w-4 h-4 text-emerald-600" />
              Budget Preference
            </label>
            <select
              className="glass-input w-full p-4 rounded-xl"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            >
              <option value="Low">Low - Budget friendly</option>
              <option value="Medium">Medium - Standard comfort</option>
              <option value="High">High - Luxury</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <Compass className="w-4 h-4 text-emerald-600" />
              Travel Pace
            </label>
            <select
              className="glass-input w-full p-4 rounded-xl"
              value={formData.travelPace}
              onChange={(e) => setFormData({...formData, travelPace: e.target.value})}
            >
              <option value="Slow">Relaxed - Take it easy</option>
              <option value="Medium">Medium - Balanced</option>
              <option value="Fast">Fast - See everything</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-emerald-900">What are you interested in?</label>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.interests.includes(interest)
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'glass-input text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="glass-button w-full py-4 rounded-xl font-bold text-xl flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" />
                Crafting Your Journey...
              </>
            ) : (
              <>Generate My Itinerary <Sparkles className="w-5 h-5 inline" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

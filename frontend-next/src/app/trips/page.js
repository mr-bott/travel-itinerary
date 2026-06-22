"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Calendar, MapPin, Plus, Trash2 } from 'lucide-react';

export default function Trips() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [itineraries, setItineraries] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchItineraries();
    }
  }, [user, loading, router]);

  const fetchItineraries = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/user/${user.userId}`);
      setItineraries(res.data.itineraries || []);
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteTrip = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}`);
      setItineraries(itineraries.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
  };

  if (loading || fetching) return <div className="text-center p-12 text-emerald-800">Loading...</div>;

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-3xl font-bold text-emerald-900 truncate">My Travel Plans</h1>
        <Link href="/" className="glass-button px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Plan New Trip
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center space-y-4">
          <h3 className="text-xl font-bold text-emerald-800">You haven't planned any trips yet!</h3>
          <p className="text-emerald-700">Start exploring the world with AI generated itineraries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Link key={itinerary._id} href={`/itinerary/${itinerary._id}`}>
              <div className="glass hover:glass-green transition-all p-6 rounded-3xl h-full flex flex-col justify-between group cursor-pointer relative">
                <button 
                  onClick={(e) => handleDeleteTrip(e, itinerary._id)}
                  className="absolute top-4 right-4 p-2 bg-red-100/50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/50 rounded-2xl group-hover:bg-white/80 transition-colors">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">{itinerary.destination}</h3>
                  <div className="flex items-center gap-2 text-emerald-700 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {itinerary.budgetEstimation?.total && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 text-emerald-800 font-semibold text-sm">
                    Est. Cost: {itinerary.budgetEstimation.total}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Calendar, Clock, Download, Trash2, Plus, RefreshCw, Luggage, Pencil, Sparkles, Check, Star, Bed, Wallet } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ItineraryView() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for regenerating
  const [regenDayIdx, setRegenDayIdx] = useState(null);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [generatingList, setGeneratingList] = useState(false);

  // States for activity editing
  const [editingActivity, setEditingActivity] = useState(null); // { dayIndex, actIndex }
  const [editActivityData, setEditActivityData] = useState({ name: '', time: '', description: '' });

  const [editingDayIdx, setEditingDayIdx] = useState(null);
  const [editDayData, setEditDayData] = useState({ day: '', title: '', activities: [] });

  const [aiEditingActivity, setAiEditingActivity] = useState(null); // { dayIndex, actIndex }
  const [aiActivityInstructions, setAiActivityInstructions] = useState('');

  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    if (itinerary?.hotels?.length > 0 && !selectedHotel) {
      setSelectedHotel(itinerary.hotels[0]);
    }
  }, [itinerary]);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}`);
        setItinerary(res.data.itinerary);
      } catch (err) {
        setError('Failed to load itinerary. It may not exist or you do not have permission.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchItinerary();
  }, [id, user]);

  if (!user) {
    if (!loading) router.push('/login');
    return null;
  }

  if (loading) return <div className="text-center p-12 text-emerald-800">Loading your adventure...</div>;
  if (error) return <div className="text-center p-12 text-red-600 font-bold">{error}</div>;

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/itinerary/export-pdf`,
        { itineraryId: id },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `itinerary-${itinerary.destination}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const handleRemoveActivity = async (dayIndex, actIndex) => {
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/activity/${dayIndex}/${actIndex}`);
      setItinerary(res.data.itinerary);
    } catch (err) {
      alert('Failed to remove activity');
    }
  };

  const handleRegenerateDay = async (dayIndex) => {
    if (!regenInstructions) return alert('Provide instructions first!');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/regenerate-day`, {
        dayIndex,
        instructions: regenInstructions
      });
      setItinerary(res.data.itinerary);
      setRegenDayIdx(null);
      setRegenInstructions('');
    } catch (err) {
      alert('Failed to regenerate day');
    }
  };

  const handleStartEditActivity = (dayIndex, actIndex, activity) => {
    setEditingActivity({ dayIndex, actIndex });
    setEditActivityData({ ...activity });
    setAiEditingActivity(null);
  };

  const handleOpenRegenerateDay = (dayIndex, day) => {
    setRegenDayIdx(dayIndex);
    let content = `Day ${day.day}: ${day.title}\n\n`;
    if (day.activities && day.activities.length > 0) {
      day.activities.forEach(act => {
        content += `[${act.time}] ${act.name}\n${act.description}\n\n`;
      });
    }
    setRegenInstructions(content.trim());
  };

  const handleStartEditDay = (dayIndex, day) => {
    setEditingDayIdx(dayIndex);
    setEditDayData({
      day: day.day || '',
      title: day.title || '',
      activities: JSON.parse(JSON.stringify(day.activities || []))
    });
  };

  const handleSaveEditDay = async () => {
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/day/${editingDayIdx}`, {
        dayData: editDayData
      });
      setItinerary(res.data.itinerary);
      setEditingDayIdx(null);
    } catch (err) {
      alert('Failed to update day');
    }
  };

  const handleSaveEditActivity = async () => {
    try {
      const { dayIndex, actIndex } = editingActivity;
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/activity/${dayIndex}/${actIndex}`, {
        activity: editActivityData
      });
      setItinerary(res.data.itinerary);
      setEditingActivity(null);
    } catch (err) {
      alert('Failed to update activity');
    }
  };

  const handleAiEditActivity = async () => {
    if (!aiActivityInstructions) return alert('Provide instructions first!');
    try {
      const { dayIndex, actIndex } = aiEditingActivity;
      const act = itinerary.itineraryData.days[dayIndex].activities[actIndex];
      const instructions = `For the activity '${act.name}' at ${act.time}, the user requests: ${aiActivityInstructions}. Please update the day accordingly.`;

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/regenerate-day`, {
        dayIndex,
        instructions
      });
      setItinerary(res.data.itinerary);
      setAiEditingActivity(null);
      setAiActivityInstructions('');
    } catch (err) {
      alert('Failed to regenerate day');
    }
  };

  const handleGeneratePackingList = async () => {
    setGeneratingList(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/itinerary/${id}/packing-list`);
      setItinerary(res.data.itinerary);
    } catch (err) {
      alert('Failed to generate packing list');
    } finally {
      setGeneratingList(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="glass p-8 md:p-12 rounded-[2rem] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">{itinerary.destination}</h1>
        <div className="flex flex-wrap justify-center items-center gap-6 text-emerald-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="mt-8 glass-button inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: AI Budget & Hotels */}
        <div className="space-y-8 lg:col-span-1">
          {/* Budget */}
          {itinerary.budgetEstimation && itinerary.budgetEstimation.total && (
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" /> Estimated Budget
              </h3>
              <div className="space-y-3 text-sm text-emerald-800">
                <div className="flex justify-between"><span>Flights:</span> <span className="font-bold">{itinerary.budgetEstimation.flights}</span></div>
                <div className="flex justify-between"><span>Accommodation:</span> <span className="font-bold">{itinerary.budgetEstimation.accommodation}</span></div>
                <div className="flex justify-between"><span>Food:</span> <span className="font-bold">{itinerary.budgetEstimation.food}</span></div>
                <div className="flex justify-between"><span>Activities:</span> <span className="font-bold">{itinerary.budgetEstimation.activities}</span></div>
                <div className="pt-3 mt-3 border-t border-emerald-500/20 flex justify-between text-base">
                  <span className="font-bold">Total:</span> <span className="font-black text-emerald-600">{itinerary.budgetEstimation.total}</span>
                </div>
              </div>
            </div>
          )}

          {selectedHotel && (
            <div className="glass p-0 rounded-3xl overflow-hidden">
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedHotel.imageUrl && selectedHotel.imageUrl.startsWith('http') ? selectedHotel.imageUrl : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'})` }}
              >
                <div className="w-full h-full bg-gradient-to-t from-emerald-900/80 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white mb-0">
                    {selectedHotel.name}
                  </h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">{selectedHotel.budgetLevel}</span>
                  {selectedHotel.rating && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      {selectedHotel.rating.replace('/5', '').trim()}
                      <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                    </span>
                  )}
                </div>

                {selectedHotel.location && (
                  <div className="flex items-start gap-2 text-sm text-emerald-700">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                    <span>{selectedHotel.location}</span>
                  </div>
                )}

                <p className="text-sm text-emerald-800 leading-relaxed">
                  {selectedHotel.description}
                </p>

                {selectedHotel.price && (
                  <div className="pt-4 border-t border-emerald-500/20 flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-900">Estimated Price</span>
                    <span className="text-lg font-black text-emerald-600">{selectedHotel.price}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hotels moved to inline activity */}
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-emerald-600" /> AI Packing List
            </h3>

            {(!itinerary.packingList || itinerary.packingList.length === 0) ? (
              <div className="text-center">
                <p className="text-sm text-emerald-700 mb-4">No packing list generated yet.</p>
                <button
                  onClick={handleGeneratePackingList}
                  disabled={generatingList}
                  className="glass-button w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border-0 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {generatingList ? 'Generating...' : (
                    <>
                      Generate Packing List <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.packingList.map((cat, i) => (
                  <div key={i}>
                    <h5 className="font-bold text-emerald-800 text-sm mb-1">{cat.category}</h5>
                    <ul className="list-disc pl-5 text-xs text-emerald-700 space-y-1">
                      {cat.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Days & Activities */}
        <div className="lg:col-span-2 space-y-8">
          {itinerary.itineraryData?.days?.map((day, dayIndex) => (
            <div key={dayIndex} className="glass p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl">
              <div className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 mb-4 sm:mb-6 group relative">
                {editingDayIdx === dayIndex ? (
                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-emerald-900">Day</span>
                      <input
                        className="glass-input w-20 p-2 rounded-lg text-xl font-bold text-emerald-900 border border-emerald-500/30 bg-white/50 focus:bg-white/80"
                        value={editDayData.day}
                        onChange={(e) => setEditDayData({ ...editDayData, day: e.target.value })}
                        placeholder="#"
                      />
                      <input
                        className="glass-input flex-grow p-2 rounded-lg text-xl font-medium text-emerald-700 border border-emerald-500/30 bg-white/50 focus:bg-white/80"
                        value={editDayData.title}
                        onChange={(e) => setEditDayData({ ...editDayData, title: e.target.value })}
                        placeholder="Day Title"
                      />
                    </div>

                    {/* Activities Inputs */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wider">Activities</h4>
                      {editDayData.activities.map((act, actIdx) => (
                        <div key={actIdx} className="flex flex-col gap-3 p-4 bg-white/40 rounded-xl border border-emerald-500/20 relative group/act">
                          <button
                            className="absolute top-2 right-2 text-red-500 md:opacity-0 group-hover/act:opacity-100 p-1 transition-opacity"
                            onClick={() => {
                              const newActivities = [...editDayData.activities];
                              newActivities.splice(actIdx, 1);
                              setEditDayData({ ...editDayData, activities: newActivities });
                            }}
                            title="Remove activity"
                          ><Trash2 className="w-4 h-4" /></button>
                          <div className="flex flex-col sm:flex-row gap-4 pr-6 sm:pr-8">
                            <input
                              className="glass-input sm:w-24 p-2 rounded-lg text-sm font-bold text-emerald-900 bg-white/50 border border-emerald-500/30"
                              value={act.time}
                              onChange={(e) => {
                                const newActivities = [...editDayData.activities];
                                newActivities[actIdx].time = e.target.value;
                                setEditDayData({ ...editDayData, activities: newActivities });
                              }}
                              placeholder="Time"
                            />
                            <input
                              className="glass-input flex-grow p-2 rounded-lg font-bold text-emerald-900 bg-white/50 border border-emerald-500/30"
                              value={act.name}
                              onChange={(e) => {
                                const newActivities = [...editDayData.activities];
                                newActivities[actIdx].name = e.target.value;
                                setEditDayData({ ...editDayData, activities: newActivities });
                              }}
                              placeholder="Activity Name"
                            />
                          </div>
                          <textarea
                            className="glass-input w-full p-3 rounded-lg text-sm text-emerald-800 h-20 resize-y bg-white/50 border border-emerald-500/30"
                            value={act.description}
                            onChange={(e) => {
                              const newActivities = [...editDayData.activities];
                              newActivities[actIdx].description = e.target.value;
                              setEditDayData({ ...editDayData, activities: newActivities });
                            }}
                            placeholder="Activity Description"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setEditDayData({
                            ...editDayData,
                            activities: [...editDayData.activities, { time: '', name: '', description: '' }]
                          });
                        }}
                        className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg w-max transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Activity
                      </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-emerald-500/20">
                      <button onClick={() => setEditingDayIdx(null)} className="px-4 py-2 text-emerald-700 font-medium text-sm hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
                      <button onClick={handleSaveEditDay} className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" /> Save Entire Day
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">Day {day.day}</h2>
                        <p className="text-emerald-700 text-sm sm:text-base font-medium">{day.title}</p>
                      </div>
                      <button
                        onClick={() => handleStartEditDay(dayIndex, day)}
                        className="md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                        title="Edit day manually"
                      >
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenRegenerateDay(dayIndex, day)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Regenerate Day
                    </button>
                  </>
                )}
              </div>

              {editingDayIdx !== dayIndex && regenDayIdx === dayIndex && (
                <div className="mb-6 p-4 bg-white/50 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-900">Edit the plan below and the AI will regenerate the day</span>
                  </div>
                  <textarea
                    className="glass-input w-full p-3 rounded-lg mb-3 h-64 resize-y text-sm font-medium text-emerald-800 border border-emerald-500/30 bg-white/70 focus:bg-white/90 leading-relaxed"
                    value={regenInstructions}
                    onChange={(e) => setRegenInstructions(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleRegenerateDay(dayIndex)} className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Regenerate
                    </button>
                    <button onClick={() => {
                      setRegenDayIdx(null);
                      setRegenInstructions('');
                    }} className="px-4 py-2 text-emerald-700 font-medium hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              {editingDayIdx !== dayIndex && (
                <div className="space-y-3 sm:space-y-4">
                  {day.activities?.map((activity, actIndex) => {
                    const isEditing = editingActivity?.dayIndex === dayIndex && editingActivity?.actIndex === actIndex;
                    const isAiEditing = aiEditingActivity?.dayIndex === dayIndex && aiEditingActivity?.actIndex === actIndex;

                    const renderActionButtons = (extraClass) => (
                      <div className={`md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${extraClass}`}>
                        <button
                          onClick={() => handleStartEditActivity(dayIndex, actIndex, activity)}
                          className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Edit manually"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAiEditingActivity({ dayIndex, actIndex });
                            setAiActivityInstructions('');
                            setEditingActivity(null);
                          }}
                          className="p-1.5 sm:p-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                          title="Edit with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove activity"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    );

                    return (
                      <div key={actIndex} className="bg-white/40 hover:bg-white/60 transition-colors p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/50 flex flex-col gap-2 sm:gap-4 group relative">
                        {isEditing ? (
                          <div className="flex flex-col gap-3 w-full">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <input
                                className="glass-input sm:w-24 p-2 rounded-lg text-sm font-bold text-emerald-900 border border-emerald-500/30 bg-white/50 focus:bg-white/80"
                                value={editActivityData.time}
                                onChange={(e) => setEditActivityData({ ...editActivityData, time: e.target.value })}
                                placeholder="Time"
                              />
                              <input
                                className="glass-input flex-grow p-2 rounded-lg font-bold text-emerald-900 border border-emerald-500/30 bg-white/50 focus:bg-white/80"
                                value={editActivityData.name}
                                onChange={(e) => setEditActivityData({ ...editActivityData, name: e.target.value })}
                                placeholder="Activity Name"
                              />
                            </div>
                            <textarea
                              className="glass-input w-full p-3 rounded-lg text-sm text-emerald-800 h-24 resize-none border border-emerald-500/30 bg-white/50 focus:bg-white/80"
                              value={editActivityData.description}
                              onChange={(e) => setEditActivityData({ ...editActivityData, description: e.target.value })}
                              placeholder="Activity Description"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingActivity(null)} className="px-4 py-2 text-emerald-700 font-medium text-sm hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
                              <button onClick={handleSaveEditActivity} className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Check className="w-4 h-4" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                              <div className="flex justify-between items-start sm:w-16 sm:flex-shrink-0">
                                <div className="text-emerald-600 font-bold text-xs sm:text-sm sm:pt-1">
                                  {activity.time}
                                </div>
                                {/* Mobile actions */}
                                {renderActionButtons('sm:hidden')}
                              </div>

                              <div className="flex-grow">
                                <h4 className="font-bold text-emerald-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{activity.name}</h4>
                                <p className="text-emerald-700 text-xs sm:text-sm leading-relaxed">{activity.description}</p>
                              </div>

                              {/* Desktop actions */}
                              {renderActionButtons('hidden sm:flex self-start')}
                            </div>

                            {/* AI Edit Mode Input */}
                            {isAiEditing && (
                              <div className="mt-2 p-4 bg-teal-50/50 rounded-xl border border-teal-500/30">
                                <h5 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Sparkles className="w-3 h-3" /> AI Activity Edit
                                </h5>
                                <input
                                  type="text"
                                  placeholder="E.g., Change this to a cheaper option"
                                  className="glass-input w-full p-3 rounded-lg mb-3 text-sm border border-teal-500/30 bg-white/50 focus:bg-white/80"
                                  value={aiActivityInstructions}
                                  onChange={(e) => setAiActivityInstructions(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <button onClick={handleAiEditActivity} className="glass-button bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all border-0">Regenerate</button>
                                  <button onClick={() => setAiEditingActivity(null)} className="px-4 py-2 text-emerald-700 font-medium text-sm hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Inline Hotel Suggestions on First Day First Activity */}
                            {dayIndex === 0 && actIndex === 0 && itinerary.hotels && itinerary.hotels.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-emerald-500/20">
                                <h5 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-sm">
                                  <Bed className="w-4 h-4 text-emerald-600" /> Recommended Hotels for this trip
                                </h5>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                                  {itinerary.hotels.map((hotel, hIdx) => {
                                    const isSelected = selectedHotel?.name === hotel.name;
                                    return (
                                      <div
                                        key={hIdx}
                                        onClick={() => setSelectedHotel(hotel)}
                                        className={`w-40 sm:w-48 flex-shrink-0 p-3 rounded-2xl snap-center border cursor-pointer transition-all ${isSelected
                                            ? 'bg-emerald-100 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                            : 'bg-emerald-50/50 border-emerald-500/20 hover:bg-emerald-50 hover:border-emerald-300'
                                          } flex flex-col justify-between`}
                                      >
                                        <div className="mb-2">
                                          <h6 className="font-bold text-emerald-900 line-clamp-2 text-sm leading-tight mb-1" title={hotel.name}>{hotel.name}</h6>
                                          {hotel.rating && (
                                            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                              {hotel.rating.replace('/5', '').trim()}
                                              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="pt-2 border-t border-emerald-500/10">
                                          {hotel.price ? (
                                            <div className="font-black text-emerald-600 text-sm">{hotel.price}</div>
                                          ) : (
                                            <div className="text-xs font-bold text-emerald-800 bg-white/60 px-2 py-1 rounded-md inline-block">{hotel.budgetLevel}</div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {/* Adding an activity manually can be implemented similarly, omitted for brevity but UI is ready */}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

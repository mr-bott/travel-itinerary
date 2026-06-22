import Itinerary from '../models/Itinerary.js';
import User from '../models/User.js';
import { generateItinerary, regenerateDayPrompt, generatePackingListPrompt } from '../services/aiService.js';
import { generatePDF } from '../services/pdfService.js';
import mongoose from 'mongoose';

export const createItinerary = async (req, res) => {
  try {
    const { destination, startDate, endDate, preferences } = req.body;
    const userId = req.user.userId; // Provided by authMiddleware

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination, startDate, endDate' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }
    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date.' });
    }

    // Generate itinerary using Groq/Gemini (outputs structured JSON with budget and hotels)
    const itineraryDataResponse = await generateItinerary(
      destination,
      startDate,
      endDate,
      preferences || {}
    );

    // Parse the extended response. The AI should return { itineraryData, budgetEstimation, hotels }
    // If it only returns days, we map it accordingly.
    const itineraryData = itineraryDataResponse.itineraryData || { destination, days: itineraryDataResponse.days };
    const budgetEstimation = itineraryDataResponse.budgetEstimation || {};
    const hotels = itineraryDataResponse.hotels || [];

    const itinerary = await Itinerary.create({
      userId,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      preferences: preferences || {},
      itineraryData,
      budgetEstimation,
      hotels,
      packingList: []
    });

    res.status(201).json({ success: true, itinerary });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ error: 'Failed to create itinerary', message: error.message });
  }
};

export const getItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Enforce authorization
    if (itinerary.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this itinerary' });
    }

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
};

export const getUserItineraries = async (req, res) => {
  try {
    // Force using the logged-in user's ID
    const userId = req.user.userId;
    const itineraries = await Itinerary.find({ userId })
      .sort({ createdAt: -1 })
      .select('-itineraryData.days.activities.location');

    res.json({ success: true, itineraries });
  } catch (error) {
    console.error('Error fetching user itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
};

export const exportPDF = async (req, res) => {
  try {
    const { itineraryId } = req.body;
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Itinerary not found or unauthorized' });
    }

    const pdfBuffer = await generatePDF(itinerary);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="itinerary-${itinerary.destination}-${itinerary._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// CRUD for editing activities
export const addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayIndex, activity } = req.body;
    
    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    itinerary.itineraryData.days[dayIndex].activities.push(activity);
    await itinerary.save();
    
    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

export const removeActivity = async (req, res) => {
  try {
    const { id, dayIndex, activityIndex } = req.params;
    
    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    itinerary.itineraryData.days[dayIndex].activities.splice(activityIndex, 1);
    await itinerary.save();
    
    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove activity' });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id, dayIndex, activityIndex } = req.params;
    const { activity } = req.body;
    
    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    itinerary.itineraryData.days[dayIndex].activities[activityIndex] = activity;
    await itinerary.save();
    
    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

export const updateDay = async (req, res) => {
  try {
    const { id, dayIndex } = req.params;
    const { dayData } = req.body;
    
    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    // Update title, day number, and activities
    itinerary.itineraryData.days[dayIndex] = {
      ...itinerary.itineraryData.days[dayIndex],
      day: dayData.day,
      title: dayData.title,
      activities: dayData.activities || itinerary.itineraryData.days[dayIndex].activities
    };
    
    await itinerary.save();
    
    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update day' });
  }
};

export const regenerateDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayIndex, instructions } = req.body;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    const targetDay = itinerary.itineraryData.days[dayIndex];
    const newDayData = await regenerateDayPrompt(itinerary.destination, targetDay, instructions);
    
    itinerary.itineraryData.days[dayIndex] = newDayData;
    await itinerary.save();

    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate day' });
  }
};

export const generatePackingList = async (req, res) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findById(id);
    if (!itinerary || itinerary.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Not found or unauthorized' });
    }

    const duration = Math.ceil((new Date(itinerary.endDate) - new Date(itinerary.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const packingList = await generatePackingListPrompt(itinerary.destination, duration, itinerary.preferences);
    
    itinerary.packingList = packingList;
    await itinerary.save();

    res.json({ success: true, itinerary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate packing list' });
  }
};

export const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const itinerary = await Itinerary.findOne({ _id: id, userId: userId });
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found or unauthorized' });
    }

    await Itinerary.findByIdAndDelete(id);

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

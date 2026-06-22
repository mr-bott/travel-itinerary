import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  rating: String,
  price: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  }
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  activities: [activitySchema]
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  preferences: {
    budget: String,
    interests: [String],
    travelPace: String
  },
  itineraryData: {
    destination: String,
    days: [daySchema]
  },
  budgetEstimation: {
    flights: String,
    accommodation: String,
    food: String,
    activities: String,
    total: String
  },
  hotels: [{
    name: String,
    budgetLevel: String,
    price: String,
    rating: String,
    location: String,
    imageUrl: String,
    description: String
  }],
  packingList: [{
    category: String,
    items: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Itinerary', itinerarySchema);



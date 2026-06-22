import Groq from "groq-sdk";
import axios from 'axios';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not set in environment variables!");
}

const fetchWikipediaImage = async (query) => {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=1`;
    const searchRes = await axios.get(searchUrl, { headers: { 'User-Agent': 'TravelItineraryApp/1.0' } });

    if (searchRes.data?.query?.search?.length > 0) {
      const title = searchRes.data.query.search[0].title;

      const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
      const imgRes = await axios.get(imgUrl, { headers: { 'User-Agent': 'TravelItineraryApp/1.0' } });

      const pages = imgRes.data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pages[pageId].thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }
  } catch (err) {
    console.error("Wikipedia API error:", err.message);
  }
  return null;
};

const fetchPlaceImageFallback = async (query) => {
  // 1. Try Wikipedia first (highly accurate for landmarks)
  const wikiImage = await fetchWikipediaImage(query);
  if (wikiImage) return wikiImage;

  // 2. Fallback to dynamic Flickr image
  const safeQuery = query.replace(/[^a-zA-Z0-9]/g, ',');
  return `https://loremflickr.com/800/600/${safeQuery}/all`;
};

const callGroq = async (prompt) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const text = response.choices[0].message.content;

    // Extract JSON from the response
    let cleanedText = text.trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse JSON. Raw response from Groq:", text);
      throw parseError;
    }
  } catch (error) {
    console.error("Groq error:", error.message);
    throw error;
  }
};

export const generateItinerary = async (destination, startDate, endDate, preferences = {}) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `
Generate a comprehensive travel itinerary.
Return ONLY valid JSON. No markdown.

Destination: ${destination}
Dates: ${startDate} to ${endDate} (${days} days)
Budget: ${preferences.budget || "Not specified"}
Interests: ${preferences.interests?.join(", ") || "General"}

CRITICAL: You MUST suggest exactly 5 real hotel options for the destination in the "hotels" array (ranging from Budget to Luxury). Do NOT leave the hotels array empty.

JSON FORMAT:
{
  "itineraryData": {
    "destination": "${destination}",
    "days": [
      {
        "day": 1,
        "title": "Day 1 title",
        "activities": [
          {
            "name": "Activity name",
            "time": "09:00 AM",
            "description": "Details",
            "imageUrl": "Provide a realistic photo URL if possible, else empty string",
            "rating": "4.8/5",
            "price": "Entry fee or $XX",
            "location": "Address or Neighborhood"
          }
        ]
      }
    ]
  },
  "budgetEstimation": {
    "flights": "$XXX",
    "accommodation": "$XXX",
    "food": "$XXX",
    "activities": "$XXX",
    "total": "$XXX"
  },
  "hotels": [
    {
      "name": "Hotel Name",
      "budgetLevel": "Budget/Mid Range/Luxury",
      "price": "$XXX/night",
      "rating": "4.5/5",
      "location": "Neighborhood or Address",
      "imageUrl": "Provide a realistic photo URL if possible, else empty string",
      "description": "Brief description"
    }
  ]
}
`;

  try {
    const itinerary = await callGroq(prompt);

    // Concurrently fetch real images for all hotels
    if (itinerary.hotels) {
      await Promise.all(itinerary.hotels.map(async (hotel) => {
        const query = `${hotel.name} ${destination}`;
        const realUrl = await fetchPlaceImageFallback(query);
        if (realUrl) hotel.imageUrl = realUrl;
      }));
    }

    return itinerary;
  } catch (error) {
    return generateMockItinerary(destination, startDate, endDate);
  }
};

export const regenerateDayPrompt = async (destination, targetDay, instructions) => {
  const prompt = `
Regenerate a specific day of a travel itinerary based on new instructions.
Return ONLY valid JSON for the single day. No markdown.

Destination: ${destination}
Current Day Data: ${JSON.stringify(targetDay)}
New Instructions: ${instructions}

JSON FORMAT:
{
  "day": ${targetDay.day},
  "title": "New Day Title",
  "activities": [
    {
      "name": "New Activity name",
      "time": "09:00 AM",
      "description": "Details"
    }
  ]
}
`;

  try {
    return await callGroq(prompt);
  } catch (error) {
    return targetDay; // fallback to original
  }
};

export const generatePackingListPrompt = async (destination, duration, preferences) => {
  const prompt = `
Generate a packing list for a trip.
Return ONLY valid JSON. No markdown.

Destination: ${destination}
Duration: ${duration} days
Interests: ${preferences?.interests?.join(", ") || "General"}

JSON FORMAT:
[
  {
    "category": "Clothing",
    "items": ["T-shirts", "Jeans"]
  },
  {
    "category": "Electronics",
    "items": ["Charger", "Camera"]
  }
]
`;

  try {
    return await callGroq(prompt);
  } catch (error) {
    return []; // fallback
  }
};

/* ---------------- MOCK FALLBACK ---------------- */

const generateMockItinerary = (destination, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return {
    itineraryData: {
      destination,
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} in ${destination}`,
        activities: [
          { name: "City Tour", time: "09:00 AM", description: "Explore landmarks" },
          { name: "Local Lunch", time: "01:00 PM", description: "Try local cuisine" }
        ],
      })),
    },
    budgetEstimation: {
      flights: "$500", accommodation: "$300", food: "$200", activities: "$100", total: "$1100"
    },
    hotels: [
      { name: "Mock Hotel 1", budgetLevel: "Budget", description: "Nice mock hotel" }
    ]
  };
};

# 🌍 AI Travel Itinerary Generator

A modern, full-stack AI-powered travel planning application that automatically generates comprehensive, day-by-day itineraries for your next adventure. Built with **Next.js**, **Node.js**, **MongoDB**, and the **Groq AI API** (Llama 3).

![Travel App UI](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80)

## ✨ Features

- **🤖 AI Itinerary Generation:** Enter your destination, dates, budget, and travel pace, and let the AI craft a fully detailed day-by-day schedule.
- **🏨 Smart Hotel Recommendations:** The AI suggests tailored hotels with estimated costs, automatically pulling real, high-quality images from the **Wikipedia API** (with a dynamic Flickr fallback).
- **💸 Budget Estimation:** Automatically calculates an estimated cost breakdown covering flights, accommodation, food, and activities.
- **🎒 AI Packing List:** Generates a custom packing list tailored to your specific destination and travel duration.
- **✏️ Interactive AI Editing:** Don't like a specific activity? Use the "AI Edit" tool to instantly swap it out for something cheaper, closer, or more exciting!
- **💾 Save & Manage Trips:** Create an account to securely save your generated itineraries to your personal "My Travel Plans" dashboard. Delete trips you no longer need.
- **💎 Glassmorphism UI:** A stunning, fully responsive frontend built with Next.js and Tailwind CSS, featuring premium glassmorphism aesthetics and smooth `lucide-react` icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS (Custom Glassmorphism UI)
- **Icons:** `lucide-react`
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Groq SDK (Llama 3)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Groq API Key (Get one for free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/travel-itinerary-app.git
cd travel-itinerary-app
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment:

```bash
cd backend
npm install
```

Copy the example environment file and fill in your secrets:
```bash
cp .env.example .env
```

**`backend/.env` Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-itinerary
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd frontend-next
npm install
```

Copy the example environment file:
```bash
cp .env.example .env.local
```

**`frontend-next/.env.local` Configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:3000` in your browser. Create an account, log in, and start planning your trips!

---

## 📂 Project Structure

```text
travel-itinerary-app/
├── backend/
│   ├── controllers/      # Route logic (auth, itineraries)
│   ├── middleware/       # JWT Auth verification
│   ├── models/           # Mongoose schemas (User, Itinerary)
│   ├── routes/           # Express API endpoints
│   ├── services/         # Groq AI & Wikipedia API integration
│   └── server.js         # Entry point
│
└── frontend-next/
    ├── src/
    │   ├── app/          # Next.js App Router (Pages & Layout)
    │   ├── components/   # Reusable UI components
    │   └── context/      # React Context (Auth State)
    └── tailwind.config   # Tailwind theme configurations
```

## 📜 License
This project is open-source and available under the MIT License.

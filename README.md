# 🗺️ AI Travel Itinerary Planner

## 1. Project Overview
The AI Travel Itinerary Planner is a full-stack, AI-driven web application that acts as a hyper-personalized digital travel agent. Users input their destination, travel dates, budget, and specific interests. In seconds, the application generates a complete, minute-by-minute itinerary. 

Beyond standard scheduling, the app intelligently estimates the entire trip budget, generates a tailored packing list, and provides local hotel recommendations (pulling real images via the Wikipedia API). It also features an interactive **AI Editor**, allowing users to surgically regenerate specific days or activities based on custom prompts. All trips can be exported as highly-stylized, magazine-quality PDFs.

## 2. Chosen Tech Stack (and Justification)
- **Frontend**: **Next.js (React)** with **Tailwind CSS**. 
  - *Justification*: Next.js provides excellent file-based routing and performance. Tailwind CSS was utilized to rapidly build the highly responsive, premium "glassmorphism" aesthetic without writing thousands of lines of custom CSS.
- **Backend**: **Node.js** with **Express.js**.
  - *Justification*: Provides a lightweight, unopinionated, and highly scalable REST API layer that perfectly integrates with the JSON-heavy nature of the frontend and MongoDB.
- **Database**: **MongoDB** with **Mongoose**.
  - *Justification*: Travel itineraries are inherently deeply nested, unpredictable JSON structures. A NoSQL document database like MongoDB is perfectly suited to store entire itineraries in single documents without complex relational joins.
- **AI Engine**: **Groq API** (`llama3-8b-8192`).
  - *Justification*: Chosen over OpenAI for its blazing-fast inference speed, which is critical for maintaining a snappy UX when users use the real-time "AI Edit" feature.
- **PDF Generation**: **PDFKit**.
  - *Justification*: A robust Node library for programmatic generation of customized, aesthetic offline documents.

## 3. Setup Instructions

### Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/mr-bott/travel-itinerary.git
   cd travel-itinerary
   ```
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   - Open `.env` and configure your `MONGODB_URI`, `JWT_SECRET`, and `GROQ_API_KEY`.
   - Start the server: `npm run dev` (Runs on port 5000)
3. **Frontend Setup**:
   ```bash
   cd ../frontend-next
   npm install
   cp .env.example .env.local
   ```
   - Start the client: `npm run dev` (Runs on port 3000)

### Deployed Setup
- **Frontend**: Connect the `frontend-next` directory to a platform like **Vercel** or **Netlify**. Ensure you set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend**: Deploy the `backend` directory to **Render**, **Railway**, or **Heroku**. Ensure you add your environment variables (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`) to the hosting platform's dashboard.
- **Database**: Use a free **MongoDB Atlas** cluster for your cloud database.

## 4. High-Level Architecture Explanation
The application follows a standard decoupled Client-Server architecture:
- The **Next.js Client** handles all UI, routing, and state management, utilizing a Context Provider (`AuthContext.js`) to manage the user's session globally.
- The **Express API Server** exposes endpoints for Authentication (`/api/auth`) and Itinerary Management (`/api/itinerary`).
- When an itinerary is requested, the backend controller (`itineraryController.js`) passes the user's parameters to the `aiService.js`. The AI service constructs strict JSON-schema prompts, calls the Groq LLM, parses the response, and fetches supplementary data (like Wikipedia images for hotels). The final object is then persisted to **MongoDB** and returned to the client.

## 5. Authentication and Authorization Approach
The app uses **JWT (JSON Web Tokens)** for stateless authentication.
- **Login/Signup**: Users send credentials to the backend. Passwords are securely hashed using `bcryptjs`. Upon success, the server signs a JWT with the user's ID and a secret key, returning it to the client.
- **Storage**: The Next.js frontend stores this JWT securely in `localStorage`.
- **Authorization**: For protected routes (saving, editing, deleting trips), the client intercepts requests and attaches the token in the HTTP `Authorization: Bearer <token>` header. A backend middleware (`authMiddleware.js`) intercepts the request, verifies the token signature, and rejects unauthorized access.

## 6. AI Agent Design and Purpose
The AI acts as an autonomous travel agent with three distinct capabilities:
1. **The Generator**: Given a set of constraints (budget, pace, dates), it uses engineered prompts to output a guaranteed JSON structure containing daily activities, estimated costs, and hotel recommendations.
2. **The Editor**: Instead of forcing the user to regenerate the entire trip if they dislike a single item, the AI acts as an interactive assistant. If a user says "Make this activity cheaper", the AI contextually understands the current activity, reads the instruction, and safely patches only that specific time slot.
3. **The Packer**: A specialized sub-agent that reviews the finalized itinerary, considers the destination's climate/activities, and generates a categorized packing list.

## 7. Explanation of Creative/Custom Features
- **Magazine-Quality PDF Exports**: Most travel apps dump raw text into a file. This app utilizes `PDFKit` to programmatically draw a stunning offline document. It features an abstract geometric cover page, "boarding pass" style trip details, smart pagination, and dynamic color styling to match the frontend UI.
- **Premium Glassmorphism UI**: The entire frontend is built with ultra-modern UI trends. It features full-bleed blurred background blobs, translucent glass cards with inner shadows, micro-animations on hover, and highly responsive grid layouts that look identical to a native mobile app.

## 8. Key Design Decisions and Trade-offs
- **Wikipedia API over Google Places**: To populate hotel images, the app relies on the free Wikipedia API (searching the hotel name and extracting the page image) with a fallback to Unsplash. 
  - *Trade-off*: While completely free and bypassing expensive Google Maps API quotas, it occasionally returns less accurate images (like city maps or crests) if the hotel lacks a direct Wikipedia page.
- **NoSQL Blob Storage**: Itineraries are stored as massive, nested JSON arrays within a single Mongoose document.
  - *Trade-off*: Modifying deeply nested elements (like editing a specific activity inside a specific day) requires pulling the whole document into memory, mutating it, and saving it. While slightly less efficient than normalized relational tables, it drastically simplified the schema and improved read speeds.

## 9. Known Limitations
- **Image Embedding in PDFs**: The exported PDF does not currently embed the hotel images, as downloading remote images synchronously blocks the PDF generation pipeline.
- **AI Hallucinations**: Since the AI does not have real-time Google Maps integration, transit times between generated activities are educated estimates, and it may occasionally recommend restaurants or attractions that have permanently closed.

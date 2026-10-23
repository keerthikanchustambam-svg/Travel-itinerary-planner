# ✈️ WanderTravel – AI-Powered Travel Itinerary Planner

> A full-stack college project using **HTML/CSS/JS + Node.js + Express + MongoDB + Google Gemini AI**

---

## 📂 Project Structure

```
Travel itinerary planner/
├── frontend/                  ← Static website (open in browser)
│   ├── index.html             ← Landing page
│   ├── login.html             ← Login page
│   ├── register.html          ← Registration page
│   ├── planner.html           ← Trip input form
│   ├── itinerary.html         ← Generated itinerary view
│   ├── dashboard.html         ← Saved trips dashboard
│   ├── css/
│   │   └── style.css          ← All styles (dark glassmorphism)
│   └── js/
│       ├── auth.js            ← Shared auth utilities
│       ├── planner.js         ← Trip form logic
│       ├── itinerary.js       ← Itinerary rendering
│       └── dashboard.js       ← Dashboard logic
│
├── backend/                   ← Node.js API server
│   ├── server.js              ← Express entry point
│   ├── .env.example           ← Environment variable template
│   ├── package.json
│   ├── config/
│   │   └── db.js              ← MongoDB connection
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   └── Itinerary.js       ← Itinerary schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── itineraryRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itineraryController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT verification
│   │   └── validate.js        ← Input validation
│   └── services/
│       └── aiService.js       ← Google Gemini AI call
│
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1 – Install Prerequisites

Make sure you have these installed on your computer:
- **Node.js** (v18 or higher) → https://nodejs.org
- **MongoDB Atlas** account (free) → https://cloud.mongodb.com

Check if Node is installed:
```bash
node --version   # Should print v18.x.x or higher
npm --version    # Should print 9.x.x or higher
```

---

### Step 2 – Get Your API Keys

#### 🔑 Google Gemini API Key (FREE)
1. Go to → https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

#### 🍃 MongoDB Atlas URI
1. Go to → https://cloud.mongodb.com
2. Create a free account → Create a **free M0 cluster**
3. Click **"Connect"** → **"Drivers"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/travel_planner
   ```
5. Replace `<username>` and `<password>` with your Atlas credentials
6. Make sure to **whitelist your IP** in Network Access (or use `0.0.0.0/0` for development)

---

### Step 3 – Configure Environment Variables

```bash
# Navigate to the backend folder
cd backend

# Copy the example env file
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

Now open `.env` in any text editor and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/travel_planner
JWT_SECRET=any_long_random_string_here_make_it_complex
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **NEVER share your `.env` file or commit it to GitHub!** It contains secret keys.

---

### Step 4 – Install Backend Dependencies

```bash
# Make sure you are inside the backend folder
cd backend
npm install
```

This installs all packages listed in `package.json`:
- `express` – Web server framework
- `mongoose` – MongoDB object modeling
- `jsonwebtoken` – JWT authentication
- `bcryptjs` – Password hashing
- `cors` – Allow frontend to talk to backend
- `helmet` – Security headers
- `express-rate-limit` – Prevent API abuse
- `express-validator` – Input validation
- `@google/generative-ai` – Gemini AI SDK
- `dotenv` – Load `.env` variables

---

### Step 5 – Start the Backend Server

```bash
# From inside the backend folder:
npm run dev       # Development mode (auto-restarts on file change)
# OR
npm start         # Production mode
```

You should see:
```
✅ Server running on http://localhost:5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📋 API Health: http://localhost:5000/api/health
```

---

### Step 6 – Open the Frontend

Since the frontend is pure HTML/CSS/JS, you need a local web server to avoid CORS issues.

**Option A: VS Code Live Server (Recommended)**
1. Install the **"Live Server"** extension in VS Code
2. Right-click on `frontend/index.html` → **"Open with Live Server"**
3. It opens at `http://127.0.0.1:5500`

**Option B: Python HTTP Server**
```bash
cd frontend
python -m http.server 3000
# Open http://localhost:3000
```

**Option C: npx serve**
```bash
cd frontend
npx serve -p 3000
# Open http://localhost:3000
```

---

### Step 7 – Test the Application

1. Open the frontend URL in your browser
2. Click **"Sign Up"** → Create an account
3. Click **"Plan My Trip"**
4. Fill in: Destination, Dates, Budget, Travelers, Interests
5. Click **"Generate AI Itinerary"** ← This calls Gemini AI!
6. Wait 15–30 seconds for the AI to generate your plan
7. View the day-by-day itinerary with hotels, restaurants, expenses
8. Click **"Save Itinerary"** to save it
9. Go to **"My Trips"** to see all saved trips

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT |
| GET | `/api/auth/me` | ✅ | Get logged-in user profile |
| POST | `/api/itinerary/generate` | ✅ | Generate AI itinerary |
| POST | `/api/itinerary/save` | ✅ | Save itinerary to DB |
| GET | `/api/itinerary/my-trips` | ✅ | Get all user's trips |
| GET | `/api/itinerary/:id` | ✅ | Get one trip by ID |
| DELETE | `/api/itinerary/:id` | ✅ | Delete a trip |
| GET | `/api/health` | ❌ | Server health check |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## 🧪 Test API with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 🏗️ How the Code Works (For CSE Students)

### What is Express.js?
Express is a lightweight Node.js framework. Think of it as the "router" of our server — it decides which function to run based on the URL and HTTP method.

### What is Mongoose?
Mongoose is an ODM (Object Data Modeling) library. It lets us define "schemas" (like table structures in SQL) for our MongoDB documents and interact with them using JavaScript.

### What is JWT?
JSON Web Token is a secure string that contains encoded user data (like their ID). The server signs it with a secret key. The client sends this token with every request to prove who they are — without the server needing to store sessions.

### What is bcrypt?
bcrypt is a password hashing algorithm. It converts a plain text password into a scrambled string. You can verify a password matches the hash, but you can't reverse the hash back to the original password.

### What is the Gemini API?
Google Gemini is an AI language model. We send it a carefully crafted "prompt" asking it to return a JSON-formatted travel itinerary. The AI processes this and responds with structured data we can parse and display.

### Security: Why is the API key on the backend?
If we put the Gemini API key in the frontend JavaScript, anyone could open browser DevTools and steal it. By keeping it in the backend `.env` file, only our server knows the key. The frontend just calls our backend, which calls Gemini.

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `MongoDB connection failed` | Check your `MONGO_URI` in `.env`. Whitelist your IP in Atlas. |
| `Invalid Gemini API key` | Check `GEMINI_API_KEY` in `.env`. Make sure no spaces. |
| `CORS error` | Make sure backend is running on port 5000. Check `FRONTEND_URL` in `.env`. |
| `401 Unauthorized` | Your JWT expired. Log out and log back in. |
| `AI generation failed` | Gemini may be rate-limited. Wait 1 minute and try again. |
| `Cannot find module` | Run `npm install` inside the `backend` folder. |

---

## 📦 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5, CSS3, Vanilla JS | User interface |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Store users & itineraries |
| AI | Google Gemini 1.5 Flash | Generate itineraries |
| Auth | JWT + bcryptjs | Secure login |
| Security | Helmet + CORS + Rate Limit | API protection |

---

## 📝 License

Built for educational purposes. Feel free to modify and learn from it!

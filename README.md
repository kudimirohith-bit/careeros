# CareerOS 🚀

**An AI-powered career acceleration platform** that analyzes your GitHub profile, evidence portfolio, and career goals to generate personalized learning plans, skill assessments, and interview roadmaps — all backed by Google Gemini AI.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)

---

## Features

| Module | Description |
|---|---|
| 🔐 **Auth** | JWT-based sign-up / sign-in with bcrypt password hashing |
| 🧭 **Onboarding** | Multi-step wizard to capture target role, education, goals & social links |
| 🧠 **AI Analysis** | Gemini AI analyzes GitHub repos + evidence links → career readiness score |
| 📅 **Learning Plan** | AI-generated day-by-day weekly plan (Mon–Fri), persisted to MongoDB |
| 🗺 **Career Roadmap** | 4-week milestone roadmap with skill boost tracking |
| 👤 **Career Twin** | AI persona reflecting your current market readiness & next actions |
| 🗂 **Evidence Hub** | Link GitHub, LinkedIn, portfolio, certificates, and projects |
| 💻 **Practice Hub** | Coding tests, aptitude tests, and skill assessments in-app |
| 🎤 **Mock Interview** | Simulated AI interview sessions |
| 🔮 **What-If Simulator** | Explore alternate career paths with AI projections |
| 📊 **Progress** | Charts tracking skill levels, readiness, and completed tasks |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ AuthPage │  │ Onboarding │  │  Dashboard │  │ LearningPlan│ │
│  └──────────┘  └────────────┘  └────────────┘  └───────────┘  │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │EvidenceHub│ │CareerTwin  │  │ PracticeHub│  │  Progress │  │
│  └──────────┘  └────────────┘  └────────────┘  └───────────┘  │
│                                                                 │
│              AppContext (Global State Manager)                  │
│                     │  axios API calls                          │
└─────────────────────│───────────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   Express REST API      │
          │   (Node.js — Port 5000) │
          │                         │
          │  /api/auth              │
          │  /api/onboarding        │
          │  /api/evidence          │
          │  /api/student           │
          │  /api/assessment        │
          │  /api/progress          │
          │  /api/ai                │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │        Services         │
          │                         │
          │  ai.js ──────────────────────► Google Gemini API
          │  aiService.js            │    (gemini-1.5-flash /
          │  github.js ──────────────────► GitHub REST API
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   MongoDB (local/Atlas) │
          │                         │
          │  Users  CareerPlans     │
          │  Students  Assessments  │
          │  UserProfiles  Progress │
          └─────────────────────────┘
```

### Request Flow

1. **User action** in the React SPA triggers an `axios` call via the `AppContext`.
2. The **Express router** authenticates the request and delegates to a **controller**.
3. Controllers call **service functions** — `ai.js` / `aiService.js` for Gemini, `github.js` for GitHub profile data.
4. **Gemini API** is called with a structured prompt; the JSON response is parsed and validated.
5. Results are **persisted to MongoDB** via Mongoose models and returned to the client.
6. `AppContext` updates global state; pages re-render with fresh data.

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| **React 19** | UI framework (SPA, no client-side router — page state managed in AppContext) |
| **Vite 8** | Dev server & production bundler |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts 3** | Skill & progress charts (lazy-loaded) |
| **Axios** | HTTP client for API communication |
| **React Icons 5** | Icon library |
| **oxlint** | Fast linter for code quality |

### Backend

| Technology | Role |
|---|---|
| **Node.js + Express 5** | REST API server (ES Modules, `type: "module"`) |
| **Mongoose 9** | MongoDB ODM — schema definitions & queries |
| **MongoDB** | Primary database (local daemon auto-started or Atlas) |
| **dotenv** | Environment variable management |
| **nodemon** | Dev-mode auto-restart |
| **cors** | Cross-origin request handling |

### AI & External Services

| Service | Role |
|---|---|
| **Google Gemini API** | Career analysis, learning plan generation, coach messages, bonus tasks, plan adaptation |
| **GitHub REST API** | Public profile & repository language detection via `github.js` |

### Gemini Model Cascade

The server tries models in this order, falling back on failure:

```
gemini-1.5-flash → gemini-2.0-flash → gemini-2.5-flash → gemini-1.5-pro
```

---

## Project Structure

```
careeros/
├── package.json              # Root monorepo scripts
│
├── client/                   # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx          # App entry point
│       ├── App.jsx           # Shell, routing, auth gate, onboarding gate
│       ├── index.css         # Global CSS variables & base styles
│       ├── context/
│       │   └── AppContext.jsx  # Global state: student, page, AI data, tasks
│       ├── api/              # Axios API helper modules
│       ├── components/       # Sidebar, TopBar, shared UI
│       ├── pages/
│       │   ├── AuthPage.jsx
│       │   ├── Onboarding.jsx
│       │   ├── Dashboard.jsx
│       │   ├── EvidenceHub.jsx
│       │   ├── LearningPlan.jsx
│       │   ├── CareerTwin.jsx
│       │   ├── MockInterview.jsx
│       │   ├── WhatIfSimulator.jsx
│       │   ├── Progress.jsx        # (lazy-loaded, Recharts)
│       │   ├── CodingTest.jsx
│       │   ├── AptitudeTest.jsx
│       │   └── AssessmentPage.jsx
│       ├── hooks/            # Custom React hooks
│       └── utils/            # Helper utilities
│
└── server/                   # Express + MongoDB backend
    ├── server.js             # Entry point — routes, CORS, MongoDB connect w/ retry
    ├── seed.js               # Seed script for demo data
    ├── .env                  # Environment variables (not committed)
    ├── routes/
    │   ├── auth.js
    │   ├── onboarding.js
    │   ├── evidence.js
    │   ├── student.js
    │   ├── assessment.js
    │   ├── progress.js
    │   └── ai.js
    ├── controllers/
    │   └── aiController.js   # AI endpoints: analyze, generate-plan, save-plan, coach, etc.
    ├── services/
    │   ├── ai.js             # Core Gemini analysis: analyzeUserData(), generateDefaultAnalysis()
    │   ├── aiService.js      # Plan generation, coach messages, bonus tasks, plan adaptation
    │   └── github.js         # GitHub public API: fetch profile + language stats
    ├── models/
    │   ├── User.js           # Master user document (profile, skills, evidence, AI cache, plan)
    │   ├── CareerPlan.js     # Weekly plan with day/task breakdown + completion tracking
    │   ├── Student.js
    │   ├── Assessment.js
    │   ├── Progress.js
    │   └── UserProfile.js
    ├── middleware/           # Auth middleware (JWT verification)
    ├── prompts/              # Prompt templates
    └── utils/                # Server-side helpers
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT token |

### Onboarding — `/api/onboarding`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/onboarding/complete` | Save onboarding data & mark complete |

### Evidence — `/api/evidence`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/evidence` | List user evidence items |
| `POST` | `/api/evidence` | Add new evidence item |
| `DELETE` | `/api/evidence/:id` | Remove evidence item |

### Student — `/api/student`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/student/profile` | Get student profile & AI analysis |
| `PATCH` | `/api/student/profile` | Update profile fields |

### AI — `/api/ai`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/analyze-profiles` | Analyze GitHub/social links via Gemini |
| `POST` | `/api/ai/generate-plan` | Generate full weekly career plan |
| `POST` | `/api/ai/save-learning-plan` | Persist learning plan & checked tasks to DB |
| `GET` | `/api/ai/plan` | Retrieve active learning plan |
| `POST` | `/api/ai/complete-task` | Mark a task as complete |
| `GET` | `/api/ai/todays-tasks` | Get today's scheduled tasks |
| `POST` | `/api/ai/coach-message` | AI coach chat response |
| `GET` | `/api/ai/bonus-tasks` | Suggest bonus tasks for spare time |
| `PATCH` | `/api/ai/interview-date` | Adapt plan around a new interview date |
| `POST` | `/api/ai/generate` | Generic Gemini proxy (keeps API key server-side) |
| `GET` | `/api/ai/user-profile` | Retrieve stored UserProfile analysis |

### Health Check

```
GET /api/health  →  { "status": "ok", "time": "<ISO timestamp>" }
```

---

## Environment Variables

Create `server/.env`:

```env
# MongoDB connection string
MONGO_URI=mongodb://127.0.0.1:27017/career_os

# Express server port
PORT=5000

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** The Gemini API key can also be supplied per-request via the `X-Gemini-Key` request header, allowing per-user key injection from the client.

---

## Running the Project

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally on port `27017` (the server will attempt to auto-start `mongod` if not running)
- A valid **Google Gemini API key**

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env and fill in MONGO_URI and GEMINI_API_KEY
```

### 3. (Optional) Seed Demo Data

```bash
# From root
npm run seed
```

### 4. Start the Backend

```bash
# From root
npm run server

# Or directly
cd server && npm run dev
```

The Express API starts at **`http://localhost:5000`**.

### 5. Start the Frontend

```bash
# From root (in a new terminal)
npm run client

# Or directly
cd client && npm run dev
```

The Vite dev server starts at **`http://localhost:5173`**.

### 6. Open the App

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

- **Register** a new account
- Complete the **Onboarding wizard** (add your GitHub username, target role, career goals)
- Add evidence links in **Evidence Hub**
- Hit **"Run AI Analysis"** on the Dashboard to generate your personalized career plan

---

## Development Scripts (Root)

| Script | Command | Description |
|---|---|---|
| `npm run server` | `cd server && npm run dev` | Start backend with nodemon |
| `npm run client` | `cd client && npm run dev` | Start Vite dev server |
| `npm run seed` | `cd server && npm run seed` | Seed the database with demo data |

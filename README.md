# IntellMeet — AI-Powered Enterprise Meeting & Collaboration Platform

[![MERN](https://img.shields.io/badge/Stack-MERN-339933)]()
[![React 19](https://img.shields.io/badge/React-19-61DAFB)]()
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)]()
[![JWT](https://img.shields.io/badge/Auth-JWT-orange)]()

**IntellMeet** is an enterprise-grade meeting platform that combines video collaboration, real-time chat, AI meeting intelligence, task management, and analytics — built for internship/portfolio submission and PPO evaluation (Zidio / LogicVeda).

> Turn meetings into actionable outcomes: AI summaries, extracted tasks, and team dashboards — reducing follow-up work by 40–60%.

---

## Live demo (local)

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:5173 |
| API       | http://localhost:5000/api |
| Health    | http://localhost:5000/api/health |

**Demo login** (after seed): `demo@intellmeet.com` / `demo123`

---

## Features mapped to specification

| ID | Feature | Status |
|----|---------|--------|
| F-01 | JWT auth, bcrypt, protected routes | ✅ Implemented |
| F-02 | Meeting rooms + Socket.io chat | ✅ Chat live; WebRTC UI ready |
| F-03 | AI transcription → summary → action items | ✅ Pipeline (OpenAI-ready) |
| F-04 | Real-time chat in meetings | ✅ Socket.io |
| F-05 | Post-meeting dashboard | ✅ MongoDB-backed |
| F-06 | Kanban / task management | ✅ CRUD API + UI |
| F-07 | Analytics & insights | ✅ Live from database |

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Lucide, Axios, Socket.io-client |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt, Helmet, Rate limiting |
| **Realtime** | Socket.io (chat, presence) · WebRTC (UI scaffold for video) |
| **AI** | Extensible service layer — swap mock analyzer for OpenAI / Hugging Face |
| **DevOps** | Docker Compose, env-based config, production-ready structure |

---

## Quick start

### Prerequisites

- Node.js 20+
- **MongoDB optional** — dev mode uses in-memory DB automatically (`USE_MEMORY_DB=true`)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Default `backend/.env` uses **in-memory MongoDB** (zero install). For a permanent cloud DB, see **[docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md)**.

### 3. Seed demo data

```bash
npm run seed
```

### 4. Run full stack

```bash
npm run dev
```

Open http://localhost:5173 → Sign in with demo account.

---

## Login not working? (troubleshooting)

**"Invalid credentials"** usually means one of these:

1. **MongoDB is not running** — the API cannot store users.  
   - Install [MongoDB Community](https://www.mongodb.com/try/download/community) for Windows, **or**  
   - Use free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), copy connection string to `backend/.env` as `MONGODB_URI`.

2. **Backend is not running** — start both services:
   ```bash
   npm run dev
   ```
   You should see `MongoDB connected` and `IntellMeet API running on http://localhost:5000`.

3. **Demo user missing** — on first API start with an empty database, a demo user is created automatically:  
   `demo@intellmeet.com` / `demo123`  
   Or **Sign up** with your own email (password min 6 characters).

4. **Wrong API URL** — `frontend/.env` must have:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## Docker (MongoDB + API)

```bash
docker compose up -d mongo
npm run dev:api
npm run dev:web
```

Or full API container:

```bash
docker compose up --build
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/meetings` | List meetings |
| GET | `/api/meetings/stats` | Dashboard stats |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update status |
| POST | `/api/ai/analyze` | AI summary + action items |
| GET | `/api/analytics` | Analytics dashboard |

---

## Project structure

```
intell-meet/
├── frontend/          # React SPA
│   └── src/
│       ├── pages/     # Home, Dashboard, Meeting, AI, Kanban…
│       ├── context/   # Auth, Theme
│       ├── hooks/     # useSocket
│       └── lib/       # API client
├── backend/           # Express API
│   └── src/
│       ├── models/    # User, Meeting, Task
│       ├── routes/    # REST + AI
│       └── server.js  # HTTP + Socket.io
├── docs/              # Architecture & submission guide
└── docker-compose.yml
```

---

## Security (enterprise practices)

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** bearer tokens on protected routes
- **Helmet** security headers
- **Rate limiting** on auth endpoints
- CORS restricted to client URL
- No secrets in repository (`.env.example` only)

---

## Submission checklist (Zidio / LogicVeda)

- [x] GitHub repository with README
- [x] Working MERN application
- [x] JWT authentication
- [x] Real-time Socket.io
- [x] AI meeting intelligence (demo pipeline)
- [x] Kanban + Analytics
- [ ] PDF documentation (use `docs/SUBMISSION_GUIDE.md`)
- [ ] Demo video (2–3 min walkthrough)
- [ ] Deploy frontend (Vercel) + API (Render/Railway) + MongoDB Atlas

---

## Roadmap (28-day plan alignment)

| Week | Focus | This repo |
|------|-------|-----------|
| 1 | Backend + auth | ✅ |
| 2 | Frontend + meetings | ✅ UI + Socket.io |
| 3 | AI + Kanban + dashboard | ✅ |
| 4 | Docker, deploy, monitoring | 🔄 Docker ready; add CI/CD + cloud |

**Next steps for maximum PPO impact:** WebRTC peer connection, OpenAI API key integration, Redis caching, deploy live URLs.

---

## Author

Internship project — **IntellMeet**  
Built to demonstrate full-stack, real-time systems, AI integration, and production-minded engineering.

---

## License

MIT — for academic and portfolio use.

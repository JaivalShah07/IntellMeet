# IntellMeet — Internship / PPO Submission Guide

Use this document to prepare your **PDF report**, **demo video**, and **evaluator presentation**.

---

## 1. One-line elevator pitch

> IntellMeet is an AI-powered enterprise meeting platform on the MERN stack that turns every video call into summaries, action items, and analytics — reducing manual follow-up by 40–60%.

---

## 2. What to show in the demo video (3 minutes)

| Time | What to demonstrate |
|------|---------------------|
| 0:00–0:30 | Landing page + value proposition |
| 0:30–1:00 | Sign up / login (mention JWT + bcrypt) |
| 1:00–1:30 | Dashboard — live data from MongoDB |
| 1:30–2:00 | Meeting room — Socket.io chat (open two browsers) |
| 2:00–2:30 | AI Insights — Run analysis → tasks created |
| 2:30–3:00 | Kanban + Analytics + tech stack slide |

---

## 3. Interview talking points

### Why MongoDB?
Meeting transcripts, summaries, and metadata are semi-structured — flexible schema fits evolving AI fields.

### How does real-time work?
Socket.io rooms per `roomId`; chat events broadcast to all participants. WebRTC signaling can reuse the same channel.

### How is AI integrated?
REST endpoint `/api/ai/analyze` — production replaces mock logic with OpenAI Whisper (audio→text) + GPT (summary/tasks).

### Security?
JWT on all protected routes, bcrypt passwords, helmet, rate limiting, CORS whitelist.

### Scalability?
Stateless Express instances behind load balancer; Socket.io Redis adapter for multi-node; MongoDB Atlas with replica set.

---

## 4. Evaluation criteria mapping

| Criteria | Your evidence |
|----------|----------------|
| **Innovation** | AI summary + auto task extraction + unified workspace |
| **Technical depth** | MERN + Socket.io + JWT + Docker + modular API |
| **Functionality** | End-to-end auth → dashboard → meeting chat → AI → kanban |
| **Documentation** | README + ARCHITECTURE + this guide |
| **Deployment** | Docker Compose; deploy to Render + Vercel + Atlas |
| **Presentation** | Polished optimistic UI |

---

## 5. Deploy for live URL (submission requirement)

### MongoDB Atlas
1. Create free cluster → get connection string
2. Set `MONGODB_URI` on API host

### API (Render / Railway)
1. Connect GitHub repo → root: `backend`
2. Build: `npm install` · Start: `npm start`
3. Env: `JWT_SECRET`, `MONGODB_URI`, `CLIENT_URL`

### Frontend (Vercel)
1. Root: `frontend`
2. Env: `VITE_API_URL=https://your-api.onrender.com/api`

---

## 6. PDF documentation outline

1. Title & abstract  
2. Problem statement  
3. Objectives & business goals (40–60% follow-up reduction)  
4. Literature / similar products (Zoom, Teams)  
5. System design (include architecture diagram)  
6. Technology stack table  
7. Feature list F-01 to F-07 with screenshots  
8. 28-day roadmap — what you completed per week  
9. Security practices  
10. Testing & results  
11. Future work (WebRTC, OpenAI, Kubernetes)  
12. Conclusion & references  

---

## 7. Commands evaluators may run

```bash
git clone <your-repo>
cd intell-meet
npm run install:all
cp backend/.env.example backend/.env
npm run seed
npm run dev
```

Login: `demo@intellmeet.com` / `demo123`

---

Good luck with your PPO selection.

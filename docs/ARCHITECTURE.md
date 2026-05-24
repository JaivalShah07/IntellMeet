# IntellMeet — System Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│  Home │ Auth │ Dashboard │ Meeting Room │ AI │ Kanban │ Analytics│
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express 5)                       │
│  Helmet │ CORS │ Rate Limit │ JWT Middleware │ REST Routes       │
└──────┬──────────────────────────────┬───────────────────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐              ┌──────────────────┐
│   MongoDB    │              │   Socket.io      │
│ Users        │              │ Room-based chat  │
│ Meetings     │              │ Presence events  │
│ Tasks        │              └──────────────────┘
└──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI SERVICE (pluggable)                              │
│  Current: Rule-based NLP demo                                    │
│  Production: OpenAI Whisper + GPT-4 / Hugging Face               │
└─────────────────────────────────────────────────────────────────┘
```

## Data models

### User
- Authentication credentials (bcrypt)
- Role: `member` | `admin`
- Profile: name, email, avatar

### Meeting
- `roomId` for Socket.io / WebRTC signaling
- Host, participants, schedule
- `transcript`, `summary`, `sentimentScore` after AI run

### Task
- Kanban status: `todo` | `in_progress` | `done`
- Linked to meetings when extracted by AI

## Non-functional requirements

| Requirement | Approach |
|-------------|----------|
| Low latency | Socket.io WebSocket transport; indexed Mongo queries |
| Security | JWT, bcrypt, helmet, rate limits |
| Scalability | Stateless API → horizontal scale; Socket.io Redis adapter (future) |
| Availability | Health endpoint; Docker restart policies |
| Observability | Morgan logs; ready for Sentry/Prometheus |

## AI pipeline (F-03)

1. **Ingest** — transcript text (live or post-meeting)
2. **Analyze** — summary + sentiment + action item extraction
3. **Persist** — update Meeting document; create Task documents
4. **Present** — Dashboard + AI Insights UI

Replace `generateInsights()` in `backend/src/routes/ai.routes.js` with OpenAI API calls for production.

## WebRTC (F-02) — integration path

1. Signaling server via Socket.io (`offer`, `answer`, `ice-candidate`)
2. `getUserMedia()` in `MeetingRoom.tsx`
3. `RTCPeerConnection` between peers
4. TURN/STUN for NAT traversal (production)

Current implementation delivers **meeting shell + real-time chat**; video is the next sprint per 28-day plan Day 10–12.

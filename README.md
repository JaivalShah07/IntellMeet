# IntellMeet — AI-Powered Enterprise Meeting & Collaboration Platform

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB)
![Node](https://img.shields.io/badge/Backend-Node.js-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)
![AI](https://img.shields.io/badge/AI-Google_Gemini-blue)

## Overview

**IntellMeet** is a full-stack AI-powered enterprise meeting and collaboration platform designed to make online meetings more productive and organized.

The platform combines real-time video communication, team collaboration tools, task management, analytics, and AI-powered meeting insights into a single workspace.

It helps teams transform conversations into actionable outcomes through automated summaries, extracted tasks, meeting records, and collaboration features.

---

## Key Features

### 🔐 Secure Authentication
- User registration and login
- JWT-based authentication
- Password encryption using bcrypt
- Protected application routes

### 🎥 Real-Time Meetings
- Multi-user video conferencing
- Audio controls and participant management
- WebRTC-based peer-to-peer communication
- Screen sharing support
- Meeting recording capability

### 💬 Live Collaboration
- Real-time chat using Socket.IO
- Collaborative notes with live synchronization
- User presence updates during meetings

### 🤖 AI Meeting Intelligence
- Meeting transcript processing
- AI-generated summaries
- Automatic action item extraction
- Intelligent meeting insights using Google Gemini AI

### 📋 Task Management
- Create tasks from meetings
- Track action items
- Kanban-style task workflow
- Task status management

### 📊 Analytics Dashboard
- Meeting history
- Productivity metrics
- Team collaboration insights
- Exportable reports

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Real-Time | Socket.IO, WebRTC |
| AI | Google Gemini AI |
| Security | JWT, bcrypt, Helmet, CORS |
| Deployment | Render, GitHub |

---

## System Architecture

```
User
 │
 ▼
React Frontend
 │
 ├── REST API
 ├── Socket.IO
 └── WebRTC
 │
 ▼
Node.js + Express Backend
 │
 ├── Authentication
 ├── Meeting Services
 ├── Task Management
 └── AI Integration
 │
 ▼
MongoDB Atlas
```

---

## Installation & Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas account or local MongoDB
- Google Gemini API key

### Clone Repository

```bash
git clone <repository-url>
cd IntellMeet
```

### Install Dependencies

```bash
npm run install:all
```

### Environment Configuration

Create environment files:

```bash
backend/.env
frontend/.env
```

Backend example:

```env
MONGODB_URI=your_database_url
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret
```

### Run Application

```bash
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

---

## Project Structure

```
IntellMeet/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── context/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── sockets/
│
└── README.md
```

---

## Security

- Encrypted passwords using bcrypt
- JWT authentication
- Protected API routes
- Helmet security middleware
- Rate limiting
- Controlled CORS access

---

## Future Enhancements

- Mobile application support
- Calendar integration
- Multi-language meeting translation
- AI sentiment analysis
- Cloud recording storage
- Advanced analytics

---

## Developed For

**Zidio Development Internship Program**

## Conclusion

IntellMeet demonstrates the practical implementation of modern full-stack development, real-time communication, and artificial intelligence to solve real-world collaboration challenges.

It provides a scalable foundation for intelligent workplace communication and productivity management.

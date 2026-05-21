# MongoDB Setup for Beginners (IntellMeet)

You have **two options**. Option 1 needs **zero MongoDB knowledge**.

---

## Option 1: Zero setup (already configured for you)

The project can run a **temporary database in memory** — like a notebook that erases when you close the app.

**Your `backend/.env` should have:**

```env
USE_MEMORY_DB=true
```

**Run the app:**

```bash
cd c:\Projects\intell-meet
npm run dev
```

**Login:**

- Email: `demo@intellmeet.com`
- Password: `demo123`

That’s it. No MongoDB install.

**Note:** Meetings/tasks you create disappear when you stop the server. Fine for demos and development.

---

## Option 2: Real MongoDB (data saved permanently)

Use this for your **internship submission** (evaluators + deployed app).

### A) MongoDB Atlas (free cloud — recommended)

1. Go to https://www.mongodb.com/cloud/atlas/register  
2. Sign up (free).  
3. Create a **free cluster** (M0).  
4. Click **Database Access** → Add user → username + password (save them).  
5. Click **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`) for demos.  
6. Click **Database** → **Connect** → **Drivers** → copy the connection string.  
   It looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Open `backend/.env` and set:

```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/intellmeet?retryWrites=true&w=majority
```

Replace `myuser`, `mypassword`, and the cluster URL with yours. Add `/intellmeet` before `?` for the database name.

8. Run:

```bash
npm run seed
npm run dev
```

### B) MongoDB on Windows (local install)

1. Download: https://www.mongodb.com/try/download/community  
2. Run installer → choose **Complete** → check **Install MongoDB as a Service**.  
3. In `backend/.env`:

```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb://127.0.0.1:27017/intellmeet
```

4. Run `npm run seed` then `npm run dev`.

---

## How to know it’s working

When you run `npm run dev`, the terminal should show:

```
MongoDB connected (in-memory — no install needed)
```
OR
```
MongoDB connected: mongodb://...
Demo user created: demo@intellmeet.com / demo123
IntellMeet API running on http://localhost:5000
```

Then open http://localhost:5173/login

---

## Still stuck?

| Problem | Fix |
|---------|-----|
| Invalid credentials | Stop server, run `npm run dev` again, use demo login |
| Cannot reach API | Run `npm run dev` from project root, not only frontend |
| Port 5000 in use | Change `PORT=5001` in backend/.env and `VITE_API_URL=http://localhost:5001/api` in frontend/.env |

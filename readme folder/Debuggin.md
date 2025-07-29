# 🔧 Debugging Guide - Ecuador Interactivo

## ⚠️ Common Error: "NetworkError when attempting to fetch resource"

This error occurs when the leaderboard tries to connect to the backend server but can't reach it.

### ✅ **Quick Fix**

The backend server needs to be running on port 3002. Follow these steps:

1. **Start the backend server:**
   ```bash
   npm run backend
   ```
   Or manually:
   ```bash
   node src/server.js
   ```

2. **Verify it's running:**
   You should see: `Servidor backend en http://localhost:3002`

3. **Test the API directly:**
   Open in browser: http://localhost:3002/api/leaderboard

### 🔄 **Complete Setup**

#### 1. Environment Variables
Copy `.env.example` to `.env` and configure your database:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```bash
DB_USER=your_username
DB_HOST=localhost
DB_NAME=ecuador_interactivo
DB_PASSWORD=your_password
DB_PORT=5432
```

#### 2. Database Setup
Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE ecuador_interactivo;

-- Create the leaderboard table
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Start All Services

**Option A: Start individually**
```bash
# Terminal 1: Backend API (port 3002)
npm run backend

# Terminal 2: Arduino server (port 3001) 
npm run arduino

# Terminal 3: Frontend (port 5173)
npm run dev
```

**Option B: Start all at once**
```bash
npm install -g concurrently
npm run start:full
```

### 🐛 **Troubleshooting**

#### Backend Server Issues:
- **Port 3002 already in use:** Kill the process or change the port in `src/server.js`
- **Database connection failed:** Check PostgreSQL is running and credentials are correct
- **Missing .env file:** Copy `.env.example` to `.env` and configure

#### Frontend Issues:
- **CORS errors:** Make sure backend has `cors()` middleware enabled
- **Network timeout:** Increase timeout in `Leaderboard.jsx` if needed

#### Database Issues:
- **Table doesn't exist:** Run the SQL commands above to create the table
- **Connection refused:** Verify PostgreSQL service is running
- **Authentication failed:** Check DB credentials in `.env`

### 📊 **API Endpoints**

- **GET** `/api/leaderboard` - Get all scores (ordered by score DESC)
- **POST** `/api/leaderboard` - Add new score
  ```json
  {
    "name": "Player Name",
    "age": 25,
    "score": 1500
  }
  ```

### 🔧 **Development Scripts**

```bash
npm run dev          # Start frontend (Vite dev server)
npm run backend      # Start backend API server
npm run arduino      # Start Arduino/hardware server  
npm run start:full   # Start all servers concurrently
npm run build        # Build for production
npm run preview      # Preview production build
```

### 💡 **Quick Tests**

Test if everything is working:

1. **Backend:** http://localhost:3002/api/leaderboard
2. **Arduino:** http://localhost:3001 (should show Socket.IO page)
3. **Frontend:** http://localhost:5173

### 🆘 **Still Having Issues?**

1. Check all terminals for error messages
2. Verify all dependencies are installed: `npm install`
3. Ensure PostgreSQL is running and accessible
4. Check firewall settings aren't blocking the ports
5. Try restarting all services

---

## 📁 **Project Structure**

```
ecuador-interactivo/
├── src/
│   ├── server.js           # Backend API (port 3002)
│   ├── components/
│   │   └── Leaderboard.jsx # Frontend leaderboard
│   └── ...
├── sever.js               # Arduino server (port 3001)
├── .env.example          # Environment template
├── .env                  # Your environment (create this)
└── package.json          # Scripts and dependencies
```

## ⚠️ Common Error: ElevenLabs TTS API Issues

### 🔊 **Error: 401 - "Unusual activity detected. Free Tier usage disabled"**

This error occurs when ElevenLabs detects unusual activity and disables free tier access.

#### ✅ **Solutions:**

1. **Check your API key:**
   - Verify your API key in `.env` file is correct
   - Get a new API key from: https://elevenlabs.io/app/speech-synthesis/text-to-speech

2. **Free Tier Limitations:**
   - ElevenLabs free tier has strict usage limits
   - Multiple accounts from same IP triggers abuse detection
   - VPN/Proxy usage may trigger restrictions

3. **Immediate workarounds:**
   - The app automatically falls back to browser's built-in TTS
   - Disable ElevenLabs temporarily by setting `VITE_DEV_MODE=false` in `.env`
   - Use a different API key if available

4. **Long-term solutions:**
   - Purchase ElevenLabs paid subscription
   - Implement alternative TTS services
   - Use browser's Speech Synthesis API as primary option

#### 🔧 **Configure TTS Settings:**

Edit your `.env` file to fix the issue immediately:

```bash
# QUICK FIX: Disable ElevenLabs completely and use browser TTS
VITE_DISABLE_ELEVENLABS=true

# OR set dev mode to false (same effect)
VITE_DEV_MODE=false

# OR update with new API key if you have one
VITE_ELEVENLABS_API_KEY=your_new_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

**After editing `.env`, restart your development server:**
```bash
# Stop the current dev server (Ctrl+C) then:
npm run dev
```

#### 🎯 **Testing TTS:**

1. Open browser console to see TTS debug messages
2. The app should automatically fallback to browser TTS
3. Test with: `speechSynthesis.speak(new SpeechSynthesisUtterance("Hello"))`

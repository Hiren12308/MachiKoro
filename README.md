# 🎲 Machi Koro Online

Online multiplayer Machi Koro — Base Game, Harbor, and Millionaire's Row expansions. 2–5 players.

---

## Local Development

### Prerequisites
- Node.js 18+

### Setup

```bash
# 1. Install server dependencies
npm install

# 2. Install client dependencies
cd client && npm install && cd ..
```

### Running locally (two terminals)

**Terminal 1 — Server:**
```bash
npm run dev:server
# Server runs on http://localhost:3000
```

**Terminal 2 — Client:**
```bash
npm run dev:client
# Client runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Deploy to Render

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/machi-koro.git
git push -u origin main
```

### Step 2 — Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign up / log in
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | machi-koro (or anything you like) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

5. Click **Create Web Service**

Render will build and deploy automatically. Your game will be live at `https://your-app-name.onrender.com`.

### Step 3 — Share with friends!

Send them your Render URL, have them open it in a browser, create/join a room, and play!

---

## Project Structure

```
machi-koro/
├── shared/
│   └── constants.js      # All card + landmark data for all expansions
├── server/
│   ├── index.js          # Express + Socket.io server
│   ├── RoomManager.js    # Lobby, room creation, player management
│   ├── GameState.js      # State factory + helper functions
│   └── GameEngine.js     # All game logic (pure functions)
├── client/
│   └── src/
│       ├── App.jsx        # Root component, socket wiring
│       ├── socket.js      # Socket.io client singleton
│       └── components/
│           ├── Lobby.jsx  # Create/join room UI
│           └── GameBoard.jsx # Main game UI
└── tests/
    └── GameEngine.test.js # 33 engine tests
```

## Running Tests

```bash
npm test
```

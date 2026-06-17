# 🏙️ Machi Koro — Multiplayer

Play Machi Koro online with friends. All expansions included: Base, Harbor, Millionaire's Row.

## Deploy to Render (online multiplayer)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Click Deploy — share the URL with friends!

## Run locally (same WiFi)

```
npm install
node server.js
```

Then open `http://localhost:3000` (host) or the Network URL shown in the terminal (others).

## How to Play

- Each player opens the URL, enters their name, and joins the lobby
- Click **Ready Up** — game starts when all players are ready
- **Goal:** First to build all 7 landmarks wins
- **Buying is mandatory** — you must purchase something each turn if you can afford it
- High roll cards (7+) require you to own Train Station first

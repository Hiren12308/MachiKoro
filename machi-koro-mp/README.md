# 🏙️ Machi Koro — Local Network Multiplayer

Play Machi Koro with friends on the same WiFi network.

---

## Requirements

- **Node.js** (v16 or newer) — download at https://nodejs.org
- All players on the **same WiFi network**

---

## Setup (one-time)

```bash
cd machi-koro-mp
npm install
```

---

## How to Play

### 1. The host starts the server

**Mac / Linux:**
```bash
./start.sh
```
or
```bash
node server.js
```

**Windows:**
Double-click `start.bat`, or run:
```
node server.js
```

You'll see output like:
```
┌─────────────────────────────────────────┐
│         MACHI KORO — Multiplayer        │
├─────────────────────────────────────────┤
│  Local:   http://localhost:3000          │
│  Network: http://192.168.1.42:3000       │
│                                         │
│  Share the Network URL with friends     │
│  on the same WiFi to join!              │
└─────────────────────────────────────────┘
```

### 2. Share the Network URL

Give everyone the **Network URL** (e.g. `http://192.168.1.42:3000`).

- The host can also open `http://localhost:3000`
- Everyone else opens the Network URL in their browser

### 3. Each player enters their name and joins

- Type your name and click **Join Game**
- Click **Ready Up** when you're ready
- The game starts automatically once everyone is ready
- The host can also click **Start Now** to force-start

---

## Rules Summary

- **Goal:** First player to build all 8 landmarks wins
- **Turn:** Roll dice → Income activates → Buy 1 card or landmark → End turn
- **Blue cards** activate on anyone's roll
- **Green cards** activate on your roll only
- **Red cards** activate on the active player's roll (they pay you)
- **Purple cards** have unique powerful effects (max 1 per player)
- **High Roll row (7+)** unlocks once any player builds the Train Station
- **Stacked cards** (×N badge) mean multiple copies are available to buy

---

## Expansions Included

- ✅ Base Game
- ✅ Harbor Expansion
- ✅ Millionaire's Row

---

## Troubleshooting

**Can't connect?**
- Make sure everyone is on the same WiFi (not mobile data)
- Check your firewall isn't blocking port 3000
- Try disabling VPN if you have one

**Server crashed?**
- Re-run `node server.js` — it starts fresh

**Port already in use?**
```bash
PORT=3001 node server.js
```

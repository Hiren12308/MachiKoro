const http = require('http');
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const { WebSocketServer } = require('ws');
const os   = require('os');

// ─── Load game logic into global scope ───────────────────────────────────────
// cards.js defines constants; engine.js references them — both run in global
// scope via vm.runInThisContext so they share the same variable space.
function loadGlobal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Strip the Node.js module.exports shim (not needed here)
  code = code.replace(/\/\/ Node\.js export[\s\S]*$/, '');
  vm.runInThisContext(code, { filename: filePath });
}

loadGlobal(path.join(__dirname, 'src/cards.js'));
loadGlobal(path.join(__dirname, 'src/engine.js'));

// ─── HTTP server (serves /public) ────────────────────────────────────────────
const MIME = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png' };

const httpServer = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' }); res.end(data); }
  });
});

// ─── Lobby state ─────────────────────────────────────────────────────────────
const lobby = {
  players: [],   // { id, name, ws, ready }
  game: null,
  started: false,
};
let nextId = 1;

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

function broadcast(msg, excludeId = null) {
  const data = JSON.stringify(msg);
  for (const p of lobby.players)
    if (p.id !== excludeId && p.ws.readyState === 1) p.ws.send(data);
}

function sendTo(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function lobbySnapshot() {
  return lobby.players.map(p => ({ id: p.id, name: p.name, ready: p.ready }));
}

function gameSnapshot() {
  const G = lobby.game;
  if (!G) return null;
  return {
    players: G.players.map(p => ({
      id: p.id, name: p.name, coins: p.coins,
      hand: p.hand, landmarks: p.landmarks,
      techStartupInvestment: p.techStartupInvestment,
    })),
    currentPlayerIndex: G.currentPlayerIndex,
    phase: G.phase,
    diceValues: G.diceValues,
    diceSum: G.diceSum,
    marketLow: G.marketLow,
    marketHigh: G.marketHigh,
    marketPurple: G.marketPurple,
    deckCount: G.deck.length,
    log: G.log,
    winner: G.winner ? { id: G.winner.id, name: G.winner.name } : null,
    pendingEffect: G.pendingEffect ? { type: G.pendingEffect.card?.id } : null,
    didBuyThisTurn: G.didBuyThisTurn,
    hasRerolledThisTurn: G.hasRerolledThisTurn,
    extraTurn: G.extraTurn,
  };
}

function pushGameState() {
  const state = gameSnapshot();
  for (const p of lobby.players)
    sendTo(p.ws, { type: 'GAME_STATE', state, yourId: p.id });
}

wss.on('connection', (ws) => {
  const playerId = nextId++;
  let player = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const G = lobby.game;

    if (msg.type === 'JOIN') {
      const name = String(msg.name || '').trim().slice(0, 20) || `Player ${playerId}`;
      if (lobby.started) return sendTo(ws, { type: 'ERROR', text: 'Game already in progress.' });
      if (lobby.players.length >= 5) return sendTo(ws, { type: 'ERROR', text: 'Lobby is full (max 5).' });
      player = { id: playerId, name, ws, ready: false };
      lobby.players.push(player);
      sendTo(ws, { type: 'JOINED', yourId: playerId, lobby: lobbySnapshot() });
      broadcast({ type: 'LOBBY_UPDATE', lobby: lobbySnapshot() }, playerId);
      console.log(`[+] ${name} joined (id=${playerId}). Players: ${lobby.players.length}`);
      return;
    }

    if (msg.type === 'READY') {
      if (!player) return;
      player.ready = !player.ready;
      broadcast({ type: 'LOBBY_UPDATE', lobby: lobbySnapshot() });
      const allReady = lobby.players.length >= 2 && lobby.players.every(p => p.ready);
      if (allReady && !lobby.started) startGame();
      return;
    }

    if (msg.type === 'START') {
      if (!player || lobby.started) return;
      if (lobby.players[0].id !== player.id) return;
      if (lobby.players.length < 2) return sendTo(ws, { type: 'ERROR', text: 'Need at least 2 players.' });
      startGame();
      return;
    }

    if (!G || !player) return;
    const isYourTurn = G.players[G.currentPlayerIndex]?.id === player.id;

    if (msg.type === 'ROLL' && isYourTurn && G.phase === 'ROLL') {
      const num = msg.numDice === 2 && G.hasLandmark(G.currentPlayer, 'TRAIN_STATION') ? 2 : 1;
      G.rollDice(num); pushGameState(); return;
    }
    if (msg.type === 'HARBOR_BONUS' && isYourTurn && G.phase === 'HARBOR_BONUS') {
      G.applyHarborBonus(!!msg.use); pushGameState(); return;
    }
    if (msg.type === 'BUY_CARD' && isYourTurn && G.phase === 'BUY') {
      G.buyCard(msg.cardId, msg.slotType); pushGameState(); return;
    }
    if (msg.type === 'BUY_LANDMARK' && isYourTurn && G.phase === 'BUY') {
      G.buyLandmark(msg.landmarkId); pushGameState(); return;
    }
    if (msg.type === 'END_TURN' && isYourTurn && G.phase === 'BUY') {
      G.skipBuy(); pushGameState(); return;
    }
    if (msg.type === 'REROLL' && isYourTurn && G.phase === 'BUY') {
      G.reroll(); pushGameState(); return;
    }
    if (msg.type === 'TV_TARGET' && isYourTurn && G.phase === 'TV_TARGET') {
      G.resolveTVStation(msg.targetId); pushGameState(); return;
    }
    if (msg.type === 'BC_CANCEL' && isYourTurn && G.phase === 'BC_TAKE') {
      G.phase = 'BC_GIVE';  // go back so player can re-choose what to give
      G.pendingEffect = {};
      pushGameState(); return;
    }

    if (msg.type === 'BC_RESOLVE' && isYourTurn) {
      if (msg.step === 'give') {
        G.pendingEffect = { ...(G.pendingEffect || {}), giveCardId: msg.cardId };
        G.phase = 'BC_TAKE'; pushGameState();
      } else {
        G.resolveBusinessCenter(G.pendingEffect.giveCardId, msg.targetPlayerId, msg.cardId);
        pushGameState();
      }
      return;
    }
    if (msg.type === 'RENOVATION_TARGET' && isYourTurn && G.phase === 'RENOVATION_TARGET') {
      if (msg.landmarkId) G.resolveRenovationCompany(msg.landmarkId);
      else G._checkCityHall();
      pushGameState(); return;
    }
    if (msg.type === 'TECH_INVEST' && isYourTurn && G.phase === 'BUY') {
      G.investInTechStartup(msg.amount); pushGameState(); return;
    }
  });

  ws.on('close', () => {
    if (!player) return;
    console.log(`[-] ${player.name} disconnected`);
    lobby.players = lobby.players.filter(p => p.id !== player.id);
    if (!lobby.started) broadcast({ type: 'LOBBY_UPDATE', lobby: lobbySnapshot() });
    else broadcast({ type: 'PLAYER_LEFT', name: player.name });
  });
});

function startGame() {
  const names = lobby.players.map(p => p.name);
  lobby.game = new MachiKoroGame(names);
  // Map lobby player ids onto game player objects
  lobby.players.forEach((lp, i) => { lobby.game.players[i].id = lp.id; });
  lobby.started = true;
  console.log(`[!] Game started with: ${names.join(', ')}`);
  pushGameState();
}

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets))
    for (const net of nets[name])
      if (net.family === 'IPv4' && !net.internal) return net.address;
  return 'localhost';
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│         MACHI KORO — Multiplayer        │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│  Local:   http://localhost:${PORT}          │`);
  console.log(`│  Network: http://${ip}:${PORT}       │`);
  console.log('│                                         │');
  console.log('│  Share the Network URL with friends!    │');
  console.log('└─────────────────────────────────────────┘\n');
});

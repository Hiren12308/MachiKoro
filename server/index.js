/**
 * Machi Koro - Server
 * Express + Socket.io
 *
 * Socket events (client → server):
 *   create_room      { name }
 *   join_room        { code, name }
 *   set_ready        { ready }
 *   set_expansions   { expansions }   ← host only
 *   start_game       {}               ← host only
 *   roll_dice        { diceCount }
 *   harbor_decision  { useBonus }
 *   reroll_dice      {}
 *   buy_card         { cardId }
 *   buy_landmark     { landmarkId }
 *   invest_tech      { amount }
 *   resolve_action   { ...actionData }
 *   end_turn         {}
 *
 * Socket events (server → client):
 *   room_update      { room }         ← lobby state
 *   game_update      { state }        ← full game state after every action
 *   error            { message }
 *   game_over        { winnerId, winnerName }
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

import {
  createRoom, joinRoom, leaveRoom, setReady, setExpansions,
  startGame, getRoom, getRoomBySocket, publicRoom,
} from './RoomManager.js';

import {
  rollDice, applyHarborBonus, rerollDice,
  buyCard, buyLandmark, endTurn,
  resolvePendingAction, investInTechStartup,
} from './GameEngine.js';

import { getActivePlayer } from './GameState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Project root is one level up from /server
const ROOT = join(__dirname, '..');
const PORT = process.env.PORT || 3000;

// ─── Express Setup ────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// Serve the React client in production
const clientDist = join(ROOT, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});

const httpServer = createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Socket Event Handlers ────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── Lobby Events ────────────────────────────────────────────────────────────

  socket.on('create_room', ({ name }) => {
    try {
      validate({ name }, ['name']);
      const room = createRoom(socket.id, name.trim());
      socket.join(room.code);
      socket.emit('room_update', { room: publicRoom(room) });
      console.log(`[Room] ${name} created room ${room.code}`);
    } catch (e) {
      socket.emit('error', { message: e.message });
    }
  });

  socket.on('join_room', ({ code, name }) => {
    try {
      validate({ code, name }, ['code', 'name']);
      const room = joinRoom(code.toUpperCase(), socket.id, name.trim());
      socket.join(room.code);
      io.to(room.code).emit('room_update', { room: publicRoom(room) });
      console.log(`[Room] ${name} joined room ${room.code}`);
    } catch (e) {
      socket.emit('error', { message: e.message });
    }
  });

  socket.on('set_ready', ({ ready }) => {
    try {
      const room = requireRoom(socket.id);
      const updated = setReady(room.code, socket.id, !!ready);
      io.to(room.code).emit('room_update', { room: publicRoom(updated) });
    } catch (e) {
      socket.emit('error', { message: e.message });
    }
  });

  socket.on('set_expansions', ({ expansions }) => {
    try {
      const room = requireRoom(socket.id);
      const updated = setExpansions(room.code, socket.id, expansions);
      io.to(room.code).emit('room_update', { room: publicRoom(updated) });
    } catch (e) {
      socket.emit('error', { message: e.message });
    }
  });

  socket.on('start_game', () => {
    try {
      const room = requireRoom(socket.id);
      const started = startGame(room.code, socket.id);
      io.to(room.code).emit('game_update', { state: started.state });
      console.log(`[Game] Room ${room.code} game started`);
    } catch (e) {
      socket.emit('error', { message: e.message });
    }
  });

  // ── Game Events ─────────────────────────────────────────────────────────────

  socket.on('roll_dice', ({ diceCount }) => {
    gameAction(socket, (room) => {
      room.state = rollDice(room.state, socket.id, diceCount ?? 1);
    });
  });

  socket.on('harbor_decision', ({ useBonus }) => {
    gameAction(socket, (room) => {
      room.state = applyHarborBonus(room.state, socket.id, !!useBonus);
    });
  });

  socket.on('reroll_dice', () => {
    gameAction(socket, (room) => {
      room.state = rerollDice(room.state, socket.id);
    });
  });

  socket.on('buy_card', ({ cardId }) => {
    gameAction(socket, (room) => {
      room.state = buyCard(room.state, socket.id, cardId);
    });
  });

  socket.on('buy_landmark', ({ landmarkId }) => {
    gameAction(socket, (room) => {
      room.state = buyLandmark(room.state, socket.id, landmarkId);
    });
  });

  socket.on('invest_tech', ({ amount }) => {
    gameAction(socket, (room) => {
      room.state = investInTechStartup(room.state, socket.id, amount);
    });
  });

  socket.on('resolve_action', (actionData) => {
    gameAction(socket, (room) => {
      room.state = resolvePendingAction(room.state, socket.id, actionData);
    });
  });

  socket.on('end_turn', () => {
    gameAction(socket, (room) => {
      room.state = endTurn(room.state, socket.id);
    });
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────

  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    try {
      const room = getRoomBySocket(socket.id);
      if (!room) return;
      const updated = leaveRoom(socket.id);
      if (updated) {
        io.to(updated.code).emit('room_update', { room: publicRoom(updated) });
        if (updated.status === 'FINISHED') {
          io.to(updated.code).emit('error', { message: 'A player disconnected — game ended.' });
        }
      }
    } catch (e) {
      console.error('Disconnect error:', e.message);
    }
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Runs a game mutation, broadcasts state update, handles errors. */
function gameAction(socket, fn) {
  try {
    const room = requireRoom(socket.id);
    if (room.status !== 'IN_GAME') throw new Error('Game has not started.');
    fn(room);
    io.to(room.code).emit('game_update', { state: room.state });

    // Announce game over
    if (room.state.phase === 'GAME_OVER') {
      const winner = room.state.players.find((p) => p.id === room.state.winner);
      io.to(room.code).emit('game_over', {
        winnerId: winner.id,
        winnerName: winner.name,
      });
      room.status = 'FINISHED';
    }
  } catch (e) {
    socket.emit('error', { message: e.message });
  }
}

function requireRoom(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) throw new Error('You are not in a room.');
  return room;
}

function validate(data, fields) {
  for (const f of fields) {
    if (!data[f] || typeof data[f] !== 'string' || !data[f].trim()) {
      throw new Error(`Missing required field: ${f}`);
    }
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n🎲 Machi Koro server running on port ${PORT}\n`);
});

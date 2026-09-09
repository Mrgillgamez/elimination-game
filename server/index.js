const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { createRoom, getRoom } = require('./gameLogic/rooms');
const { createPlayer } = require('./gameLogic/models');
const sm = require('./gameLogic/stateMachine');
const { DEFAULT_TIMER_SECONDS } = sm;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const path = require('path');

// Serve the built React frontend (created by `npm run build` in /client)
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/health', (req, res) => res.send('Elimination Game server is running.'));

// Any non-API route falls back to the React app, so /host and /player work on refresh
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const REVEAL_DURATION_MS = 12000; // 4500ms suspense + ~7500ms result clearly visible, per plan

// Tracks which room and player each live socket connection belongs to
const socketMeta = new Map(); // socket.id -> { roomCode, playerId, isHost }
const playerSockets = new Map(); // playerId -> socket.id (for direct messages like YOU_ARE_ELIMINATED)

function publicPlayers(session) {
  return session.players.map((p) => ({ id: p.id, name: p.name, status: p.status }));
}

function alivePublicPlayers(session) {
  return publicPlayers(session).filter((p) => p.status === 'ALIVE');
}

function broadcastLobby(session) {
  io.to(session.roomCode).emit('LOBBY_UPDATED', {
    players: publicPlayers(session),
    canStart: sm.canStart(session),
  });
}

// ---- Round cycle ----

function startRound(session) {
  const round = sm.beginRound(session);
  const payload = {
    roundNumber: round.roundNumber,
    votingEndsAt: round.votingEndsAt,
    timerSeconds: round.timerSecondsUsed,
    alivePlayers: alivePublicPlayers(session),
  };
  io.to(session.roomCode).emit('ROUND_STARTED', payload);

  const delay = round.votingEndsAt - Date.now();
  session.timer = setTimeout(() => closeRound(session), Math.max(delay, 0));
}

function closeRound(session) {
  if (session.phase !== 'VOTING_OPEN') return; // safety guard
  const tally = sm.closeVotingAndTally(session);
  const result = sm.applyResult(session, tally);

  io.to(session.roomCode).emit('ROUND_RESULT', {
    eliminatedId: result.eliminatedId,
    reason: result.reason,
    remainingPlayers: alivePublicPlayers(session),
  });

  if (result.eliminatedId) {
    const sockId = playerSockets.get(result.eliminatedId);
    if (sockId) io.to(sockId).emit('YOU_ARE_ELIMINATED');
  }

  session.timer = setTimeout(() => advancePhase(session), REVEAL_DURATION_MS);
}

function advancePhase(session) {
  const phase = sm.advanceAfterReveal(session);

  if (phase === 'ROUND_START') {
    startRound(session);
      } else if (phase === 'FINAL_TWO') {
    const decisionAt = Date.now() + DEFAULT_TIMER_SECONDS * 1000;
    io.to(session.roomCode).emit('FINAL_TWO_REACHED', {
      players: alivePublicPlayers(session),
      decisionAt,
    });
    // Final 60-second countdown before resolving the winner, per the plan.
    session.timer = setTimeout(() => {
      const result = sm.resolveFinalTwo(session);
      io.to(session.roomCode).emit('ROUND_RESULT', {
        eliminatedId: result.eliminatedId,
        reason: result.reason,
        remainingPlayers: alivePublicPlayers(session),
      });
      const sockId = playerSockets.get(result.eliminatedId);
      if (sockId) io.to(sockId).emit('YOU_ARE_ELIMINATED');

      session.timer = setTimeout(() => {
        io.to(session.roomCode).emit('GAME_ENDED', { winnerId: result.winnerId });
      }, REVEAL_DURATION_MS);
    }, DEFAULT_TIMER_SECONDS * 1000);
  } else if (phase === 'ENDED') {
    const winner = session.players.find((p) => p.status === 'ALIVE');
    io.to(session.roomCode).emit('GAME_ENDED', { winnerId: winner ? winner.id : null });
  }
}

// ---- Socket events ----

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('CREATE_GAME', () => {
    const session = createRoom(socket.id);
    socket.join(session.roomCode);
    socketMeta.set(socket.id, { roomCode: session.roomCode, playerId: null, isHost: true });
    socket.emit('ROOM_CREATED', { roomCode: session.roomCode });
    broadcastLobby(session);
  });

  socket.on('JOIN_GAME', ({ roomCode, name }) => {
    const session = getRoom(roomCode);
    if (!session) {
      socket.emit('JOIN_ERROR', { message: 'Room not found.' });
      return;
    }
    if (session.phase !== 'LOBBY') {
      socket.emit('JOIN_ERROR', { message: 'Game already started.' });
      return;
    }
    if (session.players.length >= sm.MAX_PLAYERS) {
      socket.emit('JOIN_ERROR', { message: 'Room is full.' });
      return;
    }
    if (sm.isNameTaken(session, name)) {
      socket.emit('JOIN_ERROR', { message: 'That name is already taken.' });
      return;
    }

    const player = createPlayer(name);
    sm.addPlayer(session, player);
    socket.join(roomCode);
    socketMeta.set(socket.id, { roomCode, playerId: player.id, isHost: false });
    playerSockets.set(player.id, socket.id);

    socket.emit('JOIN_SUCCESS', { playerId: player.id, roomCode });
    broadcastLobby(session);
  });

  socket.on('HOST_REJOIN', ({ roomCode }) => {
    const session = getRoom(roomCode);
    if (!session) {
      socket.emit('JOIN_ERROR', { message: 'That room no longer exists.' });
      return;
    }
    session.hostId = socket.id;
    socket.join(roomCode);
    socketMeta.set(socket.id, { roomCode, playerId: null, isHost: true });
    socket.emit('ROOM_CREATED', { roomCode });

        if (session.phase === 'LOBBY') {
      broadcastLobby(session);
    } else {
      socket.emit('GAME_STARTED', { players: publicPlayers(session) });

      const round = session.rounds[session.rounds.length - 1];
      if (round) {
        socket.emit('ROUND_STARTED', {
          roundNumber: round.roundNumber,
          votingEndsAt: round.votingEndsAt,
          timerSeconds: round.timerSecondsUsed,
          alivePlayers: alivePublicPlayers(session),
        });
        if (round.result) {
          socket.emit('ROUND_RESULT', {
            eliminatedId: round.result.eliminatedId,
            reason: round.result.reason,
            remainingPlayers: alivePublicPlayers(session),
          });
        }
      }
    }
  });
  socket.on('START_GAME', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta || !meta.isHost) return;
    const session = getRoom(meta.roomCode);
    if (!session) return;
    try {
      sm.startGame(session);
      io.to(session.roomCode).emit('GAME_STARTED', { players: publicPlayers(session) });
      startRound(session);
    } catch (err) {
      socket.emit('JOIN_ERROR', { message: err.message });
    }
  });

  socket.on('CAST_VOTE', ({ targetId }) => {
    const meta = socketMeta.get(socket.id);
    if (!meta || meta.isHost || !meta.playerId) return;
    const session = getRoom(meta.roomCode);
    if (!session) return;
    try {
      sm.submitVote(session, meta.playerId, targetId);
      socket.emit('VOTE_ACCEPTED', { targetId });
    } catch (err) {
      // Vote arrived after voting closed — ignore silently, client will already be mid-transition
    }
  });

  socket.on('disconnect', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const session = getRoom(meta.roomCode);
    if (session && meta.playerId) {
            if (session.phase === 'LOBBY') {
        sm.removePlayer(session, meta.playerId);
        broadcastLobby(session);
      } else {
        const player = session.players.find((p) => p.id === meta.playerId);
        if (player) {
          player.status = 'LEFT';
          // Tell everyone still connected so their vote screen drops this player live.
          io.to(session.roomCode).emit('PLAYER_LEFT', {
            playerId: player.id,
            alivePlayers: alivePublicPlayers(session),
          });
        }
      }
      playerSockets.delete(meta.playerId);
    }
    socketMeta.delete(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
const crypto = require('crypto');

// Creates one player — matches the Player shape from the plan exactly.
function createPlayer(name) {
  return {
    id: crypto.randomUUID(),
    name,
    status: 'ALIVE', // ALIVE | ELIMINATED | LEFT
    lifetimeVotesReceived: 0,
  };
}

// Creates one round — matches the Round shape from the plan exactly.
function createRound(roundNumber, timerSeconds) {
  const startedAt = Date.now();
  return {
    roundNumber,
    startedAt,
    votingEndsAt: startedAt + timerSeconds * 1000, // a timestamp, not a countdown
    timerSecondsUsed: timerSeconds,
    votes: [], // { voterId, targetId } — wiped after tallying, never stored long-term
    result: null,
  };
}

// Creates one game session — matches the GameSession shape from the plan exactly.
function createGameSession(hostId, roomCode) {
  return {
    id: crypto.randomUUID(),
    roomCode,
    status: 'LOBBY', // LOBBY | ACTIVE | ENDED (matches the plan's data model)
    phase: 'LOBBY',  // finer-grained engine phase, used internally to drive the state machine
    hostId,
    currentRoundNumber: 0,
    timerSeconds: 60,
    players: [],
    rounds: [],
  };
}

module.exports = { createPlayer, createRound, createGameSession };
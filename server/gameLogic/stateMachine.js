const { createRound } = require('./models');
const { tallyVotes } = require('./tally');

const MIN_PLAYERS = 10;
const MAX_PLAYERS = 15;

const DEFAULT_TIMER_SECONDS = 60;
const TIMER_FLOOR_SECONDS = 15;
const TIMER_SHRINK_STEP = 15;

function addPlayer(session, player) {
  if (session.phase !== 'LOBBY') throw new Error('Cannot join after game has started');
  if (session.players.length >= MAX_PLAYERS) throw new Error('Game is full');
  session.players.push(player);
  return session;
}

function isNameTaken(session, name) {
  return session.players.some(
    (p) => p.name.toLowerCase() === name.toLowerCase() && p.status !== 'LEFT'
  );
}

function removePlayer(session, playerId) {
  session.players = session.players.filter((p) => p.id !== playerId);
}

function canStart(session) {
  return session.players.length >= MIN_PLAYERS && session.players.length <= MAX_PLAYERS;
}

function startGame(session) {
  if (session.phase !== 'LOBBY') throw new Error('Game already started');
  if (!canStart(session)) throw new Error('Need 10-15 players to start');
  session.status = 'ACTIVE';
  session.phase = 'ROUND_START';
  return session;
}

function beginRound(session) {
  if (session.phase !== 'ROUND_START') throw new Error('Not ready to begin a round');
  session.currentRoundNumber += 1;
  const round = createRound(session.currentRoundNumber, session.timerSeconds);
  session.rounds.push(round);
  session.phase = 'VOTING_OPEN';
  return round;
}

function submitVote(session, voterId, targetId) {
  if (session.phase !== 'VOTING_OPEN') throw new Error('Voting is not open');
  const round = session.rounds[session.rounds.length - 1];
  const alreadyVoted = round.votes.some((v) => v.voterId === voterId);
  if (alreadyVoted) return; // one vote per player — ignore repeats
  round.votes.push({ voterId, targetId });
}

function closeVotingAndTally(session) {
  if (session.phase !== 'VOTING_OPEN') throw new Error('Voting is not open');
  const round = session.rounds[session.rounds.length - 1];
  const alivePlayers = session.players.filter((p) => p.status === 'ALIVE');

  // Rule: not voting counts as voting for yourself
  for (const player of alivePlayers) {
    const hasVoted = round.votes.some((v) => v.voterId === player.id);
    if (!hasVoted) {
      round.votes.push({ voterId: player.id, targetId: player.id });
    }
  }

  const alivePlayerIds = alivePlayers.map((p) => p.id);
  const tally = tallyVotes(round.votes, alivePlayerIds);

  // Update each player's running lifetime vote total
  for (const id of alivePlayerIds) {
    const player = session.players.find((p) => p.id === id);
    player.lifetimeVotesReceived += tally.counts[id] || 0;
  }

  session.phase = 'TALLY';
  return tally;
}

function applyResult(session, tally) {
  if (session.phase !== 'TALLY') throw new Error('Not in tally phase');
  const round = session.rounds[session.rounds.length - 1];

    if (!tally.isTie) {
    const eliminated = session.players.find((p) => p.id === tally.eliminatedId);
    if (!eliminated) {
      console.error(
        `[BUG GUARD] Room ${session.roomCode}: tally targeted unknown player id ${tally.eliminatedId}. Treating round as no-elimination.`
      );
      round.result = { eliminatedId: null, reason: 'TIE_TIMER_SHRINK' };
      session.phase = 'REVEAL';
      return round.result;
    }
    eliminated.status = 'ELIMINATED';
    round.result = { eliminatedId: tally.eliminatedId, reason: 'MAJORITY' };
    session.timerSeconds = DEFAULT_TIMER_SECONDS; // fresh round timer resets
    session.phase = 'REVEAL';
    return round.result;
  }

  // Tied. If this round's timer hadn't hit the floor yet, shrink and try again.
  if (round.timerSecondsUsed > TIMER_FLOOR_SECONDS) {
    session.timerSeconds = Math.max(TIMER_FLOOR_SECONDS, round.timerSecondsUsed - TIMER_SHRINK_STEP);
    round.result = { eliminatedId: null, reason: 'TIE_TIMER_SHRINK' };
    session.phase = 'REVEAL';
    return round.result;
  }

  // Already at the 15s floor and still tied — fall back to lifetime votes among tied players only.
  const tiedIds = tally.tiedPlayerIds;
  const totals = tiedIds.map((id) => ({
    id,
    total: session.players.find((p) => p.id === id).lifetimeVotesReceived,
  }));
  const maxTotal = Math.max(...totals.map((t) => t.total));
  const topByLifetime = totals.filter((t) => t.total === maxTotal);

  let eliminatedId;
  let reason;

  if (topByLifetime.length === 1) {
    eliminatedId = topByLifetime[0].id;
    reason = 'TIE_LIFETIME_VOTES';
  } else {
    // Absolute last resort — only path in the entire game that uses randomness.
    eliminatedId = topByLifetime[Math.floor(Math.random() * topByLifetime.length)].id;
    reason = 'RANDOM';
    console.log(
      `[RANDOM ELIMINATION] Room ${session.roomCode}, round ${round.roundNumber}: ` +
      `tied on lifetime votes among [${tiedIds.join(', ')}] at ${maxTotal} each — randomly eliminated ${eliminatedId}`
    );
  }

    const eliminated = session.players.find((p) => p.id === eliminatedId);
  if (!eliminated) {
    console.error(
      `[BUG GUARD] Room ${session.roomCode}: lifetime-tiebreak targeted unknown player id ${eliminatedId}. Treating round as no-elimination.`
    );
    round.result = { eliminatedId: null, reason: 'TIE_TIMER_SHRINK' };
    session.phase = 'REVEAL';
    return round.result;
  }
  eliminated.status = 'ELIMINATED';
  round.result = { eliminatedId, reason };
  session.timerSeconds = DEFAULT_TIMER_SECONDS; // resolved — reset for the next fresh round
  session.phase = 'REVEAL';
  return round.result;
}

function resolveFinalTwo(session) {
  if (session.phase !== 'FINAL_TWO') throw new Error('Not in final two phase');
  const [p1, p2] = session.players.filter((p) => p.status === 'ALIVE');

  let loserId;
  let reason;

  if (p1.lifetimeVotesReceived !== p2.lifetimeVotesReceived) {
    loserId = p1.lifetimeVotesReceived > p2.lifetimeVotesReceived ? p1.id : p2.id;
    reason = 'MAJORITY';
  } else {
    // Walk backward round by round, most recent first, comparing just these two players' votes.
    for (let i = session.rounds.length - 1; i >= 0; i--) {
      const round = session.rounds[i];
      const v1 = round.votes.filter((v) => v.targetId === p1.id).length;
      const v2 = round.votes.filter((v) => v.targetId === p2.id).length;
      if (v1 !== v2) {
        loserId = v1 > v2 ? p1.id : p2.id;
        reason = 'TIE_LIFETIME_VOTES';
        break;
      }
    }

    if (!loserId) {
      // Every single round was tied between them — absolute last resort.
      loserId = Math.random() < 0.5 ? p1.id : p2.id;
      reason = 'RANDOM';
      console.log(
        `[RANDOM ELIMINATION] Room ${session.roomCode}: final two fully tied across all rounds — randomly eliminated ${loserId}`
      );
    }
  }

  const loser = session.players.find((p) => p.id === loserId);
  loser.status = 'ELIMINATED';

  const winner = session.players.find((p) => p.status === 'ALIVE');
  session.phase = 'ENDED';
  session.status = 'ENDED';

  return { eliminatedId: loserId, winnerId: winner.id, reason };
}

function advanceAfterReveal(session) {
  if (session.phase !== 'REVEAL') throw new Error('Not in reveal phase');
  const aliveCount = session.players.filter((p) => p.status === 'ALIVE').length;

  if (aliveCount === 2) {
    session.phase = 'FINAL_TWO'; // Resolution logic for this comes in Stage 6
  } else if (aliveCount > 2) {
    session.phase = 'ROUND_START';
  } else {
    session.phase = 'ENDED';
    session.status = 'ENDED';
  }
  return session.phase;
}

module.exports = {
  MIN_PLAYERS,
  MAX_PLAYERS,
  DEFAULT_TIMER_SECONDS,
  TIMER_FLOOR_SECONDS,
  TIMER_SHRINK_STEP,
  isNameTaken,
  removePlayer,
  addPlayer,
  canStart,
  startGame,
  beginRound,
  submitVote,
  closeVotingAndTally,
  applyResult,
  resolveFinalTwo,
  advanceAfterReveal,
};
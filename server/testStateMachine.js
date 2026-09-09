const { createGameSession, createPlayer } = require('./gameLogic/models');
const sm = require('./gameLogic/stateMachine');

const session = createGameSession('host-1', 'ABCD');
console.log('Created session. Phase:', session.phase);

// Simulate 12 players joining
for (let i = 1; i <= 12; i++) {
  sm.addPlayer(session, createPlayer(`Player${i}`));
}
console.log(`Added ${session.players.length} players. Can start:`, sm.canStart(session));

sm.startGame(session);
console.log('Game started. Phase:', session.phase);

let safetyCounter = 0;

while (session.phase !== 'FINAL_TWO') {
  safetyCounter++;
  if (safetyCounter > 20) {
    console.log('SAFETY STOP — the loop never reached FINAL_TWO. Something is wrong.');
    break;
  }

  const round = sm.beginRound(session);
  console.log(`\n--- Round ${round.roundNumber} ---`);

  // Fake voting: everyone votes for the first alive player, except that
  // player votes for the second alive player. This always produces a clear
  // majority, so we can prove the round loop itself works correctly.
  const alive = session.players.filter((p) => p.status === 'ALIVE');
  const target = alive[0];
  const fallback = alive[1];

  for (const voter of alive) {
    const targetId = voter.id === target.id ? fallback.id : target.id;
    sm.submitVote(session, voter.id, targetId);
  }

  const tally = sm.closeVotingAndTally(session);
  const result = sm.applyResult(session, tally);
  const eliminated = session.players.find((p) => p.id === result.eliminatedId);

  console.log('Eliminated:', eliminated ? eliminated.name : 'no one (tie)');

  sm.advanceAfterReveal(session);
  console.log('New phase:', session.phase, '| Alive count:', session.players.filter((p) => p.status === 'ALIVE').length);
}

console.log('\n=== Reached FINAL_TWO ===');
console.log('Remaining players:', session.players.filter((p) => p.status === 'ALIVE').map((p) => p.name));
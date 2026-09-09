// Pure function: given votes and the list of alive player IDs, decide the outcome.
// Does not touch the game session — just counts and returns a result.
function tallyVotes(votes, alivePlayerIds) {
  const counts = {};
  for (const id of alivePlayerIds) counts[id] = 0;

  for (const vote of votes) {
    if (counts[vote.targetId] !== undefined) {
      counts[vote.targetId]++;
    }
  }

  let maxVotes = -1;
  let topIds = [];
  for (const id of alivePlayerIds) {
    if (counts[id] > maxVotes) {
      maxVotes = counts[id];
      topIds = [id];
    } else if (counts[id] === maxVotes) {
      topIds.push(id);
    }
  }

  const isTie = topIds.length > 1;

  return {
    counts,                                  // votes per player, needed to update lifetime totals
    isTie,
    eliminatedId: isTie ? null : topIds[0],
    tiedPlayerIds: isTie ? topIds : [],
  };
}

module.exports = { tallyVotes };
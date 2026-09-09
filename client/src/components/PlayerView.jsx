import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { playSound } from '../sounds';
import Confetti from './Confetti';
import './PlayerView.css';

const REVEAL_PAUSE_MS = 3000;        // must match HostView.jsx's REVEAL_PAUSE_MS
const WINNER_REVEAL_PAUSE_MS = 3000; // must match HostView.jsx's WINNER_REVEAL_PAUSE_MS

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('code') || '';
}

function isTestMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('test') === '1';
}

function randomTestName() {
  const n = Math.floor(Math.random() * 100000);
  return `Test${n}`;
}

function PlayerView() {
  const [roomCode, setRoomCode] = useState(getCodeFromUrl());
  const [name, setName] = useState(isTestMode() ? randomTestName() : '');
  const [myId, setMyId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const [alivePlayers, setAlivePlayers] = useState([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [isEliminated, setIsEliminated] = useState(false);
  const [eliminatedInRound, setEliminatedInRound] = useState(null);

  const [revealPhase, setRevealPhase] = useState('IDLE'); // IDLE | REVEALING | REVEALED
  const [revealedInfo, setRevealedInfo] = useState(null);

  const [finalTwo, setFinalTwo] = useState(false);
  const [finalTwoSecondsLeft, setFinalTwoSecondsLeft] = useState(null);

  const [winnerId, setWinnerId] = useState(null);
  const [winnerPhase, setWinnerPhase] = useState(null); // null | CROWNING | REVEALED

  const rosterRef = useRef({});
  const roundNumberRef = useRef(0);
  const revealTimeoutRef = useRef(null);
  const winnerTimeoutRef = useRef(null);

  useEffect(() => {
    if (isTestMode() && roomCode && name) {
      socket.emit('JOIN_GAME', { roomCode: roomCode.toUpperCase(), name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on('JOIN_SUCCESS', ({ playerId }) => {
      setMyId(playerId);
      setJoined(true);
      setError('');
    });
    socket.on('JOIN_ERROR', ({ message }) => setError(message));

    socket.on('GAME_STARTED', ({ players }) => {
      setGameStarted(true);
      players.forEach((p) => { rosterRef.current[p.id] = p.name; });
    });

    socket.on('ROUND_STARTED', ({ roundNumber, alivePlayers }) => {
      clearTimeout(revealTimeoutRef.current);
      roundNumberRef.current = roundNumber;
      setRoundNumber(roundNumber);
      setAlivePlayers(alivePlayers);
      setHasVoted(false);
      setSelectedTarget(null);
      setRevealPhase('IDLE');
      setRevealedInfo(null);
      alivePlayers.forEach((p) => { rosterRef.current[p.id] = p.name; });
    });

    socket.on('VOTE_ACCEPTED', () => setHasVoted(true));

    socket.on('ROUND_RESULT', ({ eliminatedId, reason, remainingPlayers }) => {
      clearTimeout(revealTimeoutRef.current);
      setRevealPhase('REVEALING');
      revealTimeoutRef.current = setTimeout(() => {
        setRevealedInfo({ eliminatedId, reason, name: rosterRef.current[eliminatedId] || null });
        setAlivePlayers(remainingPlayers);
        setRevealPhase('REVEALED');
      }, REVEAL_PAUSE_MS);
    });

    socket.on('YOU_ARE_ELIMINATED', () => {
      setIsEliminated(true);
      setEliminatedInRound(roundNumberRef.current);
      playSound('eliminatedYou', { volume: 0.9 });
    });

    socket.on('PLAYER_LEFT', ({ playerId, alivePlayers }) => {
      setAlivePlayers(alivePlayers);
      setSelectedTarget((current) => (current === playerId ? null : current));
    });

    socket.on('FINAL_TWO_REACHED', ({ decisionAt }) => {
      clearTimeout(revealTimeoutRef.current);
      setRevealPhase('IDLE');
      setFinalTwo(true);
      const tick = () => {
        setFinalTwoSecondsLeft(Math.max(0, Math.ceil((decisionAt - Date.now()) / 1000)));
      };
      tick();
      const interval = setInterval(tick, 250);
      setTimeout(() => clearInterval(interval), decisionAt - Date.now() + 500);
    });

    socket.on('GAME_ENDED', ({ winnerId }) => {
      clearTimeout(revealTimeoutRef.current);
      setRevealPhase('IDLE');
      setWinnerId(winnerId);
      setWinnerPhase('CROWNING');
      winnerTimeoutRef.current = setTimeout(() => {
        setWinnerPhase('REVEALED');
      }, WINNER_REVEAL_PAUSE_MS);
    });

    return () => {
      socket.off('JOIN_SUCCESS');
      socket.off('JOIN_ERROR');
      socket.off('GAME_STARTED');
      socket.off('ROUND_STARTED');
      socket.off('VOTE_ACCEPTED');
      socket.off('ROUND_RESULT');
      socket.off('YOU_ARE_ELIMINATED');
      socket.off('PLAYER_LEFT');
      socket.off('FINAL_TWO_REACHED');
      socket.off('GAME_ENDED');
      clearTimeout(revealTimeoutRef.current);
      clearTimeout(winnerTimeoutRef.current);
    };
  }, []);

  const joinGame = () => {
    if (!roomCode || !name) {
      setError('Enter both room code and your name.');
      return;
    }
    socket.emit('JOIN_GAME', { roomCode: roomCode.toUpperCase(), name });
  };

  const castVote = (targetId) => {
    setSelectedTarget(targetId);
    socket.emit('CAST_VOTE', { targetId });
  };

  // ---- Not joined yet ----
  if (!joined) {
    return (
      <div className="player-container">
        <h1>Join Game</h1>
        <div><input className="player-input" placeholder="Room code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} /></div>
        <div style={{ marginTop: 10 }}><input className="player-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <button className="player-btn" style={{ marginTop: 10 }} onClick={joinGame}>Join</button>
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      </div>
    );
  }

  // ---- Joined, waiting in lobby ----
  if (!gameStarted) {
    return (
      <div className="player-container">
        <h1>You're in!</h1>
        <p>Waiting for the host to start the game...</p>
      </div>
    );
  }

  // ---- Game fully ended: winner screen (shown to everyone) ----
  if (winnerId) {
    const winnerName = rosterRef.current[winnerId] || 'Unknown';
    const youWon = myId === winnerId;
    const isRevealed = winnerPhase === 'REVEALED';
    return (
      <div className="player-container winner-screen">
        {isRevealed && <Confetti />}
        <div className="player-winner-block">
          <div className="player-round-label">
            {isRevealed ? (youWon ? 'You Won!' : 'Winner') : 'Crowning the winner...'}
          </div>
          {isRevealed ? (
            <div className="player-winner-name">{youWon ? `🏆 ${winnerName} 🏆` : winnerName}</div>
          ) : (
            <div className="player-reveal-pause">🥁 🥁 🥁</div>
          )}
        </div>
        {isRevealed && isEliminated && !youWon && (
          <p className="player-subtle-note">You were eliminated in Round {eliminatedInRound}.</p>
        )}
      </div>
    );
  }

  // ---- Dramatic round reveal (shown to eliminated spectators AND active players alike) ----
  if (revealPhase !== 'IDLE') {
    return (
      <div className="player-container">
        {isEliminated && (
          <div className="player-spectator-banner">Eliminated in Round {eliminatedInRound} — spectating</div>
        )}
        <h2 className="player-round-label">Round {roundNumber}</h2>
        {revealPhase === 'REVEALING' && <div className="player-reveal-pause">Tallying votes...</div>}
        {revealPhase === 'REVEALED' && revealedInfo && (
          revealedInfo.eliminatedId ? (
            <>
              <div className="player-eliminated-name">{revealedInfo.name}</div>
              <div className="player-eliminated-label">eliminated</div>
            </>
          ) : (
            <div className="player-tie-message">It's a tie — no elimination</div>
          )
        )}
        <p className="player-remaining">Players remaining: {alivePlayers.length}</p>
      </div>
    );
  }

  // ---- Final two reached, decision pending ----
  if (finalTwo) {
    return (
      <div className="player-container">
        {isEliminated && (
          <div className="player-spectator-banner">Eliminated in Round {eliminatedInRound} — spectating</div>
        )}
        <h1>Final Two</h1>
        <p className="player-big-number">{finalTwoSecondsLeft}</p>
        <p>The game is deciding the winner...</p>
      </div>
    );
  }

  // ---- Eliminated: live spectator idle screen ----
  if (isEliminated) {
    return (
      <div className="player-container eliminated-screen">
        <h1>You have been eliminated</h1>
        <p>Eliminated in Round {eliminatedInRound}.</p>
        <p>Round {roundNumber} in progress — {alivePlayers.length} players remaining.</p>
        <p>Watch the rest of the game unfold here as it happens.</p>
      </div>
    );
  }

  // ---- Already voted, waiting for round to end ----
  if (hasVoted) {
    return (
      <div className="player-container">
        <h1>Vote locked in</h1>
        <p>Waiting for the round to end...</p>
      </div>
    );
  }

  // ---- Voting screen ----
  return (
    <div className="player-container">
      <h1>Round {roundNumber} — Vote</h1>
      <p>Tap a player, then confirm.</p>
      <ul className="player-vote-list">
        {alivePlayers.map((p) => (
          <li key={p.id}>
            <button
              className={`player-vote-btn ${selectedTarget === p.id ? 'selected' : ''}`}
              onClick={() => setSelectedTarget(p.id)}
            >
              {p.name} {p.id === myId ? '(You)' : ''}
            </button>
          </li>
        ))}
      </ul>
      <button
        className="player-btn"
        disabled={!selectedTarget}
        onClick={() => castVote(selectedTarget)}
        style={{ marginTop: 10 }}
      >
        Confirm Vote
      </button>
    </div>
  );
}

export default PlayerView;
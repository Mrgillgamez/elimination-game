import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { playSound } from '../sounds';
import Confetti from './Confetti';
import Avatar from './Avatar';
import { getAvatarColor } from '../avatar';
import './PlayerView.css';

const REVEAL_PAUSE_MS = 3000;
const WINNER_REVEAL_PAUSE_MS = 3000;

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

  const [revealPhase, setRevealPhase] = useState('IDLE');
  const [revealedInfo, setRevealedInfo] = useState(null);

  const [finalTwo, setFinalTwo] = useState(false);
  const [finalTwoSecondsLeft, setFinalTwoSecondsLeft] = useState(null);

  const [winnerId, setWinnerId] = useState(null);
  const [winnerPhase, setWinnerPhase] = useState(null);

  const rosterRef = useRef({});
  const roundNumberRef = useRef(0);
  const revealTimeoutRef = useRef(null);
  const winnerTimeoutRef = useRef(null);
  const iWasEliminatedThisRoundRef = useRef(false);

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
      iWasEliminatedThisRoundRef.current = false;
      setRoundNumber(roundNumber);
      setAlivePlayers(alivePlayers);
      setHasVoted(false);
      setSelectedTarget(null);
      setRevealPhase('IDLE');
      setRevealedInfo(null);
      alivePlayers.forEach((p) => { rosterRef.current[p.id] = p.name; });

      if (isTestMode() && alivePlayers.length > 0) {
        const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        const delay = 1000 + Math.random() * 4000;
        setTimeout(() => {
          socket.emit('CAST_VOTE', { targetId: randomTarget.id });
        }, delay);
      }
    });
    socket.on('VOTE_ACCEPTED', () => setHasVoted(true));

    socket.on('ROUND_RESULT', ({ eliminatedId, reason, remainingPlayers }) => {
      clearTimeout(revealTimeoutRef.current);
      setRevealPhase('REVEALING');
      revealTimeoutRef.current = setTimeout(() => {
        setRevealedInfo({ eliminatedId, reason, name: rosterRef.current[eliminatedId] || null });
        setAlivePlayers(remainingPlayers);
        setRevealPhase('REVEALED');

        if (iWasEliminatedThisRoundRef.current) {
          setIsEliminated(true);
          setEliminatedInRound(roundNumberRef.current);
          playSound('eliminatedYou', { volume: 0.9 });
        }
      }, REVEAL_PAUSE_MS);
    });

    socket.on('YOU_ARE_ELIMINATED', () => {
      iWasEliminatedThisRoundRef.current = true;
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

  const confirmVote = () => {
    if (!selectedTarget) return;
    socket.emit('CAST_VOTE', { targetId: selectedTarget });
  };

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

  if (!gameStarted) {
    return (
      <div className="player-container">
        <h1>You're in!</h1>
        <p>Waiting for the host to start the game...</p>
      </div>
    );
  }

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
            <div className="player-winner-name">{youWon ? `Winner: ${winnerName}` : winnerName}</div>
          ) : (
            <div className="player-reveal-pause">Drumroll...</div>
          )}
        </div>
        {isRevealed && isEliminated && !youWon && (
          <p className="player-subtle-note">You were eliminated in Round {eliminatedInRound}.</p>
        )}
      </div>
    );
  }

  if (revealPhase !== 'IDLE') {
    return (
      <div className="player-container">
        {isEliminated && (
          <div className="player-spectator-banner">Eliminated in Round {eliminatedInRound} - spectating</div>
        )}
        <h2 className="player-round-label">Round {roundNumber}</h2>
        {revealPhase === 'REVEALING' && <div className="player-reveal-pause">Tallying votes...</div>}
        {revealPhase === 'REVEALED' && revealedInfo && (
          revealedInfo.eliminatedId ? (
            revealedInfo.eliminatedId === myId ? (
              <>
                <div className="player-you-eliminated-title">YOU'RE OUT</div>
                <div className="player-eliminated-label">your journey ends here</div>
              </>
            ) : (
              <>
                <div className="player-eliminated-name">{revealedInfo.name}</div>
                <div className="player-eliminated-label">eliminated</div>
              </>
            )
          ) : (
            <div className="player-tie-message">It's a tie - no elimination</div>
          )
        )}
        <p className="player-remaining">Players remaining: {alivePlayers.length}</p>
      </div>
    );
  }

  if (finalTwo) {
    return (
      <div className="player-container">
        {isEliminated && (
          <div className="player-spectator-banner">Eliminated in Round {eliminatedInRound} - spectating</div>
        )}
        <h1>Final Two</h1>
        <p className="player-big-number">{finalTwoSecondsLeft}</p>
        <p>The game is deciding the winner...</p>
      </div>
    );
  }

  if (isEliminated) {
    return (
      <div className="player-container eliminated-screen">
        <h1>You have been eliminated</h1>
        <p>Eliminated in Round {eliminatedInRound}.</p>
        <p>Round {roundNumber} in progress - {alivePlayers.length} players remaining.</p>
        <p>Watch the rest of the game unfold here as it happens.</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="player-container">
        <h1>Vote locked in</h1>
        <p>Waiting for the round to end...</p>
      </div>
    );
  }

  // ---- Voting screen: 3x5 grid, no scroll, tap-to-select, centered confirm overlay ----
  const rows = Math.max(1, Math.ceil(alivePlayers.length / 3));
  const selectedPlayer = alivePlayers.find((p) => p.id === selectedTarget);

  return (
    <div className="vote-screen-container">
      <div className="vote-top-bar">Round {roundNumber} - Tap a player</div>

      <div
        className="vote-grid"
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {alivePlayers.map((p) => (
          <button
            key={p.id}
            className="vote-tile"
            style={{ '--tile-accent': getAvatarColor(p.name) }}
            onClick={() => setSelectedTarget(p.id)}
          >
            <Avatar name={p.name} size="fluid" />
            <span className="vote-tile-name">{p.name}{p.id === myId ? ' (You)' : ''}</span>
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <div className="vote-confirm-overlay" onClick={() => setSelectedTarget(null)}>
          <div className="vote-confirm-card" onClick={(e) => e.stopPropagation()}>
            <Avatar name={selectedPlayer.name} size="large" />
            <div className="vote-confirm-name">{selectedPlayer.name}</div>
            <button className="player-btn vote-confirm-btn" onClick={confirmVote}>
              Confirm Vote
            </button>
            <button className="vote-cancel-link" onClick={() => setSelectedTarget(null)}>
              Change selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerView;

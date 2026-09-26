import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { socket } from '../socket';
import { playSound, stopSound, playCountdownNumber } from '../sounds';
import { useRequireActiveAccount } from '../hooks/useRequireActiveAccount';
import { supabase } from '../supabaseClient';
import HostTopBar from './HostTopBar';
import Confetti from './Confetti';
import './HostView.css';

const REVEAL_PAUSE_MS = 3000;
const WINNER_REVEAL_PAUSE_MS = 3000;

function HostView() {
  const { loading: authLoading, allowed, reason } = useRequireActiveAccount();

  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [canStart, setCanStart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [roundNumber, setRoundNumber] = useState(0);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [votingEndsAt, setVotingEndsAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [viewPhase, setViewPhase] = useState('VOTING');
  const [revealedResult, setRevealedResult] = useState(null);
  const [gameEnded, setGameEnded] = useState(null);
  const [winnerPhase, setWinnerPhase] = useState(null);
  const [finalTwoPlayers, setFinalTwoPlayers] = useState(null);

  const revealTimeoutRef = useRef(null);
  const rosterRef = useRef({});
  const activeSoundRef = useRef(null);
  const prevSecondsRef = useRef(null);

  useEffect(() => {
    socket.on('ROOM_CREATED', ({ roomCode }) => {
      setRoomCode(roomCode);
      sessionStorage.setItem('hostRoomCode', roomCode);
    });
    socket.on('LOBBY_UPDATED', ({ players, canStart }) => {
      setPlayers(players);
      setCanStart(canStart);
      players.forEach((p) => { rosterRef.current[p.id] = p.name; });
    });
    socket.on('GAME_STARTED', ({ players }) => {
      setGameStarted(true);
      setAlivePlayers(players);
      players.forEach((p) => { rosterRef.current[p.id] = p.name; });
    });
    socket.on('ROUND_STARTED', ({ roundNumber, alivePlayers, votingEndsAt }) => {
      clearTimeout(revealTimeoutRef.current);
      stopSound(activeSoundRef.current);
      setRoundNumber(roundNumber);
      setAlivePlayers(alivePlayers);
      setVotingEndsAt(votingEndsAt);
      setViewPhase('VOTING');
      setRevealedResult(null);
      prevSecondsRef.current = null;
      alivePlayers.forEach((p) => { rosterRef.current[p.id] = p.name; });
    });
    socket.on('ROUND_RESULT', ({ eliminatedId, reason, remainingPlayers }) => {
      clearTimeout(revealTimeoutRef.current);
      stopSound(activeSoundRef.current);
      setViewPhase('REVEALING');
      activeSoundRef.current = playSound('drumroll', { volume: 0.7 });
      revealTimeoutRef.current = setTimeout(() => {
        stopSound(activeSoundRef.current);
        activeSoundRef.current = playSound(eliminatedId ? 'revealHit' : 'tie', { volume: 0.8 });
        setRevealedResult({ eliminatedId, reason, name: findName(eliminatedId) });
        setAlivePlayers(remainingPlayers);
        setViewPhase('REVEALED');
      }, REVEAL_PAUSE_MS);
    });
    socket.on('FINAL_TWO_REACHED', ({ players, decisionAt }) => {
      setFinalTwoPlayers(players);
      setVotingEndsAt(decisionAt);
      setViewPhase('FINAL_TWO');
    });
    socket.on('PLAYER_LEFT', ({ alivePlayers }) => {
      setAlivePlayers(alivePlayers);
    });
    socket.on('GAME_ENDED', ({ winnerId }) => {
      clearTimeout(revealTimeoutRef.current);
      stopSound(activeSoundRef.current);
      setGameEnded(winnerId);
      setWinnerPhase('CROWNING');
      sessionStorage.removeItem('hostRoomCode'); // game is over - don't auto-rejoin it later
      activeSoundRef.current = playSound('drumroll', { volume: 0.8 });
      revealTimeoutRef.current = setTimeout(() => {
        stopSound(activeSoundRef.current);
        activeSoundRef.current = playSound('winner', { volume: 0.9 });
        setWinnerPhase('REVEALED');
      }, WINNER_REVEAL_PAUSE_MS);
    });

    const savedRoomCode = sessionStorage.getItem('hostRoomCode');
    if (savedRoomCode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        socket.emit('HOST_REJOIN', { roomCode: savedRoomCode, accessToken: session?.access_token });
      });
    }

    return () => {
      socket.off('ROOM_CREATED');
      socket.off('LOBBY_UPDATED');
      socket.off('GAME_STARTED');
      socket.off('ROUND_STARTED');
      socket.off('ROUND_RESULT');
      socket.off('FINAL_TWO_REACHED');
      socket.off('PLAYER_LEFT');
      socket.off('GAME_ENDED');
      clearTimeout(revealTimeoutRef.current);
      stopSound(activeSoundRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!votingEndsAt || (viewPhase !== 'VOTING' && viewPhase !== 'FINAL_TWO')) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((votingEndsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining > 0 && remaining !== prevSecondsRef.current) {
        if (remaining > 10) {
          playSound('tick', { volume: 0.5 });
        } else {
          playCountdownNumber(remaining, { volume: 0.9 });
        }
      }
      prevSecondsRef.current = remaining;
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [votingEndsAt, viewPhase]);

  const findName = (id) => rosterRef.current[id] || null;

  const createGame = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    socket.emit('CREATE_GAME', { accessToken: session?.access_token });
  };
  const startGame = () => socket.emit('START_GAME');

  const startNewGame = () => {
    sessionStorage.removeItem('hostRoomCode');
    window.location.href = '/host';
  };

  if (authLoading) {
    return <div style={{ padding: 40, color: '#fff', background: '#0b0b0f', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!allowed) {
    window.location.href = reason === 'TRIAL_EXPIRED' ? '/upgrade' : '/login';
    return null;
  }

  if (!roomCode) {
    return (
      <div className="host-container">
        <HostTopBar />
        <h1>Host a Game</h1>
        <button className="host-start-btn" onClick={createGame}>Create Game</button>
      </div>
    );
  }

  if (gameEnded) {
    const winner = findName(gameEnded);
    const isRevealed = winnerPhase === 'REVEALED';
    return (
      <div className="host-container winner-glow">
        {isRevealed && <Confetti />}
        <div className="host-winner-block">
          <div className="host-round-label">{isRevealed ? 'Winner' : 'Crowning the winner...'}</div>
          {isRevealed ? (
            <div className="host-winner-name">{winner || 'Game Over'}</div>
          ) : (
            <div className="host-reveal-pause">Drumroll...</div>
          )}
        </div>
      </div>
    );
  }

  if (gameStarted) {
    const isLow = secondsLeft <= 10;
    return (
      <div className={`host-container ${viewPhase === 'VOTING' && isLow ? 'low-time' : ''}`}>
        <div className="host-round-label">Round {roundNumber}</div>

        {viewPhase === 'VOTING' && (
          <>
            <div className={`host-timer ${isLow ? 'low' : ''}`}>{secondsLeft}</div>
            <div className="host-remaining">Players remaining: {alivePlayers.length}</div>
            <ul className="host-player-grid">
              {alivePlayers.map((p) => <li key={p.id}>{p.name}</li>)}
            </ul>
          </>
        )}

        {viewPhase === 'REVEALING' && (
          <div className="host-reveal-pause">Tallying votes...</div>
        )}

        {viewPhase === 'REVEALED' && revealedResult && (
          <>
            {revealedResult.eliminatedId ? (
              <>
                <div className="host-eliminated-name">{revealedResult.name}</div>
                <div className="host-eliminated-label">eliminated</div>
              </>
            ) : (
              <div className="host-tie-message">It's a tie - no elimination</div>
            )}
            <div className="host-remaining" style={{ marginTop: '1.5rem' }}>
              Players remaining: {alivePlayers.length}
            </div>
          </>
        )}

        {viewPhase === 'FINAL_TWO' && finalTwoPlayers && (
          <>
            <div className="host-tie-message">FINAL TWO</div>
            <div className={`host-timer ${secondsLeft <= 10 ? 'low' : ''}`} style={{ marginTop: '0.5rem' }}>
              {secondsLeft}
            </div>
            <ul className="host-player-grid" style={{ marginTop: '1rem' }}>
              {finalTwoPlayers.map((p) => <li key={p.id}>{p.name}</li>)}
            </ul>
            <div className="host-remaining" style={{ marginTop: '1.5rem' }}>
              The final decision is coming...
            </div>
          </>
        )}
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/player?code=${roomCode}`;
  return (
    <div className="host-container">
      <HostTopBar />
      <div className="host-room-code">{roomCode}</div>
      <div className="host-qr-wrap"><QRCodeSVG value={joinUrl} size={180} /></div>
      <div className="host-remaining">Players joined: {players.length} / 15 (need at least 10)</div>
      <ul className="host-lobby-list">
        {players.map((p) => <li key={p.id}>{p.name}</li>)}
      </ul>
      <button className="host-start-btn" onClick={startGame} disabled={!canStart}>Start Game</button>
      <button
        onClick={startNewGame}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
      >
        Abandon this room and start a new game
      </button>
    </div>
  );
}

export default HostView;

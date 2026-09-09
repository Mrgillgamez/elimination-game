import HostView from './components/HostView';
import PlayerView from './components/PlayerView';

function App() {
  const path = window.location.pathname;

  if (path === '/host') {
    return <HostView />;
  }

  if (path === '/player') {
    return <PlayerView />;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Elimination Game</h1>
      <p>Go to /host or /player to continue.</p>
    </div>
  );
}

export default App;
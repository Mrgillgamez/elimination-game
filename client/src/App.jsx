import LandingPage from './components/LandingPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import UpgradePage from './components/UpgradePage';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';

function App() {
  const path = window.location.pathname;

  if (path === '/') return <LandingPage />;
  if (path === '/terms') return <TermsPage />;
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/signup') return <SignupPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/upgrade') return <UpgradePage />;
  if (path === '/host') return <HostView />;
  if (path === '/player') return <PlayerView />;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#fff', background: '#0b0b0f', minHeight: '100vh' }}>
      <h1>Page not found</h1>
      <a href="/" style={{ color: '#f5c542' }}>Go home</a>
    </div>
  );
}

export default App;

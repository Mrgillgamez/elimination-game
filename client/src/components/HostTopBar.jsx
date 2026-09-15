import { supabase } from '../supabaseClient';
import './HostTopBar.css';

function HostTopBar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="host-topbar">
      <div className="host-topbar-links">
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </div>
      <button className="host-topbar-logout" onClick={handleLogout}>Log out</button>
    </div>
  );
}

export default HostTopBar;

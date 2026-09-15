import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './AuthPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.href = '/host';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="auth-subnote">Welcome back.</p>
        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-switch">No account yet? <a href="/signup">Start your free trial</a></p>
      </div>
    </div>
  );
}

export default LoginPage;

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import CountrySelector from './CountrySelector';
import './AuthPage.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Show the country popup before sending them to /host.
    setNewUserId(data.user.id);
  };

  if (newUserId) {
    return (
      <CountrySelector
        userId={newUserId}
        onDone={() => { window.location.href = '/host'; }}
      />
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Start your free trial</h1>
        <p className="auth-subnote">3 days, full access, no card needed.</p>
        <form onSubmit={handleSignup}>
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Start Free Trial'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-switch">Already have an account? <a href="/login">Log in</a></p>
      </div>
    </div>
  );
}

export default SignupPage;

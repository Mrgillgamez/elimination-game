import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './LandingPage.css';

function LandingPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        window.location.href = '/host';
        return;
      }
      setChecking(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (checking) {
    return <div style={{ minHeight: '100vh', background: 'var(--void)' }} />;
  }

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <h1 className="landing-title">Play Minus One</h1>
        <p className="landing-tagline">
          The suspenseful, real-time party game for 10-15 players. One host screen.
          Everyone else on their phone. Someone gets voted out every round.
        </p>
        <a href="/signup" className="landing-cta">Start your 3-day free trial</a>
        <p className="landing-subnote">No credit card required.</p>
      </div>
      <footer className="landing-footer">
        <a href="/login">Log in</a>
        <span className="landing-footer-divider">.</span>
        <a href="/terms">Terms of Service</a>
        <span className="landing-footer-divider">.</span>
        <a href="/privacy">Privacy Policy</a>
        <span className="landing-footer-divider">.</span>
        <a href="/refund">Refund Policy</a>
        <span className="landing-footer-divider">.</span>
        <a href="mailto:iamsharann1@gmail.com">Contact</a>
      </footer>
    </div>
  );
}

export default LandingPage;

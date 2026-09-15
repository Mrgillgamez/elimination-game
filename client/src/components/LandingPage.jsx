import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-hero">
        <p className="landing-kicker">The Elimination Game</p>

        <div className="landing-countdown">
          <span className="landing-countdown-number">60</span>
          <span className="landing-countdown-label">seconds per round</span>
        </div>

        <p className="landing-tagline">
          10 to 15 players. One host screen. Everyone else on their phone.
          Someone gets voted out every round — until only one remains.
        </p>

        <a href="/signup" className="landing-cta">Start your 3-day free trial</a>
        <p className="landing-subnote">No credit card required.</p>
      </div>

      <footer className="landing-footer">
        <a href="/login">Log in</a>
        <span className="landing-footer-divider">·</span>
        <a href="/terms">Terms of Service</a>
        <span className="landing-footer-divider">·</span>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </div>
  );
}

export default LandingPage;

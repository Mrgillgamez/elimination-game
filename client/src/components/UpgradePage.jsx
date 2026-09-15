import './AuthPage.css';
import './UpgradePage.css';

function UpgradePage() {
  const handleUpgradeClick = () => {
    // Placeholder until Paddle is approved (Stage A7).
    // For now, this just tells the host what to do manually.
    alert('Checkout is being finalized. Contact support to upgrade manually for now.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card upgrade-card">
        <h1>Your free trial has ended</h1>
        <p className="auth-subnote">
          Upgrade to keep hosting The Elimination Game.
        </p>

        <div className="upgrade-price-box">
          <span className="upgrade-price">$19</span>
          <span className="upgrade-price-period">/ month</span>
        </div>

        <ul className="upgrade-feature-list">
          <li>Unlimited games hosted</li>
          <li>Up to 15 players per game</li>
          <li>All reveal drama, sounds, and effects</li>
        </ul>

        <button className="auth-btn" onClick={handleUpgradeClick}>
          Upgrade Now
        </button>

        <p className="auth-switch">
          Questions? <a href="mailto:iamsharann1@gmail.com">Contact support</a>
        </p>
      </div>
    </div>
  );
}

export default UpgradePage;

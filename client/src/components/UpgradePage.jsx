import { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { supabase } from '../supabaseClient';
import { TIERS } from '../tiers';
import './AuthPage.css';
import './UpgradePage.css';

function UpgradePage() {
  const [paddle, setPaddle] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkoutTier, setCheckoutTier] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      }
    });

    initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENV,
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
    }).then((paddleInstance) => setPaddle(paddleInstance));
  }, []);

  const handleUpgradeClick = (tier) => {
    if (!paddle || !userId) return;
    setCheckoutTier(tier.key);
    paddle.Checkout.open({
      items: [{ priceId: tier.priceId, quantity: 1 }],
      customer: { email: userEmail },
      customData: { supabase_user_id: userId, tier: tier.key },
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card upgrade-card upgrade-card-wide">
        <h1>Choose your plan</h1>
        <p className="auth-subnote">
          Pick the plan that fits how often you host.
        </p>

        <div className="upgrade-tier-grid">
          {TIERS.map((tier) => (
            <div key={tier.key} className="upgrade-tier-card">
              <div className="upgrade-tier-label">{tier.label}</div>
              <div className="upgrade-tier-price-box">
                <span className="upgrade-tier-price">${tier.priceUsd}</span>
                <span className="upgrade-tier-period">/ month</span>
              </div>
              <div className="upgrade-tier-limit">
                {tier.gameLimit === null ? 'Unlimited games' : `${tier.gameLimit} games / month`}
              </div>
              <button
                className="auth-btn"
                onClick={() => handleUpgradeClick(tier)}
                disabled={!paddle}
              >
                {!paddle ? 'Loading...' : checkoutTier === tier.key ? 'Opening checkout...' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        <ul className="upgrade-feature-list">
          <li>Up to 15 players per game</li>
          <li>All reveal drama, sounds, and effects</li>
          <li>Cancel anytime</li>
        </ul>

        <p className="auth-switch">
          Questions? <a href="mailto:iamsharann1@gmail.com">Contact support</a>
        </p>
      </div>
    </div>
  );
}

export default UpgradePage;

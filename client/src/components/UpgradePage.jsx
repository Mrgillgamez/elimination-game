import { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { supabase } from '../supabaseClient';
import { TIERS, TOPUPS } from '../tiers';
import './AuthPage.css';
import './UpgradePage.css';

function UpgradePage() {
  const [paddle, setPaddle] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pendingKey, setPendingKey] = useState(null);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [currentTierKey, setCurrentTierKey] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserEmail(session.user.email);
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_status, plan_tier')
        .eq('id', session.user.id)
        .single();

      if (profile?.plan_status === 'paid') setCurrentTierKey(profile.plan_tier);
    });

    initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENV,
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          setActivating(true);
          setTimeout(() => { window.location.href = '/host'; }, 3000);
        }
      },
    }).then((paddleInstance) => setPaddle(paddleInstance));
  }, []);

  const openCheckout = (key, priceId, extraCustomData) => {
    if (!paddle || !userId) return;
    setPendingKey(key);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: userEmail },
      customData: { supabase_user_id: userId, ...extraCustomData },
    });
  };

  const currentTier = TIERS.find((t) => t.key === currentTierKey);
  const showTopups = currentTierKey && currentTier?.gameLimit !== null;

  return (
    <div className="auth-container">
      <div className="auth-card upgrade-card upgrade-card-wide">
        <h1>Choose your plan</h1>
        <p className="auth-subnote">Pick the plan that fits how often you host.</p>

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
                onClick={() => openCheckout(tier.key, tier.priceId, { tier: tier.key })}
                disabled={!paddle || activating}
              >
                {!paddle ? 'Loading...' : pendingKey === tier.key ? 'Opening checkout...' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {showTopups && (
          <>
            <h2 className="upgrade-topup-heading">Running low this cycle?</h2>
            <p className="auth-subnote">Add more games without changing your plan.</p>
            <div className="upgrade-tier-grid">
              {TOPUPS.map((topup) => (
                <div key={topup.key} className="upgrade-tier-card">
                  <div className="upgrade-tier-label">{topup.label}</div>
                  <div className="upgrade-tier-price-box">
                    <span className="upgrade-tier-price">${topup.priceUsd}</span>
                  </div>
                  <div className="upgrade-tier-limit">one-time, this cycle only</div>
                  <button
                    className="auth-btn"
                    onClick={() => openCheckout(topup.key, topup.priceId, { topup: topup.key })}
                    disabled={!paddle || activating}
                  >
                    {!paddle ? 'Loading...' : pendingKey === topup.key ? 'Opening checkout...' : 'Add Games'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activating && <p className="auth-subnote">Payment received. Redirecting you back...</p>}
        {error && <p className="auth-error">{error}</p>}

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

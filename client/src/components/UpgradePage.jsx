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
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setProfileLoaded(true);
        return;
      }
      setUserEmail(session.user.email);
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_status, plan_tier')
        .eq('id', session.user.id)
        .single();

      if (profile?.plan_status === 'paid') setCurrentTierKey(profile.plan_tier);
      setProfileLoaded(true);
    });

    initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENV,
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          setActivating(true);
          setTimeout(() => { window.location.href = '/host'; }, 3000);
        }
        if (event.name === 'checkout.closed' || event.name === 'checkout.error') {
          setPendingKey(null);
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
  const isPaid = !!currentTier;
  const isUnlimited = isPaid && currentTier.gameLimit === null;
  const unlimitedTier = TIERS.find((t) => t.key === 'unlimited');

  const footer = (
    <>
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
    </>
  );

  if (!profileLoaded) {
    return (
      <div className="auth-container">
        <div className="auth-card upgrade-card upgrade-card-wide">
          <p className="auth-subnote">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (isUnlimited) {
    return (
      <div className="auth-container">
        <div className="auth-card upgrade-card upgrade-card-wide">
          <h1>You're on Unlimited</h1>
          <p className="auth-subnote">Host as many games as you like. Nothing more to buy.</p>
          <button
            className="auth-btn"
            style={{ maxWidth: 320, margin: '0 auto' }}
            onClick={() => { window.location.href = '/host'; }}
          >
            Back to hosting
          </button>
          {footer}
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="auth-container">
        <div className="auth-card upgrade-card upgrade-card-wide">
          <h1>Need more games?</h1>
          <p className="auth-subnote">
            You're on the {currentTier.label} plan. Add games for this cycle without changing your plan.
          </p>

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

          <h2 className="upgrade-topup-heading">Ready to go all in?</h2>
          <p className="auth-subnote">
            Unlimited replaces your current plan. You'll be charged for Unlimited today, and your old plan stops at the end of the period you already paid for.
          </p>
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <div className="upgrade-tier-card">
              <div className="upgrade-tier-label">{unlimitedTier.label}</div>
              <div className="upgrade-tier-price-box">
                <span className="upgrade-tier-price">${unlimitedTier.priceUsd}</span>
                <span className="upgrade-tier-period">/ month</span>
              </div>
              <div className="upgrade-tier-limit">Unlimited games</div>
              <button
                className="auth-btn"
                onClick={() => openCheckout(unlimitedTier.key, unlimitedTier.priceId, { tier: unlimitedTier.key })}
                disabled={!paddle || activating}
              >
                {!paddle ? 'Loading...' : pendingKey === unlimitedTier.key ? 'Opening checkout...' : 'Upgrade to Unlimited'}
              </button>
            </div>
          </div>

          {footer}
        </div>
      </div>
    );
  }

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

        {footer}
      </div>
    </div>
  );
}

export default UpgradePage;

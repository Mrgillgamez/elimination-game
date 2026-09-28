import { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { supabase } from '../supabaseClient';
import { TIERS } from '../tiers';
import './AuthPage.css';
import './UpgradePage.css';

// After a successful payment, wait for the webhook to mark the account as paid,
// then send the host to the game. Checks every 1.5s, gives up after 45s.
async function waitForPaidThenRedirect(onTimeout) {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) {
    onTimeout();
    return;
  }
  const startedAt = Date.now();
  const timer = setInterval(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('plan_status')
      .eq('id', uid)
      .single();
    if (data?.plan_status === 'paid') {
      clearInterval(timer);
      window.location.href = '/host';
    } else if (Date.now() - startedAt > 45000) {
      clearInterval(timer);
      onTimeout();
    }
  }, 1500);
}

function UpgradePage() {
  const [paddle, setPaddle] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkoutTier, setCheckoutTier] = useState(null);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

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
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          setActivating(true);
          waitForPaidThenRedirect(() => {
            setActivating(false);
            setError('Payment received, but activation is taking longer than usual. Refresh this page in a minute, or contact support.');
          });
        }
      },
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
                disabled={!paddle || activating}
              >
                {!paddle ? 'Loading...' : checkoutTier === tier.key ? 'Opening checkout...' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        {activating && (
          <p className="auth-subnote">Payment received. Activating your plan...</p>
        )}
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

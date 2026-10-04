import { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { supabase } from '../supabaseClient';
import { TIERS, TOPUPS } from '../tiers';
import { formatPrice } from '../pricing';
import './AuthPage.css';
import './UpgradePage.css';

const PAYG_GAME_PRICE_ID = 'pri_01m40ehjr1tppk1kw93xh6bf3h';

function UpgradePage() {
  const [paddle, setPaddle] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pendingKey, setPendingKey] = useState(null);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [currentTierKey, setCurrentTierKey] = useState(null);
  const [country, setCountry] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [mode, setMode] = useState('monthly');
  const [livePrices, setLivePrices] = useState({});

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
        .select('plan_status, plan_tier, country')
        .eq('id', session.user.id)
        .single();

      if (profile?.plan_status === 'paid') setCurrentTierKey(profile.plan_tier);
      if (profile?.country) setCountry(profile.country);
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

  useEffect(() => {
    if (!paddle) return;
    const items = [...TIERS, ...TOPUPS]
      .filter((i) => !i.usageBased)
      .map((i) => ({ priceId: i.priceId, quantity: 1 }))
      .concat([{ priceId: PAYG_GAME_PRICE_ID, quantity: 1 }]);
    paddle.PricePreview({ items })
      .then((result) => {
        console.log('PricePreview result', result);
        const map = {};
        result.data.details.lineItems.forEach((li) => {
          map[li.price.id] = li.formattedTotals.total;
        });
        setLivePrices(map);
      })
      .catch((err) => console.error('PricePreview failed', err));
  }, [paddle]);

  const priceText = (item) => livePrices[item.priceId] || formatPrice(item.key, country);

  const openCheckout = (key, priceId, extraCustomData) => {
    if (!userId) {
      window.location.href = '/signup';
      return;
    }
    if (!paddle) return;
    setPendingKey(key);
    const customer = { email: userEmail };
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer,
      customData: { supabase_user_id: userId, ...extraCustomData },
    });
  };

  const currentTier = TIERS.find((t) => t.key === currentTierKey);
  const isPaid = !!currentTier;
  const isPayg = isPaid && !!currentTier.usageBased;
  const isUnlimited = isPaid && currentTier.key === 'unlimited';
  const unlimitedTier = TIERS.find((t) => t.key === 'unlimited');
  const paygTier = TIERS.find((t) => t.key === 'payg');
  const monthlyTiers = TIERS.filter((t) => !t.usageBased);

  const footer = (
    <>
      {activating && <p className="auth-subnote">Payment received. Redirecting you back...</p>}
      {error && <p className="auth-error">{error}</p>}

      <ul className="upgrade-feature-list">
        <li>Up to 15 players per game</li>
        <li>All reveal drama, sounds, and effects</li>
        <li>Cancel monthly plans anytime</li>
        <li>Pay as you go: billed once a month, only for games that started</li>
      </ul>

      <p className="upgrade-secure-note">&#128274; Secure checkout by Paddle. We never see your card.</p>

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

  if (isPayg) {
    return (
      <div className="auth-container">
        <div className="auth-card upgrade-card upgrade-card-wide">
          <h1>You're on Pay as you go</h1>
          <p className="auth-subnote">
            Host as many games as you like. You pay $2 per game that actually starts, charged once a month.
          </p>
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
                  <span className="upgrade-tier-price">{priceText(topup)}</span>
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
                <span className="upgrade-tier-price">{priceText(unlimitedTier)}</span>
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

        <div className="upgrade-toggle">
          <button
            className={mode === 'monthly' ? 'upgrade-toggle-btn active' : 'upgrade-toggle-btn'}
            onClick={() => setMode('monthly')}
          >
            Monthly
          </button>
          <button
            className={mode === 'payg' ? 'upgrade-toggle-btn active' : 'upgrade-toggle-btn'}
            onClick={() => setMode('payg')}
          >
            Pay as you go
          </button>
        </div>

        {mode === 'monthly' && (
          <div className="upgrade-tier-grid">
            {monthlyTiers.map((tier) => (
              <div key={tier.key} className="upgrade-tier-card">
                <div className="upgrade-tier-label">{tier.label}</div>
                <div className="upgrade-tier-price-box">
                  <span className="upgrade-tier-price">{priceText(tier)}</span>
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
        )}

        {mode === 'payg' && (
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <div className="upgrade-tier-card upgrade-tier-card-single">
              <div className="upgrade-tier-label">{paygTier.label}</div>
              <div className="upgrade-tier-price-box">
                <span className="upgrade-tier-price">{livePrices[PAYG_GAME_PRICE_ID] || `$${paygTier.perGameUsd}`}</span>
                <span className="upgrade-tier-period">/ game</span>
              </div>
              <div className="upgrade-tier-limit">No monthly fee</div>
              <p className="upgrade-payg-note">
                You pay $0 today. We save your card and charge once a month, only for games that actually started.
              </p>
              <button
                className="auth-btn"
                onClick={() => openCheckout(paygTier.key, paygTier.priceId, { tier: paygTier.key })}
                disabled={!paddle || activating}
              >
                {!paddle ? 'Loading...' : pendingKey === paygTier.key ? 'Opening checkout...' : 'Start Pay as you go'}
              </button>
            </div>
          </div>
        )}

        {footer}
      </div>
    </div>
  );
}

export default UpgradePage;
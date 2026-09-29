import './UpgradePopup.css';

const COPY = {
  TRIAL_EXPIRED: {
    title: "You're on a roll!",
    subnote: 'Your free trial has ended. Upgrade to keep the elimination nights going.',
  },
  QUOTA_EXCEEDED: {
    title: "You've been busy!",
    subnote: "You've used up your games for this cycle. Upgrade for more headroom.",
  },
};

// Shown when a host needs to upgrade before creating another game.
// Reuses the same overlay pattern as CountrySelector - positive framing, not an error.
function UpgradePopup({ reason, onClose }) {
  const copy = COPY[reason] || COPY.TRIAL_EXPIRED;

  return (
    <div className="upgrade-popup-overlay">
      <div className="upgrade-popup-card">
        <h1>{copy.title}</h1>
        <p className="upgrade-popup-subnote">{copy.subnote}</p>

        <a href="/upgrade" className="upgrade-popup-btn">
          Upgrade Plan
        </a>
        <button className="upgrade-popup-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default UpgradePopup;

import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: [DATE]</p>

        <p>
          This is a starting template, not legal advice. Review and customize it,
          ideally with a qualified professional, before relying on it.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you create an account, we collect your email address. When you host
          or join a game, we temporarily process the display name you choose and
          your gameplay actions, such as votes, to run the game. Vote data is never
          stored in a way that identifies who voted for whom.
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          We use your email to manage your account, trial period, and subscription.
          Gameplay data exists only for the duration of a game session and is not
          retained afterward.
        </p>

        <h2>3. Payment Information</h2>
        <p>
          Subscription payments are handled entirely by our payment provider. We do
          not store your card details ourselves.
        </p>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal information. We share data only with service
          providers necessary to operate the Service, such as our hosting, database,
          and payment providers.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your account
          data at any time by contacting us.
        </p>

        <h2>6. Contact</h2>
        <p>Questions about this policy can be sent to [YOUR CONTACT EMAIL].</p>
      </div>
    </div>
  );
}

export default PrivacyPage;

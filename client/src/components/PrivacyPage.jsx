import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: September 14, 2026</p>

        <p>
          This Privacy Policy explains how Sharandeep Singh ("we," "us"),
          operating The Elimination Game, collects, uses, and protects
          information when you use the Service.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you create a host account, we collect your email address and a
          password, the latter of which is securely handled by our
          authentication provider and never visible to us in plain text.
        </p>
        <p>
          When you host or join a game, we temporarily process the display
          name you choose and gameplay actions, such as votes, solely to run
          that game session. This data exists only in memory for the duration
          of the game and is not permanently stored or retained afterward.
        </p>
        <p>
          Votes are never stored or exposed in any form that reveals which
          player voted for whom, during or after a game. This is a permanent
          feature of the Service.
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          We use your email address to manage your account, authenticate your
          login, track your free trial period, and manage your subscription
          status. We do not use your information for advertising, and we do
          not sell it.
        </p>

        <h2>3. Payment Information</h2>
        <p>
          Subscription payments are handled entirely by Paddle.com Market
          Limited ("Paddle"), who acts as the Merchant of Record for all
          transactions. We do not receive, process, or store your card
          details. Any payment information you provide is subject to Paddle's
          own privacy policy.
        </p>

        <h2>4. Cookies and Local Storage</h2>
        <p>
          The Service uses browser local/session storage to keep you logged
          in and to let a host screen reconnect to an in-progress game after
          an accidental refresh. We do not use tracking or advertising
          cookies.
        </p>

        <h2>5. Third-Party Service Providers</h2>
        <p>
          We rely on the following third-party providers to operate the
          Service, each of which processes limited data on our behalf:
        </p>
        <ul style={{ color: '#ccc', lineHeight: 1.8 }}>
          <li>Supabase - account authentication and account data storage</li>
          <li>Render - application hosting</li>
          <li>Paddle - payment processing and billing</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          Account data (your email and subscription status) is retained for
          as long as your account exists. You may request deletion of your
          account and associated data at any time, per Section 8 below.
          Gameplay data is never retained beyond the live duration of a game
          session.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We rely on industry-standard security practices provided by our
          infrastructure providers, including encrypted connections and
          access-controlled databases. No method of transmission or storage
          is completely secure, and we cannot guarantee absolute security.
        </p>

        <h2>8. Your Rights</h2>
        <p>
          Depending on applicable law, you may have the right to access,
          correct, or request deletion of your personal data. To exercise
          these rights, contact us using the details below.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          The Service is intended for host accounts held by individuals aged
          18 or older. We do not knowingly collect account information from
          children.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material
          changes will be reflected by updating the "Last updated" date
          above.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy can be sent to{' '}
          <a href="mailto:iamsharann1@gmail.com">iamsharann1@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;

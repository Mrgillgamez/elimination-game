import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: October 6, 2026</p>

        <p>
          This Privacy Policy explains how Love Preet ("we," "us"), operating Play Minus One, collects, uses, and protects information when you use
          the Service.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          Host account information: your email address and a password. The
          password is handled by our authentication provider and is never visible
          to us in plain text. We also store the country you choose at signup,
          your trial dates, and your plan and subscription status.
        </p>
        <p>
          Usage records: for each game a host creates, we store the host's account
          ID, the room code, whether the game started, and the time. We use this
          to enforce game limits and to bill pay-as-you-go accounts.
        </p>
        <p>
          Live game data: the display names players choose and their game actions
          are processed in server memory only to run the game. They are not
          permanently stored and are gone when the game session ends.
        </p>
        <p>
          Votes are never stored or exposed in any form that reveals which player
          voted for whom, during or after a game. This is a permanent feature of
          the Service.
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          We use your information to run your account, sign you in, track your
          trial, apply game limits, manage your subscription, bill pay-as-you-go
          usage, and respond to support requests. We do not use your information
          for advertising, and we do not sell it.
        </p>

        <h2>3. Payment Information</h2>
        <p>
          Payments are handled entirely by Paddle.com Market Limited ("Paddle"),
          the Merchant of Record for all transactions. We do not receive, process,
          or store your card details. We store a Paddle subscription reference so
          we can manage your plan. Paddle's own privacy policy applies to the
          payment information you give Paddle.
        </p>

        <h2>4. Cookies and Local Storage</h2>
        <p>
          The Service uses browser local and session storage to keep you signed in
          and to let a host screen reconnect to a game after an accidental
          refresh. We do not use tracking or advertising cookies. Paddle may set
          its own cookies during checkout.
        </p>

        <h2>5. Service Providers</h2>
        <p>
          We rely on the following providers, each of which processes limited
          data on our behalf:
        </p>
        <ul style={{ color: '#ccc', lineHeight: 1.8 }}>
          <li>Supabase: account sign-in and account data storage</li>
          <li>Render: application hosting</li>
          <li>Paddle: payment processing, tax, and billing</li>
        </ul>
        <p>
          These providers may process data in countries other than your own.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          Account data and usage records are kept for as long as your account
          exists. We may keep limited billing records as long as needed to meet
          legal and tax obligations. Live game data is never kept beyond the game
          session.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We rely on security practices provided by our infrastructure providers,
          including encrypted connections and access-controlled databases. No
          method of transmission or storage is completely secure, and we cannot
          guarantee absolute security.
        </p>

        <h2>8. Your Rights</h2>
        <p>
          Depending on where you live, you may have the right to access, correct,
          or delete your personal data, or to object to or restrict how we use it.
          To use these rights, or to ask us to delete your account, email us at
          the address below. We will reply within a reasonable time.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          Host accounts are for people aged 18 or older. We do not knowingly
          collect account information from children. Players do not create
          accounts, and we collect only the display name they type.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will update the
          "Last updated" date above when we make changes.
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
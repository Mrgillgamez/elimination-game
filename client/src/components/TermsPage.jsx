import './LegalPage.css';

function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: [DATE]</p>

        <p>
          This is a starting template, not legal advice. Review and customize it,
          ideally with a qualified professional, before relying on it.
        </p>

        <h2>1. Overview</h2>
        <p>
          These Terms of Service govern your access to and use of The Elimination
          Game (the "Service"), operated by [YOUR NAME / BUSINESS NAME]. By creating
          an account or using the Service, you agree to these Terms.
        </p>

        <h2>2. Accounts and Trial</h2>
        <p>
          New accounts receive a 3-day free trial with no payment required. After
          the trial ends, continued access to hosting features requires an active
          paid subscription.
        </p>

        <h2>3. Subscription and Billing</h2>
        <p>
          Paid subscriptions are billed monthly at the price shown at checkout.
          Payments are processed by our payment provider and renew automatically
          until cancelled.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>
          You agree not to misuse the Service, attempt to disrupt it, or use it for
          any unlawful purpose.
        </p>

        <h2>5. Termination</h2>
        <p>We may suspend or terminate access for violation of these Terms.</p>

        <h2>6. Disclaimer</h2>
        <p>The Service is provided "as is" without warranties of any kind.</p>

        <h2>7. Contact</h2>
        <p>Questions about these Terms can be sent to [YOUR CONTACT EMAIL].</p>
      </div>
    </div>
  );
}

export default TermsPage;

import './LegalPage.css';

function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: September 14, 2026</p>

        <p>
          These Terms of Service ("Terms") are a legal agreement between you and
          Sharandeep Singh, operating as an individual ("we," "us," "the Service"),
          governing your access to and use of The Elimination Game. By creating an
          account or using the Service, you agree to be bound by these Terms. If
          you do not agree, do not use the Service.
        </p>

        <h2>1. What the Service Is</h2>
        <p>
          The Elimination Game is a real-time, browser-based party game for
          in-person groups of 10 to 15 players plus one host. One person hosts a
          game from a shared screen; players join and participate from their own
          devices using a room code.
        </p>

        <h2>2. Accounts</h2>
        <p>
          Hosting a game requires an account, created with an email address and
          password. You are responsible for keeping your login credentials
          secure and for all activity that happens under your account. Players
          joining a game as participants do not need an account.
        </p>
        <p>
          You must be at least 18 years old, or the age of legal majority in
          your jurisdiction, to create a host account.
        </p>

        <h2>3. Free Trial</h2>
        <p>
          New accounts receive a 3-day free trial with full access to hosting
          features and no payment method required. At the end of the trial,
          hosting features are locked until you subscribe.
        </p>

        <h2>4. Subscription and Billing</h2>
        <p>
          Continued access to hosting features after the trial requires a paid
          subscription, currently priced at $19 per month, billed on a
          recurring monthly basis until cancelled.
        </p>
        <p>
          Payments are processed by Paddle.com Market Limited ("Paddle"), who
          acts as the Merchant of Record for all purchases. This means Paddle,
          not us directly, is the seller of record on your billing statement,
          handles applicable taxes on the transaction, and is the party you are
          contracting with for the payment itself. Paddle's own terms and
          policies apply to the payment transaction in addition to these Terms.
        </p>

        <h2>5. Cancellation and Refunds</h2>
        <p>
          You may cancel your subscription at any time. Cancellation stops
          future billing but does not refund any amount already charged for
          the current billing period; you retain access until the end of that
          period. All sales are final and non-refundable, except where
          required by applicable law or by Paddle's own buyer policies as
          Merchant of Record.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>
          You agree not to: use the Service for any unlawful purpose; attempt
          to disrupt, overload, or gain unauthorized access to the Service or
          its infrastructure; harass or abuse other players; or attempt to
          circumvent the trial or subscription system.
        </p>

        <h2>7. Gameplay Data and Vote Anonymity</h2>
        <p>
          Individual votes cast during a game are never stored or exposed in
          any form that reveals which player voted for whom. This is a
          permanent design commitment of the Service, not a configurable
          setting.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The Service, including its software, design, and branding, is owned
          by Sharandeep Singh. You are granted a limited, non-exclusive,
          non-transferable license to use the Service for its intended
          purpose. You may not copy, modify, or redistribute the Service
          itself.
        </p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available," without
          warranties of any kind, whether express or implied, including
          implied warranties of merchantability, fitness for a particular
          purpose, or non-infringement. We do not guarantee the Service will
          be uninterrupted, error-free, or available at all times.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Sharandeep Singh shall not be
          liable for any indirect, incidental, special, or consequential
          damages arising from your use of, or inability to use, the Service.
          Our total liability for any claim arising from these Terms or the
          Service is limited to the amount you paid us in the 3 months
          preceding the claim.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your account at our discretion if you
          violate these Terms. You may stop using the Service and cancel your
          subscription at any time.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India, without regard to its
          conflict of law principles. Any disputes arising from these Terms or
          the Service will be subject to the exclusive jurisdiction of the
          courts of India.
        </p>

        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes take effect constitutes acceptance of the
          revised Terms. Material changes will be reflected by updating the
          "Last updated" date above.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions about these Terms can be sent to{' '}
          <a href="mailto:iamsharann1@gmail.com">iamsharann1@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;

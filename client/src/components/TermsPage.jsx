import './LegalPage.css';

function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: October 5, 2026</p>

        <p>
          These Terms of Service ("Terms") are a legal agreement between you and
          Love Preet, operating as an individual ("we," "us"), governing your
          access to and use of The Elimination Game (the "Service"). By creating
          an account or using the Service, you agree to these Terms. If you do
          not agree, do not use the Service.
        </p>

        <h2>1. What the Service Is</h2>
        <p>
          The Elimination Game is a real-time, browser-based party game for
          in-person groups of 10 to 15 players plus one host. The host runs a
          game from a shared screen. Players join from their own devices using a
          room code.
        </p>

        <h2>2. Accounts</h2>
        <p>
          Hosting a game requires an account created with an email address and
          password. You are responsible for keeping your login credentials
          secure and for all activity under your account. Players who join a game
          do not need an account.
        </p>
        <p>
          You must be at least 18 years old, or the age of legal majority in
          your country, to create a host account.
        </p>

        <h2>3. Free Trial</h2>
        <p>
          New accounts receive a 3-day free trial with full hosting access. No
          payment method is required. When the trial ends, hosting is locked
          until you choose a plan.
        </p>

        <h2>4. Plans and Pricing</h2>
        <p>
          After the trial, hosting requires one of the following. Current prices
          and game limits are always shown on our upgrade page before you pay.
        </p>
        <ul style={{ color: '#ccc', lineHeight: 1.8 }}>
          <li>
            Monthly plans (Starter, Standard, Unlimited): a recurring monthly
            subscription with a monthly game limit, or unlimited games on the
            Unlimited plan. A game counts toward your limit when it is started.
            Your limit resets every 30 days from the date your plan began.
          </li>
          <li>
            Game top-ups: one-time purchases that add games for your current
            30-day cycle only. Unused top-up games do not carry over.
          </li>
          <li>
            Pay as you go: no monthly fee. You are charged a fixed price per
            game that actually starts, billed once a month in US dollars to the
            card you saved.
          </li>
        </ul>
        <p>
          Prices may be shown in your local currency for monthly plans and
          top-ups. Applicable taxes are calculated and collected at checkout.
        </p>

        <h2>5. Payments and Paddle</h2>
        <p>
          Payments are processed by Paddle.com Market Limited ("Paddle"), which
          acts as the Merchant of Record for all purchases. Paddle, not us, is the
          seller of record on your billing statement, handles applicable taxes,
          and is the party you contract with for the payment. Paddle's own terms
          and policies apply to the payment in addition to these Terms. We never
          see or store your card details.
        </p>

        <h2>6. Renewal and Cancellation</h2>
        <p>
          Monthly plans renew automatically each month until cancelled. You can
          cancel at any time from the upgrade page in your account. Cancelling
          stops future renewals. You keep full access until the end of the
          period you already paid for.
        </p>
        <p>
          If you cancel Pay as you go, we charge you for any games you started
          and have not yet paid for, and Pay as you go ends right away.
        </p>

        <h2>7. Refunds</h2>
        <p>
          Our refund rules are set out in our{' '}
          <a href="/refund">Refund Policy</a>, which forms part of these Terms.
        </p>

        <h2>8. Changing Plans</h2>
        <p>
          If you buy a new plan while you have another subscription, your new plan
          starts at once and your old subscription stops at the end of the period
          you already paid for. If you leave Pay as you go for a monthly plan,
          your unpaid games are charged first.
        </p>

        <h2>9. Acceptable Use</h2>
        <p>
          You agree not to: use the Service for any unlawful purpose; try to
          disrupt, overload, or gain unauthorized access to the Service or its
          infrastructure; harass or abuse other players; or try to get around the
          trial, game limits, or billing.
        </p>

        <h2>10. Gameplay Data and Vote Anonymity</h2>
        <p>
          Individual votes cast during a game are never stored or exposed in any
          form that reveals which player voted for whom. This is a permanent
          design commitment of the Service.
        </p>

        <h2>11. Intellectual Property</h2>
        <p>
          The Service, including its software, design, and branding, is owned by
          Love Preet. You are granted a limited, non-exclusive, non-transferable
          license to use the Service for its intended purpose. You may not copy,
          modify, or redistribute the Service.
        </p>

        <h2>12. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available," without warranties
          of any kind, express or implied, including warranties of
          merchantability, fitness for a particular purpose, or non-infringement.
          We do not guarantee the Service will be uninterrupted or error-free.
        </p>

        <h2>13. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for indirect,
          incidental, special, or consequential damages arising from your use of,
          or inability to use, the Service. Our total liability for any claim
          arising from these Terms or the Service is limited to the amount you
          paid us in the 3 months before the claim. Nothing in these Terms limits
          rights you have under consumer protection law that cannot be waived.
        </p>

        <h2>14. Termination</h2>
        <p>
          We may suspend or end your account if you break these Terms. You may
          stop using the Service and cancel at any time.
        </p>

        <h2>15. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India, without regard to its
          conflict of law rules. Disputes are subject to the courts of India,
          except where your local consumer law gives you the right to bring a
          claim in your own country.
        </p>

        <h2>16. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes take effect means you accept the revised Terms.
          We will update the "Last updated" date above when we make changes.
        </p>

        <h2>17. Contact</h2>
        <p>
          Questions about these Terms can be sent to{' '}
          <a href="mailto:iamsharann1@gmail.com">iamsharann1@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
import './LegalPage.css';

function RefundPage() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <a href="/" className="legal-back">&larr; Back home</a>
        <h1>Refund Policy</h1>
        <p className="legal-updated">Last updated: October 5, 2026</p>

        <p>
          We want you to be happy with The Elimination Game. This policy explains
          when you can get a refund. Payments are processed by Paddle.com Market
          Limited ("Paddle"), the Merchant of Record, and refunds are issued
          through Paddle.
        </p>

        <h2>1. Monthly Plans</h2>
        <p>
          You can ask for a full refund within 14 days of any plan charge, as long
          as you have not started a game in the billing period that charge covers.
          If you have started a game in that period, the charge is not refundable.
        </p>

        <h2>2. Game Top-Ups</h2>
        <p>
          You can ask for a full refund of a top-up within 14 days of purchase, as
          long as none of the added games have been used. Once any added game has
          been used, the top-up is not refundable.
        </p>

        <h2>3. Pay as You Go</h2>
        <p>
          Pay as you go charges you only for games that actually started, so those
          charges are not refundable. If you believe you were charged for a game
          that did not start, or were charged twice, contact us and we will
          correct it.
        </p>

        <h2>4. Used Games</h2>
        <p>
          Games that have been started cannot be refunded, because the Service has
          already been delivered.
        </p>

        <h2>5. Cancelling Is Not a Refund</h2>
        <p>
          Cancelling stops future renewals. It does not refund the current period
          unless you qualify under this policy. You keep access until the end of
          the period you paid for.
        </p>

        <h2>6. Errors and Your Legal Rights</h2>
        <p>
          If you were charged by mistake, or the Service did not work as
          described, contact us and we will put it right. Nothing in this policy
          limits any rights you have under the consumer protection laws of your
          country that cannot be waived.
        </p>

        <h2>7. How to Request a Refund</h2>
        <p>
          Email{' '}
          <a href="mailto:iamsharann1@gmail.com">iamsharann1@gmail.com</a> from
          the address on your account. Please include the date of the charge and
          the plan or top-up. You can also ask Paddle directly through the link in
          your Paddle receipt email. Approved refunds are returned to your
          original payment method. How long it takes to appear depends on your
          bank or card issuer.
        </p>

        <h2>8. Chargebacks</h2>
        <p>
          Please contact us before you dispute a charge with your bank. We can
          usually fix the problem faster.
        </p>
      </div>
    </div>
  );
}

export default RefundPage;
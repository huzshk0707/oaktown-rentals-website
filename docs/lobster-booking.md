# Lobster Nirvana direct booking

The property page offers direct booking when checkout configuration and booking rules are enabled. It also offers Airbnb and email or text inquiries. The site calculates an itemized full-stay USD quote, holds the nights in D1, then sends the guest to Stripe-hosted card Checkout. Stripe handles payment and card data. Signed events and a fresh Stripe lookup determine whether the stay is paid. The integration uses the existing Cloudflare Worker and Stripe Payments, without a booking-platform subscription. Payment processing and hosting or mail usage may incur charges. [Stripe pricing](https://stripe.com/pricing)

## Availability and Airbnb

All nights start closed. The property uses Florida Keys calendar dates, the checkout date is excluded from the stay, and a same-day arrival is unavailable. The site independently prevents two direct reservations from owning the same night.

The assigned calendar operator checks that the dates are free of reservations or commitments, blocks them on Airbnb and every other channel, then opens those exact nights in **Admin → Lobster bookings** with an approved nightly rate. Check the resulting rows before enabling the public booking rules. The acknowledgment applies to each opened range. Rates, cleaning, tax, stay limits, occupancy, and policies in both languages require owner sign-off. The tax calculation applies one configured rate to accommodation plus cleaning. The operator is responsible for confirming the tax treatment and remittance process.

For handback, close those nights in the direct admin first. Closing dates preserves rates and honors all current reservations and open Stripe sessions. Check the Stripe state of outstanding holds and wait for verified expiry or resolve them through the recovery process below. Reopen on other channels only after confirming that the direct site has no active hold or confirmed stay on those nights. Airbnb’s import can lag up to its three-hour refresh interval. Keep the channel blocks in place throughout this workflow. [Airbnb calendar sync](https://www.airbnb.com/help/article/99)

## Isolated staging setup

1. Start from [the staging example](../wrangler.booking-staging.example.jsonc). Copy it to the ignored root file `wrangler.booking-staging.local.jsonc`. Use a distinct Worker name and a disposable D1 database and set the exact staging HTTPS origin, with no trailing slash. Keep the existing Git-connected PR preview unbound. The example has file catalogue mode and omits R2.
2. Configure a staged self-hosted Cloudflare Access app for `/admin` and `/api/admin` and their descendants on that hostname. Set its team domain and audience in the staging config, and use the encrypted `ADMIN_EMAILS` secret for the approved staging operators. Check that an unauthorized account cannot enter either route and that an authorized operator can sign in with a real email code.
3. Provision a staging Turnstile widget limited to the staging hostname. Set `TURNSTILE_SITE_KEY` and encrypted `TURNSTILE_SECRET_KEY`. The Worker requires a token for the configured hostname and the action `booking`. Cloudflare's dummy verification responses omit the action and return a placeholder hostname, so use the real widget for provider acceptance. [Turnstile test-key behavior](https://developers.cloudflare.com/turnstile/troubleshooting/testing/#dummy-token-behavior)
4. Use an owner-approved Stripe sandbox. Install its `sk_test_` or `rk_test_` key as `STRIPE_SECRET_KEY`. A restricted key needs Checkout Sessions read and write, PaymentIntents read and Refunds read. In the sandbox create a signed snapshot webhook at `<staging origin>/api/booking/stripe-webhook`, pinned to Stripe API `2026-11-18.endive`, and set its `whsec_` value as `STRIPE_WEBHOOK_SECRET`. Subscribe to `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`, `refund.created`, `refund.updated` and `refund.failed`. Use the sandbox secret from the exact registered endpoint. [Stripe API versions](https://docs.stripe.com/api/versioning) · [Stripe webhooks](https://docs.stripe.com/webhooks)
5. For email acceptance, set an encrypted `RESEND_API_KEY` with sending access, a verified sender address in `BOOKING_EMAIL_FROM`, and an approved test operator address in `BOOKING_OPERATOR_EMAIL`. The operator address also receives replies. Use Resend simulator addresses or authorized test recipients. Stripe remains the source for a guest email. The D1 outbox records delivery status and keeps the guest address out of the database. [Resend testing addresses](https://resend.com/docs/dashboard/emails/send-test-emails)
6. With authenticated access to the separate staging resources, apply the migrations and deploy against the staging config only. Confirm the Wrangler output names the staging database and Worker before accepting any prompt.

   ```sh
   npx wrangler d1 migrations apply DB --remote --config wrangler.booking-staging.local.jsonc
   npx wrangler deploy --config wrangler.booking-staging.local.jsonc
   ```

   Start with `BOOKING_MODE=off`. After provider settings and secrets are in place, set `BOOKING_MODE=test` in the staging config and redeploy that Worker. Enable approved fixture rules and open only disposable staging nights. The staging configuration schedules recovery every five minutes. All test keys, policies, dates and reservations belong to staging.

## Recovery and daily operations

| Situation | Operator action |
| --- | --- |
| Guest leaves Checkout or card is declined | The open session can be resumed from the original browser. Check Stripe status before releasing inventory. An open session may still accept payment. |
| Checkout expires | A signed expiry event, guest or administrator status lookup, or the scheduled Worker confirms expiry with Stripe. An elapsed local timer alone does not release a session that Stripe can still collect on. |
| Stripe create response was lost | The guest can recover the checkout in the same tab. The Worker reuses the stored request and Stripe idempotency key while a new Stripe session could still meet the provider expiry requirement. An administrator can use **Look up Stripe checkout** to attach and reconcile a matching session in Stripe. |
| Checkout is held with no linked Stripe session | Search the correct Stripe mode and account in Workbench. Match the reservation reference and creation window and inspect the request with idempotency key `lobster-<reservation reference>`. If Stripe has a session or payment, reconcile it and keep the dates blocked until its state is settled. After the stored expiry plus five minutes, and only after ruling out a session and payment, select **Release verified unpaid hold**. The Worker independently scans Stripe in the creation window and audits the operator action. Keep the dates held if the search is incomplete or the account is in doubt. |
| Refund or cancellation | Use the reservation's Stripe payment link to issue the authorized refund according to policy. Select **Check Stripe status**. A partial, pending or failed refund keeps the stay and nights in place. A full succeeded refund closes the inventory, removes the reservation’s exclusive hold and invalidates older calendar forms. Coordinate guest communications in Stripe or through the operator. Reopen only with fresh channel verification. |
| Confirmation delivery needs review | Check Resend's delivery logs and the Stripe-confirmed payment before contacting the guest. Guest and operator emails each have a stable idempotency key. The queue retries transient errors for up to 23 hours from first attempt. A provider rejection or an unresolved attempt beyond that window is flagged for manual review. A `sent` badge records provider acceptance. Review delivery or bounce status in Resend. |
| Emergency stop | Disable the booking rules in admin. If needed, turn off the server live gate. Keep the current Stripe mode and webhook credentials available so already-issued sessions can be confirmed, expire, or be refunded. Review all open holds and queued emails before pausing the recovery schedule or changing credentials. |

Keep an operator assigned to watch the reservation list, failed Stripe deliveries, Worker recovery warnings, and the Resend queue. Restrict access to guest information. Test Stripe webhook redelivery after an outage and check recent reservations against Stripe before reopening. For a D1 restore, keep booking closed and reconcile affected reservations and nights against Stripe and the other calendars before restoring sellable availability.

## Acceptance and launch

Run the fixture suites locally using Node 24, then exercise the same flows on isolated staging with real provider accounts. Local tests accept only fixture identities and use disposable data.

```sh
npm ci
npm ci --prefix tests
npm run check
npm test
npm run test:booking
OAKTOWN_BOOKING_CAPTURES=/tmp/lobster-booking-review npm run test:booking-browser
npx wrangler d1 migrations apply DB --local
```

On staging, verify English and Spanish on desktop and mobile, 320px Turnstile, sign-in, concurrent overlapping stays, same-stay retry, decline then successful retry, 3-D Secure success and abandonment, expiry without webhook delivery, duplicate and out-of-order signed deliveries, pending or failed refunds, partial and full refunds, and guest and operator emails. Verify the public property CTA only appears with checkout enabled and confirm Airbnb and contact links on both states. Verify card fees and payout configuration with the owner separately.

Production requires separate approval. Back up the production D1 before the additive `0002_bookings.sql` and `0003_booking_recovery.sql` migrations. Confirm the existing Access policy, Stripe account and payouts, production origin, site-specific Turnstile credentials, webhook, verified email sender and recipient, and the scheduled recovery trigger. Supply live credentials through secrets and keep test and live data isolated. Get the approved rates, fees, taxes, house and cancellation terms in English and Spanish and recorded channel blocks. Live mode requires `BOOKING_MODE=live`, a live Stripe key, provider settings including mail, `BOOKING_LIVE_ENABLED=true`, and the separately enabled owner booking rules.

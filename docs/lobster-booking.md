# Lobster Nirvana booking integration — discovery

Status: discovery only, 2026-11-26. Draft PR #25, branch `codex/lobster-booking`.
No runtime changes, checkout integration, production transaction or deployment.

## Confirmed owner requirements

- Lobster Nirvana vacation reservations with instant booking and online payment.
- Preserve the current website and branding.
- Avoid a paid booking-service subscription. Hospitable was researched but is
  not selected; the owner requested alternatives and an Airbnb flow review.
- Existing payment and calendar accounts are not yet confirmed.

## Current website and source evidence

`mint-mojo/mint-mojo.js` renders a date form that prepares email/SMS inquiries.
It does not reserve nights or collect payment. Existing admin authorizes property
editing through Cloudflare Access; no booking backend exists.

Public listing: https://www.airbnb.co.in/rooms/679772407380305795
The publicly readable page shows check-in, checkout and guest selection, asks
for dates for exact pricing, and lists eight guests. No date-specific quote,
minimum stay, cancellation policy or Instant Book setting was verified.

The browser tool failed to initialize (`the gaas-browser node_repl sandbox
cannot be disabled`). Shell access to Airbnb returned a proxy 403. The web
reader retrieved listing text, but could not open the date-specific URL.
This is not a completed interactive checkout review or a screenshot review.

Airbnb's documented flow is dates/guests -> Reserve -> either Confirm and pay
(instant booking) or Request to book. The listing's Reserve button alone does
not establish Instant Book eligibility. No reservation was submitted.
Source: https://www.airbnb.com/help/article/85

## Options with no booking-platform subscription

1. **Continue to Airbnb from our website.** Airbnb remains the booking/calendar/
   payment authority. No additional booking-service subscription is introduced;
   normal Airbnb fees still apply. The owner must select this option explicitly
   because payment happens on Airbnb, not a new direct booking system. Verify
   any date/guest link parameters in a real browser before promising carryover.
2. **Custom direct booking plus Stripe Standard.** Stripe Standard has no setup
   or monthly payments fee; transaction fees apply. This still requires a rate
   source, availability controls, checkout holds, verified payment webhooks,
   confirmations, cancellation/refund handling and maintenance. Hosting usage
   and any optional services may incur costs.

Airbnb's free imported-calendar synchronization runs every three hours. An iCal
feed alone is not a real-time lock across Airbnb and a custom checkout. Do not
claim it eliminates double bookings. Before accepting direct instant bookings,
choose a supported shared inventory solution or deliberately allocate separate
nights to each channel and keep them blocked on the other. Do not silently
replace the requested instant flow with approval-first booking.
Sources: https://www.airbnb.com/help/article/99 and https://stripe.com/pricing

## Integration requirements if direct checkout is selected

- Confirm payment-account owner/country, currency, nightly/seasonal rates,
  cleaning and other fees, taxes, occupancy/minimum-stay rules, payment schedule
  and cancellation/refund terms. Do not infer them from an undated listing.
- Treat Florida Keys dates as local calendar dates; calculate nights separately
  from UTC timestamps. Reject invalid dates, stale quotes and unavailable stays.
- Calculate authoritative totals on the server. Reserve nights atomically before
  creating checkout; reconcile expiry, failed payments and delayed events.
- Use hosted payment fields/checkout, signed idempotent webhooks, and confirmed
  payment state rather than trusting a success-page redirect. Keep provider
  secrets and guest details out of public assets, logs and repository files.
- Keep booking admin behind existing signed Access checks. Preserve property
  publication and photo privacy. Any new storage migration is reviewed and tested
  locally before a separately approved production application.
- Validate EN/ES, mobile/keyboard use, error/retry flows, concurrent overlapping
  stays, payment failures, webhook replay, expiration and cancellation. Run
  relevant CMS/security, vacation-gallery and public browsing regressions.

## Next decision

Choose Airbnb checkout from our website or direct Stripe checkout with an
explicit inventory-management plan. Continue implementation on PR #25 after
that choice; no subscription or third-party account has been created.

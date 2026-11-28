# Lobster Nirvana booking review

The Chromium captures use fixture inventory, prices, policies, Stripe, Turnstile and mail. The admin capture shows the recorded results of a fixture payment and email send.

- [English desktop quote at 1440 px](desktop-en-quote.jpg)
- [Spanish mobile quote at 320 px](mobile-es-quote.jpg)
- [Booking administration at 390 px](mobile-admin.jpg)

Run `OAKTOWN_BOOKING_CAPTURES=/tmp/lobster-booking-review npm run test:booking-browser` from the repository root to regenerate the full set. It covers English and Spanish at 320, 390, 768 and 1440 px along with confirmation, mobile admin and the closed fallback.

The [setup and recovery guide](../lobster-booking.md) lists the remaining real-provider acceptance work.

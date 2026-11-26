ALTER TABLE booking_reservations ADD COLUMN stripe_create_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_reservations ADD COLUMN reconcile_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_reservations ADD COLUMN refund_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE booking_reservations ADD COLUMN recovery_checked_at INTEGER NOT NULL DEFAULT 0;

-- Existing holds without a session may already have reached Stripe.
UPDATE booking_reservations SET stripe_create_attempts=1
  WHERE state='holding' AND stripe_session IS NULL;
UPDATE booking_reservations SET refund_status='full' WHERE state='refunded';

CREATE INDEX booking_reservations_payment_intent ON booking_reservations(payment_intent);
CREATE INDEX booking_reservations_recovery ON booking_reservations(state, expires_at, recovery_checked_at);

CREATE TABLE booking_notifications (
  reservation_id TEXT NOT NULL REFERENCES booking_reservations(id),
  recipient TEXT NOT NULL CHECK (recipient IN ('guest','operator')),
  first_attempt_at INTEGER,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  sent_at INTEGER,
  needs_review INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (reservation_id, recipient)
);
CREATE INDEX booking_notifications_pending ON booking_notifications(sent_at, needs_review, next_attempt_at);

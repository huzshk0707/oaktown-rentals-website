-- Additive only. Apply locally for tests; production application requires review.
CREATE TABLE booking_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL
);
INSERT INTO booking_settings (id, config_json) VALUES (1, '{"enabled":false}');
CREATE TABLE booking_inventory (
  day TEXT PRIMARY KEY,
  rate_cents INTEGER NOT NULL CHECK (rate_cents > 0),
  open INTEGER NOT NULL DEFAULT 0 CHECK (open IN (0,1))
);
CREATE TABLE booking_reservations (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  quote_json TEXT NOT NULL,
  quote_key TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('holding','confirmed','expired','refunded')),
  stripe_session TEXT UNIQUE,
  payment_intent TEXT,
  checkout_url TEXT,
  checkout_params TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE booking_nights (
  day TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES booking_reservations(id)
);
CREATE INDEX booking_nights_reservation ON booking_nights(reservation_id);
CREATE TABLE booking_activity (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE booking_rate (client TEXT PRIMARY KEY, bucket INTEGER NOT NULL, attempts INTEGER NOT NULL);

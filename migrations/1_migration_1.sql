-- Migration: create ip_bans table and helper indexes
CREATE TABLE IF NOT EXISTS ip_bans (
  ip VARCHAR(45) PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  banned_until TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_ip_bans_last_attempt ON ip_bans(last_attempt);

-- NOTE: This migration does NOT create the main application schema — use your schema SQL separately.

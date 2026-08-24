PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'system',
  density TEXT NOT NULL DEFAULT 'comfortable',
  accent TEXT NOT NULL DEFAULT 'pink',
  reduce_motion INTEGER NOT NULL DEFAULT 0,
  advanced_data INTEGER NOT NULL DEFAULT 0,
  driving_profile_json TEXT NOT NULL DEFAULT '{}',
  notification_preferences_json TEXT NOT NULL DEFAULT '{"mot":true,"service":true,"warranty":true,"leadDays":[30,14,7]}',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS saved_scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  registration TEXT,
  listing_url TEXT,
  vehicle_json TEXT NOT NULL DEFAULT '{}',
  score_json TEXT NOT NULL DEFAULT '{}',
  mot_expiry TEXT,
  shortlist INTEGER NOT NULL DEFAULT 0,
  purchased INTEGER NOT NULL DEFAULT 0,
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS scans_user_idx ON saved_scans(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS scans_shortlist_idx ON saved_scans(user_id, shortlist);

CREATE TABLE IF NOT EXISTS garage_vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  registration TEXT,
  make TEXT,
  model TEXT,
  mot_expiry TEXT,
  tax_due TEXT,
  service_due TEXT,
  battery_warranty_end TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS garage_user_idx ON garage_vehicles(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_key TEXT NOT NULL,
  attempted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_attempts_key_idx ON auth_attempts(attempt_key, attempted_at);

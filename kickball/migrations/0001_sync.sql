-- Cloud backup (beta). One row per snapshot of a phone's whole store.
-- Apply: npx wrangler d1 migrations apply kickball --remote
CREATE TABLE IF NOT EXISTS codes (
	code TEXT PRIMARY KEY,
	label TEXT,
	enabled INTEGER NOT NULL DEFAULT 1,
	created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS devices (
	id TEXT PRIMARY KEY,
	code TEXT NOT NULL,
	label TEXT,
	created INTEGER NOT NULL,
	last_at INTEGER
);
CREATE TABLE IF NOT EXISTS snapshots (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	device TEXT NOT NULL,
	code TEXT NOT NULL,
	at INTEGER NOT NULL,
	hash TEXT NOT NULL,
	game_id TEXT,
	status TEXT,
	note TEXT,
	bytes INTEGER NOT NULL,
	body TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS snapshots_device_at ON snapshots(device, at);
CREATE INDEX IF NOT EXISTS snapshots_code_at ON snapshots(code, at);
CREATE INDEX IF NOT EXISTS snapshots_at ON snapshots(at);
-- Knobs you can turn without a deploy:  npx wrangler d1 execute kickball --remote --command "UPDATE flags SET value='off' WHERE key='sync'"
CREATE TABLE IF NOT EXISTS flags (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO flags VALUES ('sync', 'on');          -- kill switch: on | off
INSERT OR IGNORE INTO flags VALUES ('day_cap', '2000');     -- snapshots per UTC day, all devices (D1 free tier allows 100k writes)
INSERT OR IGNORE INTO flags VALUES ('device_cap', '400');   -- snapshots per device per UTC day
INSERT OR IGNORE INTO flags VALUES ('min_gap', '8');        -- seconds between snapshots from one device
INSERT OR IGNORE INTO flags VALUES ('max_bytes', '1000000'); -- one snapshot's size ceiling

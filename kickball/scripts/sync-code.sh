#!/usr/bin/env sh
# Invite codes for cloud backup (beta). Codes are never committed — mint them here.
#   ./scripts/sync-code.sh add "Thom's phone"      → prints a new code
#   ./scripts/sync-code.sh off <code> | on <code>   → disable / re-enable one code
#   ./scripts/sync-code.sh list
#   ./scripts/sync-code.sh kill | revive            → global switch for every device
#   ./scripts/sync-code.sh local ...                → same, against the local dev database
set -eu
cd "$(dirname "$0")/.."
TARGET=--remote
if [ "${1:-}" = "local" ]; then TARGET=--local; shift; fi
q() { npx --yes wrangler d1 execute kickball $TARGET --command "$1"; }
case "${1:-}" in
  add)   code="$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)-$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)"
         label="$(printf %s "${2:-}" | sed "s/'/''/g")"
         q "INSERT INTO codes (code, label, enabled, created) VALUES ('$code', '$label', 1, $(date +%s)000)" >/dev/null; echo "invite code: $code" ;;
  off)   q "UPDATE codes SET enabled = 0 WHERE code = '$2'" ;;
  on)    q "UPDATE codes SET enabled = 1 WHERE code = '$2'" ;;
  list)  q "SELECT c.code, c.label, c.enabled, (SELECT COUNT(*) FROM snapshots s WHERE s.code = c.code) AS snapshots FROM codes c" ;;
  kill)  q "UPDATE flags SET value = 'off' WHERE key = 'sync'" ;;
  revive) q "UPDATE flags SET value = 'on' WHERE key = 'sync'" ;;
  *) sed -n 2,8p "$0"; exit 1 ;;
esac

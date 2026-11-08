#!/usr/bin/env bash
# Local, encrypted, verified logical backup of the Reviews database. Read-only against the database.
#   scripts/backup-reviews-db.sh            # run one backup now
# Output: ~/.tysonlabs-reviews/backups/reviews-<UTC timestamp>.tar.gz.enc (mode 600), plus backup.log
# Restore check: scripts/restore-drill.sh [file]
# Schema is not stored here: it is rebuilt from db/roles.sql and db/migrations/*.sql, which are in git.
# Exit codes: 0 ok, 2 setup problem, 3 backup saved but looks SUSPECT (a table shrank a lot), 4 schema changed (update TABLES), 1 verification failed.
set -euo pipefail
cd "$(dirname "$0")/.."

CRED="${REVIEWS_CRED_FILE:-$HOME/.tysonlabs-reviews/credentials.env}"
OUT="${REVIEWS_BACKUP_DIR:-$HOME/.tysonlabs-reviews/backups}"
KEEP="${REVIEWS_BACKUP_KEEP:-30}"
PSQL="${PSQL:-/opt/homebrew/opt/postgresql@17/bin/psql}"
# Parents before children. Must match every public table except rate_limits (checked below, so a new table cannot be forgotten).
TABLES="clients api_keys tenants tenant_members tenant_billing connections location_links connect_sessions audit_log reviews reply_drafts sync_runs deletion_requests push_subscriptions billing_settings billing_events"

umask 077
case "$KEEP" in ''|*[!0-9]*) echo "REVIEWS_BACKUP_KEEP must be a whole number"; exit 2;; esac
[ "$KEEP" -ge 2 ] || { echo "REVIEWS_BACKUP_KEEP must be at least 2"; exit 2; }
[ -f "$CRED" ] || { echo "missing $CRED"; exit 2; }
. "$CRED"   # plain shell variables; only what is needed is exported below
[ -n "${REVIEWS_OWNER_URL:-}" ] || { echo "REVIEWS_OWNER_URL not set"; exit 2; }
mkdir -p "$OUT" && chmod 700 "$OUT"
log() { echo "$(date -u +%FT%TZ) $*" | tee -a "$OUT/backup.log"; }

# One run at a time. A lock older than 2 hours is treated as left over from a crash.
if ! mkdir "$OUT/.lock" 2>/dev/null; then
  if [ -n "$(find "$OUT/.lock" -maxdepth 0 -mmin +120 2>/dev/null)" ]; then rmdir "$OUT/.lock"; mkdir "$OUT/.lock"; else log "another backup is running; skipping"; exit 0; fi
fi
# Scratch folders from a run that was killed hold plaintext; remove them first.
rm -rf "$OUT"/.work.* "$OUT"/.verify.* 2>/dev/null || true
work="$(mktemp -d "$OUT/.work.XXXXXX")"; chk=""
trap 'rm -rf "$work" "$chk" "$OUT/.lock"' EXIT

# The passphrase is created once. Without it every backup is unreadable, so a copy must live outside this machine.
if ! grep -q '^BACKUP_PASSPHRASE=' "$CRED"; then
  printf "\nBACKUP_PASSPHRASE='%s'\n" "$(openssl rand -base64 33)" >> "$CRED"; chmod 600 "$CRED"; . "$CRED"
  echo "NEW backup passphrase created in $CRED. Copy that file to your password manager now: backups cannot be opened without it." >&2
fi
export BACKUP_PASSPHRASE

# Keep the database password out of the process list: pass it by environment, not in the connection string.
eval "$(python3 - "$REVIEWS_OWNER_URL" <<'PY'
import sys, shlex
from urllib.parse import urlsplit, urlunsplit, unquote
u = urlsplit(sys.argv[1]); host = u.hostname + (f":{u.port}" if u.port else "")
print("export PGPASSWORD=" + shlex.quote(unquote(u.password or "")))
print("DB_URL=" + shlex.quote(urlunsplit((u.scheme, f"{u.username}@{host}", u.path, u.query, ""))))
PY
)"

# Refuse to run if the schema has a table this script does not know about.
actual="$("$PSQL" "$DB_URL" -X -At -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'rate_limits' ORDER BY 1")"
known="$(echo $TABLES | tr ' ' '\n' | sort)"
if [ "$actual" != "$known" ]; then log "ABORT: database tables differ from TABLES in this script. Update TABLES (and the restore drill reads the manifest). Database has: $(echo $actual)"; exit 4; fi

mkdir "$work/data"
ts="$(date -u +%Y%m%dT%H%M%SZ)"
# One read-only snapshot transaction, so every table is consistent with the counts.
{
  echo "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;"
  echo "\\pset tuples_only on"; echo "\\pset format unaligned"; echo "\\pset fieldsep ','"
  echo "\\o $work/counts.csv"
  first=1; echo "SELECT * FROM ("
  for t in $TABLES; do [ $first = 1 ] || echo "UNION ALL"; first=0; echo "SELECT '$t' AS t, count(*) AS n FROM $t"; done
  echo ") c ORDER BY 1;"
  echo "\\o"
  for t in $TABLES; do echo "\\copy $t TO '$work/data/$t.csv' CSV HEADER"; done
  echo "COMMIT;"
} > "$work/dump.sql"
"$PSQL" "$DB_URL" -X -q -v ON_ERROR_STOP=1 -f "$work/dump.sql" >/dev/null

: > "$work/manifest.txt"; total=0
while IFS=, read -r t n; do echo "$t=$n" >> "$work/manifest.txt"; total=$((total+n)); done < "$work/counts.csv"
echo "created=$ts" >> "$work/manifest.txt"
echo "migrations=$(ls db/migrations 2>/dev/null | tr '\n' ' ')" >> "$work/manifest.txt"

# Suspect check: compare every table with the LARGEST count seen in the earlier good backups (not just the previous one),
# so a bad run cannot reset the baseline. A suspect backup is saved but never counts as good and stops all pruning.
suspect=0
for t in $TABLES; do
  max=0
  for m in $(ls -1 "$OUT"/reviews-*.manifest 2>/dev/null | sort); do
    [ -f "${m%.manifest}.suspect" ] && continue
    v="$(grep "^$t=" "$m" | cut -d= -f2 || true)"; [ -n "$v" ] && [ "$v" -gt "$max" ] && max="$v"
  done
  cur="$(grep "^$t=" "$work/manifest.txt" | cut -d= -f2)"
  if [ "$max" -gt 5 ] && [ "$cur" -lt $(( max / 2 )) ] && [ "${REVIEWS_BACKUP_ACK_DROP:-0}" != "1" ]; then
    log "WARNING: $t has $cur rows but earlier good backups had up to $max. Check the live data. If this drop is expected (for example you erased a tenant), rerun with REVIEWS_BACKUP_ACK_DROP=1."
    suspect=1
  fi
done

tar -C "$work" -czf "$work/bundle.tar.gz" data manifest.txt
openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSPHRASE -in "$work/bundle.tar.gz" -out "$OUT/reviews-$ts.tar.gz.enc"
cp "$work/manifest.txt" "$OUT/reviews-$ts.manifest"
[ $suspect = 1 ] && touch "$OUT/reviews-$ts.suspect"
chmod 600 "$OUT"/reviews-$ts.*

# Verify: decrypt, extract and compare each table's row count (CSV parsed properly) with the manifest.
chk="$(mktemp -d "$OUT/.verify.XXXXXX")"
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE -in "$OUT/reviews-$ts.tar.gz.enc" | tar -xz -C "$chk"
for t in $TABLES; do
  want="$(grep "^$t=" "$chk/manifest.txt" | cut -d= -f2)"
  got="$(python3 -c "import csv,sys; csv.field_size_limit(sys.maxsize); print(max(sum(1 for _ in csv.reader(open('$chk/data/$t.csv', newline='')))-1,0))")"
  [ "$want" = "$got" ] || { log "FAILED verification: $t manifest=$want file=$got"; rm -f "$OUT"/reviews-$ts.*; exit 1; }
done
log "$([ $suspect = 1 ] && echo SUSPECT || echo OK) backup reviews-$ts.tar.gz.enc ($(du -h "$OUT/reviews-$ts.tar.gz.enc" | cut -f1 | tr -d ' ')), $total rows across $(echo $TABLES | wc -w | tr -d ' ') tables, verified"
[ $suspect = 1 ] && { log "Pruning is paused until a good backup exists."; exit 3; }

# Retention: keep the newest $KEEP good backups, ordered by name (the timestamp), never by file time.
ls -1 "$OUT"/reviews-*.tar.gz.enc 2>/dev/null | sort -r | while read -r f; do [ -f "${f%.tar.gz.enc}.suspect" ] || echo "$f"; done | tail -n +$((KEEP+1)) | while read -r f; do
  rm -f "$f" "${f%.tar.gz.enc}.manifest"; log "pruned $(basename "$f") (older than the newest $KEEP)"
done

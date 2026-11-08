#!/usr/bin/env bash
# Proves a backup can actually be restored. Restores into a THROWAWAY local PostgreSQL (never a real database) and compares
# row counts with the backup's manifest. Run it after changing the schema and at least monthly.
#   scripts/restore-drill.sh [backup file]     # default: newest backup
set -euo pipefail
CRED="${REVIEWS_CRED_FILE:-$HOME/.tysonlabs-reviews/credentials.env}"
OUT="${REVIEWS_BACKUP_DIR:-$HOME/.tysonlabs-reviews/backups}"
BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
cd "$(dirname "$0")/.."
umask 077
. "$CRED"; export BACKUP_PASSPHRASE
# This drill must never touch a real database: forget every connection setting before doing anything.
unset REVIEWS_OWNER_URL REVIEWS_DATABASE_URL DATABASE_URL DATABASE_URL_UNPOOLED PGHOST PGPORT PGSERVICE PGUSER PGDATABASE PGPASSWORD
file="${1:-$(ls -1 "$OUT"/reviews-*.tar.gz.enc 2>/dev/null | sort | tail -1 || true)}"
[ -n "$file" ] && [ -f "$file" ] || { echo "no backup found"; exit 2; }
work="$(mktemp -d)"; port=$((55000 + RANDOM % 900)); export LC_ALL=en_US.UTF-8
cleanup() { "$BIN/pg_ctl" -D "$work/pg" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$work"; }; trap cleanup EXIT

openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE -in "$file" | tar -xz -C "$work"
# Tables come from the backup's own manifest, in FK-safe order, so older backups restore too.
ALL="clients api_keys tenants tenant_members tenant_billing connections location_links connect_sessions audit_log reviews reply_drafts sync_runs deletion_requests push_subscriptions billing_settings billing_events"
TABLES=""; for t in $ALL; do grep -q "^$t=" "$work/manifest.txt" && TABLES="$TABLES $t"; done
"$BIN/initdb" -D "$work/pg" -U postgres --auth=trust -E UTF8 >/dev/null
"$BIN/pg_ctl" -D "$work/pg" -o "-p $port -c listen_addresses=127.0.0.1 -c unix_socket_directories=" -w -l "$work/pg.log" start >/dev/null
P="$BIN/psql -h 127.0.0.1 -p $port -X -q -v ON_ERROR_STOP=1"
$P -U postgres -d postgres -c "CREATE DATABASE restore_drill" >/dev/null
sed -e 's/CHANGE_ME_OWNER/drill/' -e 's/CHANGE_ME_APP/drill/' db/roles.sql | $P -U postgres -d restore_drill >/dev/null
for m in db/migrations/*.sql; do PGPASSWORD=drill $P -U reviews_owner -d restore_drill -f "$m" >/dev/null; done
{
  # Triggers would add a billing row for every restored business and seed settings again; the backup already holds the real rows.
  echo "SET session_replication_role = replica;"
  case " $TABLES " in *" billing_settings "*) echo "TRUNCATE billing_settings;";; esac
  for t in $TABLES; do echo "\\copy $t FROM '$work/data/$t.csv' CSV HEADER"; done
  echo "SELECT setval('audit_log_id_seq', COALESCE((SELECT max(id) FROM audit_log),1));"
  echo "SELECT setval('sync_runs_id_seq', COALESCE((SELECT max(id) FROM sync_runs),1));"
} | $P -U postgres -d restore_drill >/dev/null  # superuser: COPY FROM is refused on tables with row-level security

fail=0
for t in $TABLES; do
  want="$(grep "^$t=" "$work/manifest.txt" | cut -d= -f2)"
  got="$(PGPASSWORD=drill $P -U reviews_owner -d restore_drill -At -c "SELECT count(*) FROM $t")"
  if [ "$want" = "$got" ]; then printf "  ok   %-18s %s rows\n" "$t" "$got"; else printf "  FAIL %-18s backup=%s restored=%s\n" "$t" "$want" "$got"; fail=1; fi
done
# The global billing settings must come back exactly as they were in the backup.
if grep -q "^billing_settings=" "$work/manifest.txt"; then
  want_s="$(python3 -I -c "import csv; r=list(csv.DictReader(open('$work/data/billing_settings.csv', newline='')))[0]; print(r['trial_days']+','+r['price_inr']+','+r['trial_requires_card'])")"
  got_s="$(PGPASSWORD=drill $P -U reviews_owner -d restore_drill -At -F, -c "SELECT trial_days, price_inr, trial_requires_card FROM billing_settings")"
  if [ "$want_s" = "$got_s" ]; then echo "  ok   billing_settings: trial_days,price_inr,trial_requires_card = $got_s"; else echo "  FAIL billing_settings: backup=$want_s restored=$got_s"; fail=1; fi
fi
# Every restored business must have exactly one billing row (a missing one would be treated as blocked). Older backups predate the table.
if grep -q "^tenant_billing=" "$work/manifest.txt"; then
  nb="$(PGPASSWORD=drill $P -U reviews_owner -d restore_drill -At -c "SELECT (SELECT count(*) FROM tenant_billing) || ' ' || (SELECT count(*) FROM tenants) || ' ' || (SELECT count(*) FROM tenants t WHERE NOT EXISTS (SELECT 1 FROM tenant_billing b WHERE b.tenant_id = t.id))")"
  set -- $nb
  want_b="$(grep "^tenant_billing=" "$work/manifest.txt" | cut -d= -f2)"
  if [ "$1" = "$want_b" ] && [ "$1" = "$2" ] && [ "$3" = "0" ]; then echo "  ok   tenant_billing: $1 rows, one per business"; else echo "  FAIL tenant_billing: restored=$1 manifest=$want_b businesses=$2 without a row=$3"; fail=1; fi
else
  echo "  note this backup predates tenant_billing (the migration will seed existing businesses as pilot)"
fi
# The restored data must still be protected by row-level security.
rls="$(PGPASSWORD=drill $P -U reviews_app -d restore_drill -At -c "SELECT count(*) FROM reviews")"
[ "$rls" = "0" ] && echo "  ok   app role sees 0 reviews without a scope (RLS intact)" || { echo "  FAIL RLS: app role saw $rls rows"; fail=1; }
[ $fail = 0 ] && echo "RESTORE DRILL PASSED for $(basename "$file")" || { echo "RESTORE DRILL FAILED"; exit 1; }

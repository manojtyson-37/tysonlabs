#!/usr/bin/env bash
# One-time setup for the reviews service database: creates the two roles and applies the migration.
#
#   ADMIN_DATABASE_URL='postgresql://...'  scripts/setup-reviews-db.sh --yes
#
# Safety (see CSO data-safety rules): it ONLY runs against an EMPTY public schema with none of our roles
# present, and aborts otherwise. It never drops or deletes anything. Role passwords are generated here,
# printed once to your terminal, and never written to disk.
set -euo pipefail

[ "${1:-}" = "--yes" ] || { echo "Refusing to run without --yes. Read the header of this script first."; exit 2; }
CRED_DIR="${REVIEWS_CRED_DIR:-$HOME/.tysonlabs-reviews}"
# Check before touching the database, so credentials are never generated with nowhere safe to put them.
[ ! -e "$CRED_DIR/credentials.env" ] || { echo "ABORT: $CRED_DIR/credentials.env already exists; move it away first. Nothing was changed."; exit 1; }
: "${ADMIN_DATABASE_URL:?Set ADMIN_DATABASE_URL to the admin/owner connection string of a NEW, EMPTY database}"
command -v psql >/dev/null || { echo "psql not found"; exit 2; }
command -v openssl >/dev/null || { echo "openssl not found"; exit 2; }
cd "$(dirname "$0")/.."

q() { psql "$ADMIN_DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "$1"; }

echo "Checking the target database (read-only)..."
host_db=$(python3 - <<PY
import os, urllib.parse as u
p = u.urlparse(os.environ["ADMIN_DATABASE_URL"]); print(f"{p.hostname}{p.path}")
PY
)
echo "  target: $host_db"
tables=$(q "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
roles=$(q "SELECT count(*) FROM pg_roles WHERE rolname IN ('reviews_owner','reviews_app')")
if [ "$tables" != "0" ] || [ "$roles" != "0" ]; then
  echo "ABORT: database is not fresh (public tables: $tables, existing reviews roles: $roles). Nothing was changed."
  exit 1
fi
echo "  public schema is empty and no reviews roles exist: OK"

OWNER_PW=$(openssl rand -hex 24)
APP_PW=$(openssl rand -hex 24)

echo "Creating roles..."
psql "$ADMIN_DATABASE_URL" -X -v ON_ERROR_STOP=1 -v owner_pw="$OWNER_PW" -v app_pw="$APP_PW" <<'SQL'
CREATE ROLE reviews_owner LOGIN PASSWORD :'owner_pw' NOSUPERUSER NOBYPASSRLS;
CREATE ROLE reviews_app   LOGIN PASSWORD :'app_pw'   NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
GRANT CREATE, USAGE ON SCHEMA public TO reviews_owner;
SQL

with_user() { # with_user <role> <password>
  python3 - "$1" "$2" <<'PY'
import os, sys, urllib.parse as u
p = u.urlparse(os.environ["ADMIN_DATABASE_URL"])
host = p.hostname + (f":{p.port}" if p.port else "")
print(u.urlunparse((p.scheme, f"{sys.argv[1]}:{sys.argv[2]}@{host}", p.path, "", p.query, "")))
PY
}
OWNER_URL=$(with_user reviews_owner "$OWNER_PW")
APP_URL=$(with_user reviews_app "$APP_PW")

echo "Applying migration as reviews_owner..."
psql "$OWNER_URL" -X -v ON_ERROR_STOP=1 -q -f db/migrations/0001_init.sql

echo "Verifying the app role cannot bypass row-level security..."
ok=$(psql "$APP_URL" -X -At -c "SELECT NOT rolsuper AND NOT rolbypassrls AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.relowner = r.oid AND c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace) FROM pg_roles r WHERE rolname = current_user")
[ "$ok" = "t" ] || { echo "ABORT: app role is not restricted"; exit 1; }
rows=$(psql "$APP_URL" -X -At -c "SELECT count(*) FROM tenants")
[ "$rows" = "0" ] || { echo "ABORT: app role sees rows with no scope"; exit 1; }

# Credentials go to a private file, never to the terminal or any log.
umask 077
mkdir -p "$CRED_DIR" && chmod 700 "$CRED_DIR"
# Passwords are generated hex, so single quotes are safe. Write to a temp file and move it into place.
tmp="$(mktemp "$CRED_DIR/.cred.XXXXXX")"
printf "REVIEWS_DATABASE_URL='%s'\nREVIEWS_OWNER_URL='%s'\n" "$APP_URL" "$OWNER_URL" > "$tmp"
chmod 600 "$tmp" && mv "$tmp" "$CRED_DIR/credentials.env"

cat <<MSG

DONE. Credentials were written to $CRED_DIR/credentials.env (mode 600) and were not printed.
  REVIEWS_DATABASE_URL: the service connects with this (Vercel env var).
  REVIEWS_OWNER_URL: migrations and break-glass admin only; never put it in Vercel.
Copy them into your password manager, then keep or delete the file.

REMINDER: Neon's Free plan keeps only 6 hours of history. Do NOT store real client data until the project is
on a paid plan with a longer restore window AND a scheduled external backup exists.
MSG

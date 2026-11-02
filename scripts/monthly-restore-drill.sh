#!/usr/bin/env bash
# Runs the restore drill on the newest backup and appends a one-line result to ~/.tysonlabs-reviews/backups/restore-drill.log.
# Exit 1 on failure, so launchd records it. Scheduled monthly by scripts/in.tysonlabs.reviews-restore-drill.plist.
set -uo pipefail
cd "$(dirname "$0")/.."
OUT="${REVIEWS_BACKUP_DIR:-$HOME/.tysonlabs-reviews/backups}"
umask 077
if ./scripts/restore-drill.sh > "$OUT/.drill.tmp" 2>&1; then
  echo "$(date -u +%FT%TZ) PASSED $(tail -1 "$OUT/.drill.tmp")" >> "$OUT/restore-drill.log"; rm -f "$OUT/.drill.tmp"; exit 0
else
  echo "$(date -u +%FT%TZ) FAILED $(tail -3 "$OUT/.drill.tmp" | tr '\n' ' ')" >> "$OUT/restore-drill.log"; mv "$OUT/.drill.tmp" "$OUT/restore-drill.last-failure.txt"; exit 1
fi

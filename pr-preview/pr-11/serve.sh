#!/bin/bash
# Auto-discovers perl from PATH (Git for Windows ships perl at /usr/bin/perl).
# Falls back to common Windows locations if not on PATH.
cd "$(dirname "$0")"

PERL=$(command -v perl 2>/dev/null)

if [ -z "$PERL" ]; then
  # Common Git-for-Windows fallback
  if [ -x "/usr/bin/perl" ]; then
    PERL="/usr/bin/perl"
  else
    echo "Error: perl not found. Install Git for Windows or add perl to PATH." >&2
    exit 1
  fi
fi

exec "$PERL" serve.pl

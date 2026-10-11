#!/usr/bin/env bash
# Cache-busting for GitHub Pages (which serves everything with max-age=600).
# Appends ?v=<version> to every local module import, the entry script and the stylesheet, so each
# index.html loads one consistent set of files — a browser can never mix old and new modules.
# Usage: .github/stamp.sh <version>   (run on the checkout before publishing; never committed)
set -euo pipefail
V="${1:?version}"
sed -i -E "s#(from '\./[A-Za-z0-9/_.-]+\.js)'#\1?v=${V}'#g" js/*.js js/lang/*.js
sed -i -E "s#src=\"js/main\.js\"#src=\"js/main.js?v=${V}\"#; s#href=\"style\.css\"#href=\"style.css?v=${V}\"#" index.html
# fail loudly if a pattern stopped matching (e.g. someone switched to double quotes)
grep -q "js/main.js?v=${V}" index.html
grep -q "style.css?v=${V}" index.html
! grep -hE "from '\./[^']+\.js'" js/*.js js/lang/*.js

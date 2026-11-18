#!/usr/bin/env bash
# Builds index.html (the single-page app) from the three source parts.
# Usage: ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
cat src/head.html src/engine.js src/ui.js > index.html
echo "Built index.html ($(wc -c < index.html | tr -d ' ') bytes)"

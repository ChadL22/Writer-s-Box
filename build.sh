#!/usr/bin/env bash
# Builds index.html (the single-page app) from the source parts, in order.
# Usage: ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
cat src/head.html src/config.js src/engine.js src/ui.js src/github.js src/collab.js src/live.js src/refs.js src/sections.js src/main.js > index.html
echo "Built index.html ($(wc -c < index.html | tr -d ' ') bytes)"

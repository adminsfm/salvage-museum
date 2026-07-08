#!/bin/zsh
cd "$(dirname "$0")"

echo "Starting the Salvage Fisherman's Museum website editor..."
echo "If the browser does not open, go to: http://localhost:4173/editor"

(
  sleep 2
  open "http://localhost:4173/editor"
) &

if command -v node >/dev/null 2>&1; then
  node museum-editor-server.js
else
  /Users/mollyraeburn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node museum-editor-server.js
fi

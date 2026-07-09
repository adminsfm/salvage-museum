#!/bin/zsh
SITE_FOLDER="/Users/mollyraeburn/Documents/GitHub/salvage-museum"
cd "$SITE_FOLDER" || exit 1

echo "Starting the Salvage Fisherman's Museum website editor..."
echo "Website folder: $SITE_FOLDER"
echo "If the browser does not open, go to: http://localhost:4173/editor"

OLD_EDITOR=$(lsof -ti tcp:4173)
if [ -n "$OLD_EDITOR" ]; then
  echo "Closing the old editor first..."
  kill $OLD_EDITOR 2>/dev/null
  sleep 1
fi

(
  sleep 2
  open "http://localhost:4173/editor"
) &

if command -v node >/dev/null 2>&1; then
  node museum-editor-server.js
else
  /Users/mollyraeburn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node museum-editor-server.js
fi

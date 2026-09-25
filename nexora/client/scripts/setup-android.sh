#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies..."
npm install

echo "==> Building web app..."
npm run build

if [ ! -d "android" ]; then
  echo "==> Adding Android platform..."
  npx cap add android
else
  echo "==> Android platform already present"
fi

echo "==> Syncing web assets into Android..."
npx cap sync android

echo ""
echo "Done."
echo "Next: open Android Studio with:"
echo "  npx cap open android"
echo ""
echo "Or build/run from the IDE (Run ▶)."

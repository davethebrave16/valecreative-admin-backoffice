#!/usr/bin/env bash
set -e

echo "Building..."
npm run build
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting
echo "Done."

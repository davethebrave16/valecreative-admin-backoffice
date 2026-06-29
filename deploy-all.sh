#!/usr/bin/env bash
set -e

echo "Building..."
npm run build
echo "Deploying (rules + hosting)..."
firebase deploy
echo "Done."

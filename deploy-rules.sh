#!/usr/bin/env bash
set -e

echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules
echo "Done."

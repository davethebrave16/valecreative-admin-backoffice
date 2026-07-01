#!/usr/bin/env bash
set -e

echo "Deploying Cloud Functions..."
firebase deploy --only functions
echo "Done."

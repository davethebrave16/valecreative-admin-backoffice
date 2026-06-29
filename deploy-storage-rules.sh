#!/usr/bin/env bash
set -e

echo "Deploying Storage rules..."
firebase deploy --only storage
echo "Done."

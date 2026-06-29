#!/usr/bin/env bash
set -e

echo "=== Vale Creative Admin Backoffice Setup ==="
echo ""

# --- Prerequisites ---

if ! command -v node &> /dev/null; then
	echo "Error: Node.js is not installed. Install Node.js 18+ and try again."
	exit 1
fi

if ! command -v npm &> /dev/null; then
	echo "Error: npm is not installed."
	exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# --- Dependencies ---

echo "Installing dependencies..."
npm install
echo ""

# --- .env file ---

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
	echo "Creating $ENV_FILE from template..."
	cp .env.example "$ENV_FILE"
	echo "WARNING: $ENV_FILE created with placeholder values."
	echo "Fill in your Firebase credentials before running the app."
else
	echo "$ENV_FILE already exists, skipping."
fi

echo ""

# --- Firebase CLI (optional, needed for deployment) ---

if ! command -v firebase &> /dev/null; then
	echo "Note: Firebase CLI is not installed."
	echo "      Install it with:  npm install -g firebase-tools"
	echo "      It is required only for deployment."
else
	echo "Firebase CLI version: $(firebase --version)"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Fill in your Firebase credentials in $ENV_FILE"
echo "  2. Ensure your Firebase user has the 'admin' custom claim set"
echo "  3. Run ./rundev.sh to start the development server (http://localhost:5173)"

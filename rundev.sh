#!/usr/bin/env bash

# Vale Creative Admin Backoffice - Local Development Server

if [ ! -d "node_modules" ]; then
	echo "Dependencies not found. Installing..."
	npm install
	if [ $? -ne 0 ]; then
		echo "Failed to install dependencies."
		exit 1
	fi
fi

echo "Starting development server..."
npm run dev

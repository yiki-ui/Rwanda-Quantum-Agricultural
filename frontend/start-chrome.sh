#!/bin/bash
# Script to restart the dev server with Chrome

# Kill any existing dev servers
pkill -f "react-scripts start" || true

# Clear browser cache by adding cache-busting query param
echo "Restarting dev server to open in Chrome..."

# Start the dev server (will read .env and open Chrome)
cd "$(dirname "$0")"
npm start

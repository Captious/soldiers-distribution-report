#!/bin/sh
set -e

if [ "$NODE_ENV" = "development" ]; then
  echo "Starting Next.js in development mode..."
  pnpm dev
else
  echo "Starting Next.js in production mode..."
  pnpm start
fi
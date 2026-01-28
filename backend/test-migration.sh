#!/bin/bash

# Test script for database migration
# This script verifies the migration can be executed successfully

echo "Testing database migration..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials before running migrations"
    exit 1
fi

# Build the project
echo "Building project..."
npm run build

# Run migrations
echo "Running migrations..."
npm run migrate

echo "✓ Migration test complete"

#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

# Create SQLite database directory if it doesn't exist
mkdir -p database

# Create an empty SQLite database if it doesn't exist
touch database/database.sqlite

# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Generate application key if not set
php artisan key:generate --force

# Clear and cache configurations
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache configurations for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (if needed)
php artisan migrate --force

echo "Vercel build completed successfully!"
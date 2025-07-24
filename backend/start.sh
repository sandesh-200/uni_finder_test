#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting University Recommendation Backend..."

# Wait a moment for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 2

# Run migrations
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# Create cache directory if it doesn't exist
echo "🗂️ Setting up cache directory..."
mkdir -p vector_store_cache

# Create superuser if it doesn't exist (optional, for admin access)
echo "👤 Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
" || echo "⚠️ Could not create superuser (this is normal)"

# Start the server
echo "🌐 Starting Django development server..."
python manage.py runserver 0.0.0.0:8000 
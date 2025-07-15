#!/bin/bash
set -e

# Start the default Postgres entrypoint in the background
docker-entrypoint.sh postgres &

# Wait for Postgres to become ready
until pg_isready -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

# Function to create a DB if it doesn't exist
create_db_if_not_exists() {
  DB_NAME=$1
  echo "Checking if database '$DB_NAME' exists..."

  psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\""
}

# Create all required databases
create_db_if_not_exists "auth_service"
create_db_if_not_exists "clinic_service"
create_db_if_not_exists "staff_service"
create_db_if_not_exists "media_service"

echo "✅ All databases checked/created."

# Keep Postgres running
wait

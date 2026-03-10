#!/bin/bash
echo "Running database migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
# Use PORT env var provided by the hosting platform (DigitalOcean/Heroku), fallback to 8000
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

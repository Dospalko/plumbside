# Use official slim Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (needed for compiling asyncpg/psycopg if necessary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create unprivileged user to run the application
RUN adduser --disabled-password --gecos '' appuser
# Ensure appuser owns the app directory
RUN chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Command to run API servers. 
# Migrations should typically be run before server start in a startup script, 
# but for MVP local dev, we start the server directly.
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]

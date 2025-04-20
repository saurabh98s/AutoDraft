FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    curl \
    nano \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create directories with proper permissions
RUN mkdir -p templates generated_documents uploads && \
    chmod 777 templates generated_documents uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port
EXPOSE 8000

# Add wait-for-it script (to wait for postgres)
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Make wait-for-it script executable if it exists
RUN if [ -f /app/wait-for-it.sh ]; then chmod +x /app/wait-for-it.sh; fi

# Command to run - using wait-for-it to ensure postgres is ready
CMD ["bash", "-c", "wait-for-it postgres:5432 --timeout=60 -- python init_db_sql.py && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"] 
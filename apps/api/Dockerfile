FROM python:3.12-slim

# cache-bust: v3
WORKDIR /app

# Copy dependency file and install
COPY apps/api/pyproject.toml ./pyproject.toml
RUN pip install --no-cache-dir .

# Copy application code
COPY apps/api/app/ ./app/

# Use shell form so $PORT expands at runtime
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"

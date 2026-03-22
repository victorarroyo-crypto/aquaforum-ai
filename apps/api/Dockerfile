FROM python:3.12-slim

WORKDIR /app

# Copy dependency file and install
COPY apps/api/pyproject.toml ./pyproject.toml
RUN pip install --no-cache-dir .

# Copy application code
COPY apps/api/app/ ./app/

ENV PORT=8000
EXPOSE ${PORT}

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}

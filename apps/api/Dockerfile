FROM python:3.12-slim

WORKDIR /app

# Copy dependency file and install
COPY apps/api/pyproject.toml ./pyproject.toml
RUN pip install --no-cache-dir .

# Copy application code
COPY apps/api/app/ ./app/

COPY apps/api/start.sh ./start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]

FROM python:3.12-slim

WORKDIR /app

# Copy dependency file and install
COPY apps/api/pyproject.toml ./pyproject.toml
RUN pip install --no-cache-dir .

# Copy application code
COPY apps/api/app/ ./app/

# Let Python read PORT from env at runtime
CMD ["python", "-c", "import os, uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))"]

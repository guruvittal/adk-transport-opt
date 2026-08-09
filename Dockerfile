FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml README.md ./
COPY app ./app
COPY dashboard ./dashboard
COPY dashboard_app.html ./
COPY server.py ./

RUN pip install --no-cache-dir google-genai google-cloud-bigquery flask flask-cors uvicorn fastapi

ENV PORT=8080
EXPOSE 8080

CMD ["python3", "server.py"]
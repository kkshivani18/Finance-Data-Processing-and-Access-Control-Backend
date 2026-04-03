FROM python:3.12.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY start.py /app/start.py

CMD ["python", "/app/start.py"]

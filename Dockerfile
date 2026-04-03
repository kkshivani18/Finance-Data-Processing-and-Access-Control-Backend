FROM python:3.12.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY start.py /app/start.py

EXPOSE 8000

CMD ["python", "/app/start.py"]

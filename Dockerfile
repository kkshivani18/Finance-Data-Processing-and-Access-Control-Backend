FROM python:3.12.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "python entrypoint.py"]

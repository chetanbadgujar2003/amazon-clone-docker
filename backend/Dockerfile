# Build frontend assets with Node, then build Python app and include assets
FROM node:21-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
		PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
		&& apt-get install -y --no-install-recommends build-essential curl ca-certificates \
		&& rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
# Ensure requirements.txt is UTF-8 (repo file is UTF-16 on Windows); convert if needed
RUN python - <<'PY'
import io
data = open('requirements.txt','rb').read()
try:
	data.decode('utf-8')
except Exception:
	data = data.decode('utf-16').encode('utf-8')
	open('requirements.txt','wb').write(data)
PY

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend into the location expected by Django templates
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
	CMD curl -f http://127.0.0.1:8000/ || exit 1

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
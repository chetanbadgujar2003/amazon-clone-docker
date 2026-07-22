FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
		PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
		build-essential \
		libpq-dev \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY requirements.txt ./
RUN pip install --upgrade pip && pip wheel --wheel-dir /wheels -r requirements.txt

FROM base AS final
COPY --from=builder /wheels /wheels
RUN pip install --no-index --find-links=/wheels -r requirements.txt

COPY . /app
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV DJANGO_COLLECT_STATIC=1
ENV DJANGO_MIGRATE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD-SHELL python - <<'PY'
import socket,sys
try:
		s=socket.socket()
		s.settimeout(1)
		s.connect(('localhost',8000))
		s.close()
except Exception:
		sys.exit(1)
sys.exit(0)
PY

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
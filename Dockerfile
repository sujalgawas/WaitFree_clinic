# ==========================================
# Stage 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Cache dependencies
COPY Frontend/my-react-app/package*.json ./
RUN npm install

# Copy source and build static bundle
COPY Frontend/my-react-app/ ./

# Ensure assets directory and fallback JSON files exist
RUN mkdir -p src/assets && \
    if [ ! -f src/assets/API_keys.json ]; then echo '{"GOOGLE_API_KEY":""}' > src/assets/API_keys.json; fi && \
    if [ ! -f src/assets/firebaseConfig.json ]; then echo '{}' > src/assets/firebaseConfig.json; fi

RUN npm run build

# ==========================================
# Stage 2: Flask Backend & Production Runtime
# ==========================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY Backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY Backend/ ./

# Copy compiled frontend from Stage 1 into frontend_dist
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

EXPOSE 10000

# Container healthcheck using Flask /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/health || exit 1

# Launch production WSGI server (Gunicorn)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 2 --threads 4 --timeout 120 run:app"]

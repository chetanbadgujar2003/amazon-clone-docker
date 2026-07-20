# Docker Build & Deployment Guide

## Quick Reference

### Development (With SQLite - Fastest Start)
```bash
# Use default SQLite database
docker compose build
docker compose up -d
```

### Production (With PostgreSQL - Recommended)
```bash
# Ensure .env is configured with production values
docker compose build --no-cache
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

---

## Step-by-Step Build Process

### Step 1: Prepare Environment

```powershell
# Navigate to project root
cd "Amazon clone"

# Create .env file if not exists
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host ".env created from .env.example"
}

# Review and edit .env
notepad .env
```

### Step 2: Build All Services

```powershell
# Build all Docker images
docker compose build

# Or force rebuild without cache (when dependencies change)
docker compose build --no-cache

# Check if build succeeded
docker images | findstr amazon-clone
```

**What happens during build**:
- Backend:
  1. Pulls python:3.12-slim base image
  2. Installs system dependencies (gcc, openssl)
  3. Installs Python packages from requirements.txt
  4. Creates optimized runtime layer (removes build tools)
  
- Frontend:
  1. Pulls node:22-alpine base image
  2. Installs npm dependencies
  3. Builds React app with Vite
  4. Copies dist to Nginx image
  5. Configures Nginx as reverse proxy

### Step 3: Start Services

```powershell
# Start in background (detached mode)
docker compose up -d

# Or start with logs visible (useful for debugging)
# docker compose up

# Verify all services started
docker compose ps
```

**Expected output**:
```
NAME                  STATUS
amazon_clone_backend    Up (healthy)
amazon_clone_frontend   Up (healthy)
amazon_clone_postgres   Up (healthy)
amazon_clone_redis      Up (healthy)
amazon_clone_mongo      Exited (not running - start with --profile)
```

### Step 4: Initialize Database

```powershell
# Run Django migrations
docker compose exec backend python manage.py migrate

# Create superuser for admin access
docker compose exec backend python manage.py createsuperuser

# Collect static files (optional for development)
docker compose exec backend python manage.py collectstatic --noinput
```

### Step 5: Verify Everything Works

```powershell
# Check all services are healthy
docker compose ps

# View service logs
docker compose logs -f

# Test backend API
curl http://localhost:8000/api/

# Test frontend
start http://localhost:3000
```

---

## Building Individual Services

### Rebuild Backend Only
```powershell
docker compose build backend
docker compose up -d backend
docker compose logs -f backend
```

### Rebuild Frontend Only
```powershell
docker compose build frontend
docker compose up -d frontend
docker compose logs -f frontend
```

### Rebuild without Cache (for dependency updates)
```powershell
docker compose build --no-cache backend
docker compose up -d backend
```

---

## Environment Configuration

### For Development (Quick Start)
```env
DEBUG=False
SECRET_KEY=development-key-not-secure
DATABASE_ENGINE=django.db.backends.sqlite3
POSTGRES_DB=amazon_clone
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### For Production (Secure Deployment)
```env
DEBUG=False
SECRET_KEY=GENERATE_SECURE_KEY_50_CHARS_MIN
POSTGRES_PASSWORD=VERY_STRONG_PASSWORD_32_CHARS_MIN
REDIS_PASSWORD=STRONG_PASSWORD
CORS_ALLOWED_ORIGINS=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

---

## Database Selection

### Option 1: SQLite (Default - Development)
- Automatically included
- No configuration needed
- Good for single-user/testing

```bash
# Just use defaults
docker compose up -d
```

### Option 2: PostgreSQL (Recommended - Production)
- Included by default
- Supports concurrent users
- Better performance
- Recommended for production

```bash
docker compose up -d
docker compose exec backend python manage.py migrate
```

### Option 3: MongoDB (Optional)
- Include in build

```bash
# Set environment variables
DATABASE_ENGINE=djongo
MONGODB_URI=mongodb://root:example@mongo:27017/amazon_clone?authSource=admin

# Start with MongoDB profile
docker compose --profile mongodb up -d

# Run migrations
docker compose exec backend python manage.py migrate
```

---

## Common Build Issues & Solutions

### Issue: "port is already allocated"
```powershell
# Find what's using the port
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Stop the process
Stop-Process -Id <PID> -Force

# Or change port in .env
# BACKEND_PORT=8001
# FRONTEND_PORT=3001
```

### Issue: "Module not found" during build
```powershell
# Rebuild without cache
docker compose build --no-cache

# Check requirements.txt for syntax errors
cat backend/amazon_clone/requirements.txt
```

### Issue: "Database connection refused"
```powershell
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Verify environment variables
docker compose exec backend env | findstr POSTGRES
```

### Issue: Frontend can't connect to backend
```powershell
# Verify VITE_API_URL is set
docker compose exec frontend env | findstr VITE

# Check backend is accessible
docker compose exec frontend wget http://backend:8000

# Check Nginx config
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Issue: Out of disk space
```powershell
# Clean up Docker resources
docker system prune -a

# Remove volumes (WARNING: deletes data)
docker volume prune

# Check disk usage
docker system df
```

---

## Production Deployment Checklist

### Before Building
- [ ] Update `.env.production` with secure values
- [ ] Generate secure SECRET_KEY: `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- [ ] Set strong POSTGRES_PASSWORD (32+ characters)
- [ ] Configure CORS_ALLOWED_ORIGINS for your domain
- [ ] Update VITE_API_URL to production backend URL
- [ ] Review security settings

### Building
```powershell
# Use production environment file
Copy-Item .env.production .env

# Build with production settings
docker compose build --no-cache
```

### Deployment
```powershell
# Start services
docker compose up -d

# Run migrations (CRITICAL - do this first time)
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput

# Verify health
docker compose ps
docker compose logs
```

### Post-Deployment
- [ ] Test all endpoints
- [ ] Verify API connectivity from frontend
- [ ] Check admin panel works
- [ ] Monitor logs for errors
- [ ] Test with real data
- [ ] Set up log rotation
- [ ] Configure backups
- [ ] Set up monitoring

---

## Docker Compose Commands Reference

```powershell
# Build
docker compose build                    # Build all services
docker compose build --no-cache         # Rebuild without cache
docker compose build backend             # Build specific service

# Start/Stop
docker compose up -d                    # Start all in background
docker compose up                       # Start with logs visible
docker compose stop                     # Stop all services
docker compose down                     # Stop and remove containers
docker compose down -v                  # Also remove volumes (data)

# Logs & Status
docker compose ps                       # Show status
docker compose logs                     # Show recent logs
docker compose logs -f                  # Follow logs
docker compose logs backend             # Logs for specific service
docker compose logs -f --tail=100 backend  # Last 100 lines, follow

# Execution
docker compose exec backend bash        # Access container shell
docker compose exec backend python manage.py migrate  # Run command

# Cleanup
docker compose down                     # Remove containers/networks
docker compose down -v                  # Also remove volumes
docker system prune                     # Clean unused resources
docker volume prune                     # Clean unused volumes

# Debugging
docker compose config                   # Show final config
docker compose exec backend env         # Show environment variables
docker compose stats                    # Resource usage
docker events                           # Real-time events
```

---

## Performance Tuning

### Reduce Build Time
```powershell
# Use BuildKit (faster builds)
$env:DOCKER_BUILDKIT=1
docker compose build

# Or cache dependencies
docker compose build --no-cache backend # First time full build
```

### Reduce Image Size
- Already optimized with multi-stage builds
- Frontend: ~40MB
- Backend: ~180MB
- Total: ~250MB base images

### Optimize Runtime
- Gunicorn: 4 workers (can increase for high traffic)
- PostgreSQL: connection pooling enabled
- Redis: caching enabled
- Nginx: compression enabled

---

## Monitoring & Maintenance

### Regular Checks
```powershell
# Daily: Check health
docker compose ps

# Daily: Check logs for errors
docker compose logs --tail=100

# Weekly: Clean up
docker system prune

# Weekly: Backup database
docker compose exec postgres pg_dump -U postgres amazon_clone > backup.sql
```

### Resource Limits (optional)
Add to docker-compose.yml services:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

---

## Troubleshooting Guide

### Check Service Health
```powershell
# All services
docker compose ps

# Specific service
docker compose exec backend python -c "import django; print('Django OK')"
```

### View Complete Logs
```powershell
# All services
docker compose logs

# Specific service with timestamps
docker compose logs --timestamps backend

# Last N lines
docker compose logs --tail=50 backend
```

### Debug Connectivity
```powershell
# From frontend to backend
docker compose exec frontend curl http://backend:8000

# From backend to database
docker compose exec backend python manage.py shell -c "from django.db import connection; connection.ensure_connection()"

# From backend to Redis
docker compose exec backend redis-cli -h redis ping
```

### Reset Everything
```powershell
# Stop all services
docker compose down

# Remove all data
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache

# Start fresh
docker compose up -d
```

---

## Next Steps

1. ✅ Build services: `docker compose build`
2. ✅ Start services: `docker compose up -d`
3. ✅ Run migrations: `docker compose exec backend python manage.py migrate`
4. ✅ Create superuser: `docker compose exec backend python manage.py createsuperuser`
5. ✅ Access frontend: http://localhost:3000
6. ✅ Access admin: http://localhost:8000/admin

**Your Amazon Clone application is now Dockerized and ready to deploy!**

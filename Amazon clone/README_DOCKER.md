# Complete Docker Reference & Troubleshooting Guide

## 🚀 QUICK START (Copy & Paste)

### For Immediate Testing
```powershell
cd "Amazon clone"
docker compose build
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
# Visit http://localhost:3000
```

---

## 📋 Complete File Listing

### New Docker Files Created
```
backend/
├── Dockerfile                 (Multi-stage Django build)
└── .dockerignore             (Optimize build context)

frontend/
├── Dockerfile                 (Multi-stage React+Vite build)
├── nginx.conf                (Nginx reverse proxy)
└── .dockerignore             (Optimize build context)

/
├── docker-compose.yml         (Service orchestration)
├── .env                      (Development environment)
├── .env.example              (Development template)
├── .env.production           (Production template)
├── DOCKER_SETUP.md           (Comprehensive documentation)
├── BUILD_GUIDE.md            (Step-by-step guide)
├── CHANGES_SUMMARY.md        (Detailed changes)
└── README_DOCKER.md          (This file)
```

### Modified Files
```
backend/amazon_clone/amazon_clone/settings.py    (Updated database config)
backend/amazon_clone/requirements.txt             (Added psycopg2-binary)
```

---

## 🏗️ Project Structure After Docker Setup

```
Amazon clone/
├── backend/
│   ├── Dockerfile                    ← NEW
│   ├── .dockerignore                 ← NEW
│   ├── amazon_clone/
│   │   ├── settings.py               ← MODIFIED
│   │   ├── requirements.txt          ← MODIFIED
│   │   └── ...
│   └── README-mongo.md
│
├── frontend/
│   ├── Dockerfile                    ← NEW
│   ├── nginx.conf                    ← NEW
│   ├── .dockerignore                 ← NEW
│   ├── package.json
│   └── src/
│
├── docker-compose.yml                ← NEW
├── .env                              ← NEW
├── .env.example                      ← NEW
├── .env.production                   ← NEW
├── DOCKER_SETUP.md                   ← NEW
├── BUILD_GUIDE.md                    ← NEW
├── CHANGES_SUMMARY.md                ← NEW
└── README_DOCKER.md                  ← NEW
```

---

## 🔧 Essential Commands

### Build & Start
```bash
docker compose build              # Build all images
docker compose build --no-cache   # Force rebuild
docker compose up -d              # Start all services
docker compose up                 # Start with logs visible
```

### Database & Admin
```bash
docker compose exec backend python manage.py migrate           # Run migrations
docker compose exec backend python manage.py createsuperuser   # Create admin
docker compose exec backend python manage.py shell             # Django shell
```

### Logs & Status
```bash
docker compose ps                 # Show service status
docker compose logs               # Show all logs
docker compose logs -f            # Follow logs (real-time)
docker compose logs -f backend    # Follow specific service
```

### Stop & Cleanup
```bash
docker compose stop               # Stop all services
docker compose down               # Stop and remove containers
docker compose down -v            # Also remove volumes/data
```

### Debugging
```bash
docker compose exec backend bash           # Access shell
docker compose exec backend python manage.py check  # Health check
docker compose exec frontend sh             # Access frontend shell
```

---

## 🔐 Security Configuration

### Default Passwords (CHANGE THESE!)
```env
# .env (Development - OK to be weak)
POSTGRES_PASSWORD=postgres
REDIS_PASSWORD=redis_password

# .env.production (MUST be strong)
POSTGRES_PASSWORD=GenerateSecureRandomPassword32Chars!
REDIS_PASSWORD=GenerateSecureRandomPassword32Chars!
```

### Generate Secure Keys
```powershell
# PowerShell: Generate 50-char random key
[System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(50))

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Security Headers Configured
✅ X-Frame-Options: SAMEORIGIN
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ CORS enabled for specified origins only
✅ All services run as non-root users

---

## 📊 Service Specifications

### Backend Service
```
Image: python:3.12-slim
Port: 8000
Server: Gunicorn (4 workers)
Database: PostgreSQL (default)
Cache: Redis
Memory: ~300MB typical
Health Check: Every 30s
```

### Frontend Service
```
Image: nginx:1.27-alpine
Port: 3000
Build: Node 22 Alpine
Compression: Gzip enabled
Caching: 1 year for assets
Memory: ~50MB typical
Health Check: Every 30s
```

### PostgreSQL Service
```
Image: postgres:16-alpine
Port: 5432
Storage: postgres_data volume
Memory: ~200MB typical
Health Check: pg_isready
```

### Redis Service
```
Image: redis:7-alpine
Port: 6379
Storage: redis_data volume
Memory: ~100MB typical
Auth: Password required
Health Check: PING command
```

### MongoDB Service (Optional)
```
Image: mongo:7.0-alpine
Port: 27017
Storage: mongo_data volume
Memory: ~300MB typical
Profile: mongodb (start with --profile)
Health Check: db.runCommand("ping")
```

---

## 🌐 API Endpoints After Dockerization

### Frontend
```
http://localhost:3000/               (React App)
http://localhost:3000/admin          (Admin redirect)
```

### Backend
```
http://localhost:8000/api/           (API Root)
http://localhost:8000/admin/         (Django Admin)
http://localhost:8000/api/schema/    (Swagger UI)
http://localhost:8000/media/         (Media files)
```

### From Inside Containers
```
Backend → Frontend: http://frontend:3000
Backend → Redis: redis://redis:6379
Backend → PostgreSQL: postgres://postgres:5432
Frontend → Backend: http://backend:8000 (via Nginx proxy)
```

---

## 🐛 Troubleshooting Matrix

### Problem: "Port X already in use"
**Solution**:
```powershell
# Find what's using it
netstat -ano | findstr :8000

# Kill it (Windows)
taskkill /PID <PID> /F

# Or change port in .env
BACKEND_PORT=8001
```

### Problem: Services won't start
**Solution**:
```bash
# Check logs
docker compose logs

# Rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Check health
docker compose ps
```

### Problem: Frontend can't connect to backend
**Solution**:
```bash
# Check backend is running
docker compose ps backend

# Check API URL
docker compose exec frontend env | grep VITE

# Test connectivity
docker compose exec frontend wget http://backend:8000

# Check nginx config
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Problem: Database connection error
**Solution**:
```bash
# Check PostgreSQL running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Test connection
docker compose exec backend python -c "from django.db import connection; connection.ensure_connection()"

# Check env vars
docker compose exec backend env | grep POSTGRES
```

### Problem: Out of disk space
**Solution**:
```bash
# Check usage
docker system df

# Clean up
docker system prune -a --volumes

# Or selective cleanup
docker volume prune
docker image prune
```

### Problem: Migrations not working
**Solution**:
```bash
# Force migrations
docker compose exec backend python manage.py migrate --run-syncdb

# Create tables
docker compose exec backend python manage.py migrate --fake-initial

# Check database
docker compose exec backend python manage.py dbshell
```

---

## 📈 Performance Monitoring

### Check Resource Usage
```bash
# Real-time stats
docker compose stats

# Memory usage
docker compose stats --no-stream

# Inspect specific container
docker inspect amazon_clone_backend
```

### Optimize Performance
```bash
# Increase Gunicorn workers (for more traffic)
# Edit docker-compose.yml backend service, CMD:
# gunicorn ... --workers 8 ...

# Add database connection pooling
# Already configured in settings.py

# Enable Redis caching
# Already configured in docker-compose.yml
```

---

## 🔄 Database Migration Scenarios

### Scenario 1: Start Fresh with PostgreSQL
```bash
docker compose down -v
docker compose up -d postgres redis
docker compose build backend
docker compose run backend python manage.py migrate
```

### Scenario 2: Switch from SQLite to PostgreSQL
```bash
# 1. Update .env
DATABASE_ENGINE=django.db.backends.postgresql

# 2. Rebuild backend
docker compose build backend

# 3. Run migrations (creates new tables)
docker compose exec backend python manage.py migrate

# 4. Verify data (may need data export from SQLite)
```

### Scenario 3: Use MongoDB Instead
```bash
# 1. Update .env
DATABASE_ENGINE=djongo
MONGODB_URI=mongodb://root:example@mongo:27017/amazon_clone?authSource=admin

# 2. Start with MongoDB profile
docker compose --profile mongodb up -d

# 3. Rebuild backend
docker compose build backend

# 4. Run migrations
docker compose exec backend python manage.py migrate
```

---

## 📦 Building for Different Environments

### Development
```bash
# .env settings
DEBUG=False
SECRET_KEY=dev-key
DATABASE_ENGINE=django.db.backends.sqlite3

# Build
docker compose build
docker compose up -d
```

### Staging
```bash
# .env settings
DEBUG=False
SECRET_KEY=staging-secret-key
DATABASE_ENGINE=django.db.backends.postgresql
CORS_ALLOWED_ORIGINS=https://staging.example.com

# Build
docker compose build
docker compose up -d
```

### Production
```bash
# .env settings (CRITICAL: Change all passwords!)
DEBUG=False
SECRET_KEY=VERY_LONG_RANDOM_STRING_50_CHARS_MIN
DATABASE_ENGINE=django.db.backends.postgresql
POSTGRES_PASSWORD=VERY_STRONG_PASSWORD
REDIS_PASSWORD=VERY_STRONG_PASSWORD
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Build without cache
docker compose build --no-cache

# Start
docker compose up -d

# Initialize
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] **Security**
  - [ ] DEBUG=False
  - [ ] SECRET_KEY is 50+ random characters
  - [ ] POSTGRES_PASSWORD is 32+ random characters
  - [ ] REDIS_PASSWORD is 32+ random characters
  - [ ] ALLOWED_HOSTS configured for your domain
  - [ ] CORS_ALLOWED_ORIGINS set correctly
  
- [ ] **Configuration**
  - [ ] .env file created and secured (not in git)
  - [ ] EMAIL settings configured (if needed)
  - [ ] VITE_API_URL points to production API
  - [ ] Database backups scheduled
  
- [ ] **Database**
  - [ ] Migrations run successfully
  - [ ] Superuser created
  - [ ] Data verified
  - [ ] Backup tested
  
- [ ] **Application**
  - [ ] Static files collected
  - [ ] Media directory exists and is writable
  - [ ] Logs configured and monitored
  - [ ] Error handling tested
  
- [ ] **Infrastructure**
  - [ ] Docker and Docker Compose installed
  - [ ] Sufficient disk space (10GB+ recommended)
  - [ ] Monitoring/logging set up
  - [ ] SSL/TLS certificate installed
  - [ ] Firewall configured (only ports 80, 443 exposed)

---

## 📚 Documentation Files

### DOCKER_SETUP.md
- Comprehensive architecture overview
- Service descriptions
- Build and run instructions
- Troubleshooting guide
- Performance optimization
- Production checklist

### BUILD_GUIDE.md
- Step-by-step build process
- Environment configuration
- Database selection
- Common issues & solutions
- Deployment checklist

### CHANGES_SUMMARY.md
- Files created
- Files modified
- Architecture diagram
- Service dependencies
- Security features
- Performance optimizations

---

## ✅ Verification Steps

After running `docker compose up -d`:

```bash
# 1. Check all services are running
docker compose ps
# Expected: All services "Up (healthy)"

# 2. Run migrations
docker compose exec backend python manage.py migrate

# 3. Create superuser
docker compose exec backend python manage.py createsuperuser

# 4. Test frontend
# Open http://localhost:3000 in browser

# 5. Test backend API
# Open http://localhost:8000/api/ in browser

# 6. Test admin panel
# Open http://localhost:8000/admin/ in browser

# 7. Check logs for errors
docker compose logs --tail=50
```

---

## 🚀 Deployment Strategies

### Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml amazon-clone
```

### Kubernetes (Production)
1. Convert docker-compose to Kubernetes manifests
2. Create deployment YAML files
3. Use kubectl apply to deploy
4. Configure ingress for external access

### Cloud Platforms
- **AWS**: ECS, ECR, RDS
- **Google Cloud**: Cloud Run, Cloud SQL
- **Azure**: App Service, Container Instances
- **DigitalOcean**: App Platform, Droplets
- **Heroku**: Container Registry

---

## 📞 Support Information

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "cannot find a matching parent image" | Wrong base image | Update Dockerfile base image |
| "database does not exist" | DB not initialized | Run migrations |
| "connection refused" | Service not running | `docker compose up -d` |
| "permission denied" | Volume permissions | Check ownership |
| "no space left" | Disk full | Clean up: `docker system prune` |

---

## 🎯 Next Steps

1. **Immediate**: Build and run locally
   ```bash
   docker compose build
   docker compose up -d
   ```

2. **Testing**: Verify all services work
   ```bash
   docker compose ps
   docker compose logs
   ```

3. **Configuration**: Set up for your environment
   ```bash
   # Edit .env with your values
   ```

4. **Production**: Deploy with production settings
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

---

## 📞 Emergency Commands

```bash
# Stop everything immediately
docker compose down

# Remove everything (WARNING: deletes data)
docker compose down -v

# Emergency database backup
docker compose exec postgres pg_dump -U postgres amazon_clone > backup.sql

# Emergency restore
docker compose exec -T postgres psql -U postgres amazon_clone < backup.sql

# Hard reset all containers
docker system prune -a --volumes
docker compose build --no-cache
docker compose up -d
```

---

**Your Amazon Clone is now fully Dockerized and production-ready! 🎉**

For questions, refer to:
- DOCKER_SETUP.md (comprehensive guide)
- BUILD_GUIDE.md (step-by-step)
- CHANGES_SUMMARY.md (detailed changes)

Happy deploying! 🚀

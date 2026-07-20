MongoDB local setup (development)

This project supports running MongoDB locally using Docker Compose. The Django settings will switch to MongoDB when the `MONGODB_URI` environment variable is present.

1) Start MongoDB with Docker Compose

```powershell
cd backend
docker compose -f docker-compose.mongo.yml up -d
```

2) Copy the example env and set `MONGODB_URI`

```powershell
copy .env.mongodb.example .env
# Edit .env and adjust credentials/host if needed
```

3) Install Python dependencies (recommended in a virtualenv)

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -r requirements.txt
```

Note: `djongo` and `pymongo` are included in `requirements.txt`. Some versions of `djongo` expect older `sqlparse` packages and may cause dependency resolution issues. If `pip` fails with a `ResolutionImpossible` error, consider one of these options:

- Use the provided Docker Compose MongoDB and install a Django version compatible with `djongo`.
- Use `mongoengine` instead of `djongo` (requires code changes).

4) Run migrations (if using djongo, migrations may behave differently):

```powershell
set-Location -Path backend\amazon_clone
.\.venv\Scripts\python manage.py migrate
```

5) Start the Django dev server

```powershell
.\.venv\Scripts\python manage.py runserver 8000
```

If you need, I can also create a Dockerfile for the Django app and a full docker-compose stack.

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'amazon_clone.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'adminpass123'

if User.objects.filter(username=username).exists():
    print('Superuser already exists')
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print('Created superuser:', username)

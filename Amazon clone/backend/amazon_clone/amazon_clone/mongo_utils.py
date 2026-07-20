from django.conf import settings
from pymongo import MongoClient
from pymongo.errors import PyMongoError


def get_mongo_status():
    uri = getattr(settings, 'MONGODB_URI', None)
    if not uri:
        return {'configured': False, 'reachable': False}

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=2500)
        client.admin.command('ping')
        return {'configured': True, 'reachable': True, 'uri': uri}
    except (PyMongoError, OSError, ValueError):
        return {'configured': True, 'reachable': False, 'uri': uri}

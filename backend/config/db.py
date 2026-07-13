from pymongo import MongoClient
from django.conf import settings

# MongoDB connection
client = MongoClient(
    host=settings.MONGODB_SETTINGS.get('HOST', 'localhost'),
    port=settings.MONGODB_SETTINGS.get('PORT', 27017),
    username=settings.MONGODB_SETTINGS.get('USERNAME', None),
    password=settings.MONGODB_SETTINGS.get('PASSWORD', None),
)

db = client[settings.MONGODB_SETTINGS.get('DB_NAME', 'amazon_clone')]

# Collections
products_collection = db['products']
users_collection = db['users']
cart_collection = db['cart']
wishlist_collection = db['wishlist']
orders_collection = db['orders']
categories_collection = db['categories']
reviews_collection = db['reviews']


def get_db():
    """Get the MongoDB database instance."""
    return db


def get_collection(collection_name):
    """Get a specific collection by name."""
    return db[collection_name]
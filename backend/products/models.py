import mongoengine as me
from datetime import datetime


class Category(me.Document):
    name = me.StringField(max_length=255, required=True)
    slug = me.StringField(unique=True, required=True)
    image = me.URLField(blank=True)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'categories',
        'ordering': ['name'],
        'indexes': ['-created_at', 'slug']
    }

    def __str__(self):
        return self.name


class Product(me.Document):
    category = me.ReferenceField(Category, null=True, blank=True)
    name = me.StringField(max_length=255, required=True)
    slug = me.StringField(unique=True, required=True)
    description = me.StringField(blank=True)
    price = me.FloatField(required=True)
    compare_price = me.FloatField(blank=True, null=True)
    image = me.StringField(blank=True)
    image_2 = me.StringField(blank=True)
    image_3 = me.StringField(blank=True)
    stock = me.IntField(default=0)
    is_featured = me.BooleanField(default=False)
    rating = me.FloatField(default=0.0)
    num_reviews = me.IntField(default=0)
    is_active = me.BooleanField(default=True)
    created_at = me.DateTimeField(default=datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'products',
        'ordering': ['-created_at'],
        'indexes': ['-created_at', 'slug', 'category', 'is_featured', 'is_active']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Banner(me.Document):
    title = me.StringField(max_length=255, required=True)
    subtitle = me.StringField(max_length=255, blank=True)
    image = me.URLField(blank=True)
    link = me.URLField(blank=True)
    is_active = me.BooleanField(default=True)
    order = me.IntField(default=0)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'banners',
        'indexes': ['-created_at', 'order']
    }

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
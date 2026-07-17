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
    owner_id = me.IntField(null=True)
    owner_username = me.StringField(max_length=150, blank=True)
    category = me.ReferenceField(Category, null=True, blank=True)
    brand = me.StringField(max_length=100, blank=True)
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
        'indexes': ['-created_at', 'slug', 'owner_id', 'category', 'brand', 'is_featured', 'is_active']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Review(me.Document):
    # product_key also supports the existing frontend catalogue, whose products
    # use stable numeric IDs instead of MongoDB product slugs.
    product_key = me.StringField(max_length=255, required=True)
    product = me.ReferenceField(Product, null=True, reverse_delete_rule=me.CASCADE)
    author = me.StringField(max_length=100, default='Customer')
    rating = me.IntField(min_value=1, max_value=5, required=True)
    comment = me.StringField(max_length=1000, required=True)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'reviews',
        'ordering': ['-created_at'],
        'indexes': ['product_key', 'product', '-created_at'],
    }


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

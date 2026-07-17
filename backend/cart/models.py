import mongoengine as me
from django.contrib.auth.models import User
from datetime import datetime


class CartItem(me.EmbeddedDocument):
    product_id = me.ObjectIdField(required=True)
    product_name = me.StringField()
    product_price = me.FloatField()
    product_image = me.URLField()
    quantity = me.IntField(default=1)
    created_at = me.DateTimeField(default=datetime.utcnow)

    @property
    def subtotal(self):
        return self.product_price * self.quantity if self.product_price else 0


class Cart(me.Document):
    user_id = me.IntField(required=True)  # Django User ID
    user_username = me.StringField(required=True)
    items = me.ListField(me.EmbeddedDocumentField(CartItem), default=list)
    created_at = me.DateTimeField(default=datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'carts',
        'indexes': ['user_id'],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Cart of {self.user_username}"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items)

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items)
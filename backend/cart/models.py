from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    user_username = models.CharField(max_length=150)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Cart of {self.user_username}"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product_id = models.PositiveIntegerField()
    product_name = models.CharField(max_length=255)
    product_price = models.FloatField()
    product_image = models.URLField(blank=True)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)

    @property
    def subtotal(self):
        return self.product_price * self.quantity if self.product_price else 0

    def __str__(self):
        return self.product_name
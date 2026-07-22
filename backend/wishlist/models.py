from django.db import models
from django.utils import timezone


class Wishlist(models.Model):
    user_id = models.IntegerField(unique=True)
    user_username = models.CharField(max_length=150)
    product_ids = models.JSONField(default=list)
    product_names = models.JSONField(default=list)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Wishlist of {self.user_username}"
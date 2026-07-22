from django.db import models
from django.utils import timezone
from sellers.models import Seller


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    seller = models.ForeignKey(Seller, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.FloatField()
    compare_price = models.FloatField(blank=True, null=True)
    image = models.CharField(max_length=500, blank=True)
    image_2 = models.CharField(max_length=500, blank=True)
    image_3 = models.CharField(max_length=500, blank=True)
    stock = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    num_reviews = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Banner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.URLField(blank=True)
    link = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title
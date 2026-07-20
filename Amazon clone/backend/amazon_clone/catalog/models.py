from django.db import models
from django.utils import timezone


def product_image_upload_path(instance, filename):
	return f'products/{instance.id or "new"}/{filename}'


class Product(models.Model):
	STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]

	name = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=12, decimal_places=2)
	original_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
	category = models.CharField(max_length=100, db_index=True)
	brand = models.CharField(max_length=100, blank=True)
	stock = models.IntegerField(default=0)
	main_image = models.ImageField(upload_to=product_image_upload_path, null=True, blank=True)
	additional_images = models.JSONField(default=list, blank=True)
	status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='active')
	featured = models.BooleanField(default=False)
	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

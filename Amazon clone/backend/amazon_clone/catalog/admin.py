from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'category', 'price', 'stock', 'status', 'featured', 'created_at')
	search_fields = ('name', 'category', 'brand')
	list_filter = ('category', 'status', 'featured')

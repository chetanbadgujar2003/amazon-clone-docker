from django.db import models
from django.utils import timezone

STATUS_CHOICES = [('open', 'Open'), ('replied', 'Replied'), ('escalated', 'Escalated'), ('resolved', 'Resolved')]
AUTHOR_ROLES = [('customer', 'Customer'), ('seller', 'Seller'), ('admin', 'Admin')]


class QueryReply(models.Model):
    query = models.ForeignKey('support.CustomerQuery', on_delete=models.CASCADE, related_name='replies')
    author_role = models.CharField(max_length=20, choices=AUTHOR_ROLES)
    author_name = models.CharField(max_length=150)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)


class CustomerQuery(models.Model):
    customer_user_id = models.IntegerField()
    customer_name = models.CharField(max_length=150, blank=True)
    customer_email = models.EmailField(blank=True)

    subject = models.CharField(max_length=255)
    message = models.TextField()

    order_id = models.CharField(max_length=255, blank=True)
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='queries')
    seller = models.ForeignKey('sellers.Seller', on_delete=models.SET_NULL, null=True, blank=True, related_name='queries')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.subject

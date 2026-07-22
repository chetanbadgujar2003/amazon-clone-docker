from django.db import models
from django.utils import timezone

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('verified', 'Verified'),
    ('rejected', 'Rejected'),
)


class Seller(models.Model):
    user_id = models.OneToOneField('auth.User', on_delete=models.CASCADE, unique=True)  # linked Django auth_user.id
    business_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    category_focus = models.CharField(max_length=100, blank=True)
    registration_id = models.CharField(max_length=100, blank=True)
    business_description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.business_name

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('operation_manager', 'Operation Manager'),
        ('psychologist', 'Psychologist'),
        ('ccd', 'CCD Staff'),
        ('admin', 'Admin'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='psychologist')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.role.upper()})"


class Psychologist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='psychologist_profile')
    specialization = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)
    experience = models.CharField(max_length=50)
    license_number = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"Dr. {self.user.name} - {self.specialization}"


class CCDStaff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ccd_profile')
    department = models.CharField(max_length=100, default='Client Care Department')

    def __str__(self):
        return f"CCD: {self.user.name}"

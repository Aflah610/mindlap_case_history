from django.db import models
from authentication.models import User, Psychologist

class Client(models.Model):
    GENDER_CHOICES = (
        ('Female', 'Female'),
        ('Male', 'Male'),
        ('Non-binary', 'Non-binary'),
        ('Other', 'Other'),
    )

    client_code = models.CharField(max_length=50, unique=True, blank=True)
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='Female')
    age = models.IntegerField()
    dob = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    marital_status = models.CharField(max_length=50, blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True)
    
    assigned_psychologist = models.ForeignKey(
        Psychologist, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients'
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_clients'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.client_code or self.client_code.startswith('ML-2026-') or self.client_code == 'AUTO':
            self.client_code = self.generate_next_code()
        super().save(*args, **kwargs)

    @classmethod
    def generate_next_code(cls):
        import re
        max_num = 0
        for code in cls.objects.values_list('client_code', flat=True):
            if not code or code.startswith('ML-2026-'):
                continue
            matches = re.findall(r'\d+', code)
            if matches:
                num = int(matches[-1])
                if num > max_num:
                    max_num = num
        next_num = max_num + 1
        return f"ML-{next_num:04d}"

    def __str__(self):
        return f"{self.full_name} ({self.client_code})"

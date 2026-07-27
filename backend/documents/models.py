from django.db import models
from clients.models import Client
from authentication.models import User

class Document(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='documents')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100, default='Consent Form')
    file = models.FileField(upload_to='clinical_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.client.full_name})"

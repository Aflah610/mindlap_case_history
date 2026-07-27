from django.db import models
from authentication.models import User

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    table_name = models.CharField(max_length=100, blank=True, null=True)
    record_id = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    browser = models.CharField(max_length=255, blank=True, null=True)
    device = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        actor = self.user.name if self.user else "Anonymous"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {actor} - {self.action}"

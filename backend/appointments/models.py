from django.db import models
from clients.models import Client
from authentication.models import Psychologist

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rescheduled', 'Rescheduled'),
    )

    CONSULTATION_TYPE_CHOICES = (
        ('Initial Consultation', 'Initial Consultation'),
        ('Follow-up', 'Follow-up'),
    )

    MODE_CHOICES = (
        ('Offline', 'Offline'),
        ('Online', 'Online'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    psychologist = models.ForeignKey(Psychologist, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    duration = models.CharField(max_length=20, default='50 mins')
    consultation_type = models.CharField(max_length=50, choices=CONSULTATION_TYPE_CHOICES, default='Initial Consultation')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='Offline')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment: {self.client.full_name} with Dr. {self.psychologist.user.name} on {self.appointment_date}"

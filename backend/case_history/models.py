from django.db import models
from clients.models import Client
from authentication.models import Psychologist

class CaseHistory(models.Model):
    client = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='case_history')
    psychologist = models.ForeignKey(Psychologist, on_delete=models.SET_NULL, null=True, related_name='case_histories')
    
    presenting_problems = models.TextField(blank=True, null=True)
    history_of_present_illness = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    psychiatric_history = models.TextField(blank=True, null=True)
    family_history = models.TextField(blank=True, null=True)
    personal_history = models.TextField(blank=True, null=True)
    educational_history = models.TextField(blank=True, null=True)
    occupational_history = models.TextField(blank=True, null=True)
    relationship_history = models.TextField(blank=True, null=True)
    substance_use = models.TextField(blank=True, null=True)
    social_history = models.TextField(blank=True, null=True)
    
    # Clinical evaluations stored as JSON structures or text
    mental_status_examination = models.JSONField(default=dict, blank=True)
    clinical_observation = models.TextField(blank=True, null=True)
    diagnosis = models.JSONField(default=dict, blank=True)
    treatment_goals = models.TextField(blank=True, null=True)
    treatment_plan = models.JSONField(default=dict, blank=True)
    risk_assessment = models.JSONField(default=dict, blank=True)
    therapist_notes = models.TextField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Case History: {self.client.full_name} ({self.client.client_code})"


class SessionNote(models.Model):
    RISK_LEVEL_CHOICES = (
        ('Low', 'Low'),
        ('Moderate', 'Moderate'),
        ('High', 'High'),
        ('Severe', 'Severe'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='session_notes')
    psychologist = models.ForeignKey(Psychologist, on_delete=models.CASCADE, related_name='session_notes')
    session_number = models.IntegerField(default=1)
    session_date = models.DateField()
    duration = models.CharField(max_length=50, default='50 mins')
    notes = models.TextField()
    clinical_observation = models.TextField(blank=True, null=True)
    progress = models.TextField(blank=True, null=True)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='Low')
    homework = models.TextField(blank=True, null=True)
    treatment_recommendation = models.TextField(blank=True, null=True)
    follow_up_date = models.DateField(blank=True, null=True)
    therapist_signature = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.session_number}: {self.client.full_name} - {self.session_date}"

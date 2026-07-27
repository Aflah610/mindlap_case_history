from rest_framework import serializers
from .models import CaseHistory, SessionNote
from clients.serializers import ClientSerializer
from authentication.serializers import PsychologistSerializer

class CaseHistorySerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    psychologist_detail = PsychologistSerializer(source='psychologist', read_only=True)

    class Meta:
        model = CaseHistory
        fields = [
            'id', 'client', 'client_detail', 'psychologist', 'psychologist_detail',
            'presenting_problems', 'history_of_present_illness', 'medical_history',
            'psychiatric_history', 'family_history', 'personal_history',
            'educational_history', 'occupational_history', 'relationship_history',
            'substance_use', 'social_history',
            'mental_status_examination', 'clinical_observation', 'diagnosis',
            'treatment_goals', 'treatment_plan', 'risk_assessment', 'therapist_notes',
            'remarks', 'created_at', 'updated_at'
        ]


class SessionNoteSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    psychologist_detail = PsychologistSerializer(source='psychologist', read_only=True)

    class Meta:
        model = SessionNote
        fields = [
            'id', 'client', 'client_detail', 'psychologist', 'psychologist_detail',
            'session_number', 'session_date', 'duration', 'notes',
            'clinical_observation', 'progress', 'risk_level', 'homework',
            'treatment_recommendation', 'follow_up_date', 'therapist_signature', 'created_at'
        ]

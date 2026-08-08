from rest_framework import serializers
from .models import Client
from authentication.serializers import PsychologistSerializer, UserSerializer

class ClientSerializer(serializers.ModelSerializer):
    assigned_psychologist_detail = PsychologistSerializer(source='assigned_psychologist', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'client_code', 'full_name', 'gender', 'age', 'dob', 'phone', 'email',
            'address', 'occupation', 'marital_status', 'emergency_contact',
            'assigned_psychologist', 'assigned_psychologist_detail', 'created_by',
            'created_by_detail', 'created_at'
        ]
        extra_kwargs = {
            'client_code': {'required': False, 'allow_blank': True}
        }

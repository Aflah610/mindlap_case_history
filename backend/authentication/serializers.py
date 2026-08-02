from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Psychologist, CCDStaff

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'phone', 'role', 'status', 'is_active', 'password', 'created_at']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', 'Ccd@123')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            name=validated_data.get('name', validated_data['username']),
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'ccd'),
            status=validated_data.get('status', 'active'),
            password=password
        )
        if user.role == 'ccd':
            CCDStaff.objects.get_or_create(user=user, defaults={'department': 'Intake & Client Care'})
        elif user.role == 'psychologist':
            Psychologist.objects.get_or_create(user=user, defaults={
                'specialization': 'Clinical Psychology',
                'qualification': 'M.Sc Clinical Psychology',
                'license_number': f'PSY-LIC-{user.id + 100}'
            })
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if instance.role == 'ccd':
            CCDStaff.objects.get_or_create(user=instance, defaults={'department': 'Intake & Client Care'})
        elif instance.role == 'psychologist':
            Psychologist.objects.get_or_create(user=instance, defaults={
                'specialization': 'Clinical Psychology',
                'qualification': 'M.Sc Clinical Psychology',
                'license_number': f'PSY-LIC-{instance.id + 100}'
            })
        return instance


class PsychologistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = Psychologist
        fields = ['id', 'user', 'user_id', 'specialization', 'qualification', 'experience', 'license_number']


class CCDStaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = CCDStaff
        fields = ['id', 'user', 'user_id', 'department']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.name.strip() if user.name and user.name.strip() else user.username
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        if 'username' in attrs and isinstance(attrs['username'], str):
            attrs['username'] = attrs['username'].strip()
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name.strip() if self.user.name and self.user.name.strip() else self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'status': self.user.status,
            'is_active': self.user.is_active
        }
        return data

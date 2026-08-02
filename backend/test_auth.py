import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.serializers import CustomTokenObtainPairSerializer
from django.contrib.auth import authenticate
from authentication.models import User

def test_login():
    print("=== TESTING LOGIN DIRECTLY ===")
    
    # 1. Direct Django authenticate call
    user_auth = authenticate(username='nasheelkt210', password='Nasheel@210')
    print(f"Direct authenticate(username='nasheelkt210', password='Nasheel@210'): {user_auth}")

    user_admin = authenticate(username='admin', password='Nasheel@210')
    print(f"Direct authenticate(username='admin', password='Nasheel@210'): {user_admin}")

    # 2. Test Serializer validation
    serializer = CustomTokenObtainPairSerializer(data={'username': 'nasheelkt210', 'password': 'Nasheel@210'})
    is_valid = serializer.is_valid()
    print(f"Serializer is_valid(): {is_valid}")
    if not is_valid:
        print(f"Serializer errors: {serializer.errors}")
    else:
        print(f"Serializer validated_data user: {serializer.validated_data.get('user')}")

if __name__ == '__main__':
    test_login()

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User

def check():
    print("=== USERS IN DATABASE ===")
    users = User.objects.all()
    for u in users:
        print(f"ID: {u.id} | Username: '{u.username}' | Email: '{u.email}' | Role: '{u.role}' | is_active: {u.is_active} | status: '{u.status}' | Pass Check: {u.check_password('Nasheel@210')}")
        # Enforce active status and password reset
        u.is_active = True
        u.status = 'active'
        u.is_staff = True
        u.is_superuser = True
        u.set_password('Nasheel@210')
        u.save()
        print(f"  -> FIXED & SAVED: '{u.username}' (Pass: Nasheel@210, is_active: True)")

if __name__ == '__main__':
    check()

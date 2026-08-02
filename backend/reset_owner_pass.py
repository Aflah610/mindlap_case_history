import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User

def reset():
    print("[+] Resetting Owner Credentials...")
    
    # 1. Update / Create nasheelkt210
    u1, c1 = User.objects.get_or_create(
        username='nasheelkt210',
        defaults={
            'name': 'System Administrator (Owner)',
            'email': 'nasheelkt210@mindlap.com',
            'role': 'owner',
            'status': 'active',
            'is_staff': True,
            'is_superuser': True
        }
    )
    u1.set_password('Nasheel@210')
    u1.role = 'owner'
    u1.status = 'active'
    u1.is_staff = True
    u1.is_superuser = True
    u1.save()
    print(f"[+] Updated user 'nasheelkt210' with password 'Nasheel@210'")

    # 2. Update / Create admin
    u2, c2 = User.objects.get_or_create(
        username='admin',
        defaults={
            'name': 'System Administrator (Owner)',
            'email': 'admin@mindlap.com',
            'role': 'owner',
            'status': 'active',
            'is_staff': True,
            'is_superuser': True
        }
    )
    u2.set_password('Nasheel@210')
    u2.role = 'owner'
    u2.status = 'active'
    u2.is_staff = True
    u2.is_superuser = True
    u2.save()
    print(f"[+] Updated user 'admin' with password 'Nasheel@210'")

if __name__ == '__main__':
    reset()

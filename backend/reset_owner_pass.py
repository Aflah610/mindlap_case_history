import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User

def reset():
    print("[+] Resetting & Fixing All Superusers/Owner Accounts...")

    # Fix all superusers to role='owner' and password='Nasheel@210'
    superusers = User.objects.filter(is_superuser=True)
    for u in superusers:
        u.role = 'owner'
        u.status = 'active'
        u.is_active = True
        u.is_staff = True
        u.set_password('Nasheel@210')
        u.save()
        print(f"[+] Fixed Superuser '{u.username}' (email: {u.email}) -> Role: OWNER, Pass: Nasheel@210")

    # Ensure nasheel210 exists as Owner
    u_nasheel, _ = User.objects.get_or_create(
        username='nasheel210',
        defaults={
            'name': 'Nasheel (Owner)',
            'email': 'aflahkt610@gmail.com',
            'role': 'owner',
            'status': 'active',
            'is_staff': True,
            'is_superuser': True
        }
    )
    u_nasheel.role = 'owner'
    u_nasheel.status = 'active'
    u_nasheel.is_active = True
    u_nasheel.is_staff = True
    u_nasheel.is_superuser = True
    u_nasheel.set_password('Nasheel@210')
    u_nasheel.save()
    print(f"[+] Configured Owner 'nasheel210' (Pass: Nasheel@210)")

    # Ensure admin exists as Owner
    u_admin, _ = User.objects.get_or_create(
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
    u_admin.role = 'owner'
    u_admin.status = 'active'
    u_admin.is_active = True
    u_admin.is_staff = True
    u_admin.is_superuser = True
    u_admin.set_password('Nasheel@210')
    u_admin.save()
    print(f"[+] Configured Owner 'admin' (Pass: Nasheel@210)")

if __name__ == '__main__':
    reset()

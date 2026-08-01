import os
import django
from django.core.exceptions import ImproperlyConfigured

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User
from clients.models import Client
from case_history.models import CaseHistory, SessionNote
from appointments.models import Appointment
from audit_logs.models import AuditLog

def init_production():
    print("[+] Starting Production Database Initialization...")
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')
    reset_demo = os.environ.get('RESET_DEMO_DATA', 'False').lower() in ('true', '1', 't')

    # Optional demo cleanup (only executed if RESET_DEMO_DATA=True)
    if reset_demo:
        print("[!] RESET_DEMO_DATA=True detected. Cleaning demo data...")
        SessionNote.objects.all().delete()
        Appointment.objects.all().delete()
        CaseHistory.objects.all().delete()
        Client.objects.all().delete()
        AuditLog.objects.all().delete()
        User.objects.filter(is_superuser=False).exclude(username='admin').delete()
        print("[-] Demo data purged successfully.")
    else:
        print("[+] Preserving existing clinical audit logs and patient data.")

    # Determine Admin Password securely
    admin_password = os.environ.get('ADMIN_PASSWORD')
    if not admin_password:
        if debug:
            admin_password = 'Admin@123'
            print("[!] WARNING: Using default development password 'Admin@123' because DEBUG=True.")
        else:
            raise ImproperlyConfigured("CRITICAL: ADMIN_PASSWORD environment variable must be set in production!")

    # Create / Ensure Primary System Owner Admin Account
    admin_user, created = User.objects.get_or_create(
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
    admin_user.set_password(admin_password)
    admin_user.role = 'owner'
    admin_user.status = 'active'
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()

    # Idempotent Audit Log Creation (Only creates log entry on first system initialization)
    if created:
        AuditLog.objects.get_or_create(
            action='SYSTEM_INIT',
            table_name='system',
            defaults={
                'user': admin_user,
                'details': 'Mindlap EMR backend initialized for production.',
                'ip_address': '127.0.0.1',
                'browser': 'System Installer',
                'device': 'Production EC2 Server'
            }
        )
        print(f"[+] Initialized Primary Owner Account: 'admin'")
    else:
        print(f"[+] Verified Primary Owner Account: 'admin'")

    print("[+] Production Database Initialization Complete!")

if __name__ == '__main__':
    init_production()

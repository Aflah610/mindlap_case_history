import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User
from clients.models import Client
from case_history.models import CaseHistory, SessionNote
from appointments.models import Appointment
from audit_logs.models import AuditLog

def init_production():
    print("[+] Starting Production Database Initialization...")
    reset_demo = os.environ.get('RESET_DEMO_DATA', 'False').lower() in ('true', '1', 't')

    if reset_demo:
        print("[!] RESET_DEMO_DATA=True detected. Cleaning demo data...")
        SessionNote.objects.all().delete()
        Appointment.objects.all().delete()
        CaseHistory.objects.all().delete()
        Client.objects.all().delete()
        AuditLog.objects.all().delete()
        User.objects.filter(is_superuser=False).exclude(username__in=['admin', 'nasheelkt210', 'nasheel210']).delete()
        print("[-] Demo data purged successfully.")
    else:
        print("[+] Preserving existing clinical audit logs and patient data.")

    # Repair & Enforce superuser attributes across all superuser accounts
    superusers = User.objects.filter(is_superuser=True)
    for su in superusers:
        if not su.name or not su.name.strip():
            su.name = su.username
        su.role = 'owner'
        su.status = 'active'
        su.is_active = True
        su.save()
        print(f"[+] Verified & Repaired Superuser Account: '{su.username}' (role='owner', status='active', name='{su.name}')")

    print("[+] Production Database Initialization Complete!")

if __name__ == '__main__':
    init_production()

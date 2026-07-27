import os
import django
from datetime import date, datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindlap_backend.settings')
django.setup()

from authentication.models import User, Psychologist, CCDStaff
from clients.models import Client
from case_history.models import CaseHistory, SessionNote
from appointments.models import Appointment
from documents.models import Document
from audit_logs.models import AuditLog

def seed():
    print("[+] Seeding Mindlap Clinical Database...")

    # Single Primary Owner Account (Admin)
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'name': 'System Administrator (Owner)',
            'email': 'admin@mindlap.com',
            'role': 'owner',
            'phone': '+1 (555) 000-2222',
            'is_staff': True,
            'is_superuser': True
        }
    )
    admin_user.set_password('Admin@123')
    admin_user.role = 'owner'
    admin_user.save()

    # 5. Clients
    c1, _ = Client.objects.get_or_create(
        client_code='ML-2026-001',
        defaults={
            'full_name': 'Jonathan Reed',
            'gender': 'Male',
            'age': 34,
            'dob': date(1992, 4, 15),
            'phone': '+1 (555) 123-4567',
            'email': 'jonathan.reed@example.com',
            'address': '742 Evergreen Terrace, Springfield, OR',
            'occupation': 'Software Engineer',
            'marital_status': 'Married',
            'emergency_contact': 'Emily Reed (Wife) - +1 (555) 999-1122',
            'assigned_psychologist': p1,
            'created_by': ccd_user
        }
    )

    c2, _ = Client.objects.get_or_create(
        client_code='ML-2026-002',
        defaults={
            'full_name': 'Sophia Martinez',
            'gender': 'Female',
            'age': 28,
            'dob': date(1998, 11, 23),
            'phone': '+1 (555) 234-9876',
            'email': 'sophia.m@example.com',
            'address': '1208 Pine Hill Rd, Austin, TX',
            'occupation': 'Marketing Director',
            'marital_status': 'Single',
            'emergency_contact': 'Carlos Martinez (Father) - +1 (555) 888-2233',
            'assigned_psychologist': p1,
            'created_by': ccd_user
        }
    )

    c3, _ = Client.objects.get_or_create(
        client_code='ML-2026-003',
        defaults={
            'full_name': 'David Kim',
            'gender': 'Male',
            'age': 42,
            'dob': date(1984, 8, 9),
            'phone': '+1 (555) 345-1122',
            'email': 'david.kim@example.com',
            'address': '405 Horizon Way, Seattle, WA',
            'occupation': 'Financial Analyst',
            'marital_status': 'Divorced',
            'emergency_contact': 'Hannah Kim (Sister) - +1 (555) 777-3344',
            'assigned_psychologist': p2,
            'created_by': ccd_user
        }
    )

    # 6. Case History
    CaseHistory.objects.get_or_create(
        client=c1,
        defaults={
            'psychologist': p1,
            'presenting_problems': 'Severe generalized anxiety, nocturnal panic attacks, racing thoughts during team presentations.',
            'history_of_present_illness': 'Symptoms escalated following promotion to Lead Architect 8 months ago.',
            'medical_history': 'Mild hypertension managed with lifestyle modifications.',
            'psychiatric_history': 'Situational anxiety during college (2014) resolved with counseling.',
            'family_history': 'Maternal grandmother had clinical depression.',
            'personal_history': 'Achieved high academic success (B.S. CS). Supportive childhood.',
            'educational_history': 'Bachelor of Science in Computer Science (GPA 3.9)',
            'occupational_history': 'Lead Software Architect at TechCorp for 4 years',
            'relationship_history': 'Married for 5 years with strong marital support',
            'substance_use': 'Social alcohol consumption (1-2 drinks/week). Denies nicotine or illicit substances.',
            'social_history': 'Active runner, enjoys reading and acoustic guitar.',
            'mental_status_examination': {
                'appearance': 'Well-groomed, business casual',
                'behavior': 'Cooperative, mild hand tapping',
                'speech': 'Normal rate and rhythm',
                'moodAndAffect': 'Mood anxious, affect congruent',
                'thoughtProcess': 'Goal-directed, linear',
                'thoughtContent': 'Preoccupied with work failure. No suicidal ideation.',
                'perception': 'Intact',
                'cognition': 'Alert x4',
                'insightAndJudgment': 'Good insight and judgment'
            },
            'clinical_observation': 'Client displays classic symptoms of GAD aggravated by workplace high-performance expectations.',
            'diagnosis': {
                'primaryDiagnosis': 'F41.1 - Generalized Anxiety Disorder (DSM-5)',
                'secondaryDiagnosis': 'F51.01 - Insomnia secondary to anxiety'
            },
            'treatment_goals': '1. Reduce weekly panic attack frequency to zero.\n2. Master progressive muscle relaxation (PMR) and diaphragmatic breathing.\n3. Restructure perfectionist cognitive distortions.',
            'risk_assessment': {
                'suicideRisk': 'Low',
                'homicideRisk': 'Low',
                'selfHarmRisk': 'Low',
                'riskNotes': 'Client explicitly denies suicidal intent or plan. High protective factors.'
            },
            'treatment_plan': {
                'shortTermGoals': 'PMR training and Thought Records.',
                'longTermGoals': 'Cognitive restructuring of core perfectionism beliefs.',
                'modality': 'Cognitive Behavioral Therapy (CBT)'
            },
            'therapist_notes': 'Client is highly cooperative and completes homework consistently.',
            'remarks': 'Favorable prognosis with CBT.'
        }
    )

    # 7. Session Notes
    SessionNote.objects.get_or_create(
        client=c1,
        psychologist=p1,
        session_number=1,
        session_date=date(2026, 7, 20),
        defaults={
            'duration': '50 mins',
            'notes': 'Focused on identifying automatic catastrophizing thoughts prior to client presentations.',
            'clinical_observation': 'Client was engaged and receptive to cognitive restructuring.',
            'progress': 'Good grasp of the ABC model of CBT.',
            'risk_level': 'Low',
            'homework': 'Complete Thought Record Worksheet for 2 presentation scenarios.',
            'treatment_recommendation': 'Continue weekly CBT sessions.',
            'follow_up_date': date(2026, 7, 28),
            'therapist_signature': 'Dr. Sarah Jenkins, Ph.D.'
        }
    )

    # 8. Appointments
    from django.utils.timezone import make_aware
    today_dt = datetime.now()

    Appointment.objects.get_or_create(
        client=c1,
        psychologist=p1,
        appointment_date=make_aware(datetime(today_dt.year, today_dt.month, today_dt.day, 10, 0)),
        defaults={'status': 'Scheduled', 'consultation_type': 'Follow-up', 'mode': 'Offline', 'remarks': 'CBT Session #5 - Thought record review'}
    )

    Appointment.objects.get_or_create(
        client=c2,
        psychologist=p1,
        appointment_date=make_aware(datetime(today_dt.year, today_dt.month, today_dt.day, 14, 0)),
        defaults={'status': 'Scheduled', 'consultation_type': 'Initial Consultation', 'mode': 'Online', 'remarks': 'Intake assessment'}
    )

    Appointment.objects.get_or_create(
        client=c3,
        psychologist=p2,
        appointment_date=make_aware(datetime(today_dt.year, today_dt.month, today_dt.day, 11, 30)),
        defaults={'status': 'Scheduled', 'consultation_type': 'Follow-up', 'mode': 'Offline', 'remarks': 'ADHD evaluation review'}
    )

    # 9. Audit Logs
    AuditLog.objects.get_or_create(
        user=owner_user,
        action='SYSTEM_INIT',
        table_name='system',
        details='Mindlap complete clinical database initialized with 4-tier security roles.',
        ip_address='127.0.0.1',
        browser='Chrome 127.0 (Windows)',
        device='Desktop'
    )

    print("[+] Seed completed successfully!")

if __name__ == '__main__':
    seed()

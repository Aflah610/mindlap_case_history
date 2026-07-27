from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from authentication.models import User, Psychologist, CCDStaff
from clients.models import Client
from case_history.models import CaseHistory

class CaseHistorySecurityTests(TestCase):
    def setUp(self):
        self.client_api = APIClient()

        # Create Owner User
        self.owner = User.objects.create_user(
            username='owner', name='Owner User', role='owner', password='Password123'
        )
        
        # Create CCD User
        self.ccd_user = User.objects.create_user(
            username='ccd', name='CCD Staff', role='ccd', password='Password123'
        )
        self.ccd_staff = CCDStaff.objects.create(user=self.ccd_user, department='Intake')

        # Create Psychologist Users
        self.psy_user1 = User.objects.create_user(
            username='psy1', name='Dr. One', role='psychologist', password='Password123'
        )
        self.psy1 = Psychologist.objects.create(
            user=self.psy_user1, specialization='CBT', qualification='Ph.D', experience='5 yrs', license_number='LIC001'
        )

        self.psy_user2 = User.objects.create_user(
            username='psy2', name='Dr. Two', role='psychologist', password='Password123'
        )
        self.psy2 = Psychologist.objects.create(
            user=self.psy_user2, specialization='DBT', qualification='Psy.D', experience='8 yrs', license_number='LIC002'
        )

        # Create Client assigned to Dr. One
        self.patient = Client.objects.create(
            client_code='ML-TEST-001', full_name='Test Patient', gender='Male', age=30, phone='+1234567890', assigned_psychologist=self.psy1
        )
        self.case_history = CaseHistory.objects.create(
            client=self.patient, psychologist=self.psy1, presenting_problems='Anxiety'
        )

    def test_ccd_denied_case_history_access(self):
        """CCD staff should be denied (403 Forbidden) when accessing case histories."""
        self.client_api.force_authenticate(user=self.ccd_user)
        response = self.client_api.get('/api/case-history/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ccd_denied_pdf_download(self):
        """CCD staff should be denied (403 Forbidden) when trying to download PDF."""
        self.client_api.force_authenticate(user=self.ccd_user)
        response = self.client_api.get(f'/api/case-history/{self.patient.id}/pdf/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_psychologist_data_isolation(self):
        """Dr. Two should NOT be able to view Dr. One's patient case history or PDF."""
        self.client_api.force_authenticate(user=self.psy_user2)
        response = self.client_api.get('/api/case-history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        # Dr. Two accessing Dr. One's patient PDF
        pdf_response = self.client_api.get(f'/api/case-history/{self.patient.id}/pdf/')
        self.assertEqual(pdf_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_and_assigned_psychologist_access(self):
        """Owner and Dr. One should successfully access case history and PDF."""
        # Dr. One assigned access
        self.client_api.force_authenticate(user=self.psy_user1)
        response = self.client_api.get('/api/case-history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        pdf_response = self.client_api.get(f'/api/case-history/{self.patient.id}/pdf/')
        self.assertEqual(pdf_response.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_response['Content-Type'], 'application/pdf')

        # Owner access
        self.client_api.force_authenticate(user=self.owner)
        owner_response = self.client_api.get('/api/case-history/')
        self.assertEqual(owner_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(owner_response.data), 1)

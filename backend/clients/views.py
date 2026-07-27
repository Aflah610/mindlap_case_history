import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Client
from .serializers import ClientSerializer
from appointments.models import Appointment
from authentication.models import User, Psychologist
from case_history.models import CaseHistory, SessionNote

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'client_code', 'phone', 'email', 'assigned_psychologist__user__name']
    ordering_fields = ['created_at', 'full_name', 'age']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Client.objects.none()
        
        if user.role in ['owner', 'admin', 'operation_manager', 'ccd'] or user.is_superuser:
            return Client.objects.all().order_by('-created_at')
        
        # Psychologist role: view ONLY assigned clients
        return Client.objects.filter(assigned_psychologist__user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        if request.user.role == 'psychologist':
            return Response({'detail': 'Psychologists are not permitted to edit client intake records.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role == 'psychologist':
            return Response({'detail': 'Psychologists are not permitted to delete client records.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        """Returns comprehensive KPIs and statistics for Owner, Operation Manager, CCD, and Psychologists."""
        user = request.user
        today = timezone.now().date()

        total_clients = Client.objects.count()
        total_therapists = Psychologist.objects.count()

        # Today's appointments count
        today_appointments = Appointment.objects.filter(
            appointment_date__date=today
        )
        if user.role == 'psychologist':
            today_appointments = today_appointments.filter(psychologist__user=user)

        # Therapist workload
        therapists = Psychologist.objects.all()
        workload = []
        for t in therapists:
            assigned_cnt = Client.objects.filter(assigned_psychologist=t).count()
            today_sessions = Appointment.objects.filter(psychologist=t, appointment_date__date=today).count()
            workload.append({
                'id': t.id,
                'name': f"Dr. {t.user.name}",
                'specialization': t.specialization,
                'assigned_clients': assigned_cnt,
                'today_sessions': today_sessions
            })

        completed_reports = CaseHistory.objects.exclude(diagnosis={}).count()
        total_case_histories = CaseHistory.objects.count()
        pending_reports = max(0, total_clients - completed_reports)

        return Response({
            'total_clients': total_clients,
            'active_clients': total_clients,
            'total_therapists': total_therapists,
            'today_appointments_count': today_appointments.count(),
            'pending_reports': pending_reports,
            'completed_reports': completed_reports,
            'therapist_workload': workload,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def export_csv(self, request):
        """Allows Owner and Operation Manager to export clients data as CSV."""
        if request.user.role not in ['owner', 'admin', 'operation_manager']:
            return Response({'detail': 'Permission denied. Only Owner or Operation Manager can export.'}, status=status.HTTP_403_FORBIDDEN)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="mindlap_clients_{timezone.now().strftime("%Y%m%d")}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Client Code', 'Full Name', 'Gender', 'Age', 'Phone', 'Email', 'Assigned Therapist', 'Created At'])

        clients = Client.objects.all().order_by('-created_at')
        for c in clients:
            therapist_name = f"Dr. {c.assigned_psychologist.user.name}" if c.assigned_psychologist else "Unassigned"
            writer.writerow([c.client_code, c.full_name, c.gender, c.age, c.phone, c.email or '', therapist_name, c.created_at.strftime('%Y-%m-%d %H:%M')])

        return response

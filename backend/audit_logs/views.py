from rest_framework import serializers, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AuditLog
from clients.models import Client
from case_history.models import CaseHistory
from appointments.models import Appointment
from authentication.models import Psychologist, CCDStaff, User
from authentication.serializers import UserSerializer

class AuditLogSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_detail', 'action', 'table_name', 'record_id', 'details', 'timestamp', 'ip_address']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['owner', 'admin', 'operation_manager', 'ccd'] or self.request.user.is_superuser:
            return AuditLog.objects.all().order_by('-timestamp')
        return AuditLog.objects.filter(user=self.request.user).order_by('-timestamp')


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Admin Stats
        total_clients = Client.objects.count()
        active_clients = Client.objects.count() # Or filter by active
        today_sessions = Appointment.objects.count()
        pending_cases = Client.objects.filter(case_history__isnull=True).count() + CaseHistory.objects.filter(diagnosis={}).count()
        psychologists_count = Psychologist.objects.count()
        ccd_staff_count = CCDStaff.objects.count()

        # Psychologist specific stats
        assigned_clients = Client.objects.filter(assigned_psychologist__user=user).count() if user.role == 'psychologist' else total_clients

        data = {
            'role': user.role,
            'total_clients': total_clients,
            'active_clients': active_clients,
            'today_sessions': today_sessions,
            'pending_case_histories': pending_cases,
            'psychologists_count': psychologists_count,
            'ccd_staff_count': ccd_staff_count,
            'assigned_clients': assigned_clients
        }
        return Response(data)

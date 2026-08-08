from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CaseHistory, SessionNote
from .serializers import CaseHistorySerializer, SessionNoteSerializer
from .pdf_generator import generate_case_history_pdf
from authentication.permissions import DenyCCDConfidential
from clients.models import Client

class CaseHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = CaseHistorySerializer
    permission_classes = [permissions.IsAuthenticated, DenyCCDConfidential]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or user.role == 'ccd':
            return CaseHistory.objects.none()
        
        # Owner, Admin, and Operation Manager can view all case histories
        if user.role in ['owner', 'admin', 'operation_manager'] or user.is_superuser:
            return CaseHistory.objects.all().order_by('-updated_at')
        
        # Psychologists view assigned clients OR case histories linked to them
        from django.db.models import Q
        return CaseHistory.objects.filter(
            Q(client__assigned_psychologist__user=user) | 
            Q(psychologist__user=user)
        ).distinct().order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        client_id = request.data.get('client')
        if client_id:
            existing = CaseHistory.objects.filter(client_id=client_id).first()
            if existing:
                serializer = self.get_serializer(existing, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        client = serializer.validated_data.get('client')
        psychologist = serializer.validated_data.get('psychologist')
        
        if not psychologist and client and client.assigned_psychologist:
            psychologist = client.assigned_psychologist
        if not psychologist and hasattr(self.request.user, 'psychologist_profile'):
            psychologist = self.request.user.psychologist_profile

        if client and not client.assigned_psychologist and hasattr(self.request.user, 'psychologist_profile'):
            client.assigned_psychologist = self.request.user.psychologist_profile
            client.save()

        serializer.save(psychologist=psychologist)

    def perform_update(self, serializer):
        client = serializer.validated_data.get('client', serializer.instance.client if serializer.instance else None)
        psychologist = serializer.validated_data.get('psychologist', serializer.instance.psychologist if serializer.instance else None)
        
        if not psychologist and client and client.assigned_psychologist:
            psychologist = client.assigned_psychologist
        if not psychologist and hasattr(self.request.user, 'psychologist_profile'):
            psychologist = self.request.user.psychologist_profile

        if client and not client.assigned_psychologist and hasattr(self.request.user, 'psychologist_profile'):
            client.assigned_psychologist = self.request.user.psychologist_profile
            client.save()

        serializer.save(psychologist=psychologist)


class SessionNoteViewSet(viewsets.ModelViewSet):
    serializer_class = SessionNoteSerializer
    permission_classes = [permissions.IsAuthenticated, DenyCCDConfidential]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or user.role == 'ccd':
            return SessionNote.objects.none()
        
        from django.db.models import Q
        if user.role in ['owner', 'admin', 'operation_manager'] or user.is_superuser:
            qs = SessionNote.objects.all()
        else:
            # Psychologists view assigned clients OR notes they authored OR clients they created
            qs = SessionNote.objects.filter(
                Q(client__assigned_psychologist__user=user) | 
                Q(psychologist__user=user) |
                Q(client__created_by=user)
            ).distinct()

        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)

        return qs.order_by('session_number', 'session_date', 'created_at')

    def perform_create(self, serializer):
        client = serializer.validated_data.get('client')
        psychologist = serializer.validated_data.get('psychologist')
        if not psychologist and client and client.assigned_psychologist:
            psychologist = client.assigned_psychologist
        if not psychologist and hasattr(self.request.user, 'psychologist_profile'):
            psychologist = self.request.user.psychologist_profile

        if client and not client.assigned_psychologist and hasattr(self.request.user, 'psychologist_profile'):
            client.assigned_psychologist = self.request.user.psychologist_profile
            client.save()

        serializer.save(psychologist=psychologist)


class PDFDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated, DenyCCDConfidential]

    def get(self, request, pk):
        user = request.user
        if user.role == 'ccd':
            return Response({'detail': 'CCD Staff are restricted from accessing client clinical case histories or PDF reports.'}, status=status.HTTP_403_FORBIDDEN)
        
        client = get_object_or_404(Client, pk=pk)

        # Check permission: Owner, Admin, Operation Manager, Superuser, OR Assigned Psychologist
        is_management = user.role in ['owner', 'admin', 'operation_manager'] or user.is_superuser
        is_assigned_psychologist = (
            user.role == 'psychologist' and 
            client.assigned_psychologist and 
            client.assigned_psychologist.user == user
        )

        if not (is_management or is_assigned_psychologist):
            return Response({'detail': 'Permission denied. Clinical PDF reports can only be downloaded by management or the assigned psychologist.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            case_history = client.case_history
        except CaseHistory.DoesNotExist:
            case_history = None

        return generate_case_history_pdf(client, case_history)

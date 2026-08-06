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
        
        # Psychologists view ONLY their assigned clients' case histories
        return CaseHistory.objects.filter(client__assigned_psychologist__user=user).order_by('-updated_at')

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
        serializer.save(psychologist=psychologist)

    def perform_update(self, serializer):
        client = serializer.validated_data.get('client', serializer.instance.client if serializer.instance else None)
        psychologist = serializer.validated_data.get('psychologist', serializer.instance.psychologist if serializer.instance else None)
        if not psychologist and client and client.assigned_psychologist:
            psychologist = client.assigned_psychologist
        if not psychologist and hasattr(self.request.user, 'psychologist_profile'):
            psychologist = self.request.user.psychologist_profile
        serializer.save(psychologist=psychologist)


class SessionNoteViewSet(viewsets.ModelViewSet):
    serializer_class = SessionNoteSerializer
    permission_classes = [permissions.IsAuthenticated, DenyCCDConfidential]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or user.role == 'ccd':
            return SessionNote.objects.none()
        
        # Owner, Admin, and Operation Manager can view all session notes
        if user.role in ['owner', 'admin', 'operation_manager'] or user.is_superuser:
            return SessionNote.objects.all().order_by('-session_date')
        
        # Psychologists view ONLY their assigned clients' session notes
        return SessionNote.objects.filter(client__assigned_psychologist__user=user).order_by('-session_date')

    def perform_create(self, serializer):
        client = serializer.validated_data.get('client')
        psychologist = serializer.validated_data.get('psychologist')
        if not psychologist and client and client.assigned_psychologist:
            psychologist = client.assigned_psychologist
        if not psychologist and hasattr(self.request.user, 'psychologist_profile'):
            psychologist = self.request.user.psychologist_profile
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

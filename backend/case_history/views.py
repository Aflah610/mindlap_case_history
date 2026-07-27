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


class PDFDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated, DenyCCDConfidential]

    def get(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        
        # Check permissions: Psychologist can only download for assigned clients
        if request.user.role == 'psychologist':
            if not client.assigned_psychologist or client.assigned_psychologist.user != request.user:
                return Response({'detail': 'Permission denied. You can only access assigned client PDFs.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            case_history = client.case_history
        except CaseHistory.DoesNotExist:
            case_history = None

        return generate_case_history_pdf(client, case_history)

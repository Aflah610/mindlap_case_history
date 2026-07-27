from rest_framework import serializers, viewsets, permissions
from .models import Document
from clients.serializers import ClientSerializer
from authentication.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'client', 'client_detail', 'file_name', 'file_type', 'file', 'uploaded_by', 'uploaded_by_detail', 'uploaded_at']


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Document.objects.none()

        if user.role in ['owner', 'admin', 'operation_manager'] or user.is_superuser:
            return Document.objects.all().order_by('-uploaded_at')

        if user.role in ['ccd', 'psychologist']:
            return Document.objects.none()

        return Document.objects.filter(client__assigned_psychologist__user=user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

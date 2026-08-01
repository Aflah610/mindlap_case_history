from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Psychologist, CCDStaff
from .serializers import UserSerializer, PsychologistSerializer, CCDStaffSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdminUserRole, IsOperationManagerRole

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


from rest_framework.decorators import action

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsOperationManagerRole]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.username == 'admin':
            return Response({'detail': 'Primary Owner account cannot be deleted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft-deactivate user account to preserve historical medical audit records & client case logs
        user.status = 'inactive'
        user.is_active = False
        user.save()

        return Response({'detail': f'Staff account @{user.username} deactivated and moved to former staff records.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsOperationManagerRole])
    def offboard(self, request, pk=None):
        user = self.get_object()
        replacement_psychologist_id = request.data.get('replacement_psychologist_id')

        departing_psychologist = getattr(user, 'psychologist_profile', None)
        reassigned_clients_count = 0
        reassigned_appointments_count = 0

        if departing_psychologist:
            replacement_psychologist = None
            if replacement_psychologist_id:
                try:
                    replacement_psychologist = Psychologist.objects.get(id=replacement_psychologist_id)
                except Psychologist.DoesNotExist:
                    return Response({'detail': 'Replacement psychologist not found.'}, status=status.HTTP_400_BAD_REQUEST)

            from clients.models import Client
            from appointments.models import Appointment

            clients_to_reassign = Client.objects.filter(assigned_psychologist=departing_psychologist)
            reassigned_clients_count = clients_to_reassign.count()
            if replacement_psychologist:
                clients_to_reassign.update(assigned_psychologist=replacement_psychologist)

            appointments_to_reassign = Appointment.objects.filter(
                psychologist=departing_psychologist,
                status='Scheduled'
            )
            reassigned_appointments_count = appointments_to_reassign.count()
            if replacement_psychologist:
                appointments_to_reassign.update(psychologist=replacement_psychologist)

        user.status = 'inactive'
        user.is_active = False
        user.save()

        return Response({
            'detail': f'Account @{user.username} deactivated successfully.',
            'reassigned_clients_count': reassigned_clients_count,
            'reassigned_appointments_count': reassigned_appointments_count,
        })


class PsychologistViewSet(viewsets.ModelViewSet):
    queryset = Psychologist.objects.all().select_related('user').order_by('user__name')
    serializer_class = PsychologistSerializer
    permission_classes = [permissions.IsAuthenticated]


class CCDStaffViewSet(viewsets.ModelViewSet):
    queryset = CCDStaff.objects.all()
    serializer_class = CCDStaffSerializer
    permission_classes = [IsOperationManagerRole]

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


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsOperationManagerRole]


class PsychologistViewSet(viewsets.ModelViewSet):
    queryset = Psychologist.objects.all()
    serializer_class = PsychologistSerializer
    permission_classes = [permissions.IsAuthenticated]


class CCDStaffViewSet(viewsets.ModelViewSet):
    queryset = CCDStaff.objects.all()
    serializer_class = CCDStaffSerializer
    permission_classes = [IsOperationManagerRole]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, CurrentUserView, UserViewSet, PsychologistViewSet, CCDStaffViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'psychologists', PsychologistViewSet, basename='psychologists')
router.register(r'ccd-staff', CCDStaffViewSet, basename='ccd-staff')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
]

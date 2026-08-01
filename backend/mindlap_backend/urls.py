"""
Main URL Configuration for Mindlap REST API
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('clients.urls')),
    path('api/', include('case_history.urls')),
    path('api/', include('appointments.urls')),
    path('api/', include('audit_logs.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

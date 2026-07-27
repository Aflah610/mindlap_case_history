from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseHistoryViewSet, SessionNoteViewSet, PDFDownloadView

router = DefaultRouter()
router.register(r'case-history', CaseHistoryViewSet, basename='case-history')
router.register(r'session-notes', SessionNoteViewSet, basename='session-notes')

urlpatterns = [
    path('case-history/<int:pk>/pdf/', PDFDownloadView.as_view(), name='case-history-pdf'),
    path('', include(router.urls)),
]

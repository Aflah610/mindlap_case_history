from .models import AuditLog

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Log modifying API requests or PDF downloads
        if request.path.startswith('/api/'):
            if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] or 'pdf' in request.path or 'export' in request.path:
                if hasattr(request, 'user') and request.user.is_authenticated:
                    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '127.0.0.1'))
                    if ',' in ip:
                        ip = ip.split(',')[0].strip()
                    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown Browser')

                    parts = request.path.strip('/').split('/')
                    table_name = parts[1] if len(parts) > 1 else 'general'
                    action_type = f"{request.method}_{table_name.upper()}"

                    try:
                        AuditLog.objects.create(
                            user=request.user,
                            action=action_type,
                            table_name=table_name,
                            details=f"Endpoint: {request.path} | Method: {request.method}",
                            ip_address=ip[:45],
                            browser=user_agent[:250],
                            device="Desktop/Web"
                        )
                    except Exception:
                        pass

        return response

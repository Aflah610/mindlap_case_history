from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom Authentication Backend allowing login via either Username or Email address
    with case-insensitive matching and whitespace stripping.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None
        
        cleaned_username = username.strip()
        
        try:
            user = User.objects.get(
                Q(username__iexact=cleaned_username) | Q(email__iexact=cleaned_username)
            )
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(
                Q(username__iexact=cleaned_username) | Q(email__iexact=cleaned_username)
            ).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from .models import Appointment
from clients.serializers import ClientSerializer
from authentication.serializers import PsychologistSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    psychologist_detail = PsychologistSerializer(source='psychologist', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_detail', 'psychologist', 'psychologist_detail',
            'appointment_date', 'duration', 'consultation_type', 'mode',
            'status', 'remarks', 'created_at'
        ]

    def validate(self, data):
        psychologist = data.get('psychologist')
        appointment_date = data.get('appointment_date')
        
        # When updating existing instance, exclude current ID
        instance_id = self.instance.id if self.instance else None

        if psychologist and appointment_date:
            # Check slot collision within +/- 45 minutes
            start_window = appointment_date - timedelta(minutes=44)
            end_window = appointment_date + timedelta(minutes=44)

            overlapping = Appointment.objects.filter(
                psychologist=psychologist,
                appointment_date__range=(start_window, end_window),
                status__in=['Scheduled', 'Rescheduled']
            )

            if instance_id:
                overlapping = overlapping.exclude(id=instance_id)

            if overlapping.exists():
                existing = overlapping.first()
                time_str = existing.appointment_date.strftime('%I:%M %p')
                raise serializers.ValidationError(
                    f"Dr. {psychologist.user.name} is already booked around {time_str}. Please select a different time slot."
                )

        return data


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()

        # Owner, Admin, Operation Manager, and CCD can view all appointments
        if user.role in ['owner', 'admin', 'operation_manager', 'ccd'] or user.is_superuser:
            return Appointment.objects.all().order_by('-appointment_date')

        # Psychologists see only their own appointments
        return Appointment.objects.filter(psychologist__user=user).order_by('-appointment_date')

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def reassign(self, request, pk=None):
        """Allows Operation Manager, Owner, or CCD to reassign a therapist or move slot."""
        user = request.user
        if user.role not in ['owner', 'admin', 'operation_manager', 'ccd']:
            return Response({'detail': 'Permission denied. Only managers can reassign.'}, status=status.HTTP_403_FORBIDDEN)

        appointment = self.get_object()
        new_psychologist_id = request.data.get('psychologist_id')
        new_date_str = request.data.get('appointment_date')

        if new_psychologist_id:
            appointment.psychologist_id = new_psychologist_id
        if new_date_str:
            parsed_date = parse_datetime(new_date_str)
            if parsed_date:
                appointment.appointment_date = parsed_date

        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

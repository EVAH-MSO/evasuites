from rest_framework import viewsets
from .models import MaintenanceRequest
from .serializers import MaintenanceSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return MaintenanceRequest.objects.all()
        if u.role == 'landlord':
            return MaintenanceRequest.objects.filter(unit__property__owner=u)
        return MaintenanceRequest.objects.filter(tenant__user=u)

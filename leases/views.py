from rest_framework import viewsets
from .models import Lease
from .serializers import LeaseSerializer


class LeaseViewSet(viewsets.ModelViewSet):
    serializer_class = LeaseSerializer

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return Lease.objects.all()
        if u.role == 'landlord':
            return Lease.objects.filter(unit__property__owner=u)
        return Lease.objects.filter(tenant__user=u)

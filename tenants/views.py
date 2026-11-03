from rest_framework import viewsets
from .models import Tenant
from .serializers import TenantSerializer


class TenantViewSet(viewsets.ModelViewSet):
    serializer_class = TenantSerializer

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return Tenant.objects.all()
        if u.role == 'landlord':
            return Tenant.objects.filter(landlord=u)
        return Tenant.objects.filter(user=u)

    def perform_create(self, serializer):
        # Automatically assign the logged-in landlord as the owner
        if self.request.user.role == 'landlord':
            serializer.save(landlord=self.request.user)
        else:
            serializer.save()

from rest_framework import viewsets
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return Payment.objects.all()
        if u.role == 'landlord':
            return Payment.objects.filter(lease__unit__property__owner=u)
        return Payment.objects.filter(lease__tenant__user=u)

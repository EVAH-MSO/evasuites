from rest_framework import viewsets
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return Property.objects.all()
        if u.role == 'landlord':
            return Property.objects.filter(owner=u)
        return Property.objects.filter(units__leases__tenant__user=u).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status as drf_status

class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        prop_id = request.data.get('property')
        prefix = request.data.get('prefix', 'House')
        start = int(request.data.get('start', 1))
        end = int(request.data.get('end', 10))
        unit_type = request.data.get('unit_type', 'Bedsitter')
        bedrooms = int(request.data.get('bedrooms', 1))
        rent = request.data.get('rent_amount')
        
        units_to_create = []
        for i in range(start, end + 1):
            units_to_create.append(Unit(
                property_id=prop_id,
                unit_number=f"{prefix} {i}",
                unit_type=unit_type,
                bedrooms=bedrooms,
                bathrooms=1,
                rent_amount=rent,
                status='available'
            ))
        
        Unit.objects.bulk_create(units_to_create)
        return Response({'message': f'Successfully created {len(units_to_create)} units'}, status=drf_status.HTTP_201_CREATED)

    def get_queryset(self):
        u = self.request.user
        if u.is_superuser or u.role == 'admin':
            return Unit.objects.all()
        if u.role == 'landlord':
            return Unit.objects.filter(property__owner=u)
        return Unit.objects.filter(leases__tenant__user=u).distinct()

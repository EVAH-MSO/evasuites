from rest_framework import serializers
from .models import MaintenanceRequest


class MaintenanceSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.__str__', read_only=True)
    unit_label = serializers.CharField(source='unit.__str__', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'

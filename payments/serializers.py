from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    lease_label = serializers.CharField(source='lease.__str__', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

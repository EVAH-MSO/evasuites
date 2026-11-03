from rest_framework import serializers
from .models import Tenant
from users.serializers import UserSerializer
from users.models import User


class TenantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = Tenant
        fields = '__all__'

from rest_framework import serializers
from .models import Property, Unit
from users.serializers import UserSerializer


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('users.models', fromlist=['User']).User.objects.all(),
        source='owner', write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = '__all__'

    def create(self, validated_data):
        if 'owner' not in validated_data:
            validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

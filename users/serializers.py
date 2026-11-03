from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'avatar', 'password',
                  'is_superuser', 'is_staff']
        read_only_fields = ['is_superuser', 'is_staff']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    national_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    emergency_contact = serializers.CharField(write_only=True, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(write_only=True, required=False, allow_null=True)
    
    # NEW: Fields for auto-creating a lease
    landlord_username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    unit_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    lease_start = serializers.DateField(write_only=True, required=False, allow_null=True)
    lease_end = serializers.DateField(write_only=True, required=False, allow_null=True)
    rent_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'role', 'phone',
            'national_id', 'emergency_contact', 'date_of_birth',
            'unit_id', 'lease_start', 'lease_end', 'rent_amount', 'landlord_username',
        ]

    def create(self, data):
        national_id = data.pop('national_id', '')
        emergency_contact = data.pop('emergency_contact', '')
        date_of_birth = data.pop('date_of_birth', None)
        
        unit_id = data.pop('unit_id', None)
        lease_start = data.pop('lease_start', None)
        lease_end = data.pop('lease_end', None)
        rent_amount = data.pop('rent_amount', None)

        user = User.objects.create_user(**data)
        
        if user.role == 'tenant':
            from tenants.models import Tenant
            landlord = None
            landlord_username = data.pop('landlord_username', None)
            
            # If coming from a public link
            if landlord_username:
                try:
                    landlord = User.objects.get(username=landlord_username, role='landlord')
                except User.DoesNotExist:
                    pass
            # If created by a logged-in landlord
            elif self.context.get('request') and self.context['request'].user.is_authenticated:
                if self.context['request'].user.role == 'landlord':
                    landlord = self.context['request'].user
            
            tenant = Tenant.objects.create(
                user=user,
                landlord=landlord,
                national_id=national_id,
                emergency_contact=emergency_contact,
                date_of_birth=date_of_birth,
            )
            
            # Auto-create lease if a unit was selected
            if unit_id and lease_start and rent_amount:
                from properties.models import Unit
                from leases.models import Lease
                try:
                    unit = Unit.objects.get(id=unit_id)
                    Lease.objects.create(
                        tenant=tenant,
                        unit=unit,
                        start_date=lease_start,
                        end_date=lease_end,
                        monthly_rent=rent_amount,
                        status='active'
                    )
                    unit.status = 'occupied'
                    unit.save()
                except Unit.DoesNotExist:
                    pass
                    
        return user

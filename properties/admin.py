from django.contrib import admin
from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'property_type', 'owner', 'created_at')
    list_filter = ('property_type', 'city')
    search_fields = ('name', 'city', 'address')


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'bedrooms', 'bathrooms', 'rent_amount', 'status')
    list_filter = ('status', 'bedrooms')
    search_fields = ('unit_number', 'property__name')

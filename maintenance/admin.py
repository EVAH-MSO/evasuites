from django.contrib import admin
from .models import MaintenanceRequest


@admin.register(MaintenanceRequest)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('title', 'unit', 'tenant', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('title', 'description')

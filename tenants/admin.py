from django.contrib import admin
from .models import Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'national_id', 'emergency_contact')
    search_fields = ('user__username', 'user__email', 'national_id')

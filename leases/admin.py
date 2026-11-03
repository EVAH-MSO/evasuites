from django.contrib import admin
from .models import Lease


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'start_date', 'end_date', 'monthly_rent', 'status')
    list_filter = ('status',)
    search_fields = ('tenant__user__username', 'unit__unit_number')

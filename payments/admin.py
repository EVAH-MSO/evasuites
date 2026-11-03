from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'amount', 'due_date', 'payment_date', 'method', 'status')
    list_filter = ('status', 'method')
    search_fields = ('reference', 'lease__tenant__user__username')

from django.db import models
from users.models import User


class Tenant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant_profile')
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_tenants', null=True, blank=True)
    national_id = models.CharField(max_length=30, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

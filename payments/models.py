from django.db import models
from leases.models import Lease


class Payment(models.Model):
    STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('late', 'Late'),
    )
    METHOD = (
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
        ('card', 'Card'),
        ('mobile', 'Mobile Money'),
    )
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    due_date = models.DateField()
    method = models.CharField(max_length=20, choices=METHOD, default='cash')
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    reference = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.lease} - {self.amount} ({self.status})"
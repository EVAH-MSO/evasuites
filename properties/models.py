from django.db import models
from users.models import User


class Property(models.Model):
    PROPERTY_TYPES = (
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('commercial', 'Commercial'),
        ('land', 'Land'),
    )
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='properties/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Unit(models.Model):
    STATUS = (
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    )
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
    unit_number = models.CharField(max_length=20)
    unit_type = models.CharField(max_length=50, default='Bedsitter')
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS, default='available')

    class Meta:
        unique_together = ('property', 'unit_number')
        ordering = ['property', 'unit_number'] # Sorts by House Number automatically

    def __str__(self):
        return f"{self.property.name} - {self.unit_number}"
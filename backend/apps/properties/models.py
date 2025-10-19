from django.conf import settings
from django.db import models


class Property(models.Model):
    TYPE_CHOICES = (
        ("mall", "Mall"),
        ("shop", "Shop"),
        ("office", "Office"),
        ("hall", "Hall"),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="properties")
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=40, choices=TYPE_CHOICES)
    address = models.TextField(blank=True)
    currency = models.CharField(max_length=10, default="TZS")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Unit(models.Model):
    STATUS_CHOICES = (
        ("vacant", "Vacant"),
        ("occupied", "Occupied"),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="units")
    code = models.CharField(max_length=50, unique=True)
    unit_type = models.CharField(max_length=40)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="vacant")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.property.name} - {self.code}"



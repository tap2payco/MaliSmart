from django.contrib import admin
from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
  list_display = ("id", "name", "type", "owner", "currency")
  search_fields = ("name", "address")
  list_filter = ("type", "currency")


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
  list_display = ("id", "code", "property", "unit_type", "rent_amount", "status")
  search_fields = ("code", "unit_type")
  list_filter = ("status",)



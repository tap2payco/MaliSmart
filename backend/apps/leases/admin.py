from django.contrib import admin
from .models import Lease


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ("id", "unit", "tenant", "rent_amount", "frequency", "is_active")
    list_filter = ("frequency", "is_active")
    search_fields = ("unit__code", "tenant__user__phone")



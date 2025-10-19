from django.contrib import admin
from .models import TenantProfile


@admin.register(TenantProfile)
class TenantProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "business_name", "phone", "email")
    search_fields = ("business_name", "phone", "email", "user__phone")




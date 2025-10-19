from rest_framework import serializers
from .models import TenantProfile


class TenantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantProfile
        fields = "__all__"




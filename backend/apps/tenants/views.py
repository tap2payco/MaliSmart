from rest_framework import viewsets, permissions
from .models import TenantProfile
from .serializers import TenantProfileSerializer


class TenantProfileViewSet(viewsets.ModelViewSet):
    queryset = TenantProfile.objects.select_related("user").all().order_by("-id")
    serializer_class = TenantProfileSerializer
    permission_classes = [permissions.IsAuthenticated]




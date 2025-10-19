from rest_framework import viewsets, permissions
from .models import Lease
from .serializers import LeaseSerializer


class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.select_related("unit", "tenant", "tenant__user").all().order_by("-id")
    serializer_class = LeaseSerializer
    permission_classes = [permissions.IsAuthenticated]



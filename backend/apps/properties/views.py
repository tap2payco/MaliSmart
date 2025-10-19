from rest_framework import viewsets, permissions
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by("-id")
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.select_related("property").all().order_by("-id")
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]



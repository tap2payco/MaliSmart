"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
]

try:
    from rest_framework import routers

    router = routers.DefaultRouter()
    from apps.properties.views import PropertyViewSet, UnitViewSet
    from apps.tenants.views import TenantProfileViewSet
    from apps.leases.views import LeaseViewSet
    router.register(r'properties', PropertyViewSet, basename='property')
    router.register(r'units', UnitViewSet, basename='unit')
    router.register(r'tenants', TenantProfileViewSet, basename='tenant')
    router.register(r'leases', LeaseViewSet, basename='lease')
    urlpatterns += [path("api/", include(router.urls))]
except Exception:  # rest_framework not installed yet
    pass

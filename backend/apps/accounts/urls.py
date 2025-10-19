from django.urls import path
from .views import otp_request, otp_verify

urlpatterns = [
    path("otp_request/", otp_request),
    path("otp_verify/", otp_verify),
]



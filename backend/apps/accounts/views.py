import random
from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


OTP_TTL_SECONDS = 300


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def get_tokens_for_user(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


@api_view(["POST"])
@permission_classes([AllowAny])
def otp_request(request):
    phone = (request.data.get("phone") or "").strip()
    if not phone:
        return Response({"detail": "phone required"}, status=status.HTTP_400_BAD_REQUEST)
    otp = generate_otp()
    cache.set(f"otp:{phone}", otp, timeout=OTP_TTL_SECONDS)
    # TODO: integrate SMS provider; for dev, return OTP in response
    return Response({"phone": phone, "otp": otp, "expires_in": OTP_TTL_SECONDS})


@api_view(["POST"])
@permission_classes([AllowAny])
def otp_verify(request):
    phone = (request.data.get("phone") or "").strip()
    otp = (request.data.get("otp") or "").strip()
    cached = cache.get(f"otp:{phone}")
    if not cached or cached != otp:
        return Response({"detail": "invalid otp"}, status=status.HTTP_400_BAD_REQUEST)
    user, _ = User.objects.get_or_create(phone=phone, defaults={"role": "tenant"})
    tokens = get_tokens_for_user(user)
    cache.delete(f"otp:{phone}")
    return Response({"user": {"id": user.id, "phone": user.phone, "role": user.role}, "tokens": tokens})



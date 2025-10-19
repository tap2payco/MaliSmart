from django.test import TestCase
from rest_framework.test import APIClient
from django.core.cache import cache


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_otp_flow(self):
        phone = "255711111111"
        # request OTP
        r1 = self.client.post("/api/auth/otp_request/", {"phone": phone}, format="json")
        self.assertEqual(r1.status_code, 200)
        otp = r1.data["otp"]
        # verify OTP
        r2 = self.client.post("/api/auth/otp_verify/", {"phone": phone, "otp": otp}, format="json")
        self.assertEqual(r2.status_code, 200)
        self.assertIn("tokens", r2.data)
        self.assertIn("access", r2.data["tokens"])
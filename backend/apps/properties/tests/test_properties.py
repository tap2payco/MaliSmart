from django.test import TestCase
from rest_framework.test import APIClient


class PropertiesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_properties_requires_auth(self):
        r = self.client.get("/api/properties/")
        self.assertEqual(r.status_code, 401)

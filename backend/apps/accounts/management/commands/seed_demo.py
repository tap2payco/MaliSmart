from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.properties.models import Property, Unit
from apps.tenants.models import TenantProfile
from apps.leases.models import Lease


class Command(BaseCommand):
    help = "Seed demo data: owner, tenant, property, unit, lease"

    def handle(self, *args, **options):
        owner, _ = User.objects.get_or_create(
            phone="255700000001",
            defaults={"name": "Owner One", "role": "owner", "is_staff": True},
        )
        tenant_user, _ = User.objects.get_or_create(
            phone="255700000010", defaults={"name": "Tenant One", "role": "tenant"}
        )
        tenant, _ = TenantProfile.objects.get_or_create(user=tenant_user, defaults={"business_name": "Tenant One Biz"})

        prop, _ = Property.objects.get_or_create(
            owner=owner,
            name="Mwanza Mall",
            defaults={"type": "mall", "address": "Mwanza CBD", "currency": "TZS"},
        )
        unit, _ = Unit.objects.get_or_create(
            property=prop,
            code="A-101",
            defaults={"unit_type": "shop", "rent_amount": 500000, "deposit": 500000, "status": "vacant"},
        )

        lease, created = Lease.objects.get_or_create(
            unit=unit,
            tenant=tenant,
            defaults={
                "start_date": timezone.now().date(),
                "rent_amount": unit.rent_amount,
                "frequency": "monthly",
                "deposit": unit.deposit,
                "is_active": True,
            },
        )

        self.stdout.write(self.style.SUCCESS("Seeded demo data."))

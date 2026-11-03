from users.models import User
from properties.models import Property, Unit
from tenants.models import Tenant
from leases.models import Lease
from payments.models import Payment
from maintenance.models import MaintenanceRequest
from datetime import date, timedelta
import random

print("🧹 Wiping old data...")
User.objects.filter(is_superuser=False).delete()
Property.objects.all().delete()

today = date.today()

# --- 1. CREATE LANDLORDS ---
landlord1 = User.objects.create_user(username='landlord1', password='pass123', role='landlord', first_name='John', last_name='Kamau')
landlord2 = User.objects.create_user(username='landlord2', password='pass123', role='landlord', first_name='Sarah', last_name='Omondi')

# --- 2. CREATE PROPERTIES ---
prop1 = Property.objects.create(name='Eva Apartments', address='123 Mombasa Rd', city='Nairobi', property_type='apartment', owner=landlord1)
prop2 = Property.objects.create(name='Green Villa', address='45 Westlands', city='Nairobi', property_type='house', owner=landlord2)

# --- 3. CREATE 10 UNITS PER PROPERTY ---
unit_types = [
    ('Single Room', 3500),
    ('Bedsitter', 6000),
    ('1 Bedroom', 12000),
    ('2 Bedroom', 20000)
]

print("🚪 Generating 20 Units...")
units_p1 = []
units_p2 = []

for i in range(1, 11):
    utype, base_rent = random.choice(unit_types)
    # Randomize rent slightly (+/- 1000)
    rent = base_rent + random.choice([-1000, 0, 1000])
    
    u1 = Unit.objects.create(property=prop1, unit_number=f'H{i}', unit_type=utype, rent_amount=rent, status='available')
    units_p1.append(u1)
    
    u2 = Unit.objects.create(property=prop2, unit_number=f'V{i}', unit_type=utype, rent_amount=rent, status='available')
    units_p2.append(u2)

# --- 4. CREATE 5 TENANTS PER LANDLORD ---
first_names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
last_names = ['Wanjiku', 'Ochieng', 'Mwangi', 'Kipchoge', 'Mutua']

print("👥 Generating 10 Tenants, Leases, and Payments...")

def create_tenant_and_lease(landlord, property_name, unit_list, index):
    fname = random.choice(first_names)
    lname = random.choice(last_names)
    username = f'{landlord.username}_t{index}'
    
    # Create User & Tenant
    t_user = User.objects.create_user(username=username, password='pass123', role='tenant', first_name=fname, last_name=lname)
    tenant = Tenant.objects.create(user=t_user, landlord=landlord, national_id=f'ID{random.randint(10000,99999)}')
    
    # Assign a unit
    unit = unit_list.pop(0) # Grab an available unit
    unit.status = 'occupied'
    unit.save()
    
    # Create Lease (Started 2 months ago)
    lease_start = today - timedelta(days=60)
    lease = Lease.objects.create(tenant=tenant, unit=unit, start_date=lease_start, monthly_rent=unit.rent_amount, status='active')
    
    # Create Payments (Month 1: Paid. Month 2: Random status)
    # Payment 1
    Payment.objects.create(lease=lease, amount=unit.rent_amount, due_date=today - timedelta(days=30), payment_date=today - timedelta(days=28), method='mobile', status='paid')
    # Payment 2
    status_choice = random.choice(['paid', 'pending', 'late'])
    Payment.objects.create(lease=lease, amount=unit.rent_amount, due_date=today, payment_date=today if status_choice == 'paid' else None, method='bank', status=status_choice)
    
    # 30% chance of a maintenance request
    if random.random() < 0.3:
        MaintenanceRequest.objects.create(
            unit=unit, tenant=tenant, 
            title=random.choice(['Leaking Tap', 'Broken Door', 'No Electricity']),
            description='Please fix this urgently.',
            priority=random.choice(['low', 'medium', 'high']), status='open'
        )

# Create 5 for Landlord 1
for i in range(1, 6):
    create_tenant_and_lease(landlord1, prop1.name, units_p1, i)

# Create 5 for Landlord 2
for i in range(1, 6):
    create_tenant_and_lease(landlord2, prop2.name, units_p2, i)

print("✅ SUCCESS: 2 Landlords, 20 Units, 10 Tenants, and Payments generated!")

from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from hospital.models import Package, Record, Reminder, SharedLink
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.core import mail
from django.utils import timezone
from datetime import timedelta
import os

User = get_user_model()

class HospitalAPITests(APITestCase):
    def setUp(self):
        # Create test data
        self.client = APIClient()
        
        # Create package
        self.package = Package.objects.create(
            name="Basic",
            price=10.00,
            can_share=True,
            can_set_reminders=True,
            can_delete=True
        )
        
        # Create doctor
        self.doctor = User.objects.create_user(
            username="drbob",
            email="rustyboffinbot@gmail.com",
            password="RustyB0ff!n28#",
            user_type="doctor",
            phone_number="1234567890",
            package=self.package
        )
        
        # Create patient
        self.patient = User.objects.create_user(
            username="john",
            email="tharunkumarvk28@gmail.com",
            password="Th@runkum@r2025!",
            user_type="patient",
            phone_number="9876543210"
        )
        
        # Load real test document
        test_file_path = os.path.join(os.path.dirname(__file__), '../tests/test.jpg')
        with open(test_file_path, 'rb') as f:
            self.test_document = SimpleUploadedFile(
                name="test.jpg",
                content=f.read(),
                content_type="image/jpeg"
            )

    def test_register_patient(self):
        response = self.client.post('/api/register/', {
            "username": "alice",
            "email": "alice@example.com",
            "password": "Al!ce2025#Secure",
            "user_type": "patient",
            "phone_number": "5555555555"
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"message": "User created"})
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_register_doctor(self):
        response = self.client.post('/api/register/', {
            "username": "dralice",
            "email": "dralice@example.com",
            "password": "Dr@lice2025!Secure",
            "user_type": "doctor",
            "phone_number": "4444444444",
            "package": self.package.id
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"message": "User created"})
        self.assertTrue(User.objects.filter(username="dralice").exists())

    def test_login(self):
        response = self.client.post('/api/login/', {
            "username": "john",
            "password": "Th@runkum@r2025!"
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Welcome, john")
        self.assertEqual(response.data["user"]["username"], "john")
        self.assertEqual(response.data["user"]["email"], "tharunkumarvk28@gmail.com")

    def test_profile(self):
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["username"], "john")
        self.assertEqual(response.data["user"]["email"], "tharunkumarvk28@gmail.com")
        self.assertEqual(response.data["records"], [])

    def test_logout(self):
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"message": "Logged out"})
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, 401)

    def test_upload_record(self):
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post('/api/records/upload/', {
            "patient": self.patient.id,
            "doctor": self.doctor.id,
            "prescription": self.test_document,
            "description": "Test medical document"
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"message": "Record uploaded"})
        self.assertTrue(Record.objects.filter(description="Test medical document").exists())

    def test_share_record(self):
        # Create record
        record = Record.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            prescription="prescriptions/test.jpg",
            description="Test document"
        )
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post(f'/api/records/{record.id}/share/', {
            "user_id": self.doctor.id
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"message": "Record shared"})
        self.assertTrue(record.shared_with.filter(id=self.doctor.id).exists())

    def test_delete_record(self):
        record = Record.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            prescription="prescriptions/test.jpg",
            description="Test document"
        )
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post(f'/api/records/{record.id}/delete/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"message": "Record deleted"})
        record.refresh_from_db()
        self.assertTrue(record.is_deleted)

    def test_list_records(self):
        Record.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            prescription="prescriptions/test.jpg",
            description="Test document"
        )
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.get('/api/records/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "Test document")

    def test_generate_share_link(self):
        record = Record.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            prescription="prescriptions/test.jpg",
            description="Test document"
        )
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post(f'/api/records/{record.id}/generate-link/')
        self.assertEqual(response.status_code, 201)
        self.assertIn("link", response.data)
        self.assertTrue(SharedLink.objects.filter(record=record).exists())

    def test_view_shared_record(self):
        record = Record.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            prescription="prescriptions/test.jpg",
            description="Test document"
        )
        shared_link = SharedLink.objects.create(
            record=record,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        response = self.client.get(f'/api/share/{shared_link.token}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["record"]["description"], "Test document")

    def test_create_reminder(self):
        self.client.login(username="john", password="Th@runkum@r2025!")
        response = self.client.post('/api/reminders/', {
            "user": self.patient.id,
            "title": "Doctor Visit",
            "date": "2025-05-22T11:00:00"
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"message": "Reminder created"})
        self.assertTrue(Reminder.objects.filter(title="Doctor Visit").exists())

class ReminderCommandTests(TestCase):
    def setUp(self):
        # Create package
        self.package = Package.objects.create(
            name="Basic",
            price=10.00,
            can_share=True,
            can_set_reminders=True,
            can_delete=True
        )
        
        # Create patient
        self.patient = User.objects.create_user(
            username="john",
            email="tharunkumarvk28@gmail.com",
            password="Th@runkum@r2025!",
            user_type="patient",
            phone_number="9876543210"
        )
        
        # Create reminder
        self.reminder = Reminder.objects.create(
            user=self.patient,
            title="Doctor Visit",
            date=timezone.now() - timedelta(hours=1),  # Past due
            notified=False
        )

    def test_check_reminders(self):
        call_command('check_reminders')
        self.reminder.refresh_from_db()
        self.assertTrue(self.reminder.notified)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Reminder: Doctor Visit")
        self.assertEqual(mail.outbox[0].to, ["tharunkumarvk28@gmail.com"])
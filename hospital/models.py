from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone

class Package(models.Model):
    name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    can_share = models.BooleanField(default=True)
    can_set_reminders = models.BooleanField(default=True)
    can_delete = models.BooleanField(default=True)
    max_storage_mb = models.IntegerField(default=0)
    max_uploads = models.IntegerField(default=0)
    max_shares = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    )
    user_type = models.CharField(max_length=15, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=10)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username

class Record(models.Model):
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'patient'},
        related_name='patient_records'
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'doctor'},
        related_name='doctor_records'
    )
    prescription = models.ImageField(upload_to='prescriptions/')
    upload_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(
        User,
        blank=True,
        related_name='shared_records'
    )

    def __str__(self):
        return f"Record {self.id}"

class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    date = models.DateTimeField()
    notified = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class SharedLink(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    record = models.ForeignKey(Record, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"Link for Record {self.record.id}"
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class Package(models.Model):
    name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in INR")
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
    # Explicit doctor-patient assignment
    patients = models.ManyToManyField('self', symmetrical=False, related_name='assigned_doctors', blank=True, limit_choices_to={'user_type': 'patient'})
    # Per-user feature flags (override package if set)
    can_share = models.BooleanField(null=True, blank=True)
    can_set_reminders = models.BooleanField(null=True, blank=True)
    can_delete = models.BooleanField(null=True, blank=True)

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

class Reminder(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='doctor_reminders', limit_choices_to={'user_type': 'doctor'})
    patient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='patient_reminders', limit_choices_to={'user_type': 'patient'})
    notified = models.BooleanField(default=False)

    def __str__(self):
        return f"Reminder: {self.title} ({self.date})"

class SharedLink(models.Model):
    record = models.ForeignKey(Record, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Link for {self.record.id} (expires {self.expires_at})"
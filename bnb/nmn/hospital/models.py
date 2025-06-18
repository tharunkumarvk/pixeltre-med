from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
import os

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

    def save(self, *args, **kwargs):
        if self.pk is None or 'password' in self.get_dirty_fields():
            if self.password and not self.password.startswith('pbkdf2_sha256$'):
                from django.contrib.auth.hashers import make_password
                self.password = make_password(self.password)
        super().save(*args, **kwargs)

def validate_file_size(value):
    filesize = value.size
    if filesize > 10 * 1024 * 1024:  # 10MB
        raise ValidationError("The maximum file size that can be uploaded is 10MB")

def validate_file_type(value):
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    if ext.lower() not in valid_extensions:
        raise ValidationError('Unsupported file type. Please upload PDF, JPG, JPEG, or PNG files.')

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
    prescription = models.ImageField(
        upload_to='prescriptions/',
        validators=[
            validate_file_size,
            validate_file_type,
            FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])
        ]
    )
    upload_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(
        User,
        blank=True,
        related_name='shared_records'
    )

    def clean(self):
        if self.prescription:
            validate_file_size(self.prescription)
            validate_file_type(self.prescription)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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
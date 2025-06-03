from rest_framework import serializers
from .models import User, Package, Record, Reminder, SharedLink

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all(), required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False)
    can_share = serializers.BooleanField(required=False, allow_null=True)
    can_set_reminders = serializers.BooleanField(required=False, allow_null=True)
    can_delete = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone_number', 'package', 'password', 'can_share', 'can_set_reminders', 'can_delete']

    def validate(self, data):
        # Only require package for doctors if you want to enforce it
        if data.get('user_type') == 'doctor':
            # If you want to allow doctors to register without a package, do nothing
            pass
        return data

    def get_package(self, obj):
        if obj.user_type == 'doctor' and obj.package:
            return {
                'id': obj.package.id,
                'name': obj.package.name,
                'can_share': obj.package.can_share,
                'can_set_reminders': obj.package.can_set_reminders,
                'can_delete': obj.package.can_delete,
                'max_storage_mb': obj.package.max_storage_mb,
                'max_uploads': obj.package.max_uploads,
                'max_shares': obj.package.max_shares,
            }
        return None

class RecordSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='doctor'),
        required=True
    )
    patient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='patient'),
        required=True
    )
    prescription = serializers.FileField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    doctor_package = serializers.SerializerMethodField()

    class Meta:
        model = Record
        fields = ['id', 'doctor', 'patient', 'prescription', 'description', 'upload_date', 'doctor_package']

    def get_doctor_package(self, obj):
        if obj.doctor and obj.doctor.package:
            return {
                'id': obj.doctor.package.id,
                'name': obj.doctor.package.name,
                'can_share': obj.doctor.package.can_share,
                'can_set_reminders': obj.doctor.package.can_set_reminders,
                'can_delete': obj.doctor.package.can_delete,
                'max_storage_mb': obj.doctor.package.max_storage_mb,
                'max_uploads': obj.doctor.package.max_uploads,
                'max_shares': obj.doctor.package.max_shares,
            }
        return None

    def validate(self, data):
        if not data.get('doctor'):
            raise serializers.ValidationError({"doctor": "This field is required."})
        if not data.get('prescription'):
            raise serializers.ValidationError({"prescription": "This field is required."})
        return data

class ReminderSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(user_type='doctor'), required=False, allow_null=True)
    patient = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(user_type='patient'), required=False, allow_null=True)

    class Meta:
        model = Reminder
        fields = ['id', 'title', 'date', 'doctor', 'patient', 'notified']

class SharedLinkSerializer(serializers.ModelSerializer):
    record = RecordSerializer()

    class Meta:
        model = SharedLink
        fields = ['token', 'record', 'expires_at']
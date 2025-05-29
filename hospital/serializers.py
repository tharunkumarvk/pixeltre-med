from rest_framework import serializers
from .models import User, Record, Reminder, Package, SharedLink

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    package = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone_number', 'package', 'password']

    def get_package(self, obj):
        if obj.user_type == 'doctor' and obj.package:
            return PackageSerializer(obj.package).data
        return None

class RecordSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='doctor'),
        required=True
    )
    prescription = serializers.FileField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    doctor_package = serializers.SerializerMethodField()
    patient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='patient'),
        required=False,  # Made optional
        allow_null=True
    )

    class Meta:
        model = Record
        fields = ['id', 'patient', 'doctor', 'prescription', 'description', 'upload_date', 'is_deleted', 'shared_with', 'doctor_package']

    def get_doctor_package(self, obj):
        if obj.doctor and obj.doctor.package:
            return PackageSerializer(obj.doctor.package).data
        return None

    def validate(self, data):
        if not data.get('doctor'):
            raise serializers.ValidationError({"doctor": "This field is required."})
        if not data.get('prescription'):
            raise serializers.ValidationError({"prescription": "This field is required."})
        return data

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'user', 'title', 'date']

class SharedLinkSerializer(serializers.ModelSerializer):
    record = RecordSerializer()

    class Meta:
        model = SharedLink
        fields = ['token', 'record', 'expires_at']
from rest_framework import serializers
from .models import User, Record, Reminder, Package, SharedLink

class UserSerializer(serializers.ModelSerializer):
    package = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone_number', 'package']

    def get_package(self, obj):
        if obj.package:
            return {'id': obj.package.id, 'name': obj.package.name}
        return None

class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ['id', 'patient', 'doctor', 'prescription', 'description', 'upload_date', 'is_deleted', 'shared_with']

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'user', 'title', 'date']

class SharedLinkSerializer(serializers.ModelSerializer):
    record = RecordSerializer()

    class Meta:
        model = SharedLink
        fields = ['token', 'record', 'expires_at']
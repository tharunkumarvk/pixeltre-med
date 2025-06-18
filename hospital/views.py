from django.contrib.auth import authenticate, login, logout
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Record, Reminder, SharedLink
from .serializers import UserSerializer, RecordSerializer, ReminderSerializer, SharedLinkSerializer
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        user_type = request.data.get('user_type')
        package_id = request.data.get('package') if user_type == 'doctor' else None
        if user_type == 'doctor' and not package_id:
            return Response({'error': 'Doctors need a package'}, status=400)
        user = User(
            username=data['username'],
            email=data['email'],
            user_type=user_type,
            phone_number=data['phone_number'],
            package_id=package_id
        )
        user.password = make_password(request.data['password'])
        user.save()
        return Response({'message': 'User created'}, status=201)
    return Response({'error': 'Invalid data'}, status=400)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({'message': f'Welcome, {user.username}', 'user': serializer.data}, status=200)
    return Response({'error': 'Wrong username or password'}, status=400)

@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out'}, status=200)

@api_view(['GET'])
def profile(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Not logged in'}, status=401)
    serializer = UserSerializer(request.user)
    if request.user.user_type == 'patient':
        records = Record.objects.filter(patient=request.user, is_deleted=False)
    else:  # doctor
        records = Record.objects.filter(
            models.Q(doctor=request.user) | models.Q(shared_with=request.user),
            is_deleted=False
        ).distinct()
    record_serializer = RecordSerializer(records, many=True)
    return Response({
        'user': serializer.data,
        'records': record_serializer.data
    })

@api_view(['POST'])
def upload_record(request):
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can upload'}, status=403)
    serializer = RecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(patient=request.user)
        return Response({'message': 'Record uploaded'}, status=201)
    return Response({'error': 'Invalid data'}, status=400)

@api_view(['POST'])
def share_record(request, record_id):
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can share'}, status=403)
    try:
        record = Record.objects.get(id=record_id, patient=request.user, is_deleted=False)
        if not record.doctor.package.can_share:
            return Response({'error': 'Doctor’s package does not allow sharing'}, status=403)
        user_id = request.data.get('user_id')
        user = User.objects.get(id=user_id)
        record.shared_with.add(user)
        return Response({'message': 'Record shared'}, status=200)
    except (Record.DoesNotExist, User.DoesNotExist):
        return Response({'error': 'Record or user not found'}, status=404)

@api_view(['POST'])
def delete_record(request, record_id):
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can delete'}, status=403)
    try:
        record = Record.objects.get(id=record_id, patient=request.user, is_deleted=False)
        if not record.doctor.package.can_delete:
            return Response({'error': 'Doctor’s package does not allow deletion'}, status=403)
        record.is_deleted = True
        record.save()
        return Response({'message': 'Record deleted'}, status=200)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)

@api_view(['GET'])
def list_records(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Not logged in'}, status=401)
    if request.user.user_type == 'patient':
        records = Record.objects.filter(patient=request.user, is_deleted=False)
    else:  # doctor
        records = Record.objects.filter(
            models.Q(doctor=request.user) | models.Q(shared_with=request.user),
            is_deleted=False
        ).distinct()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_reminder(request):
    if request.user.user_type == 'doctor' and not request.user.package.can_set_reminders:
        return Response({'error': 'Doctor’s package does not allow reminders'}, status=403)
    serializer = ReminderSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'message': 'Reminder created'}, status=201)
    return Response({'error': 'Invalid data'}, status=400)

@api_view(['POST'])
def generate_share_link(request, record_id):
    try:
        record = Record.objects.get(id=record_id, is_deleted=False)
        if request.user.user_type == 'patient' and record.patient != request.user:
            return Response({'error': 'Only the patient can share this record'}, status=403)
        if request.user.user_type == 'doctor' and record.doctor != request.user:
            return Response({'error': 'Only the doctor can share this record'}, status=403)
        if request.user.user_type == 'doctor' and not request.user.package.can_share:
            return Response({'error': 'Doctor’s package does not allow sharing'}, status=403)
        shared_link = SharedLink.objects.create(
            record=record,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        serializer = SharedLinkSerializer(shared_link)
        return Response({
            'message': 'Shareable link created',
            'link': f'http://localhost:8000/api/share/{shared_link.token}/'
        }, status=201)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)

@api_view(['GET'])
def view_shared_record(request, token):
    try:
        shared_link = SharedLink.objects.get(token=token)
        if not shared_link.is_valid():
            return Response({'error': 'Link expired'}, status=410)
        serializer = SharedLinkSerializer(shared_link)
        return Response(serializer.data)
    except SharedLink.DoesNotExist:
        return Response({'error': 'Invalid link'}, status=404)
from django.contrib.auth import authenticate, login, logout
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from .models import User, Record, Reminder, SharedLink, Package
from .serializers import UserSerializer, RecordSerializer, ReminderSerializer, SharedLinkSerializer, PackageSerializer
from django.middleware.csrf import get_token

@api_view(['GET'])
def get_csrf_token(request):
    return Response({'csrfToken': get_token(request)})

@api_view(['GET'])
def list_packages(request):
    packages = Package.objects.all()
    serializer = PackageSerializer(packages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user_type = serializer.validated_data.get('user_type')
        package_id = request.data.get('package')
        if user_type == 'doctor' and not package_id:
            return Response({'Error': 'Doctors must select a package'}, status=400)
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data.get('password', ''),
            user_type=user_type,
            phone_number=serializer.validated_data['phone_number'],
            package=Package.objects.get(id=package_id) if package_id else None
        )
        serializer = UserSerializer(user)
        return Response({'message': f'Welcome, {user.username}', 'user': serializer.data}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({'message': f'Welcome, {username}', 'user': serializer.data}, status=200)
    return Response({'error': 'Wrong username or password'}, status=400)

@api_view(['POST'])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out'}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    if request.user.user_type == 'patient':
        records = Record.objects.filter(patient=request.user, is_deleted=False)
    else:
        records = Record.objects.filter(
            models.Q(doctor=request.user) | models.Q(shared_with=request.user),
            is_deleted=False
        ).distinct()
    record_serializer = RecordSerializer(records, many=True)
    return Response({'user': serializer.data, 'records': record_serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_record(request):
    if not request.user.is_authenticated or request.user.user_type != 'patient':
        return Response({'error': 'Only authenticated patients can upload records'}, status=403)
    serializer = RecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(patient=request.user)
        return Response(serializer.data, status=201)
    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_records(request):
    if request.user.user_type == 'patient':
        records = Record.objects.filter(patient=request.user, is_deleted=False)
    else:
        records = Record.objects.filter(
            models.Q(doctor=request.user) | models.Q(shared_with=request.user),
            is_deleted=False
        ).distinct()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reminder(request):
    serializer = ReminderSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    print("Serializer errors:", serializer.errors)  # Added for debugging
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_record(request, record_id):
    return Response({'message': 'Share record not implemented'}, status=501)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_record(request, record_id):
    return Response({'message': 'Delete record not implemented'}, status=501)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_share_link(request, record_id):
    return Response({'message': 'Generate share link not implemented'}, status=501)

@api_view(['GET'])
@permission_classes([AllowAny])
def view_shared_record(request, token):
    return Response({'message': 'View shared record not implemented'}, status=501)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_doctors(request):
    doctors = User.objects.filter(user_type='doctor')
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)
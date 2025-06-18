from django.contrib.auth import authenticate, get_user_model
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from .models import User, Package, Record, Reminder, SharedLink
from .serializers import UserSerializer, PackageSerializer, RecordSerializer, ReminderSerializer, SharedLinkSerializer
from django.http import FileResponse
from django.core.mail import send_mail
from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
import logging
import mimetypes
import os

# Setup logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get a new CSRF token."""
    return Response({'csrfToken': get_token(request)})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def manage_packages(request):
    if request.method == 'GET':
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Admin only'}, status=403)
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def update_delete_package(request, package_id):
    try:
        package = Package.objects.get(id=package_id)
        if request.method == 'PUT':
            serializer = PackageSerializer(package, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        elif request.method == 'DELETE':
            if User.objects.filter(package=package).exists():
                return Response({'error': 'Package in use'}, status=400)
            package.delete()
            return Response({'message': 'Package deleted'}, status=204)
    except Package.DoesNotExist:
        return Response({'error': 'Package not found'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_doctors(request):
    doctors = User.objects.filter(user_type='doctor')
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_patients(request):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    patients = request.user.patients.all()
    serializer = UserSerializer(patients, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_records(request, patient_id):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    try:
        patient = User.objects.get(id=patient_id, user_type='patient')
        records = Record.objects.filter(patient=patient, doctor=request.user, is_deleted=False)
        serializer = RecordSerializer(records, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user_type = serializer.validated_data.get('user_type')
        package_id = request.data.get('package')
        # Enforce package for patients only
        if user_type == 'patient' and not package_id:
            return Response({'error': 'Patients must select a package.'}, status=400)
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data.get('password', ''),
            user_type=user_type,
            phone_number=serializer.validated_data['phone_number'],
            package=Package.objects.get(id=package_id) if user_type == 'patient' and package_id else None
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_type': user.user_type,
            'username': user.username,
            'id': user.id
        }, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        user_type = getattr(user, 'user_type', None)
        if not user_type and (user.is_staff or user.is_superuser):
            user_type = 'admin'
        package_info = None
        if user.user_type == 'patient' and user.package:
            package = user.package
            max_uploads = package.max_uploads
            max_storage_mb = package.max_storage_mb
            current_uploads = Record.objects.filter(patient=user, is_deleted=False).count()
            try:
                total_storage = sum([
                    rec.prescription.size for rec in Record.objects.filter(patient=user, is_deleted=False)
                    if rec.prescription and os.path.exists(rec.prescription.path)
                ]) / (1024 * 1024)
            except Exception as e:
                logger.warning(f"Error during storage calculation: {e}")
                total_storage = 0

            package_info = {
                'max_uploads': max_uploads,
                'max_storage_mb': max_storage_mb,
                'current_uploads': current_uploads,
                'used_storage_mb': total_storage,
                'available_uploads': max_uploads - current_uploads if max_uploads > 0 else 'Unlimited',
                'available_storage_mb': max_storage_mb - total_storage if max_storage_mb > 0 else 'Unlimited'
            }

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'user_type': user_type,
                'username': user.username,
                'id': user.id,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'package_info': package_info if user.user_type == 'patient' else None
        }, status=200)
    return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        RefreshToken(request.data['refresh']).blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_record(request):
    user = request.user
    data = request.data.copy()

    if user.user_type == 'patient':
        package = user.package
        if not package:
            return Response({'error': 'No package assigned.'}, status=403)

        # Validate package upload limits
        max_uploads = package.max_uploads
        current_uploads = Record.objects.filter(patient=user, is_deleted=False).count()
        if max_uploads == 0:
            return Response({'error': 'Your package does not allow uploads.'}, status=403)
        if max_uploads > 0 and current_uploads >= max_uploads:
            return Response({'error': 'You have reached your upload limit.'}, status=403)

        # Validate package storage limits
        max_storage_mb = package.max_storage_mb
        if max_storage_mb > 0:
            try:
                total_storage = sum([
                    rec.prescription.size for rec in Record.objects.filter(patient=user, is_deleted=False)
                    if rec.prescription and os.path.exists(rec.prescription.path)
                ]) / (1024 * 1024)
            except FileNotFoundError as e:
                logger.warning(f"File not found during storage calculation: {e}")
                total_storage = 0

            upload_file = request.FILES.get('prescription')
            if upload_file and (total_storage + upload_file.size / (1024 * 1024)) > max_storage_mb:
                return Response({'error': 'You have exceeded your storage limit.'}, status=403)

    serializer = RecordSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_records(request):
    if request.user.user_type == 'patient':
        # Show records where patient is owner
        records = Record.objects.filter(patient=request.user, is_deleted=False)
    elif request.user.user_type == 'doctor':
        # Doctor: show all records where doctor is the uploader
        records = Record.objects.filter(doctor=request.user, is_deleted=False)
    else:
        records = Record.objects.none()
    serializer = RecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reminder(request):
    data = request.data.copy()
    # Convert empty string doctor/patient to None
    if data.get('doctor', '') == '':
        data['doctor'] = None
    if data.get('patient', '') == '':
        data['patient'] = None
    data['user'] = request.user.id
    serializer = ReminderSerializer(data=data)
    if serializer.is_valid():
        # Check package existence before accessing can_set_reminders
        if request.user.user_type == 'doctor' and (not request.user.package or not request.user.package.can_set_reminders):
            return Response({'error': 'Reminders not allowed for your package.'}, status=403)
        reminder = serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_record(request, record_id):
    try:
        record = Record.objects.get(id=record_id, is_deleted=False)
        if request.user.user_type != 'patient' or record.patient != request.user:
            return Response({'error': 'Only patient can share'}, status=403)
        if record.patient.package and not record.patient.package.can_share:
            return Response({'error': 'Sharing not allowed for your package.'}, status=403)
        if record.patient.package and record.patient.package.max_shares > 0 and record.shared_with.count() >= record.patient.package.max_shares:
            return Response({'error': 'Share limit reached for your package.'}, status=403)
        doctor_id = request.data.get('doctor_id')
        if not doctor_id:
            return Response({'error': 'Doctor ID required'}, status=400)
        doctor = User.objects.get(id=doctor_id, user_type='doctor')
        record.shared_with.add(doctor)
        return Response({'message': 'Record shared'}, status=200)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_record(request, record_id):
    try:
        record = Record.objects.get(id=record_id, is_deleted=False)
        # Allow doctor to delete if they are the uploader
        if request.user.user_type == 'doctor' and record.doctor != request.user:
            return Response({'error': 'Only the uploading doctor can delete'}, status=403)
        # Allow patient to delete if they are the owner
        if request.user.user_type == 'patient' and record.patient != request.user:
            return Response({'error': 'Only the owner patient can delete'}, status=403)
        record.is_deleted = True
        record.save()
        return Response({'message': 'Record deleted'}, status=200)
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_share_link(request, record_id):
    try:
        record = Record.objects.get(id=record_id, is_deleted=False)
        if request.user.user_type != 'patient' or record.patient != request.user:
            logger.warning(f"Share link denied: user={request.user.id} ({request.user.user_type}), record.patient={record.patient_id}")
            return Response({'error': 'Only the patient who owns this record can generate a share link.'}, status=403)
        user = request.user
        if user.can_share is False:
            logger.warning(f"Share link denied: user={user.id} has can_share=False")
            return Response({'error': 'Sharing is disabled for your user account. Please contact support or your administrator.'}, status=403)
        if user.can_share is None:
            if not user.package:
                logger.warning(f"Share link denied: user={user.id} has no package assigned.")
                return Response({'error': 'No package assigned. Please contact support or your administrator.'}, status=403)
            if not user.package.can_share:
                logger.warning(f"Share link denied: user={user.id} package.can_share=False (package id={user.package.id})")
                return Response({'error': 'Sharing is not allowed for your current package. Please upgrade your package or contact support.'}, status=403)
        import uuid
        from django.utils import timezone
        from datetime import timedelta
        # Always set token and expires_at before creating SharedLink
        token = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(hours=24)
        shared_link, created = SharedLink.objects.get_or_create(
            record=record,
            defaults={
                'token': token,
                'expires_at': expires_at
            }
        )
        # If it already exists, update if needed
        if not shared_link.token:
            shared_link.token = token
        if not shared_link.expires_at or shared_link.expires_at < timezone.now():
            shared_link.expires_at = expires_at
        shared_link.save()
        site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        link = f"{site_url}/api/share/{shared_link.token}/"
        logger.info(f"Share link generated: user={user.id}, record={record.id}, link={link}")
        return Response({'link': link, 'token': str(shared_link.token)}, status=201)
    except Record.DoesNotExist:
        logger.error(f"Share link error: Record {record_id} not found for user {request.user.id}")
        return Response({'error': 'Record not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in generate_share_link: {e}", exc_info=True)
        return Response({'error': f'Internal server error: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def view_shared_record(request, token):
    try:
        link = SharedLink.objects.get(token=token)
        if hasattr(link, 'is_valid'):
            if not link.is_valid():
                return Response({'error': 'Link expired'}, status=410)
        elif link.expires_at and timezone.now() > link.expires_at:
            return Response({'error': 'Link expired'}, status=410)
        prescription = link.record.prescription
        if not prescription:
            return Response({'error': 'No file found'}, status=404)
        # Check if the file exists before attempting to open it
        if not os.path.exists(prescription.path):
            logger.error(f"File not found: {prescription.path}")
            return Response({'error': 'File not found'}, status=404)
        response = FileResponse(prescription.open('rb'), as_attachment=True, filename=prescription.name.split('/')[-1])
        return response
    except SharedLink.DoesNotExist:
        return Response({'error': 'Invalid link'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_patient(request, patient_id):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can assign patients'}, status=403)
    try:
        patient = User.objects.get(id=patient_id, user_type='patient')
        request.user.patients.add(patient)
        return Response({'message': 'Patient assigned'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_patient(request, patient_id):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can remove patients'}, status=403)
    try:
        patient = User.objects.get(id=patient_id, user_type='patient')
        request.user.patients.remove(patient)
        return Response({'message': 'Patient removed'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_patients(request):
    """
    List all patients in the system (for doctors to assign or upload records).
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    patients = User.objects.filter(user_type='patient')
    serializer = UserSerializer(patients, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_patient(request):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    data = request.data.copy()
    data['user_type'] = 'patient'
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        patient = serializer.save()
        request.user.patients.add(patient)
        return Response(UserSerializer(patient).data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_patient(request, patient_id):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    try:
        patient = request.user.patients.get(id=patient_id)
    except User.DoesNotExist:
        return Response({'error': 'Patient not found or not assigned to you'}, status=404)
    serializer = UserSerializer(patient, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_patient(request, patient_id):
    if request.user.user_type != 'doctor':
        return Response({'error': 'Doctors only'}, status=403)
    try:
        patient = request.user.patients.get(id=patient_id)
        request.user.patients.remove(patient)
        return Response({'message': 'Patient removed from your list'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'Patient not found or not assigned to you'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def users_list_create(request):
    if not request.user.is_authenticated or not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Admin access required'}, status=403)
        
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def user_update_delete(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                user.set_password(request.data['password'])
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        user.delete()
        return Response({'message': 'User deleted'}, status=204)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response(UserSerializer(user).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_record(request, record_id):
    try:
        record = Record.objects.get(id=record_id, is_deleted=False)
        prescription = record.prescription
        if not prescription:
            return Response({'error': 'No file found'}, status=404)
        if not os.path.exists(prescription.path):
            logger.error(f"File not found: {prescription.path}")
            return Response({'error': 'File not found'}, status=404)
        response = FileResponse(prescription.open('rb'), as_attachment=True, filename=prescription.name.split('/')[-1])
        return response
    except Record.DoesNotExist:
        return Response({'error': 'Record not found'}, status=404)
    except Exception as e:
        logger.error(f"Download error for record {record_id}: {str(e)}")
        return Response({'error': str(e)}, status=500)

class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='preview')
    def preview(self, request, pk=None):
        record = get_object_or_404(Record, pk=pk, is_deleted=False)

        # Access Control: Only the patient or doctor can view
        if request.user != record.patient and request.user != record.doctor:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        preview_url = request.build_absolute_uri(record.prescription.url)
        return Response({
            "record_id": record.id,
            "patient": record.patient.id,
            "doctor": record.doctor.id,
            "description": record.description,
            "preview_url": preview_url
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_package_details(request):
    user = request.user
    if user.user_type == 'doctor':
        return Response({})  # Doctors do not have package details
    if user.user_type == 'patient' and user.package:
        package = user.package
        max_uploads = package.max_uploads
        max_storage_mb = package.max_storage_mb
        current_uploads = Record.objects.filter(patient=user, is_deleted=False).count()
        try:
            total_storage = sum([
                rec.prescription.size for rec in Record.objects.filter(patient=user, is_deleted=False)
                if rec.prescription and os.path.exists(rec.prescription.path)
            ]) / (1024 * 1024)
        except FileNotFoundError:
            total_storage = 0

        return Response({
            'max_uploads': max_uploads,
            'max_storage_mb': max_storage_mb,
            'current_uploads': current_uploads,
            'used_storage_mb': total_storage,
            'available_uploads': max_uploads - current_uploads if max_uploads > 0 else 'Unlimited',
            'available_storage_mb': max_storage_mb - total_storage if max_storage_mb > 0 else 'Unlimited'
        })
    return Response({})  # Default empty response for users without a package
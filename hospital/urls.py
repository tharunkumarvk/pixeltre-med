from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/register/', views.register, name='api_register'),
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('records/upload/', views.upload_record, name='upload_record'),
    path('records/<int:record_id>/share/', views.share_record, name='share_record'),
    path('records/<int:record_id>/delete/', views.delete_record, name='delete_record'),
    path('records/', views.list_records, name='list_records'),
    path('records/<int:record_id>/generate-link/', views.generate_share_link, name='generate_share_link'),
    path('share/<uuid:token>/', views.view_shared_record, name='view_shared_record'),
    path('reminders/', views.create_reminder, name='create_reminder'),
    path('packages/', views.manage_packages, name='manage_packages'),
    path('packages/<int:package_id>/', views.update_delete_package, name='update_delete_package'),
    path('doctors/', views.list_doctors, name='list_doctors'),
    path('patients/', views.list_patients, name='list_patients'),
    path('patient/<int:patient_id>/records/', views.patient_records, name='patient_records'),
    path('csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('patients/<int:patient_id>/assign/', views.assign_patient, name='assign_patient'),
    path('patients/<int:patient_id>/remove/', views.remove_patient, name='remove_patient'),
    path('patients/all/', views.list_all_patients, name='list_all_patients'),  # NEW: all patients for doctors
    path('patients/create/', views.create_patient, name='create_patient'),      # NEW: doctor create patient
    path('patients/<int:patient_id>/update/', views.update_patient, name='update_patient'),  # NEW: doctor update patient
    path('patients/<int:patient_id>/delete/', views.delete_patient, name='delete_patient'),  # NEW: doctor delete patient
    path('users/', views.users_list_create, name='users_list_create'),
    path('users/<int:user_id>/', views.user_update_delete, name='user_update_delete'),
    path('login/', views.login_view, name='login'),
    path('me/', views.user_info, name='user_info'),
    path('records/<int:record_id>/download/', views.download_record, name='download_record'),
]
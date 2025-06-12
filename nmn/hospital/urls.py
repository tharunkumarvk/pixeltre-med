from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register, name='api_register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
    
    # User management endpoints
    path('users/', views.users_list_create, name='users_list_create'),
    path('users/<int:user_id>/', views.user_update_delete, name='user_update_delete'),
    path('me/', views.user_info, name='user_info'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    
    # Package management
    path('packages/', views.manage_packages, name='manage_packages'),
    path('packages/<int:package_id>/', views.update_delete_package, name='update_delete_package'),
    
    # Doctor endpoints
    path('doctors/', views.list_doctors, name='list_doctors'),
    path('patients/', views.list_patients, name='list_patients'),
    path('patients/all/', views.list_all_patients, name='list_all_patients'),
    path('patients/create/', views.create_patient, name='create_patient'),
    path('patients/<int:patient_id>/update/', views.update_patient, name='update_patient'),
    path('patients/<int:patient_id>/delete/', views.delete_patient, name='delete_patient'),
    path('patients/<int:patient_id>/assign/', views.assign_patient, name='assign_patient'),
    path('patients/<int:patient_id>/remove/', views.remove_patient, name='remove_patient'),
    path('patient/<int:patient_id>/records/', views.patient_records, name='patient_records'),
    
    # Record management
    path('records/', views.list_records, name='list_records'),
    path('records/upload/', views.upload_record, name='upload_record'),
    path('records/<int:record_id>/share/', views.share_record, name='share_record'),
    path('records/<int:record_id>/delete/', views.delete_record, name='delete_record'),
    path('records/<int:record_id>/generate-link/', views.generate_share_link, name='generate_share_link'),
    path('records/<int:record_id>/download/', views.download_record, name='download_record'),
    path('share/<uuid:token>/', views.view_shared_record, name='view_shared_record'),
    
    # Reminders
    path('reminders/', views.create_reminder, name='create_reminder'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)